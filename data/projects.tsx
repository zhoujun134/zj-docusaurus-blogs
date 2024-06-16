export const projects: Project[] = [
    {
        title: '愧怍的小站',
        description: '🦖 基于 Docusaurus 静态网站生成器实现个人博客',
        preview: '/anonymous.png',
        website: 'https://kuizuo.cn',
        source: 'https://github.com/kuizuo/blog',
        tags: ['opensource', 'design', 'favorite'],
        type: 'web',
    },
    {
        title: 'JS代码反混淆',
        description: '基于 Babel 对 JavaScript 混淆代码还原的工具',
        preview: '/anonymous.png',
        website: 'https://js-deobfuscator.vercel.app',
        source: 'https://github.com/kuizuo/js-deobfuscator',
        tags: ['opensource', 'favorite'],
        type: 'web',
    },
    {
        title: 'undraw Svg 图标',
        description: 'svg 图标库，非常好看的图标库',
        preview: '/anonymous.png',
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
        const {type} = project
        group[type] = group[type] ?? []
        group[type].push(project)
        return group
    },
    {} as Record<ProjectType, Project[]>,
)
