import React from 'react'

import { sanitizeCommentHtml } from '@site/src/features/comments/sanitizeComment'
import type { ICommentInfo } from '@site/src/utils/interface/zjType'

import styles from './Comments.module.css'

type Props = {
  comments: ICommentInfo[]
  onReply: (comment: ICommentInfo, parentCommentId?: string) => void
}

function Avatar({ author }: { author: string }) {
  return (
    <svg
      aria-label={`${author} 的头像`}
      width={50}
      height={50}
      viewBox="0 0 100 100"
      className={styles.avatar}
    >
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle">
        {author[0] ?? '?'}
      </text>
    </svg>
  )
}

function CommentItem({
  comment,
  parentCommentId,
  onReply,
}: {
  comment: ICommentInfo
  parentCommentId?: string
  onReply: Props['onReply']
}) {
  const rootCommentId = parentCommentId ?? comment.commentId

  return (
    <li className={styles.commentItem}>
      <div className={styles.commentItemUp}>
        <Avatar author={comment.author} />
        <div
          className={styles.commentItemContent}
          dangerouslySetInnerHTML={{ __html: sanitizeCommentHtml(comment.content) }}
        />
      </div>
      <div className={styles.commentItemDown}>
        <p className={styles.commentCreateTime}>{comment.createTime}</p>
        <button
          className={styles.replyButton}
          type="button"
          onClick={() => onReply(comment, rootCommentId)}
        >
          回复
        </button>
      </div>
      {comment.children?.length ? (
        <div className={styles.commentListContainer}>
          <ul>
            {comment.children.map((child) => (
              <CommentItem
                key={child.commentId}
                comment={child}
                parentCommentId={rootCommentId}
                onReply={onReply}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  )
}

export default function CommentList({ comments, onReply }: Props) {
  return (
    <div className={styles.commentListContainer}>
      <ul>
        {comments.map((comment) => (
          <CommentItem
            key={comment.commentId}
            comment={comment}
            parentCommentId={comment.commentId}
            onReply={onReply}
          />
        ))}
      </ul>
    </div>
  )
}
