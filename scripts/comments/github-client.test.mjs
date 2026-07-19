import { describe, expect, it, vi } from 'vitest'

import { createGitHubDiscussionClient } from './github-client.mjs'

const response = (payload, ok = true, status = 200) => ({
  ok,
  status,
  json: async () => payload,
})

describe('GitHub Discussions client', () => {
  it('creates a Discussion with the expected GraphQL input', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      response({
        data: {
          createDiscussion: {
            discussion: {
              id: 'D_discussion',
              url: 'https://github.com/zhoujun134/zj-docusaurus-blogs/discussions/1',
            },
          },
        },
      }),
    )
    const client = createGitHubDiscussionClient({ token: 'test', fetchImpl })

    await expect(
      client.createDiscussion({
        repositoryId: 'R_repo',
        categoryId: 'DIC_category',
        title: '[评论] Example · zbus-comment:/blog/example',
        body: '由站点评论迁移工具创建。',
      }),
    ).resolves.toMatchObject({ id: 'D_discussion' })

    const request = JSON.parse(fetchImpl.mock.calls[0][1].body)
    expect(request.query).toContain('mutation CreateDiscussion')
    expect(request.variables.input).toEqual({
      repositoryId: 'R_repo',
      categoryId: 'DIC_category',
      title: '[评论] Example · zbus-comment:/blog/example',
      body: '由站点评论迁移工具创建。',
    })
  })

  it('adds roots without replyToId and replies with it', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        response({ data: { addDiscussionComment: { comment: { id: 'DC_root' } } } }),
      )
      .mockResolvedValueOnce(
        response({ data: { addDiscussionComment: { comment: { id: 'DC_reply' } } } }),
      )
    const client = createGitHubDiscussionClient({ token: 'test', fetchImpl })

    await client.addComment({ discussionId: 'D_discussion', body: 'root' })
    await client.addComment({
      discussionId: 'D_discussion',
      body: 'reply',
      replyToId: 'DC_root',
    })

    const rootInput = JSON.parse(fetchImpl.mock.calls[0][1].body).variables.input
    const replyInput = JSON.parse(fetchImpl.mock.calls[1][1].body).variables.input
    expect(rootInput).toEqual({ discussionId: 'D_discussion', body: 'root' })
    expect(replyInput).toEqual({
      discussionId: 'D_discussion',
      body: 'reply',
      replyToId: 'DC_root',
    })
  })

  it('paginates until it finds a title containing the exact term', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        response({
          data: {
            repository: {
              discussions: {
                nodes: [{ id: 'D_other', title: '其他讨论' }],
                pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
              },
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        response({
          data: {
            repository: {
              discussions: {
                nodes: [{ id: 'D_match', title: '[评论] Example · zbus-comment:/blog/example' }],
                pageInfo: { hasNextPage: false, endCursor: null },
              },
            },
          },
        }),
      )
    const client = createGitHubDiscussionClient({ token: 'test', fetchImpl })

    await expect(
      client.findDiscussionByTerm({
        repositoryOwner: 'zhoujun134',
        repositoryName: 'zj-docusaurus-blogs',
        categoryId: 'DIC_category',
        term: 'zbus-comment:/blog/example',
      }),
    ).resolves.toMatchObject({ id: 'D_match' })
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('surfaces the first GraphQL error without exposing headers', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(response({ errors: [{ message: 'Discussion creation denied' }] }))
    const client = createGitHubDiscussionClient({ token: 'secret-token', fetchImpl })

    await expect(
      client.createDiscussion({
        repositoryId: 'R_repo',
        categoryId: 'DIC_category',
        title: 'title',
        body: 'body',
      }),
    ).rejects.toThrow('Discussion creation denied')
  })
})
