import { describe, expect, it } from 'vitest'

import { groupTagsDeterministically } from './groupTags'

describe('groupTagsDeterministically', () => {
  it('uses the same Unicode code-point order in every runtime', () => {
    const groups = groupTagsDeterministically([
      { label: '随笔', permalink: '/blog/tags/essay' },
      { label: '杂谈', permalink: '/blog/tags/chat' },
      { label: '博客', permalink: '/blog/tags/blog' },
    ])

    expect(groups.map((group) => group.tags.map((tag) => tag.label))).toEqual([
      ['博客'],
      ['杂谈'],
      ['随笔'],
    ])
  })
})
