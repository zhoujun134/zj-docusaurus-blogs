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
