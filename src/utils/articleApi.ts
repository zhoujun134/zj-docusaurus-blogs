import request from './service'
import { ICommentInfo, ICommentSubmitRequest, IResult } from '@site/src/utils/interface/zjType'

export async function getCommentListByArticleId(articleId: string) {
  return await request<IResult<ICommentInfo[]>>({
    url: '/api/article/comment',
    method: 'get',
    params: {
      articleId: articleId,
    },
  }).catch((error: IResult<unknown>) => {
    const { message } = error

    const result: IResult<ICommentInfo[]> = {
      code: '-1',
      message: '系统开小差了！请稍后重试！' + message,
      data: [] as ICommentInfo[],
    }
    return result
  })
}

export async function submitComment(data: ICommentSubmitRequest) {
  return await request<IResult<boolean>>({
    url: '/api/article/comment/submit',
    method: 'post',
    data: data,
  }).catch((error: IResult<unknown>) => {
    const { message } = error
    // ElMessage.error({
    //     message: "系统开小差了！请稍后重试！" + message,
    //     duration: 5 * 1000
    // })
    const result: IResult<boolean> = {
      code: '-1',
      message: '系统开小差了！请稍后重试！' + message,
      data: false,
    }
    return result
  })
}
