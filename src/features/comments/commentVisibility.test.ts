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
