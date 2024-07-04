---
slug: docusaurus-add-comments
title: docusaurus 实现自定义评论(调用后端的接口)
authors:
  name: Gao Wei
  title: Docusaurus Core Team
  url: https://github.com/wgao19
  image_url: https://github.com/wgao19.png
tags: [hola, docusaurus, comments]
image: https://img.zbus.top/zbus/blog202403150008819.webp
---
<!-- truncate -->

首先编写评论的组件信息, 创建一个评论的 Comments.tsx 这里会书写我们对应的评论信息

```typescript
// src/components/Comments/Comments.tsx
import React, {useEffect, useState} from 'react';
import styles from './Comments.module.css';
import {useBlogPost} from "@docusaurus/theme-common/internal";
import {ICommentInfo, ICommentSubmitRequest} from "@site/src/utils/interface/zjType";
import {getCommentListByArticleId, submitComment} from "@site/src/utils/articleApi"; // 引入 CSS 模块
// 引入 Docusaurus 的 DocPageContext

interface CommentsProps {
    // 如果有特定的 props 可以在这里定义
}

const Comments: React.FC<CommentsProps> = () => {
    // 使用 useContext 钩子来访问当前文档页面的上下文
    const {metadata} = useBlogPost();

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
        const commentsRes = await getCommentListByArticleId(metadata.source);
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
            articleId: metadata.source,
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
        const newCommentsRes = await getCommentListByArticleId(metadata.source);
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
                    {comment.content}
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
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <button type="submit" className={styles.commentButton}>
                        提交评论
                    </button>
                </div>
            </form>
        </div>
    )

    return (
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
            {/*提交评论的表单*/}
            {submitForm()}
        </div>
    );
};

export default Comments;
```

上面代码中的 css 样式代码如下：

```css
/* src/components/Comments/Comments.module.css */
.commentsContainer {
    margin: 20px 0;
}

.commentsContainer li {
    list-style-type: none;
}

.commentItem {
    padding: 10px;
    margin-bottom: 8px;
}
.commentItemContent {
    margin-left: 10px;
    margin-bottom: 8px;
    max-width: 80%; /* 或者根据需要设置一个合适的值 */
    word-break: break-word; /* 允许长单词在边界处断行 */
}
/* 限制评论内容的宽度，防止过长导致布局问题 */
.commentItemContent p {
    white-space: normal;
    overflow-wrap: break-word;
    word-wrap: break-word;
    hyphens: auto;
}
.commentTitle {
    margin-bottom: 10px;
}

.commentForm {
    display: flex;
    flex-direction: column;
}

.commentInput {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;     /* 输入框圆角 */
}

.inputGroup {
    display: flex;          /* 使用 Flexbox 布局 */
    flex-direction: row;
    justify-content: space-between; /* 左右排列，中间留间隔 */
    margin-bottom: 10px;    /* 容器下方留白 */
}

.commentItemUp {
    display: flex;
    flex-direction: row;
    align-items: center; /* 在交叉轴的开始位置对齐 */
    /*justify-content: space-between; !* 两端对齐 *!*/
    /*margin-left: 50px;*/
}
.commentItemDown {
    display: flex;
    flex-direction: row;
    align-items: flex-start; /* 在交叉轴的开始位置对齐 */
    /*justify-content: space-between; !* 两端对齐 *!*/
    margin-left: 60px;
}

.commentCreateTime {
    /* 创建时间样式，根据需要添加 */
    margin-right: 10px; /* 与回复按钮保持间隔 */
    align-items: center; /* 垂直居中对齐 */

}

.replyButton {
    /* 回复按钮样式 */
    margin-left: auto; /* 推到行尾 */
}

.inputFieldLeft {
    flex: 1;                /* 每个输入框占据一半空间 */
    padding: 8px;           /* 输入框内边距 */
    box-sizing: border-box; /* 边框计算在宽度内 */
    border: 1px solid #ddd;/* 输入框边框 */
    border-radius: 4px;     /* 输入框圆角 */
}

.inputFieldRight {
    flex: 1;                /* 每个输入框占据一半空间 */
    padding: 8px;           /* 输入框内边距 */
    box-sizing: border-box; /* 边框计算在宽度内 */
    border: 1px solid #ddd;/* 输入框边框 */
    border-radius: 4px;     /* 输入框圆角 */
    margin-left: 10px;
}
.commentButton {
    padding: 8px 16px;
    background-color: var(--ifm-color-primary-darker2);;
    color: white;
    border: none;
    cursor: pointer;
}

.commentButton:hover {
    background-color: var(--ifm-color-primary-darker);;
}

.noComments {
    text-align: center;
    color: #666;
    margin: 20px 0;
}

.commentListContainer {
    margin-top: 20px;
}
```

在样式代码中，我们用到了  --ifm-color-primary-darker2 和 --ifm-color-primary-darker 变量，这两个变量实在对应的 src/css/custom.css 中定义的两个颜色。这里可以根据自己的主题进行配置，我这里的配置如下：

```typescript

/* 这里是因为用到了 tailwind 的样式，将其引入 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 主题的相关配置文件 */
:root {
  --ifm-color-primary: #2e8555;
  --ifm-color-primary-dark: #29784c;
  --ifm-color-primary-darker: #277148;
  --ifm-color-primary-darker2: #277148;
  --ifm-color-primary-darkest: #205d3b;
  --ifm-color-primary-light: #33925d;
  --ifm-color-primary-lighter: #359962;
  --ifm-color-primary-lightest: #3cad6e;
  --ifm-code-font-size: 95%;

  --ifm-text-color: #333;
  --ifm-secondary-text-color: #555;

  --docusaurus-highlighted-code-line-bg: rgba(0, 0, 0, 0.1);

  --blog-item-background-color: linear-gradient(180deg, #fcfcfc, #fff);
  --blog-item-shade: #f4f4f5;
  --blog-item-shadow: 0 10px 18px #f1f5f9dd, 0 0 10px 0 #e4e4e7dd;

  --ifm-heading-font-weight: 500;
  --ifm-font-weight-bold: 520;

  --ifm-font-family-base: misans, ui-sans-serif, system-ui, -apple-system;
  --zj-comment-author-font-color: white;
}

div[class^='announcementBar_'] {
  background: repeating-linear-gradient(
          -35deg,
          var(--ifm-color-primary-lighter),
          var(--ifm-color-primary-lighter) 20px,
          var(--ifm-color-primary-lightest) 10px,
          var(--ifm-color-primary-lightest) 40px
  );
  font-weight: 700;
}

/* For readability concerns, you should choose a lighter palette in dark mode. */
[data-theme='dark'] {
  --ifm-color-primary: #25c2a0;
  --ifm-color-primary-dark: #21af90;
  --ifm-color-primary-darker: #1fa588;
  --ifm-color-primary-darker2: #205d3b;
  --ifm-color-primary-darkest: #1a8870;
  --ifm-color-primary-light: #29d5b0;
  --ifm-color-primary-lighter: #32d8b4;
  --ifm-color-primary-lightest: #4fddbf;
  --docusaurus-highlighted-code-line-bg: rgba(0, 0, 0, 0.3);
  --ifm-menu-color: #eceef1;
  --ifm-text-color: var(--ifm-menu-color);

  --blog-item-background-color: linear-gradient(180deg, #171717, #18181b);
  --blog-item-shade: #27272a;
  --blog-item-shadow: 0 10px 18px #25374833, 0 0 8px #25374866;

  --zj-comment-author-font-color: black;
}

/*[data-theme='light'] .DocSearch {*/
/*  !* --docsearch-primary-color: var(--ifm-color-primary); *!*/
/*  !* --docsearch-text-color: var(--ifm-font-color-base); *!*/
/*  --docsearch-muted-color: var(--ifm-color-secondary-darkest);*/
/*  --docsearch-container-background: rgba(94, 100, 112, 0.7);*/
/*  !* Modal *!*/
/*  --docsearch-modal-background: var(--ifm-color-secondary-lighter);*/
/*  !* Search box *!*/
/*  --docsearch-searchbox-background: var(--ifm-color-secondary);*/
/*  --docsearch-searchbox-focus-background: var(--ifm-color-white);*/
/*  !* Hit *!*/
/*  --docsearch-hit-color: var(--ifm-font-color-base);*/
/*  --docsearch-hit-active-color: var(--ifm-color-white);*/
/*  --docsearch-hit-background: var(--ifm-color-white);*/
/*  !* Footer *!*/
/*  --docsearch-footer-background: var(--ifm-color-white);*/
/*}*/

/*[data-theme='dark'] .DocSearch {*/
/*  --docsearch-text-color: var(--ifm-font-color-base);*/
/*  --docsearch-muted-color: var(--ifm-color-secondary-darkest);*/
/*  --docsearch-container-background: rgba(47, 55, 69, 0.7);*/
/*  !* Modal *!*/
/*  --docsearch-modal-background: var(--ifm-background-color);*/
/*  !* Search box *!*/
/*  --docsearch-searchbox-background: var(--ifm-background-color);*/
/*  --docsearch-searchbox-focus-background: var(--ifm-color-black);*/
/*  !* Hit *!*/
/*  --docsearch-hit-color: var(--ifm-font-color-base);*/
/*  --docsearch-hit-active-color: var(--ifm-color-white);*/
/*  --docsearch-hit-background: var(--ifm-color-emphasis-100);*/
/*  !* Footer *!*/
/*  --docsearch-footer-background: var(--ifm-background-surface-color);*/
/*  --docsearch-key-gradient: linear-gradient(*/
/*          -26.5deg,*/
/*          var(--ifm-color-emphasis-200) 0%,*/
/*          var(--ifm-color-emphasis-100) 100%*/
/*  );*/
/*}*/
a:hover {
  @apply no-underline;
}

@layer components {
  .bg-blog {
    background: var(--blog-item-background-color);
  }
  .bg-blog-shade {
    background: var(--blog-item-shade);
  }
}

html,
body {
  scroll-behavior: smooth;
}

body {
  font-family: misans, system-ui, -apple-system, 'PingFang SC',
  'Microsoft YaHei';
}
article .markdown > h2 {
  font-size: 1.6em;
}

article .markdown > h3 {
  font-size: 1.4em;
}

article .markdown > h4 {
  font-size: 1.2em;
}

article .markdown a:not(.hash-link) {
  text-decoration: none;
  font-weight: inherit;
  border-bottom: 1px solid rgba(125, 125, 125, 0.3);
  transition: border 0.3s ease-in-out;
}

.navbar__item {
  display: inline-flex;
}

.navbar__link {
  @apply flex items-center;
}


.navbar {
  box-shadow: none;
  background-color: transparent;
}

.navbar-sidebar__items {
  height: calc(100% - var(--ifm-navbar-height) - 444px);
}

@media (max-width: 1100px) {
  .navbar > .container,
  .navbar > .container-fluid {
    padding: 0;
  }

  .navbar__toggle {
    display: inherit;
  }

  .navbar__item {
    display: none;
  }

  .navbar__search-input {
    width: 9rem;
  }

  .navbar-sidebar {
    display: block;
  }
}


.tag::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  transform: scaleX(0);
  height: 2px;
  background: var(--ifm-color-primary);
  visibility: hidden;
  transition: all 0.3s linear;
}

.tag:hover::after {
  visibility: visible;
  transform: scaleX(1);
}

```

在上面的代码中，我们使用到了 axios （@site/src/utils/articleApi 中的代码） 的方式，调用后端的评论接口进行评论数据的提交。

```typescript
import request from "./service";
import {ICommentInfo, ICommentSubmitRequest, IResult} from "@site/src/utils/interface/zjType";

export async function getCommentListByArticleId(articleId: string) {
    return await request({
        url: '/api/article/comment',
        method: 'get',
        params: {
            articleId: articleId
        }
    }).then(resp => {
        return JSON.parse(JSON.stringify(resp)) as IResult<ICommentInfo[]>;
    }).catch(error => {
        let {message} = error;

        const result: IResult<ICommentInfo[]> = {
            code: "-1",
            message: "系统开小差了！请稍后重试！" + message,
            data: [] as ICommentInfo[]
        };
        return result;
    })
}

export async function submitComment(data: ICommentSubmitRequest) {
    return await request({
        url: '/api/article/comment/submit',
        method: 'post',
        data: data
    }).then(resp => {
        return JSON.parse(JSON.stringify(resp)) as IResult<boolean>;
    }).catch(error => {
        let {message} = error;
        // ElMessage.error({
        //     message: "系统开小差了！请稍后重试！" + message,
        //     duration: 5 * 1000
        // })
        const result: IResult<ICommentInfo[]> = {
            code: "-1",
            message: "系统开小差了！请稍后重试！" + message,
            data: false
        };
        return result;
    })
}
```

其中的类型定义 (@site/src/utils/interface/zjType)

```typescript
// 响应体 ========================= start =======================================
export interface IResult<T> {
    code: string
    message: string
    data?: T | any
}

export interface Page<T> {
    current: number,
    total: number,
    pageSize: number,
    records?: T[]
}

export interface ICommentInfo {
    commentId?: string,
    author: string,
    content: string,
    createTime?: string,
    likeNum?: number,
    children?: ICommentInfo[],
    isShowSubmit?: boolean
}

// 响应体 ========================= end =======================================

// 请求体 ======================== start =======================================
export interface ICommentSubmitRequest {
    articleId?: string,
    parentCommentId?: string,
    replyCommentId?: string,
    author: string,
    email: string,
    content: string;
}
// 请求体 ======================== end =======================================

```

在本次的代码中，我们封装了 axios 的请求逻辑，具体的封装逻辑如下图所示:&#x20;

```typescript showLineNumbers
import axios, {AxiosInstance, AxiosError, InternalAxiosRequestConfig} from 'axios';
import {IResult} from "@site/src/utils/interface/zjType";

// 设置 axios 默认配置
axios.defaults.withCredentials = true;

// 创建 axios 实例
const service: AxiosInstance = axios.create({
    baseURL: "https://zbus.top", // 确保这是正确的 baseURL
    timeout: 15000,
    headers: {'Content-Type': 'application/json;charset=utf-8'},
});

let loading: any;
let requestCount: number = 0; // 正在请求的数量

// 显示 loading
const showLoading = () => {
    if (requestCount === 0 && !loading) {
        // 这里可以使用 Element UI 的 Loading 组件，或者您选择的其他库
        // loading = ElLoading.service({
        //   lock: true,
        //   text: "拼命加载中，请稍后...",
        //   background: 'rgba(0, 0, 0, 0.7)',
        // });
    }
    requestCount++;
};

// 隐藏 loading
const hideLoading = () => {
    requestCount--;
    if (requestCount === 0 && loading) {
        loading.close();
    }
};

// 请求拦截器
service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    showLoading();
    // 如果是 GET 请求且有 params 参数，则处理参数
    if (config.method === 'get' && config.params) {
        // 这里对 config.url 进行处理，将 params 转换为查询字符串
        // 请根据您的实际需求调整参数编码逻辑
    }
    return config;
}, (error: AxiosError) => {
    return Promise.reject(error);
});

// 响应拦截器
service.interceptors.response.use((response) => {
    hideLoading();
    const result: IResult<any> = response.data;
    // 处理其他逻辑
    return response.data
}, (error: AxiosError) => {
    console.error('err' + error);
    hideLoading();
    let errorMsg: string = '请求出现异常';
    if (error.response) {
        // 服务器端返回的异常信息
        errorMsg = error.message || errorMsg;
    } else if (error.request) {
        // 请求已发出，但没有收到响应
        errorMsg = '请求已发出，但没有收到响应';
    } else {
        // 发生了触发请求错误的问题
        errorMsg = error.message || errorMsg;
    }
    const errResult: IResult<object> = {
        code: "-1",
        message: errorMsg,
        data: {},
    }
    return Promise.reject(errResult);
});

export default service;

```
