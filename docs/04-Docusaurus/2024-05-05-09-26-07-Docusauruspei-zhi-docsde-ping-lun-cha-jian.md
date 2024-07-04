---
slug: Docusauruspei-zhi-docsde-ping-lun-cha-jian
title: Docusaurus配置docs的评论插件
authors:
  name: zhoujun134
  title: 不要等! 不管想做什么, 都要立刻动起来。
  url: https://github.com/zhoujun134
  image_url: https://img.zbus.top/zbus/logo.jpg
tags: [Docusaurus, 博客, 博客构建]
image: https://img.zbus.top/zbus/blog202403140854791.png
---
 
 本文主要讲述了如何在 Docusaurus 中引入评论组件，解决了博客中没有评论组件的问题。文章首先介绍了博客的样式问题，然后讲述了如何配置 Gitalk 评论插件，并将其引入到博客中。接着，文章详细介绍了如何使用 Swizzling 将评论组件引入到 docs 中，包括修改 `DocItem` 组件的代码和重新运行 Docusaurus。最终，文章实现了在 docs 中添加评论插件的功能。 
<!-- truncate -->  
 书写自己的博客时，没有一个很好看的样式，对于一个强迫症来说真的很难受，对于一个前端小白来说，修改一个博客的样式，是真的不好改，各种查资料和学习，有时候发现也不能去解决相对应的问题。

就是小小的吐槽一些。
![wallhaven-weq8y7](https://img.zbus.top//zbus/blog/202312031128794.webp)

回到正题，现在我们拥有我的 [博客](https://zbus.top) 站点之后，我们发现博客的页面是下面的样式，是存在 评论组件的。

对于如何配置 gittalk 的评论组件，可以参考 [Docusaurus配置Gitalk评论插件](https://zbus.top/blog/docusaurus-gitalk-plugin) 这篇文章。

![image-20231203111542234](https://img.zbus.top//zbus/blog/202312031115065.webp)

而对于 docs 中的内容却没有这一部分内容，有时候我们也希望各位友友们可以提交一些意见，方便我们后续对这些内容进行修改或者和他们交流，所以我们需要在 docs 中也引入一下博客中的评论组件。

docs 中，如果我们要修改文章的样式的话，需要使用到 `Swizzling Docusaurus` 内部组. Swizzling 文档页面对应组件为 `DocItem`

```bash
yarn run swizzle @docusaurus/theme-classic DocItem/Layout -- --eject --typescript
```

> 因为我的项目是基于 typescript 的，如果你的项目是 javascript 的话，则不需要加后面的 --typescript

执行完上面的命令之后，`Swizzling 后会生成 `src/theme/DocItem/Layout` 目录，我们需要对 `src/theme/DocItem/Layout/index.tsx` 进行修改

````tsx
import React from 'react';
import clsx from 'clsx';
import {useWindowSize} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/theme-common/internal';
import DocItemPaginator from '@theme/DocItem/Paginator';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocItemFooter from '@theme/DocItem/Footer';
import DocItemTOCMobile from '@theme/DocItem/TOC/Mobile';
import DocItemTOCDesktop from '@theme/DocItem/TOC/Desktop';
import DocItemContent from '@theme/DocItem/Content';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import Unlisted from '@theme/Unlisted';
import type {Props} from '@theme/DocItem/Layout';
// 导入我们的评论组件 【注意】
import Comment from '@site/src/components/Comment'

import styles from './styles.module.css';

/**
 * Decide if the toc should be rendered, on mobile or desktop viewports
 */
function useDocTOC() {
  const {frontMatter, toc} = useDoc();
  const windowSize = useWindowSize();

  const hidden = frontMatter.hide_table_of_contents;
  const canRender = !hidden && toc.length > 0;

  const mobile = canRender ? <DocItemTOCMobile /> : undefined;

  const desktop =
    canRender && (windowSize === 'desktop' || windowSize === 'ssr') ? (
      <DocItemTOCDesktop />
    ) : undefined;

  return {
    hidden,
    mobile,
    desktop,
  };
}

export default function DocItemLayout({children}: Props): JSX.Element {
  const docTOC = useDocTOC();
  const {
    metadata: {unlisted},
  } = useDoc();
  return (
    <div className="row">
      <div className={clsx('col', !docTOC.hidden && styles.docItemCol)}>
        {unlisted && <Unlisted />}
        <DocVersionBanner />
        <div className={styles.docItemContainer}>
          <article>
            <DocBreadcrumbs />
            <DocVersionBadge />
            {docTOC.mobile}
            <DocItemContent>{children}</DocItemContent>
            <DocItemFooter />
          </article>
          <DocItemPaginator />
        </div>
        {/*引用我们的评论组件*/}
        <Comment />
      </div>
      {docTOC.desktop && <div className="col col--3">{docTOC.desktop}</div>}
    </div>
  );
}

````

Swizzling 后需要重新运行 Docusaurus ，不然是无法看到效果的。

修改完成之后，我们的 docs 中的文件也就有对应的评论插件啦。