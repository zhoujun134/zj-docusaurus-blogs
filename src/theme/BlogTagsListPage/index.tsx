import {
  HtmlClassNameProvider,
  PageMetadata,
  ThemeClassNames,
  translateTagsPageTitle,
} from '@docusaurus/theme-common'
import type { Props } from '@theme/BlogTagsListPage'
import SearchMetadata from '@theme/SearchMetadata'
import TagsListByLetter from '@theme/TagsListByLetter'
import { useState } from 'react'
import { TagsListByFlat } from '../TagsListByLetter'

import MyLayout from '../MyLayout'
import { cn } from '@site/src/utils/cnUtils'
import ViewToggle, { type ViewType } from '@site/src/components/ViewToggle'

export default function BlogTagsListPage({ tags, sidebar: _sidebar }: Props): React.JSX.Element {
  const title = translateTagsPageTitle()

  const [type, setType] = useState<ViewType>('list')

  return (
    <HtmlClassNameProvider
      className={cn(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogTagsListPage)}
    >
      <PageMetadata title={title} />
      <SearchMetadata tag="blog_tags_list" />
      <MyLayout>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h1>{title}</h1>
          <ViewToggle value={type} onChange={setType} />
        </div>
        {type === 'list' && <TagsListByLetter tags={tags} />}
        {type === 'grid' && <TagsListByFlat tags={tags} />}
      </MyLayout>
    </HtmlClassNameProvider>
  )
}
