import { describe, expect, it } from 'vitest'

import {
  createMigrationPlan,
  flattenComments,
  formatMigratedBody,
  validateComments,
} from './migration-core.mjs'

const comment = (overrides = {}) => ({
  commentId: '1',
  articleId: '/blog/example',
  articleTitle: '示例文章',
  parentCommentId: null,
  replyCommentId: null,
  author: '示例作者',
  content: '示例内容',
  createTime: '2024-05-01T12:30:00+08:00',
  ...overrides,
})

describe('historical comment migration planning', () => {
  it('rejects duplicate IDs before producing a plan', () => {
    expect(() => validateComments([comment(), comment()])).toThrow('重复 commentId: 1')
  })

  it('rejects orphan replies', () => {
    expect(() =>
      validateComments([comment({ commentId: '2', parentCommentId: 'missing' })]),
    ).toThrow('找不到父评论 missing')
  })

  it('inherits article metadata while flattening nested API exports', () => {
    const flattened = flattenComments([
      comment({
        children: [
          {
            commentId: '2',
            author: '回复者',
            content: '回复内容',
          },
        ],
      }),
    ])

    expect(flattened[1]).toMatchObject({
      articleId: '/blog/example',
      articleTitle: '示例文章',
      parentCommentId: '1',
    })
  })

  it('groups friend applications into their dedicated term', () => {
    const plan = createMigrationPlan([
      comment({
        articleId: '@site/my-friends/links/apply',
        articleTitle: '友链申请',
      }),
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
    expect(plan.groups[0].comments[2].replyAuthor).toBe('示例作者')
  })

  it('formats original identity and time as quoted metadata', () => {
    expect(formatMigratedBody(comment({ author: '张三' }))).toContain(
      '> 原作者：张三\n> 原发布时间：2024-05-01T12:30:00+08:00',
    )
  })

  it('escapes imported HTML so GitHub renders it as text', () => {
    expect(formatMigratedBody(comment({ content: '<img src=x onerror=alert(1)>' }))).toContain(
      '&lt;img src=x onerror=alert(1)&gt;',
    )
  })
})
