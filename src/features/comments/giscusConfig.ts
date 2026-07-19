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
