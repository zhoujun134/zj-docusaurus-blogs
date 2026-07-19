# Docusaurus Theme Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the site to Docusaurus 3.10.2 and rebuild its custom theme integration while preserving visible behavior, fixing security and correctness defects, and making clean installs verifiable in CI.

**Architecture:** Stabilize the current site first, then isolate comment and friend-link behavior behind tested helpers, upgrade the framework, and reintroduce only the theme wrappers required by visible features. Keep content URLs and backend contracts stable; use official Docusaurus components wherever possible and retain a documented internal theme hook only when no public hook can place article comments correctly.

**Tech Stack:** Docusaurus 3.10.2, React 19.2.7, TypeScript 5.9.3, Tailwind CSS 4.3.3, Axios 1.18.1, DOMPurify 3.4.12, Vitest 4.1.10, Testing Library 16.3.2, ESLint 10.7.0, Node 22.22.2.

---

## Target file structure

- `.nvmrc`: supported local and CI Node version.
- `.github/workflows/ci.yml`: install, typecheck, lint, test, and build checks.
- `eslint.config.mjs`: project-owned flat ESLint configuration.
- `vitest.config.ts`: jsdom test environment and aliases.
- `src/test/setup.ts`: Testing Library DOM matchers and cleanup.
- `src/components/Comments/`: comment container, form, list, styles, and component tests.
- `src/features/comments/`: comment visibility, sanitization, and API contracts.
- `src/features/friends/`: friend response normalization and tests.
- `src/utils/requestState.ts`: bounded request activity tracking.
- `src/theme/DocItem/Content/index.tsx`: minimal wrapper that appends copyright and comments.
- `src/theme/BlogPostItem/Content/index.tsx`: minimal wrapper that appends copyright and comments on full posts.
- `src/theme/CodeBlock/`: only the code-block extensions that remain necessary after comparison with Docusaurus 3.10.2.
- `src/theme/`: delete copied theme implementations whose visible behavior can be expressed through CSS or official theme components.

## Task 1: Establish the supported runtime and quality harness

**Files:**
- Create: `.nvmrc`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Modify: `package.json`
- Modify: `tsconfig.json`

- [ ] **Step 1: Record the current missing-script failures**

Run:

```bash
npm run lint
npm test -- --run
```

Expected: both commands fail because the repository has no `lint` or `test` script.

- [ ] **Step 2: Add the Node version file**

Create `.nvmrc` with exactly:

```text
22.22.2
```

- [ ] **Step 3: Install the test and lint toolchain**

Run:

```bash
npm install --save-dev vitest@4.1.10 jsdom@29.1.1 @testing-library/react@16.3.2 @testing-library/dom@10.4.1 @testing-library/user-event@14.6.1 @testing-library/jest-dom@6 @types/react@19.2.17 @types/react-dom@19.2.3 eslint@10.7.0 @eslint/js@10.0.1 typescript-eslint@8.64.0 globals@17.7.0 prettier@3.9.5
```

Expected: `package.json` and `package-lock.json` contain the exact development dependency versions.

- [ ] **Step 4: Add package scripts and constrain Node**

Update `package.json` scripts and engines to include:

```json
{
  "scripts": {
    "lint": "eslint .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "engines": {
    "node": ">=22.22.2 <23"
  }
}
```

Preserve all existing Docusaurus scripts.

- [ ] **Step 5: Configure Vitest**

Create `vitest.config.ts`:

```ts
import path from 'node:path'
import {defineConfig} from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@site': path.resolve(__dirname),
      '@site/src': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
import {cleanup} from '@testing-library/react'
import {afterEach} from 'vitest'

afterEach(cleanup)
```

- [ ] **Step 6: Configure ESLint**

Create `eslint.config.mjs`:

```js
import eslint from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {ignores: ['build/**', '.docusaurus/**', 'node_modules/**']},
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    languageOptions: {
      globals: {...globals.browser, ...globals.node},
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
      'no-console': ['warn', {allow: ['warn', 'error']}],
    },
  },
)
```

- [ ] **Step 7: Verify the harness runs**

Run:

```bash
npm run typecheck
npm run lint
npm test
```

Expected: TypeScript passes; lint reports only real source issues to be fixed in later tasks; Vitest exits successfully with no test files or with `--passWithNoTests` temporarily added only until Task 2 creates the first test.

- [ ] **Step 8: Commit the harness**

```bash
git add .nvmrc package.json package-lock.json tsconfig.json eslint.config.mjs vitest.config.ts src/test/setup.ts
git commit -m "build: add project quality harness"
```

## Task 2: Stabilize the existing Tailwind build before upgrading

**Files:**
- Modify: `tailwind.config.ts`
- Test: production build command

- [ ] **Step 1: Reproduce the current failure**

Run:

```bash
npm run build
```

Expected: FAIL at `tailwind.config.ts` with `_minisvgdatauri2.default.call is not a function`.

- [ ] **Step 2: Replace the incompatible default import**

Change the first imports in `tailwind.config.ts` to:

```ts
import type {Config} from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const svgToDataUri: typeof import('mini-svg-data-uri') = require('mini-svg-data-uri')
```

Keep the existing `bg-grid` implementation unchanged.

- [ ] **Step 3: Verify the original build defect is gone**

Run:

```bash
npm run build
```

Expected: PASS, or fail at a different independently actionable issue; the `_minisvgdatauri2.default.call` error must be absent.

- [ ] **Step 4: Commit the build fix**

```bash
git add tailwind.config.ts
git commit -m "fix: load mini svg data uri compatibly"
```

## Task 3: Add tested comment sanitization

**Files:**
- Create: `src/features/comments/sanitizeComment.ts`
- Create: `src/features/comments/sanitizeComment.test.ts`
- Modify: `src/components/Comments/index.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install the sanitizer**

Run:

```bash
npm install dompurify@3.4.12
```

- [ ] **Step 2: Write the failing sanitizer tests**

Create `src/features/comments/sanitizeComment.test.ts`:

```ts
import {describe, expect, it} from 'vitest'
import {sanitizeCommentHtml} from './sanitizeComment'

describe('sanitizeCommentHtml', () => {
  it('removes scripts, event handlers, and dangerous protocols', () => {
    const html = '<img src=x onerror=alert(1)><script>alert(1)</script><a href="javascript:alert(1)">bad</a>'
    const result = sanitizeCommentHtml(html)

    expect(result).not.toContain('<script')
    expect(result).not.toContain('onerror')
    expect(result).not.toContain('javascript:')
  })

  it('converts plain-text newlines and keeps safe inline formatting', () => {
    expect(sanitizeCommentHtml('hello\n<strong>world</strong>')).toBe('hello<br><strong>world</strong>')
  })
})
```

- [ ] **Step 3: Verify the test fails for the missing module**

Run:

```bash
npm test -- src/features/comments/sanitizeComment.test.ts
```

Expected: FAIL because `sanitizeCommentHtml` does not exist.

- [ ] **Step 4: Implement the minimal sanitizer**

Create `src/features/comments/sanitizeComment.ts`:

```ts
import DOMPurify from 'dompurify'

export function sanitizeCommentHtml(content: string): string {
  return DOMPurify.sanitize(content.replace(/\n/g, '<br>'), {
    ALLOWED_TAGS: ['br', 'strong', 'em', 'code', 'a'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_UNKNOWN_PROTOCOLS: false,
  })
}
```

- [ ] **Step 5: Use sanitized content in the comment renderer**

Replace the current `HtmlContent` implementation with:

```tsx
import {sanitizeCommentHtml} from '@site/src/features/comments/sanitizeComment'

const HtmlContent = ({html}: {html: string}) => (
  <div dangerouslySetInnerHTML={{__html: sanitizeCommentHtml(html)}} />
)
```

- [ ] **Step 6: Verify sanitizer tests and typecheck**

Run:

```bash
npm test -- src/features/comments/sanitizeComment.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit the security fix**

```bash
git add package.json package-lock.json src/features/comments src/components/Comments/index.tsx
git commit -m "fix: sanitize rendered comment content"
```

## Task 4: Make comment visibility deterministic and tested

**Files:**
- Create: `src/features/comments/commentVisibility.ts`
- Create: `src/features/comments/commentVisibility.test.ts`
- Modify: `src/theme/DocItem/Content/index.tsx`
- Modify: `src/theme/BlogPostPage/index.tsx`
- Modify: `src/types.d.ts`

- [ ] **Step 1: Write failing visibility tests**

Create `src/features/comments/commentVisibility.test.ts`:

```ts
import {describe, expect, it} from 'vitest'
import {shouldShowComments} from './commentVisibility'

describe('shouldShowComments', () => {
  it('requires the matching global switch', () => {
    expect(shouldShowComments('docs', {docs: false, blog: true}, false)).toBe(false)
    expect(shouldShowComments('blog', {docs: false, blog: true}, false)).toBe(true)
  })

  it('allows front matter to hide comments', () => {
    expect(shouldShowComments('blog', {docs: true, blog: true}, true)).toBe(false)
  })
})
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test -- src/features/comments/commentVisibility.test.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement visibility policy**

Create `src/features/comments/commentVisibility.ts`:

```ts
export type CommentTarget = 'docs' | 'blog'

export type CommentSwitches = {
  docs: boolean
  blog: boolean
}

export function shouldShowComments(
  target: CommentTarget,
  switches: CommentSwitches,
  hideComment = false,
): boolean {
  return switches[target] && !hideComment
}
```

- [ ] **Step 4: Define typed theme configuration**

Extend `src/types.d.ts` with:

```ts
declare module '@docusaurus/preset-classic' {
  interface ThemeConfig {
    commentConfig?: {
      docs: boolean
      blog: boolean
      commentApiHost: string
      api: {
        submitComment: string
        commentList: string
      }
    }
  }
}
```

- [ ] **Step 5: Apply policy in docs and blog integrations**

In each wrapper, read `themeConfig.commentConfig`, default both switches to `false`, and render `Comments` only when `shouldShowComments(...)` returns true. For blog posts, pass `Boolean(frontMatter.hide_comment)` as the third argument.

- [ ] **Step 6: Verify tests and typecheck**

Run:

```bash
npm test -- src/features/comments/commentVisibility.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit visibility behavior**

```bash
git add src/features/comments src/theme/DocItem/Content/index.tsx src/theme/BlogPostPage/index.tsx src/types.d.ts
git commit -m "fix: honor comment visibility settings"
```

## Task 5: Correct request state and API result contracts

**Files:**
- Create: `src/utils/requestState.ts`
- Create: `src/utils/requestState.test.ts`
- Modify: `src/utils/interface/zjType.ts`
- Modify: `src/utils/service.ts`
- Modify: `src/utils/articleApi.ts`

- [ ] **Step 1: Write the failing request-state test**

Create `src/utils/requestState.test.ts`:

```ts
import {describe, expect, it} from 'vitest'
import {createRequestState} from './requestState'

describe('createRequestState', () => {
  it('never decrements below zero', () => {
    const state = createRequestState()
    state.finish()
    expect(state.active()).toBe(0)
    state.start()
    state.finish()
    expect(state.active()).toBe(0)
  })
})
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test -- src/utils/requestState.test.ts
```

Expected: FAIL because `createRequestState` does not exist.

- [ ] **Step 3: Implement bounded request state**

Create `src/utils/requestState.ts`:

```ts
export function createRequestState() {
  let count = 0

  return {
    start: () => {
      count += 1
      return count
    },
    finish: () => {
      count = Math.max(0, count - 1)
      return count
    },
    active: () => count,
  }
}
```

- [ ] **Step 4: Tighten shared types**

Change the result and request identifiers to:

```ts
export interface IResult<T> {
  code: string
  message: string
  data?: T
}

export interface ICommentSubmitRequest {
  articleId?: string
  articleTitle?: string
  parentCommentId?: string | null
  replyCommentId?: string | null
  author: string
  email: string
  content: string
}
```

Remove `T | any` from `IResult`.

- [ ] **Step 5: Use the request state in Axios interceptors**

Replace the module-level numeric counter in `src/utils/service.ts` with one `createRequestState()` instance. Call `start()` in the request interceptor and `finish()` in both response branches. Return `response.data` directly with an `unknown` generic rather than assigning an unused `IResult<any>`.

- [ ] **Step 6: Return typed API results without JSON cloning**

In `src/utils/articleApi.ts`, replace `JSON.parse(JSON.stringify(resp))` with typed Axios calls and return values:

```ts
return request.get<unknown, IResult<ICommentInfo[]>>('/api/article/comment', {
  params: {articleId},
})
```

Use the same pattern for comment submission.

- [ ] **Step 7: Verify tests, types, and lint**

Run:

```bash
npm test -- src/utils/requestState.test.ts
npm run typecheck
npm run lint
```

Expected: request-state test and typecheck pass; fix lint errors in touched files before committing.

- [ ] **Step 8: Commit request corrections**

```bash
git add src/utils/requestState.ts src/utils/requestState.test.ts src/utils/interface/zjType.ts src/utils/service.ts src/utils/articleApi.ts
git commit -m "refactor: make API request state type safe"
```

## Task 6: Normalize friend responses safely

**Files:**
- Create: `src/features/friends/normalizeFriends.ts`
- Create: `src/features/friends/normalizeFriends.test.ts`
- Modify: `src/pages/friends/index.tsx`

- [ ] **Step 1: Write failing normalization tests**

Create `src/features/friends/normalizeFriends.test.ts`:

```ts
import {describe, expect, it} from 'vitest'
import {normalizeFriends} from './normalizeFriends'

describe('normalizeFriends', () => {
  it('returns empty groups for missing or failed responses', () => {
    expect(normalizeFriends(undefined)).toEqual({friends: [], tools: []})
    expect(normalizeFriends({code: '500', message: 'failed'})).toEqual({friends: [], tools: []})
  })

  it('maps known backend groups', () => {
    const result = normalizeFriends({
      code: '0',
      message: 'ok',
      data: {
        我的友链: [{title: 'A', description: 'B', siteUrl: 'https://a.test', logoUrl: '/a.png'}],
      },
    })
    expect(result.friends[0].website).toBe('https://a.test')
  })
})
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test -- src/features/friends/normalizeFriends.test.ts
```

Expected: FAIL because the helper does not exist.

- [ ] **Step 3: Implement safe normalization**

Create `src/features/friends/normalizeFriends.ts`:

```ts
import type {Friend, IFriendInfo, IResult} from '@site/src/utils/interface/zjType'

type FriendGroups = Record<string, IFriendInfo[]>

function mapFriend(friend: IFriendInfo): Friend {
  return {
    title: friend.title ?? '',
    description: friend.description ?? '',
    website: friend.siteUrl ?? '',
    avatar: friend.logoUrl,
  }
}

export function normalizeFriends(response?: IResult<FriendGroups>): {
  friends: Friend[]
  tools: Friend[]
} {
  if (response?.code !== '0' || !response.data) {
    return {friends: [], tools: []}
  }

  return {
    friends: (response.data['我的友链'] ?? []).map(mapFriend),
    tools: (response.data['我的工具组'] ?? []).map(mapFriend),
  }
}
```

- [ ] **Step 4: Simplify the friend page**

Change the service result type from `Map` to `Record<string, IFriendInfo[]>`, return error code `'-1'`, replace the invalid `if (!result && result.code != '0')` branch with `normalizeFriends(result)`, and set both state arrays from the helper result.

- [ ] **Step 5: Verify tests and types**

Run:

```bash
npm test -- src/features/friends/normalizeFriends.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit friend handling**

```bash
git add src/features/friends src/pages/friends/index.tsx
git commit -m "fix: handle friend API failures safely"
```

## Task 7: Rebuild the comment UI into focused components

**Files:**
- Create: `src/components/Comments/CommentList.tsx`
- Create: `src/components/Comments/CommentForm.tsx`
- Create: `src/components/Comments/Comments.test.tsx`
- Modify: `src/components/Comments/index.tsx`
- Modify: `src/components/Comments/Comments.module.css`

- [ ] **Step 1: Write failing user-behavior tests**

Create `src/components/Comments/Comments.test.tsx` with mocked API module functions and these cases:

```tsx
it('keeps entered values and shows an error when submission fails', async () => {
  vi.mocked(submitComment).mockResolvedValue({code: '-1', message: '提交失败', data: false})
  render(<Comments articleId="/blog/test" />)
  await user.type(screen.getByLabelText('用户名'), 'Z')
  await user.type(screen.getByLabelText('邮箱'), 'z@example.com')
  await user.type(screen.getByLabelText('评论内容'), 'hello')
  await user.click(screen.getByRole('button', {name: '提交评论'}))
  expect(await screen.findByRole('alert')).toHaveTextContent('提交失败')
  expect(screen.getByLabelText('评论内容')).toHaveValue('hello')
})

it('disables the submit button while a request is pending', async () => {
  vi.mocked(submitComment).mockReturnValue(new Promise(() => undefined))
  render(<Comments articleId="/blog/test" />)
  await user.type(screen.getByLabelText('用户名'), 'Z')
  await user.type(screen.getByLabelText('邮箱'), 'z@example.com')
  await user.type(screen.getByLabelText('评论内容'), 'hello')
  await user.click(screen.getByRole('button', {name: '提交评论'}))
  expect(screen.getByRole('button', {name: '提交中…'})).toBeDisabled()
})
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test -- src/components/Comments/Comments.test.tsx
```

Expected: FAIL because current controls do not have accessible labels and failed submissions clear or hide state incorrectly.

- [ ] **Step 3: Extract `CommentList`**

Move recursive comment rendering and sanitized HTML into `CommentList.tsx`. Accept `comments` and `onReply(comment, parentId)` props. Use buttons for reply actions and stable `commentId` keys.

- [ ] **Step 4: Extract `CommentForm`**

Move form state and controls into `CommentForm.tsx`. Give inputs labels `用户名`, `邮箱`, and `评论内容`. Accept `submitting`, `error`, `initialContent`, and `onSubmit` props. Disable submission while pending and render errors with `role="alert"`.

- [ ] **Step 5: Make the container own async state**

`Comments/index.tsx` should own `loading`, `loadError`, `submitting`, `submitError`, comments, and reply target. On failed submission, preserve form input. On success, reload comments and reset the form. Remove debugging `console.log` and direct `window.location.href` mutation; use `document.getElementById('submitCommentForm')?.scrollIntoView({behavior: 'smooth'})`.

- [ ] **Step 6: Verify component tests**

Run:

```bash
npm test -- src/components/Comments/Comments.test.tsx
npm run typecheck
npm run lint
```

Expected: PASS with no lint errors in touched files.

- [ ] **Step 7: Commit the comment UI rebuild**

```bash
git add src/components/Comments
git commit -m "refactor: rebuild comment interactions"
```

## Task 8: Upgrade Docusaurus, React, and primary dependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `docusaurus.config.ts`
- Modify: `tsconfig.json`
- Modify: `babel.config.js`

- [ ] **Step 1: Capture the pre-upgrade verification state**

Run:

```bash
npm run typecheck
npm test
npm run build
```

Expected: all checks pass after Tasks 1–7.

- [ ] **Step 2: Upgrade the framework family together**

Run:

```bash
npm install @docusaurus/core@3.10.2 @docusaurus/preset-classic@3.10.2 @docusaurus/plugin-content-blog@3.10.2 @docusaurus/plugin-ideal-image@3.10.2 @docusaurus/plugin-pwa@3.10.2 @docusaurus/plugin-sitemap@3.10.2 @docusaurus/theme-search-algolia@3.10.2 @docusaurus/module-type-aliases@3.10.2 @docusaurus/tsconfig@3.10.2 @docusaurus/types@3.10.2 react@19.2.7 react-dom@19.2.7 @mdx-js/react@3.1.1 axios@1.18.1 clsx@2.1.1 framer-motion@12.42.2 @iconify/react@6.0.2 react-github-calendar@5.0.6 react-icon-cloud@4.1.7 tailwind-merge@3.6.0 prism-react-renderer@2.4.1 docusaurus-plugin-image-zoom@3.0.1 typescript@5.9.3
```

- [ ] **Step 3: Remove stale and duplicated dependencies**

Run:

```bash
npm uninstall postcss-loader punycode rehype-prism-plus react-popper
```

Keep `postcss` only as a development dependency. Remove duplicate `autoprefixer`, `postcss-loader`, and `tailwindcss` entries so each package appears in one dependency section.

- [ ] **Step 4: Align TypeScript configuration**

Keep `extends: '@docusaurus/tsconfig'`, add `noUncheckedIndexedAccess: true`, and keep the `baseUrl` alias. Do not enable TypeScript 7-only options.

- [ ] **Step 5: Run Docusaurus checks and fix public API changes**

Run:

```bash
npm run typecheck
npm run build
```

Expected initially: failures identify old theme imports. Fix only configuration and public import changes in this task; theme-file removals are handled in Task 10.

- [ ] **Step 6: Commit dependency upgrade**

```bash
git add package.json package-lock.json docusaurus.config.ts tsconfig.json babel.config.js
git commit -m "build: upgrade docusaurus and react"
```

## Task 9: Migrate Tailwind to version 4

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `docusaurus.config.ts`
- Modify: `tailwind.config.ts`
- Modify: `src/css/custom.css`

- [ ] **Step 1: Record the Tailwind 3 baseline**

Run:

```bash
./node_modules/.bin/tailwindcss -i ./src/css/custom.css -o /tmp/zj-tailwind-v3.css --config ./tailwind.config.ts
```

Expected: PASS and generate CSS containing `.bg-grid-slate-50`.

- [ ] **Step 2: Upgrade Tailwind and its PostCSS adapter**

Run:

```bash
npm install --save-dev tailwindcss@4.3.3 @tailwindcss/postcss@4.3.3 postcss@8.5.6
npm uninstall autoprefixer mini-svg-data-uri
```

- [ ] **Step 3: Replace the PostCSS plugin configuration**

Change the Docusaurus PostCSS plugin to push only:

```ts
postcssOptions.plugins.push(require('@tailwindcss/postcss'))
```

- [ ] **Step 4: Replace Tailwind directives**

At the beginning of `src/css/custom.css`, replace the three `@tailwind` directives with:

```css
@config "../../tailwind.config.ts";
@import "tailwindcss";
```

- [ ] **Step 5: Replace generated SVG grid utility with CSS**

Remove the `mini-svg-data-uri` import and custom Tailwind plugin from `tailwind.config.ts`. Add stable grid classes to `src/css/custom.css`:

```css
.bg-grid-slate-50 {
  background-image: linear-gradient(to right, rgb(248 250 252) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(248 250 252) 1px, transparent 1px);
  background-size: 32px 32px;
}

.dark .dark\\:bg-grid-slate-700\\/25,
[data-theme='dark'] .dark\\:bg-grid-slate-700\\/25 {
  background-image: linear-gradient(to right, rgb(51 65 85 / 25%) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(51 65 85 / 25%) 1px, transparent 1px);
  background-size: 32px 32px;
}
```

- [ ] **Step 6: Verify Tailwind and the full build**

Run:

```bash
npm run typecheck
npm test
npm run build
```

Expected: PASS; homepage grid and utility classes remain present in generated CSS.

- [ ] **Step 7: Commit Tailwind migration**

```bash
git add package.json package-lock.json docusaurus.config.ts tailwind.config.ts src/css/custom.css
git commit -m "build: migrate styles to tailwind 4"
```

## Task 10: Replace copied theme internals with minimal wrappers

**Files:**
- Delete: obsolete files under `src/theme/Blog*`, `src/theme/Tag`, `src/theme/TagsListByLetter`, `src/theme/Navbar`, `src/theme/PaginatorNavLink`, `src/theme/Admonition`, and `src/theme/MDXComponents`
- Create or modify: `src/theme/DocItem/Content/index.tsx`
- Create or modify: `src/theme/BlogPostItem/Content/index.tsx`
- Modify: `src/css/custom.css`
- Test: `src/features/comments/commentVisibility.test.ts`

- [ ] **Step 1: Verify the upgraded build fails through copied theme internals**

Run:

```bash
npm run typecheck
npm run build
```

Expected: failures reference old Docusaurus theme types or `@docusaurus/theme-common/internal` imports.

- [ ] **Step 2: Inventory required visible differences**

For each `src/theme` directory, compare it to Docusaurus 3.10.2 using:

```bash
npm run swizzle -- --list
```

Record the keep/delete decision in the commit body. Keep only wrappers that add copyright notices, comments, grid blog layout, or code-block controls not supplied by the default theme.

- [ ] **Step 3: Replace docs integration with a wrapper**

Implement `src/theme/DocItem/Content/index.tsx` as a wrapper around `@theme-original/DocItem/Content`:

```tsx
import React from 'react'
import {useLocation} from '@docusaurus/router'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Content from '@theme-original/DocItem/Content'
import type ContentType from '@theme/DocItem/Content'
import type {WrapperProps} from '@docusaurus/types'
import Comments from '@site/src/components/Comments'
import NoticeCard from '@site/src/components/NoticeCard'
import {shouldShowComments} from '@site/src/features/comments/commentVisibility'

type Props = WrapperProps<typeof ContentType>

export default function ContentWrapper(props: Props): JSX.Element {
  const {pathname} = useLocation()
  const {siteConfig} = useDocusaurusContext()
  const switches = siteConfig.themeConfig.commentConfig ?? {docs: false, blog: false}
  const url = `${siteConfig.url}${pathname}`

  return (
    <>
      <Content {...props} />
      <NoticeCard
        title="本文声明"
        href={url}
        type="danger"
        icon="💡"
        description={<p>转载请注明出处：<a href={url}>{url}</a></p>}
      />
      {shouldShowComments('docs', switches) ? <Comments articleId={pathname} /> : null}
    </>
  )
}
```

- [ ] **Step 4: Replace blog integration with one narrow content override**

Implement `src/theme/BlogPostItem/Content/index.tsx` as a wrapper around the official content renderer. Use the Docusaurus 3.10.2 `Props` type generated by `swizzle --wrap`, then apply this component body:

```tsx
import React from 'react'
import {useLocation} from '@docusaurus/router'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
// Docusaurus exposes no public hook for full-post state inside BlogPostItem/Content.
// Keep this single internal dependency covered by production builds during upgrades.
import {useBlogPost} from '@docusaurus/theme-common/internal'
import Content from '@theme-original/BlogPostItem/Content'
import type ContentType from '@theme/BlogPostItem/Content'
import type {WrapperProps} from '@docusaurus/types'
import Comments from '@site/src/components/Comments'
import NoticeCard from '@site/src/components/NoticeCard'
import {shouldShowComments} from '@site/src/features/comments/commentVisibility'

type Props = WrapperProps<typeof ContentType>

export default function BlogPostItemContentWrapper(props: Props): JSX.Element {
  const {pathname} = useLocation()
  const {siteConfig} = useDocusaurusContext()
  const {isBlogPostPage, metadata} = useBlogPost()
  const switches = siteConfig.themeConfig.commentConfig ?? {docs: false, blog: false}
  const hideComment = Boolean(metadata.frontMatter.hide_comment)
  const url = `${siteConfig.url}${pathname}`

  return (
    <>
      <Content {...props} />
      {isBlogPostPage ? (
        <>
          <NoticeCard
            title="本文声明"
            href={url}
            type="danger"
            icon="💡"
            description={<p>转载请注明出处：<a href={url}>{url}</a></p>}
          />
          {shouldShowComments('blog', switches, hideComment) ? (
            <Comments articleId={pathname} articleTitle={metadata.title} />
          ) : null}
        </>
      ) : null}
    </>
  )
}
```

The internal import must retain this comment:

```ts
// Docusaurus exposes no public hook for full-post state inside BlogPostItem/Content.
// Keep this single internal dependency covered by production builds during upgrades.
```

- [ ] **Step 5: Remove obsolete theme copies**

Delete theme overrides that now match the official theme. Preserve custom presentation by moving stable selectors and variables into `src/css/custom.css`, never by targeting generated hash class names.

- [ ] **Step 6: Verify comments and all content routes build**

Run:

```bash
npm test -- src/features/comments/commentVisibility.test.ts
npm run typecheck
npm run build
```

Expected: PASS with no unresolved theme imports.

- [ ] **Step 7: Commit the theme reset**

```bash
git add src/theme src/css/custom.css
git commit -m "refactor: rebuild theme overrides for docusaurus 3.10"
```

## Task 11: Restore code-block features against the new theme

**Files:**
- Modify or recreate: `src/theme/CodeBlock/index.tsx`
- Modify or recreate: `src/theme/CodeBlock/Container/index.tsx`
- Modify or recreate: `src/theme/CodeBlock/CollapseCodeButton/index.tsx`
- Modify or recreate: `src/theme/CodeBlock/WordWrapButton/index.tsx`
- Create: `src/theme/CodeBlock/CodeBlockControls.test.tsx`

- [ ] **Step 1: Write failing control tests**

Create tests that render a long code block and assert:

```tsx
expect(screen.getByRole('button', {name: '折叠代码'})).toBeInTheDocument()
expect(screen.getByRole('button', {name: '自动换行'})).toBeInTheDocument()
await user.click(screen.getByRole('button', {name: '自动换行'}))
expect(screen.getByTestId('code-content')).toHaveClass('codeBlockLinesWithWordWrap')
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test -- src/theme/CodeBlock/CodeBlockControls.test.tsx
```

Expected: FAIL after the old incompatible code-block overrides are removed.

- [ ] **Step 3: Swizzle the 3.10.2 code-block wrapper**

Run:

```bash
npm run swizzle @docusaurus/theme-classic CodeBlock -- --wrap
```

Keep the official renderer and add only two accessible buttons: `折叠代码` and `自动换行`. Reuse existing CSS module class names where they still represent the same visible state.

- [ ] **Step 4: Verify controls and production build**

Run:

```bash
npm test -- src/theme/CodeBlock/CodeBlockControls.test.tsx
npm run typecheck
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit code-block controls**

```bash
git add src/theme/CodeBlock
git commit -m "feat: restore code block controls"
```

## Task 12: Correct site configuration and documentation

**Files:**
- Modify: `package.json`
- Modify: `docusaurus.config.ts`
- Modify: `README.md`
- Modify: `blog/2024-01/2024-01-05-09-16-55-kuai-pao-xiao-huo-che---dan-sheng-la.md`

- [ ] **Step 1: Add a configuration regression test**

Create `src/config/siteConfig.test.ts`:

```ts
import {describe, expect, it} from 'vitest'
import config from '../../docusaurus.config'

describe('site configuration', () => {
  it('contains only the project identity', () => {
    const serialized = JSON.stringify(config)
    expect(config.title).toBe('Z 不殊')
    expect(serialized).toContain('zhoujun134')
    expect(serialized).not.toContain('kuizuo/blog')
    expect(serialized).not.toContain('愧怍')
  })
})
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test -- src/config/siteConfig.test.ts
```

Expected: FAIL because the current edit link and feed copyright contain copied branding.

- [ ] **Step 3: Correct site identity**

Set `package.json.name` to `zj-docusaurus-blogs`. Change the blog `editUrl` to:

```ts
`https://github.com/zhoujun134/zj-docusaurus-blogs/edit/main/${blogDirPath}/${blogPath}`
```

Replace copied feed copyright text with `Z 不殊`. Replace default Docusaurus community Footer links with the configured GitHub, 掘金, email, docs, blog, project, and friends links.

- [ ] **Step 4: Correct README and content residue**

Replace the incomplete backend deployment link with the existing backend repository URL. Update installation instructions to Node 22.22.2 and `npm ci`. Correct the missing `/log.png` image reference to `/logo.png`. Remove the contradictory statement that the site is built with Halo.

- [ ] **Step 5: Verify config test and broken links**

Run:

```bash
npm test -- src/config/siteConfig.test.ts
npm run build
```

Expected: PASS with no broken internal links.

- [ ] **Step 6: Commit configuration cleanup**

```bash
git add package.json docusaurus.config.ts README.md blog src/config/siteConfig.test.ts
git commit -m "docs: align site identity and setup instructions"
```

## Task 13: Add continuous integration

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `package.json`

- [ ] **Step 1: Verify the full local command sequence**

Run:

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

Expected: PASS before encoding the same checks in CI.

- [ ] **Step 2: Create the workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run format:check
      - run: npm test
      - run: npm run build
```

- [ ] **Step 3: Validate workflow syntax locally**

Run:

```bash
npx prettier --check .github/workflows/ci.yml package.json
```

Expected: PASS.

- [ ] **Step 4: Commit CI**

```bash
git add .github/workflows/ci.yml package.json
git commit -m "ci: verify site quality and production build"
```

## Task 14: Perform visual and functional regression verification

**Files:**
- Modify: the specific source or style file responsible for each observed regression; stage each correction explicitly rather than using a blanket add.
- Update: `README.md` only if final commands differ from documented commands.

- [ ] **Step 1: Start the production preview**

Run:

```bash
npm run build
npm run serve -- --host 127.0.0.1
```

Expected: production server starts and all generated routes are available.

- [ ] **Step 2: Verify core routes**

Inspect these routes at desktop and mobile widths in both themes:

```text
/
/blog
/blog/bu-que-ding-xing-de-hu-lian-wang-huan-jing
/docs/intro
/project
/friends
/blog/archive
/blog/tags
```

Expected: no blank pages, hydration errors, horizontal overflow, missing navigation, or visibly broken cards.

- [ ] **Step 3: Verify interactive behavior**

Confirm theme switching, mobile navigation, project links, friend links, image zoom, code copy, code wrapping, code collapse, comment loading failure state, reply scrolling, and comment submission failure preservation.

- [ ] **Step 4: Run the final verification suite**

Run:

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
git status --short
```

Expected: every command passes and `git status --short` contains only intentional final changes, or is clean after the final commit.

- [ ] **Step 5: Commit regression fixes**

```bash
git add package.json package-lock.json docusaurus.config.ts tailwind.config.ts src README.md .github
git commit -m "fix: resolve theme rebuild regressions"
```
