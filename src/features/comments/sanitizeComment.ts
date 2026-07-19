import DOMPurify from 'dompurify'

export function sanitizeCommentHtml(content: string): string {
  return DOMPurify.sanitize(content.replace(/\n/g, '<br>'), {
    ALLOWED_TAGS: ['br', 'strong', 'em', 'code', 'a'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_UNKNOWN_PROTOCOLS: false,
  })
}
