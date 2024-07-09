import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {BlogPost} from "@docusaurus/plugin-content-blog";

const beian = '京ICP备2023022073号-1'
const beian1 = '京公网安备11010802044104号'

const config: Config = {
    title: 'Z 不殊',
    tagline: '大家好，我是周不殊，在这里，我主要分享我的日常，学习和笔记，欢迎大家共同学习和进步',
    favicon: '/img/favicon.ico',

    // Set the production url of your site here
    url: 'https://zbus.top',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'zhoujun134', // Usually your GitHub org/user name.
    projectName: 'zbusBlog', // Usually your repo name.

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'zh-Hans',
        locales: ['zh-Hans'],
    },

    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.ts',
                },
                blog: false,
                theme: {
                    customCss: './src/css/custom.css',
                },
                gtag: {
                    trackingID: 'G-S4SD5NXWXF',
                    anonymizeIP: true,
                },
                googleAnalytics: {
                    trackingID: 'UA-141789564-1',
                    anonymizeIP: true,
                },
            } satisfies Preset.Options,
        ],
    ],
    plugins: [
        'docusaurus-plugin-image-zoom', // can also just be 'image-zoom'
        '@docusaurus/plugin-ideal-image',
        [
            'docusaurus-plugin-baidu-tongji',
            { token: '3fe9ea74bd372ee22bcbf0caaf670701' },
        ],
        [
            '@docusaurus/plugin-pwa',
            {
                debug: process.env.NODE_ENV === 'development',
                offlineModeActivationStrategies: [
                    'appInstalled',
                    'standalone',
                    'queryString',
                ],
                pwaHead: [
                    { tagName: 'link', rel: 'icon', href: '/img/logo.png' },
                    { tagName: 'link', rel: 'manifest', href: '/manifest.json' },
                    { tagName: 'meta', name: 'theme-color', content: '#12affa' },
                ],
            },
        ],
        [
            './src/plugins/plugin-content-blog', // 为了实现全局 blog 数据，必须改写 plugin-content-blog 插件
            {
                path: 'blog',
                editUrl: ({locale, blogDirPath, blogPath, permalink}) =>
                    `https://github.com/kuizuo/blog/edit/main/${blogDirPath}/${blogPath}`,
                editLocalizedFiles: false,
                blogDescription: '代码人生：编织技术与生活的博客之旅',
                blogSidebarCount: 10,
                blogSidebarTitle: 'Blogs',
                postsPerPage: 10,
                showReadingTime: true,
                readingTime: ({content, frontMatter, defaultReadingTime}) =>
                    defaultReadingTime({content, options: {wordsPerMinute: 300}}),
                feedOptions: {
                    type: 'all',
                    title: 'Z 不殊',
                    copyright: `Copyright © ${new Date().getFullYear()} 愧怍 Built with Docusaurus.<p><a href="http://beian.miit.gov.cn/" class="footer_lin">${beian}</a></p>`,
                },
            },
        ],
        // ...other plugins
        async function docusaurusTailwindcssPlugin(context, options) {
            return {
                name: 'docusaurus-tailwindcss',
                configurePostCss(postcssOptions) {
                    // Appends TailwindCSS and AutoPrefixer.
                    postcssOptions.plugins.push(require('tailwindcss'))
                    postcssOptions.plugins.push(require('autoprefixer'))
                    return postcssOptions
                },
            }
        },
    ],
    stylesheets: [
        'https://cdn.jsdelivr.net/npm/misans@4.0.0/lib/Normal/MiSans-Normal.min.css',
        'https://cdn.jsdelivr.net/npm/misans@4.0.0/lib/Normal/MiSans-Semibold.min.css',
    ],
    headTags: [
        {
            tagName: 'meta',
            attributes: {
                name: 'Z 不殊',
                content: 'Z 不殊的个人博客',
            },
        },
        {
            tagName: 'meta',
            attributes: {
                name: '快跑小火车',
                content: 'Z 不殊的个人博客',
            },
        },
    ],
    themeConfig: {
        // 图片放大缩小效果
        zoom: {
            background: {
                light: 'rgb(255, 255, 255)',
                dark: 'rgb(50, 50, 50)'
            },
            config: {

                // options you can specify via https://github.com/francoischalifour/medium-zoom#usage
            }
        },

        // 评论相关配置
        commentConfig: {
            docs: true,                         // 启用 docs 的评论功能
            blog: true,                         // 启用 blog 的评论功能
            commentApiHost: "https://zbus.top", // 评论来源的 api 域名
            api: {
                // 提交评论
                submitComment: "/api/comment/submitComment",
                // 评论列表
                commentList: "/api/comment/list"
            }
        },
        // 搜索按钮相关
        algolia: {
            appId: 'KNKL89273C',
            apiKey: '628bcad21219abb3c3078604745ac41a',
            indexName: 'zbus.top',
            contextualSearch: true,
        },
        // Replace with your project's social card
        image: 'img/docusaurus-social-card.jpg',
        navbar: {
            title: 'Z 不殊',
            logo: {
                alt: 'Z 不殊 Logo',
                src: '/logo.jpg',
            },
            // 内置的当向下滑动时，隐藏导航栏
            hideOnScroll: true,
            items: [
                {
                    type: 'docSidebar',
                    sidebarId: 'tutorialSidebar',
                    position: 'left',
                    label: '文档',
                },
                {
                    to: '/blog',
                    label: '博客',
                    position: 'left',
                    items: [
                        {
                            to: '/blog',
                            label: '博客列表',
                        },
                        {
                            to: '/blog/archive',
                            label: '归档',
                        },
                    ]
                },

                {
                    label: '友链',
                    position: 'left',
                    to: 'friends'
                },
                {
                    label: '项目',
                    position: 'left',
                    to: 'project'
                },
                {
                    label: '关于我',
                    position: 'left',
                    to: 'about'
                },
                {
                    href: 'https://afdian.net/a/zbusTop',
                    label: '为爱发电',
                    position: 'right',
                },
                {
                    href: 'https://github.com/zhoujun134',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: '总结类',
                    items: [
                        {
                            label: '文档',
                            to: '/docs/intro',
                        },
                        {label: '博客', position: 'right', to: 'blog'},
                        {label: '项目', position: 'right', to: 'project'},
                    ],
                },
                {
                    title: '交流社区',
                    items: [
                        {
                            label: 'Stack Overflow',
                            href: 'https://stackoverflow.com/questions/tagged/docusaurus',
                        },
                        {
                            label: 'Discord',
                            href: 'https://discordapp.com/invite/docusaurus',
                        },
                        {
                            label: 'Twitter',
                            href: 'https://twitter.com/docusaurus',
                        },
                    ],
                },
                {
                    title: '更多',
                    items: [
                        {
                            label: '友链',
                            position: 'right',
                            to: 'friends'},
                        {
                            html: `
                                    <a href="https://docusaurus.io/zh-CN/" target="_blank" rel="noreferrer noopener">
                                      <img src="/img/buildwith.png" alt="build with docusaurus" width="120" height="50"/>
                                    <a/>
                                    `,
                        },
                    ],
                },
            ],
            copyright: `
            <p style="margin-bottom: 0;"><a href="http://beian.miit.gov.cn/">${beian}</a></p>
        <p style="display: inline-flex; align-items: center;"><img style="height:20px;margin-right: 0.5rem;" src="/img/police.png" alt="police" height="20"/><a href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=${
                beian1.match(/\d+/)?.[0]
            }" >${beian1}</a></p>
        <p>Copyright © 2024 - PRESENT Z不殊 Built with Docusaurus.</p>
            `,
        },
        prism: {
            theme: prismThemes.okaidia,
            darkTheme: prismThemes.dracula,
            additionalLanguages: [
                'bash',
                'json',
                'java',
                'python',
                'php',
                'graphql',
                'rust',
                'toml',
                'protobuf',
                'sql',
                'yaml',
                'markdown',
            ],
            defaultLanguage: 'java',

        },
    } satisfies Preset.ThemeConfig
};

export default config;
