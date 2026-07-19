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
