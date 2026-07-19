import type {BlogSidebar} from '@docusaurus/plugin-content-blog'
import {HtmlClassNameProvider, ThemeClassNames} from '@docusaurus/theme-common'
import {BlogPostProvider, useBlogPost} from '@docusaurus/plugin-content-blog/client'
import BackToTopButton from '@theme/BackToTopButton'
import BlogLayout from '@theme/BlogLayout'
import BlogPostItem from '@theme/BlogPostItem'
import type {Props} from '@theme/BlogPostPage'
import BlogPostPageMetadata from '@theme/BlogPostPage/Metadata'
import BlogPostPaginator from '@theme/BlogPostPaginator'
import TOC from '@theme/TOC'
import React, {type ReactNode} from 'react'
import {cn} from "@site/src/utils/cnUtils";
import Comments from "@site/src/components/Comments";
import {useLocation} from "@docusaurus/router";
import {VNoticeCardProps} from "@site/src/utils/interface/zjType";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Link from "@docusaurus/Link";
import NoticeCard from "@site/src/components/NoticeCard";
import {
    CommentSwitches,
    shouldShowComments
} from "@site/src/features/comments/commentVisibility";

function BlogPostPageContent({
                                 sidebar,
                                 children,
                             }: {
    sidebar: BlogSidebar
    children: ReactNode
}): React.JSX.Element {
    const {pathname} = useLocation();
    const {metadata, toc} = useBlogPost()
    const {siteConfig} = useDocusaurusContext()
    const {nextItem, prevItem, frontMatter} = metadata
    const {
        hide_table_of_contents: hideTableOfContents,
        toc_min_heading_level: tocMinHeadingLevel,
        toc_max_heading_level: tocMaxHeadingLevel,
        hide_comment: hideComment,
    } = frontMatter
    const commentSwitches = (siteConfig.themeConfig.commentConfig ?? {
        docs: false,
        blog: false,
    }) as CommentSwitches

    const noticeCard: VNoticeCardProps = copyrightVNoticeCardProps();
    return (
        <BlogLayout
            sidebar={sidebar}
            toc={
                !hideTableOfContents && toc.length > 0 ? (
                    <TOC toc={toc} minHeadingLevel={tocMinHeadingLevel} maxHeadingLevel={tocMaxHeadingLevel}/>
                ) : undefined
            }
        >
            <BlogPostItem>{children}</BlogPostItem>

            {(nextItem || prevItem) && (
                <div className="margin-bottom--md">
                    <BlogPostPaginator nextItem={nextItem} prevItem={prevItem}/>
                </div>
            )}
            {/*文章版权提示*/}
            <NoticeCard {...noticeCard}/>
            {/*文章评论组件*/}
            {shouldShowComments('blog', commentSwitches, Boolean(hideComment)) ? (
                <Comments articleId={pathname} articleTitle={metadata.title}/>
            ) : null}
            <BackToTopButton/>
        </BlogLayout>
    )
}

function copyrightVNoticeCardProps(): VNoticeCardProps {
    const {siteConfig} = useDocusaurusContext();
    const {pathname} = useLocation();
    const curDocsPath = siteConfig.url + pathname;
    return {
        title: "本文声明",
        href: curDocsPath,
        type: 'danger',
        icon: '💡',
        description: <>
            <p>转载请注明出处，谢谢合作！转载本文请声明原文章链接如下:</p>
            <p><strong>原文链接: </strong><a href={curDocsPath}>{curDocsPath}</a></p>
            <p><strong>作者: </strong><a href={siteConfig.url}>{siteConfig.title}</a></p>
            <p><Link href={siteConfig.url}>{siteConfig.title}</Link> 致力于分享有价值的信息和知识。我们尊重并保护知识产权。本文仅代表作者观点，不代表任何立场。
                如果本文有所侵权，请联系作者删除或修改！</p>
        </>
    }
}

export default function BlogPostPage(props: Props): React.JSX.Element {
    const BlogPostContent = props.content
    return (
        <BlogPostProvider content={props.content} isBlogPostPage>
            <HtmlClassNameProvider className={cn(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogPostPage)}>
                <BlogPostPageMetadata/>
                <BlogPostPageContent sidebar={props.sidebar}>
                    <BlogPostContent/>
                </BlogPostPageContent>
            </HtmlClassNameProvider>
        </BlogPostProvider>
    )
}
