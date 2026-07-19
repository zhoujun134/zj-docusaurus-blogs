export const FRIEND_APPLICATION_IDS = new Set(['@site/my-friends/links/apply', '/friends'])

export function normalizeArticlePath(value) {
  const pathOnly = String(value).split(/[?#]/, 1)[0] || '/'
  const withLeadingSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`
  return withLeadingSlash === '/' ? '/' : withLeadingSlash.replace(/\/+$/, '')
}

export function createMigrationTerm(articleId) {
  return FRIEND_APPLICATION_IDS.has(articleId)
    ? 'zbus-friend-applications'
    : `zbus-comment:${normalizeArticlePath(articleId)}`
}

export function flattenComments(records) {
  const flattened = []

  const visit = (record, context = {}) => {
    const { children = [], ...values } = record
    const comment = {
      ...values,
      articleId: values.articleId ?? context.articleId,
      articleTitle: values.articleTitle ?? context.articleTitle,
      parentCommentId: values.parentCommentId ?? context.parentCommentId ?? null,
    }
    flattened.push(comment)

    for (const child of children) {
      visit(child, {
        articleId: comment.articleId,
        articleTitle: comment.articleTitle,
        parentCommentId: comment.commentId,
      })
    }
  }

  for (const record of records) visit(record)
  return flattened
}

export function validateComments(records) {
  const ids = new Set()

  for (const record of records) {
    for (const field of ['commentId', 'articleId', 'author', 'content']) {
      if (!String(record[field] ?? '').trim()) throw new Error(`缺少必填字段 ${field}`)
    }
    if (ids.has(record.commentId)) throw new Error(`重复 commentId: ${record.commentId}`)
    ids.add(record.commentId)
  }

  for (const record of records) {
    if (record.parentCommentId && !ids.has(record.parentCommentId)) {
      throw new Error(`找不到父评论 ${record.parentCommentId}`)
    }
  }

  return records
}

export function formatMigratedBody(record) {
  const oneLine = (value) => String(value).replace(/\s+/g, ' ').trim()
  const escapedContent = String(record.content)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r\n/g, '\n')
  const createdAt = oneLine(record.createTime || '原系统未记录')
  const replyLine = record.replyAuthor ? `\n> 回复原作者：${oneLine(record.replyAuthor)}` : ''

  return [
    '> 历史评论迁移',
    `> 原作者：${oneLine(record.author)}`,
    `> 原发布时间：${createdAt}`,
    `> 原评论 ID：${oneLine(record.commentId)}${replyLine}`,
    '',
    escapedContent,
  ].join('\n')
}

function orderGroup(records) {
  const pending = [...records]
  const ordered = []
  const roots = new Map()
  const byId = new Map(records.map((record) => [record.commentId, record]))

  while (pending.length > 0) {
    const index = pending.findIndex(
      (record) =>
        !record.parentCommentId ||
        ordered.some((item) => item.commentId === record.parentCommentId),
    )
    if (index < 0) throw new Error('评论回复关系存在循环')

    const [record] = pending.splice(index, 1)
    const rootCommentId = record.parentCommentId
      ? (roots.get(record.parentCommentId) ?? record.parentCommentId)
      : record.commentId
    roots.set(record.commentId, rootCommentId)
    const repliedTo = byId.get(record.replyCommentId ?? record.parentCommentId)
    ordered.push({ ...record, rootCommentId, replyAuthor: repliedTo?.author })
  }

  return ordered
}

export function createMigrationPlan(input) {
  const records = validateComments(flattenComments(input))
  const groups = new Map()

  for (const record of records) {
    const term = createMigrationTerm(record.articleId)
    const group = groups.get(term) ?? {
      term,
      title: record.articleTitle || normalizeArticlePath(record.articleId),
      category: FRIEND_APPLICATION_IDS.has(record.articleId) ? 'friends' : 'comments',
      comments: [],
    }
    group.comments.push(record)
    groups.set(term, group)
  }

  return {
    groups: [...groups.values()].map((group) => ({
      ...group,
      comments: orderGroup(group.comments),
    })),
  }
}
