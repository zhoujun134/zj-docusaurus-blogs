import WebDeveloperSvg from '@site/static/svg/undraw_web_developer.svg'
import OpenSourceSvg from '@site/static/svg/undraw_open_source.svg'
import SpiderSvg from '@site/static/svg/undraw_spider.svg'
import Translate, { translate } from '@docusaurus/Translate'
import React from "react";

export type FeatureItem = {
  title: string
  text: JSX.Element
  Svg: React.ComponentType<React.ComponentProps<'svg'>>
}

const FEATURES: FeatureItem[] = [
  {
    title: translate({
      id: 'homepage.feature.developer',
      message: '说不上都会的全栈工程师',
    }),
    text: (
      <Translate>
        作为一名后端开发工程师，不断学习后端的路上，总归是需要总结和归档自己的成长之路的，断断续续，一直没有一个好的博客网站，所以在折腾后端的学习上也在不断补齐自己对于前端知识的一些学习，
        前端目前初步算是入门了 vue3，TypeScript 的一些基本操作。在日常的开发中，秉着能用 TS 绝不用 JS 的原则，为项目提供类型安全的保障，提高代码质量和开发效率。
      </Translate>
    ),
    Svg: WebDeveloperSvg,
  },
  {
    title: translate({
      id: 'homepage.feature.spider',
      message: '生活 & 搞钱',
    }),
    text: (
      <Translate>
        作为一名刚刚毕业的大学生，最缺的就是钱了吧，欢迎大家有任何搞钱的机会和项目都可以和我联系交流，
        如果有什么小项目，也欢迎咨询，我一定尽自己的有限能力，为您办好每一件事。
      </Translate>
    ),
    Svg: SpiderSvg,
  },
  {
    title: translate({
      id: 'homepage.feature.enthusiast',
      message: '开源爱好者',
    }),
    text: (
      <Translate>
        作为一名开源爱好者，积极参与开源社区，为开源项目贡献代码，希望有生之年能够构建出一个知名的开源项目。
      </Translate>
    ),
    Svg: OpenSourceSvg,
  },
]

export default FEATURES
