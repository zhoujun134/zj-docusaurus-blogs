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
