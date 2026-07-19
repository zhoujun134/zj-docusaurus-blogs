# GitHub Discussions Comments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the self-hosted blog, docs, and friend-link comment flow with Giscus backed by GitHub Discussions, and add a safe, resumable tool for importing historical comments.

**Architecture:** Keep the existing `Comments` entry point and visibility switches, but replace its request/form/list internals with a small Giscus adapter using stable `specific` mapping terms. Build the historical importer as isolated Node ESM modules: pure validation/planning functions, a GitHub GraphQL client, and a CLI that defaults to dry-run and writes an idempotency state file.

**Tech Stack:** Docusaurus 3.10, React 19, TypeScript 5.9, `@giscus/react` 3.1.0, Vitest 4, Node.js 22 built-in `fetch`, GitHub GraphQL API.

---

## File map

- Create `src/features/comments/commentKey.ts`: normalize page identifiers and generate stable Giscus terms.
- Create `src/features/comments/commentKey.test.ts`: lock down blog, docs, trailing-slash, and friend-link mappings.
- Create `src/features/comments/giscusConfig.ts`: typed comment configuration validation and category selection.
- Create `src/features/comments/giscusConfig.test.ts`: verify missing configuration and target category behavior.
- Replace `src/components/Comments/index.tsx`: render the existing notices plus Giscus instead of the legacy form/list.
- Replace `src/components/Comments/Comments.test.tsx`: test Giscus props, theme selection, missing configuration, and friend target.
- Simplify `src/components/Comments/Comments.module.css`: keep only container, loading, and error/fallback styles.
- Modify `src/pages/friends/index.tsx`: mark the comment target as the dedicated friend-applications Discussion.
- Modify `docusaurus.config.ts`: remove legacy API fields and add non-secret Giscus build configuration.
- Modify `package.json` and `package-lock.json`: add `@giscus/react` and migration scripts.
- Delete `src/components/Comments/CommentForm.tsx`, `src/components/Comments/CommentList.tsx`, `src/features/comments/sanitizeComment.ts`, `src/features/comments/sanitizeComment.test.ts`, and `src/utils/articleApi.ts` after the replacement tests pass.
- Modify `src/utils/interface/zjType.ts`: remove comment API request/response types no longer used by the site.
- Create `scripts/comments/migration-core.mjs`: validate exports, flatten nested comments, group records, order replies, and format migrated bodies.
- Create `scripts/comments/migration-core.test.mjs`: test pure migration behavior without network or filesystem access.
- Create `scripts/comments/github-client.mjs`: small GraphQL client for finding/creating Discussions and adding comments.
- Create `scripts/comments/github-client.test.mjs`: verify GraphQL payloads, pagination, errors, and reply IDs with mocked `fetch`.
- Create `scripts/comments/migrate-to-github.mjs`: CLI parsing, dry-run output, state persistence, resume behavior, and apply orchestration.
- Create `scripts/comments/migrate-to-github.test.mjs`: execute the CLI with temporary fixtures and a fake GitHub client.
- Create `scripts/comments/fixtures/example-comments.json`: non-sensitive fixture used to demonstrate dry-run output.
- Create `scripts/comments/README.md`: exact GitHub preparation, export schema, dry-run, apply, verification, and rollback instructions.
- Create `.env.example`: document the public Giscus IDs used at build time without adding a token.

### Task 1: Add stable comment keys

**Files:**
- Create: `src/features/comments/commentKey.ts`
- Create: `src/features/comments/commentKey.test.ts`

- [ ] **Step 1: Write the failing mapping tests**

```ts
import { describe, expect, it } from 'vitest'
import { FRIEND_APPLICATION_TERM, createCommentTerm, normalizeArticlePath } from './commentKey'

describe('comment keys', () => {
  it('normalizes article paths without changing meaningful characters', () => {
    expect(normalizeArticlePath('blog/示例/?preview=1#comments')).toBe('/blog/示例')
    expect(normalizeArticlePath('/docs/intro/')).toBe('/docs/intro')
    expect(normalizeArticlePath('/')).toBe('/')
  })

  it('creates stable page and friend terms', () => {
    expect(createCommentTerm('/blog/example')).toBe('zbus-comment:/blog/example')
    expect(createCommentTerm('@site/my-friends/links/apply', 'friends')).toBe(
      FRIEND_APPLICATION_TERM,
    )
  })
})
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npx vitest run src/features/comments/commentKey.test.ts
```

Expected: FAIL because `./commentKey` does not exist.

- [ ] **Step 3: Implement the pure mapping functions**

```ts
export type CommentTarget = 'page' | 'friends'

export const FRIEND_APPLICATION_TERM = 'zbus-friend-applications'

export function normalizeArticlePath(value: string): string {
  const pathOnly = value.split(/[?#]/, 1)[0] || '/'
  const withLeadingSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`
  return withLeadingSlash === '/' ? '/' : withLeadingSlash.replace(/\/+$/, '')
}

export function createCommentTerm(articleId: string, target: CommentTarget = 'page'): string {
  if (target === 'friends') return FRIEND_APPLICATION_TERM
  return `zbus-comment:${normalizeArticlePath(articleId)}`
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run the command from Step 2.

Expected: 1 test file and 2 tests pass.

- [ ] **Step 5: Commit the mapping unit**

```bash
git add src/features/comments/commentKey.ts src/features/comments/commentKey.test.ts
git commit -m "feat: add stable GitHub comment keys"
```

### Task 2: Add typed Giscus configuration

**Files:**
- Create: `src/features/comments/giscusConfig.ts`
- Create: `src/features/comments/giscusConfig.test.ts`
- Modify: `docusaurus.config.ts`
- Modify: `.env.example`

- [ ] **Step 1: Write failing configuration tests**

```ts
import { describe, expect, it } from 'vitest'
import { resolveGiscusTarget, validateGiscusConfig, type GiscusConfig } from './giscusConfig'

const config: GiscusConfig = {
  repo: 'zhoujun134/zj-docusaurus-blogs',
  repoId: 'R_kgDOMKBFkQ',
  commentsCategory: '站点评论',
  commentsCategoryId: 'DIC_comments',
  friendCategory: '友链申请',
  friendCategoryId: 'DIC_friends',
}

describe('Giscus configuration', () => {
  it('reports the exact missing public IDs', () => {
    expect(validateGiscusConfig({ ...config, commentsCategoryId: '' })).toEqual([
      'GISCUS_COMMENTS_CATEGORY_ID',
    ])
  })

  it('selects the friend category independently from page comments', () => {
    expect(resolveGiscusTarget(config, 'friends')).toEqual({
      category: '友链申请',
      categoryId: 'DIC_friends',
    })
  })
})
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npx vitest run src/features/comments/giscusConfig.test.ts
```

Expected: FAIL because `./giscusConfig` does not exist.

- [ ] **Step 3: Implement configuration types and validation**

```ts
import type { CommentTarget } from './commentKey'

export type GiscusConfig = {
  repo: `${string}/${string}`
  repoId: string
  commentsCategory: string
  commentsCategoryId: string
  friendCategory: string
  friendCategoryId: string
}

export type CommentConfig = {
  docs: boolean
  blog: boolean
  provider: 'giscus'
  giscus: GiscusConfig
}

export function validateGiscusConfig(config: GiscusConfig): string[] {
  const missing: string[] = []
  if (!config.repoId) missing.push('GISCUS_REPO_ID')
  if (!config.commentsCategoryId) missing.push('GISCUS_COMMENTS_CATEGORY_ID')
  if (!config.friendCategoryId) missing.push('GISCUS_FRIEND_CATEGORY_ID')
  return missing
}

export function resolveGiscusTarget(config: GiscusConfig, target: CommentTarget) {
  return target === 'friends'
    ? { category: config.friendCategory, categoryId: config.friendCategoryId }
    : { category: config.commentsCategory, categoryId: config.commentsCategoryId }
}
```

- [ ] **Step 4: Replace the legacy config fields**

Use the known public repository ID and build-time category IDs:

```ts
commentConfig: {
  docs: true,
  blog: true,
  provider: 'giscus',
  giscus: {
    repo: 'zhoujun134/zj-docusaurus-blogs',
    repoId: process.env.GISCUS_REPO_ID ?? 'R_kgDOMKBFkQ',
    commentsCategory: '站点评论',
    commentsCategoryId: process.env.GISCUS_COMMENTS_CATEGORY_ID ?? '',
    friendCategory: '友链申请',
    friendCategoryId: process.env.GISCUS_FRIEND_CATEGORY_ID ?? '',
  },
},
```

Create `.env.example` without a token:

```dotenv
GISCUS_REPO_ID=R_kgDOMKBFkQ
GISCUS_COMMENTS_CATEGORY_ID=
GISCUS_FRIEND_CATEGORY_ID=
```

- [ ] **Step 5: Run focused tests and typecheck**

```bash
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npx vitest run src/features/comments/giscusConfig.test.ts
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npm run typecheck
```

Expected: configuration tests and TypeScript pass.

- [ ] **Step 6: Commit configuration**

```bash
git add src/features/comments/giscusConfig.ts src/features/comments/giscusConfig.test.ts docusaurus.config.ts .env.example
git commit -m "feat: configure Giscus comments"
```

### Task 3: Replace the legacy comment UI with Giscus

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Replace: `src/components/Comments/index.tsx`
- Replace: `src/components/Comments/Comments.test.tsx`
- Replace: `src/components/Comments/Comments.module.css`
- Modify: `src/pages/friends/index.tsx`

- [ ] **Step 1: Install the pinned Giscus React adapter**

```bash
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npm install @giscus/react@3.1.0
```

Expected: `package.json` and `package-lock.json` contain `@giscus/react` version `3.1.0`.

- [ ] **Step 2: Replace the old component tests with failing Giscus behavior tests**

Mock `@giscus/react`, Docusaurus configuration, color mode, and `BrowserOnly`. Assert these behaviors in `Comments.test.tsx`:

```tsx
it('passes a stable page term and the comments category to Giscus', () => {
  render(<Comments articleId="/blog/example/" articleTitle="Example" />)
  expect(screen.getByTestId('giscus')).toHaveAttribute('data-term', 'zbus-comment:/blog/example')
  expect(screen.getByTestId('giscus')).toHaveAttribute('data-category', '站点评论')
})

it('uses the dedicated friend application term and keeps the notice', () => {
  render(
    <Comments
      articleId="@site/my-friends/links/apply"
      target="friends"
      noticeCardBeforeSumitForm={{ title: '申请格式', type: 'info', description: 'YAML' }}
    />,
  )
  expect(screen.getByText('申请格式')).toBeInTheDocument()
  expect(screen.getByTestId('giscus')).toHaveAttribute('data-term', 'zbus-friend-applications')
  expect(screen.getByTestId('giscus')).toHaveAttribute('data-category', '友链申请')
})

it('uses the dark Giscus theme when Docusaurus is dark', () => {
  colorMode = 'dark'
  render(<Comments articleId="/docs/intro" />)
  expect(screen.getByTestId('giscus')).toHaveAttribute('data-theme', 'dark')
})

it('keeps a direct GitHub Discussions fallback link', () => {
  render(<Comments articleId="/docs/intro" />)
  expect(screen.getByRole('link', { name: '前往 GitHub Discussions' })).toHaveAttribute(
    'href',
    'https://github.com/zhoujun134/zj-docusaurus-blogs/discussions',
  )
})

it('shows a configuration error instead of loading Giscus when a category ID is missing', () => {
  commentsCategoryId = ''
  render(<Comments articleId="/docs/intro" />)
  expect(screen.getByRole('alert')).toHaveTextContent('GISCUS_COMMENTS_CATEGORY_ID')
  expect(screen.queryByTestId('giscus')).not.toBeInTheDocument()
})
```

- [ ] **Step 3: Run the focused test and verify RED**

```bash
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npx vitest run src/components/Comments/Comments.test.tsx
```

Expected: FAIL because the current component calls the legacy API and has no `target` prop or Giscus output.

- [ ] **Step 4: Implement the minimal Giscus wrapper**

The replacement `Comments` component must:

```tsx
import BrowserOnly from '@docusaurus/BrowserOnly'
import { useColorMode } from '@docusaurus/theme-common'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Giscus from '@giscus/react'
import NoticeCard from '@site/src/components/NoticeCard'
import { createCommentTerm, type CommentTarget } from '@site/src/features/comments/commentKey'
import {
  resolveGiscusTarget,
  validateGiscusConfig,
  type CommentConfig,
} from '@site/src/features/comments/giscusConfig'
import type { VNoticeCardProps } from '@site/src/utils/interface/zjType'
import styles from './Comments.module.css'

type Props = {
  articleId: string
  articleTitle?: string
  target?: CommentTarget
  noticeCardBeforeSumitForm?: VNoticeCardProps
}

export default function Comments({
  articleId,
  target = 'page',
  noticeCardBeforeSumitForm,
}: Props) {
  const { siteConfig } = useDocusaurusContext()
  const { colorMode } = useColorMode()
  const commentConfig = siteConfig.themeConfig.commentConfig as CommentConfig
  const missing = validateGiscusConfig(commentConfig.giscus)
  const discussionTarget = resolveGiscusTarget(commentConfig.giscus, target)

  return (
    <section className={styles.commentsContainer} aria-label="评论">
      {noticeCardBeforeSumitForm ? <NoticeCard {...noticeCardBeforeSumitForm} /> : null}
      {missing.length > 0 ? (
        <p className={styles.commentError} role="alert">
          GitHub 评论尚未完成配置：{missing.join(', ')}
        </p>
      ) : (
        <BrowserOnly fallback={<p className={styles.loading}>评论加载中…</p>}>
          {() => (
            <Giscus
              repo={commentConfig.giscus.repo}
              repoId={commentConfig.giscus.repoId}
              category={discussionTarget.category}
              categoryId={discussionTarget.categoryId}
              mapping="specific"
              term={createCommentTerm(articleId, target)}
              reactionsEnabled="1"
              emitMetadata="0"
              inputPosition="top"
              theme={colorMode === 'dark' ? 'dark' : 'light'}
              lang="zh-CN"
              loading="lazy"
            />
          )}
        </BrowserOnly>
      )}
      <p className={styles.fallbackLink}>
        评论无法加载时，可直接
        <a href={`https://github.com/${commentConfig.giscus.repo}/discussions`}>
          前往 GitHub Discussions
        </a>
        。
      </p>
    </section>
  )
}
```

Keep only these CSS responsibilities: vertical margin, `min-height: 220px`, readable loading text, and the existing danger-colored error box.

- [ ] **Step 5: Mark the friends page target explicitly**

```tsx
<Comments
  articleId="@site/my-friends/links/apply"
  target="friends"
  noticeCardBeforeSumitForm={noticeCardProps}
/>
```

- [ ] **Step 6: Run focused tests and verify GREEN**

```bash
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npx vitest run src/components/Comments/Comments.test.tsx src/features/comments/commentKey.test.ts src/features/comments/giscusConfig.test.ts
```

Expected: all focused tests pass without console warnings.

- [ ] **Step 7: Commit the Giscus UI**

```bash
git add package.json package-lock.json src/components/Comments src/pages/friends/index.tsx
git commit -m "feat: replace site comments with Giscus"
```

### Task 4: Remove the unused self-hosted comment client

**Files:**
- Delete: `src/components/Comments/CommentForm.tsx`
- Delete: `src/components/Comments/CommentList.tsx`
- Delete: `src/features/comments/sanitizeComment.ts`
- Delete: `src/features/comments/sanitizeComment.test.ts`
- Delete: `src/utils/articleApi.ts`
- Modify: `src/utils/interface/zjType.ts`

- [ ] **Step 1: Prove the replacement no longer imports legacy code**

Run:

```bash
rg -n "CommentForm|CommentList|getCommentListByArticleId|submitComment|sanitizeCommentHtml|ICommentSubmitRequest|ICommentInfo" src
```

Expected before deletion: matches only in the legacy files and comment API types, not in the new `Comments/index.tsx`.

- [ ] **Step 2: Delete legacy files and types**

Remove `ICommentInfo` and `ICommentSubmitRequest` from `src/utils/interface/zjType.ts`. Keep unrelated result, pagination, friend, and notice-card types unchanged.

- [ ] **Step 3: Verify no legacy references remain**

Run the `rg` command from Step 1.

Expected: no matches and exit code 1.

- [ ] **Step 4: Run TypeScript, lint, and tests**

```bash
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npm run typecheck
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npm run lint
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npm test
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit cleanup**

```bash
git add -A src/components/Comments src/features/comments src/utils/articleApi.ts src/utils/interface/zjType.ts
git commit -m "refactor: remove legacy comment client"
```

### Task 5: Build and test the pure migration planner

**Files:**
- Create: `scripts/comments/migration-core.mjs`
- Create: `scripts/comments/migration-core.test.mjs`

- [ ] **Step 1: Write failing pure-function tests**

Cover all of these exact cases:

```js
it('rejects duplicate IDs before producing a plan', () => {
  expect(() => validateComments([comment({ commentId: '1' }), comment({ commentId: '1' })]))
    .toThrow('重复 commentId: 1')
})

it('rejects orphan replies', () => {
  expect(() => validateComments([comment({ commentId: '2', parentCommentId: 'missing' })]))
    .toThrow('找不到父评论 missing')
})

it('groups friend applications into their dedicated term', () => {
  const plan = createMigrationPlan([
    comment({ articleId: '@site/my-friends/links/apply', articleTitle: '友链申请' }),
  ])
  expect(plan.groups[0].term).toBe('zbus-friend-applications')
  expect(plan.groups[0].category).toBe('friends')
})

it('orders roots before replies and collapses deeper replies to the root', () => {
  const plan = createMigrationPlan([
    comment({ commentId: '3', parentCommentId: '2', replyCommentId: '2' }),
    comment({ commentId: '1' }),
    comment({ commentId: '2', parentCommentId: '1', replyCommentId: '1' }),
  ])
  expect(plan.groups[0].comments.map((item) => item.commentId)).toEqual(['1', '2', '3'])
  expect(plan.groups[0].comments[2].rootCommentId).toBe('1')
})

it('formats original identity and time as quoted metadata', () => {
  expect(formatMigratedBody(comment({ author: '张三', createTime: '2024-05-01T12:30:00+08:00' })))
    .toContain('> 原作者：张三\n> 原发布时间：2024-05-01T12:30:00+08:00')
})

it('escapes imported HTML so GitHub renders it as text', () => {
  expect(formatMigratedBody(comment({ content: '<img src=x onerror=alert(1)>' })))
    .toContain('&lt;img src=x onerror=alert(1)&gt;')
})
```

- [ ] **Step 2: Run the tests and verify RED**

```bash
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npx vitest run scripts/comments/migration-core.test.mjs
```

Expected: FAIL because `migration-core.mjs` does not exist.

- [ ] **Step 3: Implement the migration core exports**

Export these functions with no filesystem or network dependencies:

```js
export const FRIEND_APPLICATION_IDS = new Set([
  '@site/my-friends/links/apply',
  '/friends',
])

export function normalizeArticlePath(value) {
  const pathOnly = String(value).split(/[?#]/, 1)[0] || '/'
  const withLeadingSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`
  return withLeadingSlash === '/' ? '/' : withLeadingSlash.replace(/\/+$/, '')
}

export function createMigrationTerm(articleId) {
  return FRIEND_APPLICATION_IDS.has(articleId)
    ? 'zbus-friend-applications'
    : `zbus-comment:${normalizeArticlePath(articleId)}`
}

export function flattenComments(records) {
  const flattened = []
  const visit = (record, context = {}) => {
    const { children = [], ...values } = record
    const comment = {
      ...values,
      articleId: values.articleId ?? context.articleId,
      articleTitle: values.articleTitle ?? context.articleTitle,
      parentCommentId: values.parentCommentId ?? context.parentCommentId ?? null,
    }
    flattened.push(comment)
    for (const child of children) {
      visit(child, {
        articleId: comment.articleId,
        articleTitle: comment.articleTitle,
        parentCommentId: comment.commentId,
      })
    }
  }
  for (const record of records) visit(record)
  return flattened
}

export function validateComments(records) {
  const ids = new Set()
  for (const record of records) {
    for (const field of ['commentId', 'articleId', 'author', 'content']) {
      if (!String(record[field] ?? '').trim()) throw new Error(`缺少必填字段 ${field}`)
    }
    if (ids.has(record.commentId)) throw new Error(`重复 commentId: ${record.commentId}`)
    ids.add(record.commentId)
  }
  for (const record of records) {
    if (record.parentCommentId && !ids.has(record.parentCommentId)) {
      throw new Error(`找不到父评论 ${record.parentCommentId}`)
    }
  }
  return records
}

export function formatMigratedBody(record) {
  const oneLine = (value) => String(value).replace(/\s+/g, ' ').trim()
  const escapedContent = String(record.content)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r\n/g, '\n')
  const createdAt = oneLine(record.createTime || '原系统未记录')
  const replyLine = record.replyAuthor ? `\n> 回复原作者：${oneLine(record.replyAuthor)}` : ''
  return [
    '> 历史评论迁移',
    `> 原作者：${oneLine(record.author)}`,
    `> 原发布时间：${createdAt}`,
    `> 原评论 ID：${oneLine(record.commentId)}${replyLine}`,
    '',
    escapedContent,
  ].join('\n')
}

function orderGroup(records) {
  const pending = [...records]
  const ordered = []
  const roots = new Map()
  const byId = new Map(records.map((record) => [record.commentId, record]))
  while (pending.length > 0) {
    const index = pending.findIndex(
      (record) => !record.parentCommentId || ordered.some((item) => item.commentId === record.parentCommentId),
    )
    if (index < 0) throw new Error('评论回复关系存在循环')
    const [record] = pending.splice(index, 1)
    const rootCommentId = record.parentCommentId
      ? roots.get(record.parentCommentId) ?? record.parentCommentId
      : record.commentId
    roots.set(record.commentId, rootCommentId)
    const repliedTo = byId.get(record.replyCommentId ?? record.parentCommentId)
    ordered.push({ ...record, rootCommentId, replyAuthor: repliedTo?.author })
  }
  return ordered
}

export function createMigrationPlan(input) {
  const records = validateComments(flattenComments(input))
  const groups = new Map()
  for (const record of records) {
    const term = createMigrationTerm(record.articleId)
    const group = groups.get(term) ?? {
      term,
      title: record.articleTitle || normalizeArticlePath(record.articleId),
      category: FRIEND_APPLICATION_IDS.has(record.articleId) ? 'friends' : 'comments',
      comments: [],
    }
    group.comments.push(record)
    groups.set(term, group)
  }
  return {
    groups: [...groups.values()].map((group) => ({
      ...group,
      comments: orderGroup(group.comments),
    })),
  }
}
```

Use Kahn-style parent ordering: repeatedly append records whose parent is absent or already appended; validation guarantees the loop completes. Store `rootCommentId` for each reply so grandchildren attach to the top-level GitHub comment.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run the command from Step 2.

Expected: all migration-core tests pass.

- [ ] **Step 5: Commit the planner**

```bash
git add scripts/comments/migration-core.mjs scripts/comments/migration-core.test.mjs
git commit -m "feat: plan historical comment migration"
```

### Task 6: Add a tested GitHub Discussions GraphQL client

**Files:**
- Create: `scripts/comments/github-client.mjs`
- Create: `scripts/comments/github-client.test.mjs`

- [ ] **Step 1: Write failing client tests with injected fetch**

Test the public client API:

```js
const client = createGitHubDiscussionClient({ token: 'test', fetchImpl })

await expect(client.createDiscussion({
  repositoryId: 'R_repo',
  categoryId: 'DIC_category',
  title: '[评论] Example · zbus-comment:/blog/example',
  body: '由站点评论迁移工具创建。',
})).resolves.toEqual({ id: 'D_discussion', url: 'https://github.com/example/discussions/1' })

await client.addComment({ discussionId: 'D_discussion', body: 'root' })
await client.addComment({ discussionId: 'D_discussion', body: 'reply', replyToId: 'DC_root' })
expect(fetchImpl).toHaveBeenLastCalledWith(
  'https://api.github.com/graphql',
  expect.objectContaining({ body: expect.stringContaining('"replyToId":"DC_root"') }),
)
```

Also test that GraphQL `errors` throws a message containing the first GitHub error and that `findDiscussionByTerm` follows `pageInfo.hasNextPage` until it finds a title containing the exact term.

- [ ] **Step 2: Run the tests and verify RED**

```bash
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npx vitest run scripts/comments/github-client.test.mjs
```

Expected: FAIL because the client module does not exist.

- [ ] **Step 3: Implement the GraphQL client**

```js
const ENDPOINT = 'https://api.github.com/graphql'

const FIND_DISCUSSIONS = `
  query FindDiscussions($owner: String!, $name: String!, $categoryId: ID!, $after: String) {
    repository(owner: $owner, name: $name) {
      discussions(first: 100, after: $after, categoryId: $categoryId) {
        nodes { id title url }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`

const CREATE_DISCUSSION = `
  mutation CreateDiscussion($input: CreateDiscussionInput!) {
    createDiscussion(input: $input) { discussion { id url } }
  }
`

const ADD_DISCUSSION_COMMENT = `
  mutation AddDiscussionComment($input: AddDiscussionCommentInput!) {
    addDiscussionComment(input: $input) { comment { id url } }
  }
`

export function createGitHubDiscussionClient({ token, fetchImpl = fetch }) {
  async function graphql(query, variables) {
    const response = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        'user-agent': 'zj-docusaurus-comment-migrator',
      },
      body: JSON.stringify({ query, variables }),
    })
    const payload = await response.json()
    if (!response.ok || payload.errors?.length) {
      throw new Error(payload.errors?.[0]?.message ?? `GitHub HTTP ${response.status}`)
    }
    return payload.data
  }

  return {
    findDiscussionByTerm: async ({ repositoryOwner, repositoryName, categoryId, term }) => {
      let after = null
      do {
        const data = await graphql(FIND_DISCUSSIONS, {
          owner: repositoryOwner,
          name: repositoryName,
          categoryId,
          after,
        })
        const connection = data.repository.discussions
        const match = connection.nodes.find((discussion) => discussion.title.includes(term))
        if (match) return match
        after = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null
      } while (after)
      return null
    },
    createDiscussion: async ({ repositoryId, categoryId, title, body }) => {
      const data = await graphql(CREATE_DISCUSSION, {
        input: { repositoryId, categoryId, title, body },
      })
      return data.createDiscussion.discussion
    },
    addComment: async ({ discussionId, body, replyToId }) => {
      const input = { discussionId, body }
      if (replyToId) input.replyToId = replyToId
      const data = await graphql(ADD_DISCUSSION_COMMENT, { input })
      return data.addDiscussionComment.comment
    },
  }
}
```

Use explicit GraphQL operation strings named `FindDiscussions`, `CreateDiscussion`, and `AddDiscussionComment`. Do not log the token or request headers.

- [ ] **Step 4: Run tests and verify GREEN**

Run the command from Step 2.

Expected: client pagination, mutation, reply, and error tests pass.

- [ ] **Step 5: Commit the client**

```bash
git add scripts/comments/github-client.mjs scripts/comments/github-client.test.mjs
git commit -m "feat: add GitHub Discussions client"
```

### Task 7: Add the dry-run-first migration CLI

**Files:**
- Create: `scripts/comments/migrate-to-github.mjs`
- Create: `scripts/comments/migrate-to-github.test.mjs`
- Create: `scripts/comments/fixtures/example-comments.json`
- Modify: `package.json`

- [ ] **Step 1: Write failing CLI tests**

Use temporary directories and a dependency-injected `runMigration()` export. Verify:

```js
it('defaults to dry-run and performs no mutations', async () => {
  const result = await runMigration({ inputPath, statePath, apply: false, client: throwingClient })
  expect(result).toMatchObject({ discussions: 1, comments: 2, applied: false })
})

it('resumes without duplicating stored discussions or comments', async () => {
  const env = {
    GISCUS_REPO_ID: 'R_kgDOMKBFkQ',
    GISCUS_COMMENTS_CATEGORY_ID: 'DIC_comments',
    GISCUS_FRIEND_CATEGORY_ID: 'DIC_friends',
  }
  await runMigration({ inputPath, statePath, apply: true, client, env })
  await runMigration({ inputPath, statePath, apply: true, client, env })
  expect(client.createDiscussion).toHaveBeenCalledTimes(1)
  expect(client.addComment).toHaveBeenCalledTimes(2)
})

it('refuses apply without a token and category IDs', async () => {
  await expect(runCli(['--input', inputPath, '--apply'], {}))
    .rejects.toThrow('缺少 GITHUB_TOKEN')
})
```

- [ ] **Step 2: Run the tests and verify RED**

```bash
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npx vitest run scripts/comments/migrate-to-github.test.mjs
```

Expected: FAIL because the CLI module does not exist.

- [ ] **Step 3: Implement `runMigration` with atomic state writes**

State shape:

```js
{
  version: 1,
  discussions: {
    'zbus-comment:/blog/example': {
      id: 'D_discussion',
      url: 'https://github.com/zhoujun134/zj-docusaurus-blogs/discussions/1'
    }
  },
  comments: {
    '123': {
      id: 'DC_comment',
      url: 'https://github.com/zhoujun134/zj-docusaurus-blogs/discussions/1#discussioncomment-1'
    }
  }
}
```

After every successful mutation, write JSON to `${statePath}.tmp` and rename it to `statePath`. For replies, look up the stored GitHub ID for `rootCommentId` and pass it as `replyToId`. Skip every comment already present in `state.comments`.

Use this orchestration shape:

```js
import { readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import { createGitHubDiscussionClient } from './github-client.mjs'
import { createMigrationPlan, formatMigratedBody } from './migration-core.mjs'

const EMPTY_STATE = { version: 1, discussions: {}, comments: {} }

async function readState(statePath) {
  try {
    return JSON.parse(await readFile(statePath, 'utf8'))
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

export async function runMigration({ inputPath, statePath, apply, client, env }) {
  const input = JSON.parse(await readFile(inputPath, 'utf8'))
  const plan = createMigrationPlan(input)
  if (!apply) {
    return {
      applied: false,
      discussions: plan.groups.length,
      comments: plan.groups.reduce((sum, group) => sum + group.comments.length, 0),
    }
  }

  const state = await readState(statePath)
  for (const group of plan.groups) {
    const categoryId =
      group.category === 'friends'
        ? env.GISCUS_FRIEND_CATEGORY_ID
        : env.GISCUS_COMMENTS_CATEGORY_ID
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
      const comment = await client.addComment({
        discussionId: discussion.id,
        body: formatMigratedBody(record),
        replyToId: root?.id,
      })
      state.comments[record.commentId] = comment
      await writeState(statePath, state)
    }
  }

  return {
    applied: true,
    discussions: Object.keys(state.discussions).length,
    comments: Object.keys(state.comments).length,
  }
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
  const client = values.apply
    ? createGitHubDiscussionClient({ token: env.GITHUB_TOKEN })
    : null
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
```

- [ ] **Step 4: Implement CLI argument and environment parsing**

Use `node:util` `parseArgs` with:

```text
--input PATH      required JSON file
--state PATH      optional; defaults beside input as migration-state.json
--apply           optional boolean flag; absent means dry-run
```

Apply mode requires:

```text
GITHUB_TOKEN
GISCUS_REPO_ID
GISCUS_COMMENTS_CATEGORY_ID
GISCUS_FRIEND_CATEGORY_ID
```

Use repository owner `zhoujun134`, repository name `zj-docusaurus-blogs`, comments category name `站点评论`, and friend category name `友链申请`. Print counts and destination terms, but never print comment email addresses, tokens, or authorization headers.

- [ ] **Step 5: Add the package script**

```json
"comments:migrate": "node scripts/comments/migrate-to-github.mjs",
"format:check": "prettier --check \"src/**/*.{ts,tsx,js,css}\" \"data/**/*.{ts,tsx,js,css}\" \"scripts/**/*.{js,mjs,json,md}\" \"*.{ts,js,mjs,json,md}\" \".github/**/*.{yml,yaml}\""
```

Create the non-sensitive dry-run fixture:

```json
[
  {
    "commentId": "example-root",
    "articleId": "/blog/example",
    "articleTitle": "示例文章",
    "parentCommentId": null,
    "replyCommentId": null,
    "author": "示例作者",
    "content": "第一条历史评论",
    "createTime": "2024-05-01T12:30:00+08:00"
  },
  {
    "commentId": "example-reply",
    "articleId": "/blog/example",
    "articleTitle": "示例文章",
    "parentCommentId": "example-root",
    "replyCommentId": "example-root",
    "author": "回复者",
    "content": "一条历史回复",
    "createTime": "2024-05-01T13:00:00+08:00"
  }
]
```

- [ ] **Step 6: Run focused tests and a fixture dry-run**

```bash
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npx vitest run scripts/comments/migrate-to-github.test.mjs
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npm run comments:migrate -- --input scripts/comments/fixtures/example-comments.json
```

Expected: tests pass; dry-run prints one Discussion group and performs no network writes.

- [ ] **Step 7: Commit the CLI**

```bash
git add package.json scripts/comments/migrate-to-github.mjs scripts/comments/migrate-to-github.test.mjs scripts/comments/fixtures/example-comments.json
git commit -m "feat: add resumable comment migration CLI"
```

### Task 8: Document setup, migration, and rollback

**Files:**
- Create: `scripts/comments/README.md`
- Modify: `README.md`

- [ ] **Step 1: Write the operational guide**

Document these exact facts:

- The repository ID is `R_kgDOMKBFkQ`.
- GitHub Discussions is currently disabled and must be enabled before IDs can be obtained.
- Install the Giscus app for `zhoujun134/zj-docusaurus-blogs`.
- Create “站点评论” and “友链申请” categories and copy their IDs into the three documented build variables.
- Export history using the JSON schema from the approved design.
- Run dry-run first:

```bash
npm run comments:migrate -- --input /absolute/path/comments.json
```

- After reviewing counts, run apply with a fine-grained token that can write Discussions:

```bash
set -a
source .env.local
set +a
npm run comments:migrate -- --input /absolute/path/comments.json --apply
```

- Keep the generated state file and old database/API read-only for at least 30 days.
- Roll back the frontend using the previous Git commit; do not delete migrated Discussions.

- [ ] **Step 2: Add a short README link**

Add a “评论迁移” entry in the root README pointing to `scripts/comments/README.md`; do not duplicate the full operational guide.

- [ ] **Step 3: Check documentation formatting and secrets**

```bash
rg -n "ghp_|github_pat_|Bearer " README.md scripts/comments .env.example
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npx prettier --check README.md scripts/comments/README.md
```

Expected: the secret scan has no matches; Prettier exits 0.

- [ ] **Step 4: Commit documentation**

```bash
git add README.md scripts/comments/README.md .env.example
git commit -m "docs: explain GitHub comment migration"
```

### Task 9: Configure GitHub and perform final verification

**Files:**
- No source files unless real category IDs replace empty deployment variables.

- [ ] **Step 1: Verify the GitHub prerequisite state read-only**

```bash
gh repo view zhoujun134/zj-docusaurus-blogs --json id,hasDiscussionsEnabled,nameWithOwner
```

Expected before setup: repository ID `R_kgDOMKBFkQ`; the current observed Discussions state is `false`.

- [ ] **Step 2: Pause for action-time authorization and user interaction**

Before changing repository settings or installing the Giscus app, report the exact external actions. Enabling Discussions and creating categories may be performed with authenticated GitHub tools after confirmation; Giscus app installation may require the user to approve repository access in their signed-in browser.

- [ ] **Step 3: Discover and validate real category IDs**

After Discussions and categories exist, query the repository with GitHub GraphQL and verify both category names resolve to exactly one node ID. Put the IDs in local/deployment environment configuration, not `GITHUB_TOKEN` in source files.

- [ ] **Step 4: Run clean automated verification**

```bash
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npm ci
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npm run typecheck
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npm run lint
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npm run format:check
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npm test
PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" npm run build
```

Expected: every command exits 0 and Vitest reports all tests passing.

- [ ] **Step 5: Browser-test the production build**

Serve on a fresh port and verify:

- A blog page and docs page load the “站点评论” Giscus iframe with different stable terms.
- `/friends` loads the “友链申请” iframe and keeps the YAML instructions.
- `hide_comment: true` still suppresses blog comments.
- Light/dark switching updates the iframe theme.
- Mobile width has no horizontal overflow.
- Homepage and main routes have zero browser console errors.

- [ ] **Step 6: Dry-run the real export**

Run the migration CLI without `--apply`. Compare total records, Discussion groups, root comments, replies, rejected records, and friend applications against the export. Do not perform external writes in this step.

- [ ] **Step 7: Request explicit confirmation before real migration**

Present the target repository, GitHub account, two category names, Discussion count, comment count, reply count, and state-file path. Run `--apply` only after the user confirms this irreversible external write.

- [ ] **Step 8: Commit any final non-secret configuration changes**

```bash
git status --short
git add docusaurus.config.ts package.json package-lock.json src scripts README.md .env.example
git commit -m "feat: migrate comments to GitHub Discussions"
```

Do not stage the user's unrelated `.gitignore` modification.
