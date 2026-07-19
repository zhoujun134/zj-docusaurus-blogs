export const projects: Project[] = [
  {
    title: 'Z 不殊的小站',
    description: '🦖 基于 Docusaurus 静态网站生成器实现个人博客',
    preview: '/logo.png',
    website: 'https://zbus.top',
    source: 'https://github.com/zhoujun134/zj-docusaurus-blogs',
    tags: ['opensource', 'design', 'favorite'],
    type: 'web',
  },
  {
    title: 'Vue3 + ts + elementPlus 实现的博客系统【前端项目】',
    description: '基于 Vue3 + ts + elementPlus 实现的博客系统',
    preview: '/img/project/blog-vue3-ts-elementPlus.png',
    website: 'https://github.com/zhoujun134/zsFront',
    source: 'https://github.com/zhoujun134/zsFront',
    tags: ['opensource', 'design', 'favorite'],
    type: 'web',
  },
  {
    title: 'Java SpringBoot2 脚手架',
    description: '【后端】后端项目开发脚手架工具',
    preview: '/img/project/springboot2-jiao-shou-jia.png',
    website: 'https://github.com/zhoujun134/zjBoot',
    source: 'https://github.com/zhoujun134/zjBoot',
    tags: ['opensource', 'design', 'favorite'],
    type: 'web',
  },
  {
    title: 'undraw Svg 图标',
    description: 'svg 图标库，非常好看的图标库',
    preview: '/img/project/undraw_website_u6x8.svg',
    website: 'https://undraw.co/illustrations',
    tags: ['product', 'favorite'],
    type: 'app',
  },
  {
    title: '@kuizuo/http',
    description: '基于 Axios 封装的 HTTP 类库',
    website: 'https://www.npmjs.com/package/@kuizuo/http',
    tags: ['opensource', 'personal'],
    type: 'other',
  },
]

export type Tag = {
  label: string
  description: string
  color: string
}

export type TagType = 'favorite' | 'opensource' | 'product' | 'design' | 'large' | 'personal'

export type ProjectType = 'web' | 'app' | 'commerce' | 'personal' | 'toy' | 'other'

export const projectTypeMap = {
  web: '网站',
  app: '应用',
  commerce: '商业项目',
  personal: '个人',
  toy: '玩具',
  other: '其他',
}

export type Project = {
  title: string
  description: string
  preview?: string
  website: string
  source?: string | null
  tags: TagType[]
  type: ProjectType
}

export const Tags: Record<TagType, Tag> = {
  favorite: {
    label: '喜爱',
    description: '我最喜欢的网站，一定要去看看!',
    color: '#e9669e',
  },
  opensource: {
    label: '开源',
    description: '开源项目可以提供灵感!',
    color: '#39ca30',
  },
  product: {
    label: '产品',
    description: '与产品相关的项目!',
    color: '#dfd545',
  },
  design: {
    label: '设计',
    description: '设计漂亮的网站!',
    color: '#a44fb7',
  },
  large: {
    label: '大型',
    description: '大型项目，原多于平均数的页面',
    color: '#8c2f00',
  },
  personal: {
    label: '个人',
    description: '个人项目',
    color: '#12affa',
  },
}

export const TagList = Object.keys(Tags) as TagType[]

export const groupByProjects = projects.reduce(
  (group, project) => {
    const { type } = project
    group[type] = group[type] ?? []
    group[type].push(project)
    return group
  },
  {} as Record<ProjectType, Project[]>,
)
