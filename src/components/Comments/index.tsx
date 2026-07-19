// src/components/Comments/Comments.tsx
import React, {useEffect, useState} from 'react';
import styles from './Comments.module.css';
import {ICommentInfo, ICommentSubmitRequest, VNoticeCardProps} from "@site/src/utils/interface/zjType";
import {getCommentListByArticleId, submitComment} from "@site/src/utils/articleApi";
import NoticeCard from "@site/src/components/NoticeCard";
import BrowserOnly from "@docusaurus/BrowserOnly"; // 引入 CSS 模块
import {sanitizeCommentHtml} from "@site/src/features/comments/sanitizeComment";
// 引入 Docusaurus 的 DocPageContext

interface CommentsProps {
    // 如果有特定的 props 可以在这里定义
    articleId: string,
    articleTitle?: string,
    noticeCardBeforeSumitForm?: VNoticeCardProps,
}

const HtmlContent = ({html}: {html: string}) => {
    return <div dangerouslySetInnerHTML={{__html: sanitizeCommentHtml(html)}}/>;
};

const Comments: React.FC<CommentsProps> = (props: CommentsProps) => {

    const [comments, setComments] = useState<ICommentInfo[]>([]);
    const [newComment, setNewComment] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [userEmail, setUserEmail] = useState<string>('');
    const [commentTitle, setCommentTitle] = useState<string>('# 欢迎留下您的宝贵评论');
    // 头像组件
    const AvatarSVG = ({
                           char,
                           size = 50,
                           color = 'var(--zj-comment-author-font-color)',
                           bgColor = 'var(--ifm-color-primary-light)'
                       }) => {
        const fontSize = size * 0.8;
        return (
            <svg
                width={size} /* 设置固定宽度 */
                height={size} /* 设置固定高度 */
                viewBox="0 0 100 100"
                style={{
                    backgroundColor: bgColor,
                    borderRadius: '50%',
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    fontSize: fontSize,
                    fontWeight: 'bold'
                }}
            >
                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill={color}>
                    {char}
                </text>
            </svg>
        );
    };
    // 组件挂载完成后获取评论列表
    useEffect(() => {
        fetchCommentsFromServer().then(r => {
        });
    }, []); // 空依赖数组表示这个 effect 只会在组件挂载时运行一次
    // 侦听 newComment 的变化，如果为 "" 则重置 commentTitle
    useEffect(() => {
        // 当评论的输入框为空时，重置评论的标题，回复的评论 id，父id
        if (newComment === '') {
            setCommentTitle('# 欢迎留下您的宝贵评论');
            setReplyingCommentId(''); // 隐藏回复输入区域
            setParentCommentId(''); // 隐藏回复输入区域
        }
    }, [newComment]); // 依赖数组包含 newComment

    const fetchCommentsFromServer = async () => {
        const commentsRes = await getCommentListByArticleId(props.articleId);
        if (commentsRes && commentsRes.data) {
            setComments(commentsRes.data);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // 验证用户名和邮箱是否已填写
        if (!userName || !userEmail) {
            alert('用户名和邮箱不能为空！');
            return;
        }

        const submitRequest: ICommentSubmitRequest = {
            articleId: props.articleId,
            articleTitle: props.articleTitle,
            author: userName,
            email: userEmail,
            content: newComment,
            parentCommentId: parentCommentId,
            replyCommentId: replyingCommentId,
        }
        await submitComment(submitRequest).then(resp => {
            // console.log("resp=", resp);
        })
        // 这里应该是调用后端 API 提交新评论的逻辑
        const newCommentsRes = await getCommentListByArticleId(props.articleId);
        if (newCommentsRes) {
            const newComments = newCommentsRes.data;
            setComments(newComments);
            setNewComment(''); // 清空输入框
            setUserName(''); // 清空用户名输入框
            setUserEmail(''); // 清空邮箱输入框
            setReplyingCommentId(''); // 隐藏回复输入区域
            setParentCommentId(''); // 隐藏回复输入区域
            setCommentTitle('# 欢迎留下您的宝贵评论')
        }
    };

    // ...其他状态保持不变
    // 用于跟踪当前回复的父评论ID
    const [parentCommentId, setParentCommentId] = useState<string | null>(null);
    // 用于跟踪当前回复的评论ID
    const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);


    // 提交回复评论的内容
    const handleOnReplying = (event: React.MouseEvent, curComment: ICommentInfo, parentCommentId?: string) => {
        event.preventDefault(); // 如果你需要阻止默认行为
        console.log("来源: commentId=", JSON.stringify(curComment), " parentCommentId=", parentCommentId);
        setParentCommentId(parentCommentId)
        setReplyingCommentId(curComment.commentId)
        setNewComment(userName + " 回复 " + curComment.author + ": ")
        setCommentTitle('# 回复 ' + curComment.author + ' 的评论 ')
        // 点击回复时，重定向到表单处。
        if (window.location.href.endsWith("#submitCommentForm")) {
            window.location.href = window.location.href + ""
        } else {
            window.location.href += '#submitCommentForm'
        }
    };
    // 渲染每条评论及其回复按钮和回复表单
    const commentItem = (comment: ICommentInfo, parentCommentId?: string) => (
        <li key={comment.commentId} className={styles.commentItem}>
            <div className={styles.commentItemUp}>
                <AvatarSVG char={comment.author[0]}/>
                <p className={styles.commentItemContent}>
                     <HtmlContent html={comment.content}/>
                </p>
            </div>
            <div className={styles.commentItemDown}>
                <p className={styles.commentCreateTime}>{comment.createTime}</p>
                <a href="#submitCommentForm" onClick={e => handleOnReplying(e, comment, parentCommentId)}>回复</a>
            </div>
            {
                comment.children && comment.children.length > 0 ? (
                    <>
                        <div className={styles.commentListContainer}>
                            <ul>
                                {comment.children.map((childComment) => (
                                    commentItem(childComment, parentCommentId)
                                ))}
                            </ul>
                        </div>
                    </>) : (<> </>)
            }
        </li>
    );
    const submitForm = () => (
        <div className={styles.commentsContainer}>
            <form id='submitCommentForm' onSubmit={handleSubmit} className={styles.commentForm}>
                <div className={styles.commentTitle}>
                    <h2>{commentTitle}</h2>
                </div>
                {/* 用户名和邮箱输入框容器 */}
                <div className={styles.inputGroup}>
                    {/* 用户名输入框 */}
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="输入你的用户名"
                        className={styles.inputFieldLeft}
                        required
                    />
                    {/* 邮箱输入框 */}
                    <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="输入你的邮箱"
                        className={styles.inputFieldRight}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    {/* 现有评论输入框 */}
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="写下你的评论..."
                        className={styles.commentInput}
                        rows={5}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <button type="submit" className={styles.commentButton}>
                        提交评论
                    </button>
                </div>
                {props.noticeCardBeforeSumitForm ?
                    <>
                        <NoticeCard {...props.noticeCardBeforeSumitForm} />
                    </> : <></>}
            </form>
        </div>
    )

    const noticeCard: VNoticeCardProps = {
        title: "关于您提交的评论",
        type: "info",
        icon: '🕹',
        description:
            <>
                <p>您提交的评论，作者将会收到通知，在审核之后，将会展示在评论列表中。</p>
            </>,
    }
    return (
        <BrowserOnly fallback={<div>Loading Comments...</div>}>
            {() =>
                <div className={styles.commentsContainer}>
                    <h2># 评论列表</h2>
                    {
                        comments.length > 0 ? (
                            <>
                                <div className={styles.commentListContainer}>
                                    <ul>
                                        {comments.map((comment) => (
                                            commentItem(comment, comment.commentId)
                                        ))}
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <p className={styles.noComments}>当前暂无评论, 欢迎大佬通过下面的表单留下您的足迹。❤️🍷🍭✅💯</p> // 当没有评论时显示
                        )
                    }
                    <NoticeCard {...noticeCard} />
                    {/*提交评论的表单*/}
                    {submitForm()}
                </div>
            }
        </BrowserOnly>
    );
};

export default Comments;
