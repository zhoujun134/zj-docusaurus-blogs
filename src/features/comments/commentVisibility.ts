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
