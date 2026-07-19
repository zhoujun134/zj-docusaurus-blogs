import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it} from 'vitest'

import Tooltip from './index'

describe('Tooltip', () => {
  it('shows accessible tooltip text on hover', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip id="project-tag" text="开源项目" delay={0}>
        <button type="button">开源</button>
      </Tooltip>,
    )

    await user.hover(screen.getByRole('button', {name: '开源'}))

    expect(await screen.findByRole('tooltip')).toHaveTextContent('开源项目')
  })
})
