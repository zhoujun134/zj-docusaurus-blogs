const ENDPOINT = 'https://api.github.com/graphql'

const FIND_DISCUSSIONS = `
  query FindDiscussions($owner: String!, $name: String!, $categoryId: ID!, $after: String) {
    repository(owner: $owner, name: $name) {
      discussions(first: 100, after: $after, categoryId: $categoryId) {
        nodes { id title url }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`

const CREATE_DISCUSSION = `
  mutation CreateDiscussion($input: CreateDiscussionInput!) {
    createDiscussion(input: $input) { discussion { id url } }
  }
`

const ADD_DISCUSSION_COMMENT = `
  mutation AddDiscussionComment($input: AddDiscussionCommentInput!) {
    addDiscussionComment(input: $input) { comment { id url } }
  }
`

export function createGitHubDiscussionClient({ token, fetchImpl = fetch }) {
  async function graphql(query, variables) {
    const response = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        'user-agent': 'zj-docusaurus-comment-migrator',
      },
      body: JSON.stringify({ query, variables }),
    })
    const payload = await response.json()

    if (!response.ok || payload.errors?.length) {
      throw new Error(payload.errors?.[0]?.message ?? `GitHub HTTP ${response.status}`)
    }
    return payload.data
  }

  return {
    async findDiscussionByTerm({ repositoryOwner, repositoryName, categoryId, term }) {
      let after = null

      do {
        const data = await graphql(FIND_DISCUSSIONS, {
          owner: repositoryOwner,
          name: repositoryName,
          categoryId,
          after,
        })
        const connection = data.repository.discussions
        const match = connection.nodes.find((discussion) => discussion.title.includes(term))
        if (match) return match
        after = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null
      } while (after)

      return null
    },

    async createDiscussion({ repositoryId, categoryId, title, body }) {
      const data = await graphql(CREATE_DISCUSSION, {
        input: { repositoryId, categoryId, title, body },
      })
      return data.createDiscussion.discussion
    },

    async addComment({ discussionId, body, replyToId }) {
      const input = { discussionId, body }
      if (replyToId) input.replyToId = replyToId
      const data = await graphql(ADD_DISCUSSION_COMMENT, { input })
      return data.addDiscussionComment.comment
    },
  }
}
