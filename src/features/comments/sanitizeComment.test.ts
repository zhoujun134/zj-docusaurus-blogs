import { describe, expect, it } from 'vitest'

import { sanitizeCommentHtml } from './sanitizeComment'

describe('sanitizeCommentHtml', () => {
  it('removes scripts, event handlers, and dangerous protocols', () => {
    const html =
      '<img src=x onerror=alert(1)><script>alert(1)</script><a href="javascript:alert(1)">bad</a>'

    const result = sanitizeCommentHtml(html)

    expect(result).not.toContain('<script')
    expect(result).not.toContain('onerror')
    expect(result).not.toContain('javascript:')
  })

  it('converts plain-text newlines and keeps safe inline formatting', () => {
    expect(sanitizeCommentHtml('hello\n<strong>world</strong>')).toBe(
      'hello<br><strong>world</strong>',
    )
  })
})
