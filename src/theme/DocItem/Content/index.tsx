import React from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type {WrapperProps} from '@docusaurus/types';
import Comments from "@site/src/components/Comments";
import {useLocation} from "@docusaurus/router";
import NoticeCard from "@site/src/components/NoticeCard";
import {VNoticeCardProps} from "@site/src/utils/interface/zjType";
import Link from "@docusaurus/Link";

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
    CommentSwitches,
    shouldShowComments
} from "@site/src/features/comments/commentVisibility";

type Props = WrapperProps<typeof ContentType>;

function copyrightVNoticeCardProps(): VNoticeCardProps {
    const {siteConfig} = useDocusaurusContext();
    const {pathname} = useLocation();
    const curDocsPath = siteConfig.url + pathname;
    return {
        title: "本文声明",
        href: curDocsPath,
        type: 'danger',
        icon: '💡',
        description:
            <>
                <p>转载请注明出处，谢谢合作！转载本文请声明原文章链接如下:</p>
                <p><strong>原文链接: </strong><a href={curDocsPath}>{curDocsPath}</a></p>
                <p><strong>作者: </strong><a href={siteConfig.url}>{siteConfig.title}</a></p>
                <p><Link href={siteConfig.url}>{siteConfig.title}</Link> 致力于分享有价值的信息和知识。我们尊重并保护知识产权。本文仅代表作者观点，不代表任何立场。
                    如果本文有所侵权，请联系作者删除或修改！</p>
            </>
    }
}

export default function ContentWrapper(props: Props): React.JSX.Element {
    const {pathname} = useLocation();
    const {siteConfig} = useDocusaurusContext();
    const noticeCard: VNoticeCardProps = copyrightVNoticeCardProps();
    const commentSwitches = (siteConfig.themeConfig.commentConfig ?? {
        docs: false,
        blog: false,
    }) as CommentSwitches;
    return (
        <>
            <Content {...props} />
            {/*版本提示卡片*/}
            <NoticeCard {...noticeCard}/>
            {/*评论组件注入*/}
            {shouldShowComments('docs', commentSwitches) ? (
                <Comments articleId={pathname}/>
            ) : null}
        </>
    );
}
