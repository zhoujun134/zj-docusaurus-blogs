import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import IconCloud from './icon-cloud'

vi.mock('@docusaurus/theme-common', () => ({
  useColorMode: () => ({ colorMode: 'light' }),
}))

describe('IconCloud', () => {
  it('renders deterministic markup for server hydration', () => {
    const firstRender = renderToStaticMarkup(<IconCloud iconSlugs={[]} />)
    const secondRender = renderToStaticMarkup(<IconCloud iconSlugs={[]} />)

    expect(secondRender).toBe(firstRender)
  })
})
