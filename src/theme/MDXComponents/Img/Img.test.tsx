import React from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import MDXImg from './index'

describe('MDXImg', () => {
  it('uses phrasing content so MDX images remain valid inside paragraphs', () => {
    const { container } = render(
      <p>
        <MDXImg src="/logo.png" alt="Z 不殊" />
      </p>,
    )

    expect(container.querySelector('p > span > img')).not.toBeNull()
    expect(container.querySelector('p > div')).toBeNull()
  })
})
