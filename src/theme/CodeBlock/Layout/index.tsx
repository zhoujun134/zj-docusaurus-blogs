import React from 'react'

import CollapsibleCodeBlock from '@site/src/components/CollapsibleCodeBlock'
import Layout from '@theme-original/CodeBlock/Layout'
import type LayoutType from '@theme/CodeBlock/Layout'
import type { WrapperProps } from '@docusaurus/types'

type Props = WrapperProps<typeof LayoutType>

export default function CodeBlockLayoutWrapper(props: Props) {
  return (
    <CollapsibleCodeBlock>
      <Layout {...props} />
    </CollapsibleCodeBlock>
  )
}
