import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it} from 'vitest'

import CollapsibleCodeBlock from './index'

describe('CollapsibleCodeBlock', () => {
  it('toggles the collapsed state while preserving code content', async () => {
    const user = userEvent.setup()
    render(
      <CollapsibleCodeBlock>
        <pre>long code</pre>
      </CollapsibleCodeBlock>,
    )

    const button = screen.getByRole('button', {name: '展开代码'})
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByTestId('collapsible-code-content')).toHaveTextContent('long code')

    await user.click(button)

    expect(screen.getByRole('button', {name: '折叠代码'})).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })
})
