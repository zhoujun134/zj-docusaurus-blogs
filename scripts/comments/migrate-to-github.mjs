import { readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

import { createGitHubDiscussionClient } from './github-client.mjs'
import { createMigrationPlan, formatMigratedBody } from './migration-core.mjs'

const EMPTY_STATE = { version: 1, discussions: {}, comments: {} }

async function readState(statePath) {
  try {
    const state = JSON.parse(await readFile(statePath, 'utf8'))
    if (state.version !== 1) throw new Error(`不支持的迁移状态版本: ${state.version}`)
    return state
  } catch (error) {
    if (error.code === 'ENOENT') return structuredClone(EMPTY_STATE)
    throw error
  }
}

async function writeState(statePath, state) {
  const temporaryPath = `${statePath}.tmp`
  await writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, statePath)
}

function countPlan(plan) {
  const comments = plan.groups.flatMap((group) => group.comments)
  return {
    discussions: plan.groups.length,
    comments: comments.length,
    roots: comments.filter((comment) => !comment.parentCommentId).length,
    replies: comments.filter((comment) => comment.parentCommentId).length,
  }
}

export async function runMigration({ inputPath, statePath, apply, client, env }) {
  const input = JSON.parse(await readFile(inputPath, 'utf8'))
  const plan = createMigrationPlan(input)
  const counts = countPlan(plan)

  if (!apply) return { applied: false, ...counts }
  if (!client) throw new Error('真实迁移缺少 GitHub 客户端')

  const state = await readState(statePath)

  for (const group of plan.groups) {
    const categoryId =
      group.category === 'friends' ? env.GISCUS_FRIEND_CATEGORY_ID : env.GISCUS_COMMENTS_CATEGORY_ID
    let discussion = state.discussions[group.term]

    if (!discussion) {
      discussion =
        (await client.findDiscussionByTerm({
          repositoryOwner: 'zhoujun134',
          repositoryName: 'zj-docusaurus-blogs',
          categoryId,
          term: group.term,
        })) ??
        (await client.createDiscussion({
          repositoryId: env.GISCUS_REPO_ID,
          categoryId,
          title: `[评论] ${group.title} · ${group.term}`,
          body: '由 zbus.top 历史评论迁移工具创建。',
        }))
      state.discussions[group.term] = discussion
      await writeState(statePath, state)
    }

    for (const record of group.comments) {
      if (state.comments[record.commentId]) continue

      const root = record.parentCommentId ? state.comments[record.rootCommentId] : null
      if (record.parentCommentId && !root) {
        throw new Error(`回复 ${record.commentId} 找不到已迁移的根评论 ${record.rootCommentId}`)
      }
      const comment = await client.addComment({
        discussionId: discussion.id,
        body: formatMigratedBody(record),
        replyToId: root?.id,
      })
      state.comments[record.commentId] = comment
      await writeState(statePath, state)
    }
  }

  return { applied: true, ...counts, statePath }
}

export async function runCli(argv = process.argv.slice(2), env = process.env) {
  const { values } = parseArgs({
    args: argv,
    options: {
      input: { type: 'string' },
      state: { type: 'string' },
      apply: { type: 'boolean', default: false },
    },
  })

  if (!values.input) throw new Error('缺少 --input')
  if (values.apply) {
    for (const name of [
      'GITHUB_TOKEN',
      'GISCUS_REPO_ID',
      'GISCUS_COMMENTS_CATEGORY_ID',
      'GISCUS_FRIEND_CATEGORY_ID',
    ]) {
      if (!env[name]) throw new Error(`缺少 ${name}`)
    }
  }

  const statePath = values.state ?? join(dirname(values.input), 'migration-state.json')
  const client = values.apply ? createGitHubDiscussionClient({ token: env.GITHUB_TOKEN }) : null

  return runMigration({
    inputPath: values.input,
    statePath,
    apply: values.apply,
    client,
    env,
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli()
    .then((result) => process.stdout.write(`${JSON.stringify(result, null, 2)}\n`))
    .catch((error) => {
      process.stderr.write(`${error.message}\n`)
      process.exitCode = 1
    })
}
