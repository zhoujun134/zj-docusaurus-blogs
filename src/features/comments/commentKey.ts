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
