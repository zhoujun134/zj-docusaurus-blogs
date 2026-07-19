import React, { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import ViewToggle, { type ViewType } from './index'

function Harness() {
  const [value, setValue] = useState<ViewType>('list')
  return <ViewToggle value={value} onChange={setValue} />
}

describe('ViewToggle', () => {
  it('switches between list and grid views', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    expect(screen.getByRole('button', { name: '列表视图' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: '网格视图' }))

    expect(screen.getByRole('button', { name: '网格视图' })).toHaveAttribute('aria-pressed', 'true')
  })
})
