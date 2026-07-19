import { describe, expect, it, vi } from 'vitest'

import { normalizeRequestError } from './service'

describe('normalizeRequestError', () => {
  it('normalizes an unavailable backend without logging a console error', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(normalizeRequestError({ request: {}, message: 'Network Error' })).toEqual({
      code: '-1',
      message: '请求已发出，但没有收到响应',
      data: {},
    })
    expect(consoleError).not.toHaveBeenCalled()
  })
})
