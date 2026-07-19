import BrowserOnly from '@docusaurus/BrowserOnly'
import React, { useEffect, useState } from 'react'

import NoticeCard from '@site/src/components/NoticeCard'
import { getCommentListByArticleId, submitComment } from '@site/src/utils/articleApi'
import type {
  ICommentInfo,
  ICommentSubmitRequest,
  VNoticeCardProps,
} from '@site/src/utils/interface/zjType'

import CommentForm, { type CommentDraft } from './CommentForm'
import CommentList from './CommentList'
import styles from './Comments.module.css'

interface CommentsProps {
  articleId: string
  articleTitle?: string
  noticeCardBeforeSumitForm?: VNoticeCardProps
}

const EMPTY_DRAFT: CommentDraft = { author: '', email: '', content: '' }

export default function Comments({
  articleId,
  articleTitle,
  noticeCardBeforeSumitForm,
}: CommentsProps) {
  const [comments, setComments] = useState<ICommentInfo[]>([])
  const [draft, setDraft] = useState<CommentDraft>(EMPTY_DRAFT)
  const [parentCommentId, setParentCommentId] = useState<string | null>(null)
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null)
  const [commentTitle, setCommentTitle] = useState('# 欢迎留下您的宝贵评论')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const fetchComments = async () => {
    setLoading(true)
    const result = await getCommentListByArticleId(articleId)
    setLoading(false)

    if (result.code !== '0') {
      setLoadError(result.message)
      return false
    }

    setLoadError(null)
    setComments(result.data ?? [])
    return true
  }

  useEffect(() => {
    void fetchComments()
  }, [articleId])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setSubmitError(null)

    const submitRequest: ICommentSubmitRequest = {
      articleId,
      articleTitle,
      author: draft.author.trim(),
      email: draft.email.trim(),
      content: draft.content,
      parentCommentId,
      replyCommentId: replyingCommentId,
    }
    const result = await submitComment(submitRequest)

    if (result.code !== '0' || result.data !== true) {
      setSubmitError(result.message || '评论提交失败，请稍后重试。')
      setSubmitting(false)
      return
    }

    await fetchComments()
    setDraft(EMPTY_DRAFT)
    setParentCommentId(null)
    setReplyingCommentId(null)
    setCommentTitle('# 欢迎留下您的宝贵评论')
    setSubmitting(false)
  }

  const handleReply = (comment: ICommentInfo, rootCommentId?: string) => {
    setParentCommentId(rootCommentId ?? comment.commentId ?? null)
    setReplyingCommentId(comment.commentId ?? null)
    setDraft((current) => ({
      ...current,
      content: `${current.author} 回复 ${comment.author}: `,
    }))
    setCommentTitle(`# 回复 ${comment.author} 的评论`)
    document.getElementById('submitCommentForm')?.scrollIntoView({ behavior: 'smooth' })
  }

  const noticeCard: VNoticeCardProps = {
    title: '关于您提交的评论',
    type: 'info',
    icon: '🕹',
    description: <p>您提交的评论，作者将会收到通知，在审核之后，将会展示在评论列表中。</p>,
  }

  return (
    <BrowserOnly fallback={<div>Loading Comments...</div>}>
      {() => (
        <div className={styles.commentsContainer}>
          <h2># 评论列表</h2>
          {loading ? <p>评论加载中…</p> : null}
          {loadError ? (
            <p className={styles.commentError} role="alert">
              {loadError}
            </p>
          ) : null}
          {!loading && !loadError && comments.length > 0 ? (
            <CommentList comments={comments} onReply={handleReply} />
          ) : null}
          {!loading && !loadError && comments.length === 0 ? (
            <p className={styles.noComments}>
              当前暂无评论, 欢迎大佬通过下面的表单留下您的足迹。❤️🍷🍭✅💯
            </p>
          ) : null}
          <NoticeCard {...noticeCard} />
          <CommentForm
            draft={draft}
            title={commentTitle}
            submitting={submitting}
            error={submitError}
            notice={noticeCardBeforeSumitForm}
            onChange={setDraft}
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </BrowserOnly>
  )
}
