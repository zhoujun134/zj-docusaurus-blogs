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
