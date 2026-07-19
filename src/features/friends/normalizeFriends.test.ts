import { describe, expect, it } from 'vitest'

import { normalizeFriends } from './normalizeFriends'

describe('normalizeFriends', () => {
  it('returns empty groups for missing or failed responses', () => {
    expect(normalizeFriends(undefined)).toEqual({ friends: [], tools: [] })
    expect(normalizeFriends({ code: '500', message: 'failed' })).toEqual({
      friends: [],
      tools: [],
    })
  })

  it('maps known backend groups', () => {
    const result = normalizeFriends({
      code: '0',
      message: 'ok',
      data: {
        我的友链: [
          {
            title: 'A',
            description: 'B',
            siteUrl: 'https://a.test',
            logoUrl: '/a.png',
          },
        ],
      },
    })

    expect(result.friends[0].website).toBe('https://a.test')
  })
})
