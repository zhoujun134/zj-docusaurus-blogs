import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { runCli, runMigration } from './migrate-to-github.mjs'

const records = [
  {
    commentId: 'root',
    articleId: '/blog/example',
    articleTitle: '示例文章',
    parentCommentId: null,
    replyCommentId: null,
    author: '作者',
    content: '根评论',
    createTime: '2024-05-01T12:30:00+08:00',
  },
  {
    commentId: 'reply',
    articleId: '/blog/example',
    articleTitle: '示例文章',
    parentCommentId: 'root',
    replyCommentId: 'root',
    author: '回复者',
    content: '回复内容',
    createTime: '2024-05-01T13:00:00+08:00',
  },
]

describe('comment migration CLI', () => {
  let directory
  let inputPath
  let statePath

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'zbus-comments-'))
    inputPath = join(directory, 'comments.json')
    statePath = join(directory, 'migration-state.json')
    await writeFile(inputPath, JSON.stringify(records), 'utf8')
  })

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true })
  })

  it('defaults to dry-run and performs no mutations', async () => {
    const throwingClient = {
      findDiscussionByTerm: vi.fn(() => {
        throw new Error('network should not be called')
      }),
      createDiscussion: vi.fn(() => {
        throw new Error('network should not be called')
      }),
      addComment: vi.fn(() => {
        throw new Error('network should not be called')
      }),
    }

    await expect(
      runMigration({ inputPath, statePath, apply: false, client: throwingClient, env: {} }),
    ).resolves.toEqual({ applied: false, discussions: 1, comments: 2, roots: 1, replies: 1 })
    expect(throwingClient.createDiscussion).not.toHaveBeenCalled()
  })

  it('resumes without duplicating stored discussions or comments', async () => {
    const client = {
      findDiscussionByTerm: vi.fn().mockResolvedValue(null),
      createDiscussion: vi.fn().mockResolvedValue({ id: 'D_discussion', url: 'discussion-url' }),
      addComment: vi
        .fn()
        .mockResolvedValueOnce({ id: 'DC_root', url: 'root-url' })
        .mockResolvedValueOnce({ id: 'DC_reply', url: 'reply-url' }),
    }
    const env = {
      GISCUS_REPO_ID: 'R_kgDOMKBFkQ',
      GISCUS_COMMENTS_CATEGORY_ID: 'DIC_comments',
      GISCUS_FRIEND_CATEGORY_ID: 'DIC_friends',
    }

    await runMigration({ inputPath, statePath, apply: true, client, env })
    await runMigration({ inputPath, statePath, apply: true, client, env })

    expect(client.createDiscussion).toHaveBeenCalledTimes(1)
    expect(client.addComment).toHaveBeenCalledTimes(2)
    expect(client.addComment.mock.calls[1][0].replyToId).toBe('DC_root')
    const state = JSON.parse(await readFile(statePath, 'utf8'))
    expect(Object.keys(state.comments)).toEqual(['root', 'reply'])
  })

  it('refuses apply without a token and category IDs', async () => {
    await expect(runCli(['--input', inputPath, '--apply'], {})).rejects.toThrow('缺少 GITHUB_TOKEN')
  })
})
