import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Comments from './index'

const testState = vi.hoisted(() => ({
  colorMode: 'light',
  commentsCategoryId: 'DIC_comments',
  friendCategoryId: 'DIC_friends',
}))

vi.mock('@docusaurus/BrowserOnly', () => ({
  default: ({ children }: { children: () => React.ReactNode }) => children(),
}))

vi.mock('@docusaurus/theme-common', () => ({
  useColorMode: () => ({ colorMode: testState.colorMode }),
}))

vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({
    siteConfig: {
      themeConfig: {
        commentConfig: {
          docs: true,
          blog: true,
          provider: 'giscus',
          giscus: {
            repo: 'zhoujun134/zj-docusaurus-blogs',
            repoId: 'R_kgDOMKBFkQ',
            commentsCategory: '站点评论',
            commentsCategoryId: testState.commentsCategoryId,
            friendCategory: '友链申请',
            friendCategoryId: testState.friendCategoryId,
          },
        },
      },
    },
  }),
}))

vi.mock('@giscus/react', () => ({
  default: (props: {
    term: string
    category: string
    categoryId: string
    theme: string
  }) => (
    <div
      data-testid="giscus"
      data-term={props.term}
      data-category={props.category}
      data-category-id={props.categoryId}
      data-theme={props.theme}
    />
  ),
}))

vi.mock('@site/src/components/NoticeCard', () => ({
  default: ({ title }: { title: string }) => <div>{title}</div>,
}))

describe('Comments', () => {
  beforeEach(() => {
    testState.colorMode = 'light'
    testState.commentsCategoryId = 'DIC_comments'
    testState.friendCategoryId = 'DIC_friends'
  })

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
    expect(screen.getByRole('region', { name: '评论' })).toHaveAttribute('id', 'submitCommentForm')
    expect(screen.getByTestId('giscus')).toHaveAttribute('data-term', 'zbus-friend-applications')
    expect(screen.getByTestId('giscus')).toHaveAttribute('data-category', '友链申请')
  })

  it('uses the dark Giscus theme when Docusaurus is dark', () => {
    testState.colorMode = 'dark'
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
    testState.commentsCategoryId = ''
    render(<Comments articleId="/docs/intro" />)

    expect(screen.getByRole('alert')).toHaveTextContent('GISCUS_COMMENTS_CATEGORY_ID')
    expect(screen.queryByTestId('giscus')).not.toBeInTheDocument()
  })
})
