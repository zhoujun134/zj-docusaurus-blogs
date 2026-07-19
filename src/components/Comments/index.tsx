import BrowserOnly from '@docusaurus/BrowserOnly'
import { useColorMode } from '@docusaurus/theme-common'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Giscus from '@giscus/react'

import NoticeCard from '@site/src/components/NoticeCard'
import { createCommentTerm, type CommentTarget } from '@site/src/features/comments/commentKey'
import {
  resolveGiscusTarget,
  validateGiscusConfig,
  type CommentConfig,
} from '@site/src/features/comments/giscusConfig'
import type { VNoticeCardProps } from '@site/src/utils/interface/zjType'

import styles from './Comments.module.css'

type CommentsProps = {
  articleId: string
  articleTitle?: string
  target?: CommentTarget
  noticeCardBeforeSumitForm?: VNoticeCardProps
}

export default function Comments({
  articleId,
  target = 'page',
  noticeCardBeforeSumitForm,
}: CommentsProps) {
  const { siteConfig } = useDocusaurusContext()
  const { colorMode } = useColorMode()
  const commentConfig = siteConfig.themeConfig.commentConfig as CommentConfig
  const missing = validateGiscusConfig(commentConfig.giscus)
  const discussionTarget = resolveGiscusTarget(commentConfig.giscus, target)
  const discussionsUrl = `https://github.com/${commentConfig.giscus.repo}/discussions`

  return (
    <section id="submitCommentForm" className={styles.commentsContainer} aria-label="评论">
      {noticeCardBeforeSumitForm ? <NoticeCard {...noticeCardBeforeSumitForm} /> : null}
      {missing.length > 0 ? (
        <p className={styles.commentError} role="alert">
          GitHub 评论尚未完成配置：{missing.join(', ')}
        </p>
      ) : (
        <BrowserOnly fallback={<p className={styles.loading}>评论加载中…</p>}>
          {() => (
            <Giscus
              repo={commentConfig.giscus.repo}
              repoId={commentConfig.giscus.repoId}
              category={discussionTarget.category}
              categoryId={discussionTarget.categoryId}
              mapping="specific"
              term={createCommentTerm(articleId, target)}
              reactionsEnabled="1"
              emitMetadata="0"
              inputPosition="top"
              theme={colorMode === 'dark' ? 'dark' : 'light'}
              lang="zh-CN"
              loading="lazy"
            />
          )}
        </BrowserOnly>
      )}
      <p className={styles.fallbackLink}>
        评论无法加载时，可直接
        <a href={discussionsUrl} target="_blank" rel="noreferrer">
          前往 GitHub Discussions
        </a>
        。
      </p>
    </section>
  )
}
