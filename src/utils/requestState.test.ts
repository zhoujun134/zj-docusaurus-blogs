import {describe, expect, it} from 'vitest'

import {createRequestState} from './requestState'

describe('createRequestState', () => {
  it('never decrements below zero', () => {
    const state = createRequestState()

    state.finish()
    expect(state.active()).toBe(0)

    state.start()
    state.finish()
    expect(state.active()).toBe(0)
  })
})
