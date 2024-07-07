---
slug: 2024-07-07-23-32-23-vue3-ts-prism-problem
title: vue3+ts使用 prism不生效解决方案（vue3集成 prism代码高亮显示）
authors:
  name: zhoujun134
  title: 不要等! 不管想做什么, 都要立刻动起来。
  url: https://github.com/zhoujun134
  image_url: https://img.zbus.top/zbus/logo.jpg
---
<!-- truncate -->  

在实现自己的博客时，后端使用了 flexmark-java 生成对应的博客文档，对于代码块部分也进行了特殊处理（格式按照 prism 的形式渲染）。比如生成的 html 代码如下:

```html
<pre>
		<code class="language-sql line-numbers">create table zs_article
(
    title       varchar(255) default ''    null comment '标题',
    id          bigint auto_increment comment '主键' primary key,
    content     longtext                   null comment '内容',
    create_time datetime     default NOW() null comment '创建时间'

) comment '文章页面';
	</code>
</pre>
```

> prism 的代码主要需要在 code 标签，或者 pre 标签上添加对应 language-语言 的格式进行渲染，其中的 line-numbers 是使用 prism 的行号插件。

在测试的 html 代码中，其能够正常显示:

![image-20240602101854944](https://img.zbus.top/zbus/blog202406021018993.png)

可是在 vue3 + ts 的博客项目上，却没法正常显示，可以看见其中的行号，都正常显示了，但是就是没有高亮。

![image-20240602102222905](https://img.zbus.top/zbus/blog202406021022933.png)

其中的代码如下:

1. 安装 prism 组件

   ```bash
   npm install prismjs
   npm install  @types/prismjs
   npm install vite-plugin-prismjs -D
   ```

2. 在文章的 ArticleDetail.vue 中，导入了对应的 css 文件和 js 文件。

   ```typescript
   import Prism from "prismjs" //代码高亮插件的core
   import "prismjs/plugins/line-numbers/prism-line-numbers.js"//行号插件
   import "prismjs/themes/prism-okaidia.css"//高亮主题
   import "prismjs/plugins/line-numbers/prism-line-numbers.css"//行号插件的样式
   ```

3. 在 ArticleDetail.vue 中，渲染的代码是从后端请求而来，具体的渲染逻辑如下：

   ```typescript
   const props = defineProps<{
     articleId: string
   }>()
   
   const articleDetails = ref()
   const articleInfo = ref<IArticle>()
   
   onMounted(async() => {
     await getArticleDetail({
       articleId: props.articleId
     }).then(res => {
       const result = res.data as IArticle
       // articleDetails.value = result.content
       articleInfo.value = result
       if (result.content) {
         articleDetails.value = result.content
         nextTick(() => {
           mediumZoom('[data-zoomable]', {
             // 打开之后非图片区域显示黑色
             background: 'rgba(0, 0, 0, 0.6)'
           });
           // 全局代码高亮(必须等获取数据之后，代码高亮才能生效，也可以用定时器定时)
           Prism.highlightAll()
         })
       }
     })
   })
   ```

   具体代码是在 24 行。Prism.highlightAll() 进行全局渲染。

4. 实际显示的效果，如上图所示，没有进行高亮显示。

## 解决方案

通过互联网查阅相关问题的解决方案，找了很多都没有找到实际有用的方法，后面，不经意间，看到需要在 vite.config.ts 中配置 prism 的组件。如下：

```typescript
import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {prismjsPlugin} from 'vite-plugin-prismjs'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        // prismjs 组件配置
        prismjsPlugin({
            languages: 'all', // 语言
            plugins: ['line-numbers', 'show-language', 'copy-to-clipboard', 'inline-color'],
            theme: 'okaidia',// 主题
            css: true,
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    // 解决跨域问题
    server: {
        host: 'localhost',
        // 随便设置一个冷门port，避免和api服务器上运行的vue项目port冲突
        port: 12333,
        // https: false,
        // open: false,
        proxy: {
            '/api': {
                // 实际请求地址
                target: 'http://localhost:8080/zs',
                // 是否允许跨域，在本地会创建一个虚拟的服务器
                // 然后发送请求数据
                changeOrigin: true,
                ws: false,
                rewrite: (path: string): string => {
                    return path.replace(/^\/api/, '/api');
                }
            }
        }
    }
})
```

prismjs 组件配置在 12 到 17 行。添加对应的配置之后，实际的效果如图:

![image-20240602104218547](https://img.zbus.top/zbus/blog202406021042590.png)
