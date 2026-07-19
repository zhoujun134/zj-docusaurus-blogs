import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'

import {getCommentListByArticleId, submitComment} from '@site/src/utils/articleApi'
import Comments from './index'

vi.mock('@docusaurus/BrowserOnly', () => ({
  default: ({children}: {children: () => React.ReactNode}) => children(),
}))

vi.mock('@site/src/components/NoticeCard', () => ({
  default: () => null,
}))

vi.mock('@site/src/utils/articleApi', () => ({
  getCommentListByArticleId: vi.fn(),
  submitComment: vi.fn(),
}))

describe('Comments', () => {
  beforeEach(() => {
    vi.mocked(getCommentListByArticleId).mockResolvedValue({
      code: '0',
      message: 'ok',
      data: [],
    })
    vi.mocked(submitComment).mockReset()
  })

  it('keeps entered values and shows an error when submission fails', async () => {
    vi.mocked(submitComment).mockResolvedValue({
      code: '-1',
      message: '提交失败',
      data: false,
    })
    const user = userEvent.setup()
    render(<Comments articleId="/blog/test" />)

    await user.type(screen.getByLabelText('用户名'), 'Z')
    await user.type(screen.getByLabelText('邮箱'), 'z@example.com')
    await user.type(screen.getByLabelText('评论内容'), 'hello')
    await user.click(screen.getByRole('button', {name: '提交评论'}))

    expect(await screen.findByRole('alert')).toHaveTextContent('提交失败')
    expect(screen.getByLabelText('评论内容')).toHaveValue('hello')
  })

  it('disables the submit button while a request is pending', async () => {
    vi.mocked(submitComment).mockReturnValue(new Promise(() => undefined))
    const user = userEvent.setup()
    render(<Comments articleId="/blog/test" />)

    await user.type(screen.getByLabelText('用户名'), 'Z')
    await user.type(screen.getByLabelText('邮箱'), 'z@example.com')
    await user.type(screen.getByLabelText('评论内容'), 'hello')
    await user.click(screen.getByRole('button', {name: '提交评论'}))

    expect(screen.getByRole('button', {name: '提交中…'})).toBeDisabled()
  })
})
