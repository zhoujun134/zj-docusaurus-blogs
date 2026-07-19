import React from 'react'

import NoticeCard from '@site/src/components/NoticeCard'
import type { VNoticeCardProps } from '@site/src/utils/interface/zjType'

import styles from './Comments.module.css'

export type CommentDraft = {
  author: string
  email: string
  content: string
}

type Props = {
  draft: CommentDraft
  title: string
  submitting: boolean
  error: string | null
  notice?: VNoticeCardProps
  onChange: (draft: CommentDraft) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function CommentForm({
  draft,
  title,
  submitting,
  error,
  notice,
  onChange,
  onSubmit,
}: Props) {
  return (
    <div className={styles.commentsContainer}>
      <form id="submitCommentForm" onSubmit={onSubmit} className={styles.commentForm}>
        <div className={styles.commentTitle}>
          <h2>{title}</h2>
        </div>
        {error ? (
          <p className={styles.commentError} role="alert">
            {error}
          </p>
        ) : null}
        <div className={styles.inputGroup}>
          <input
            aria-label="用户名"
            type="text"
            value={draft.author}
            onChange={(event) => onChange({ ...draft, author: event.target.value })}
            placeholder="输入你的用户名"
            className={styles.inputFieldLeft}
            required
          />
          <input
            aria-label="邮箱"
            type="email"
            value={draft.email}
            onChange={(event) => onChange({ ...draft, email: event.target.value })}
            placeholder="输入你的邮箱"
            className={styles.inputFieldRight}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <textarea
            aria-label="评论内容"
            value={draft.content}
            onChange={(event) => onChange({ ...draft, content: event.target.value })}
            placeholder="写下你的评论..."
            className={styles.commentInput}
            rows={5}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <button type="submit" className={styles.commentButton} disabled={submitting}>
            {submitting ? '提交中…' : '提交评论'}
          </button>
        </div>
        {notice ? <NoticeCard {...notice} /> : null}
      </form>
    </div>
  )
}
