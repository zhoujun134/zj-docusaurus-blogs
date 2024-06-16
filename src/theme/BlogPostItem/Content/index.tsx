import { useBlogPost } from '@docusaurus/theme-common/internal'
import { blogPostContainerID } from '@docusaurus/utils-common'
import type { Props } from '@theme/BlogPostItem/Content'
import MDXContent from '@theme/MDXContent'
import React from 'react'
import {cn} from "@site/src/utils/cnUtils";

export default function BlogPostItemContent({ children, className }: Props): JSX.Element {
  const { isBlogPostPage } = useBlogPost()
  return (
    <div
      // This ID is used for the feed generation to locate the main content
      id={isBlogPostPage ? blogPostContainerID : undefined}
      className={cn('markdown', className)}
      itemProp="articleBody"
      style={{ position: 'relative' }}
    >
      <MDXContent>{children}</MDXContent>
    </div>
  )
}
