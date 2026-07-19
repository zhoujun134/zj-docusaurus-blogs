# 👏🏻 欢迎来到 [Z 不殊](https://zbus.top) 的小站

本站点基于 Docusaurus 3.10、React 19 和 Tailwind CSS 4 构建，用于记录技术学习、日常思考和项目实践。

![博客首页](https://zbus.top/img/blog/blog202406161538926.png)

![文章列表](https://zbus.top/img/blog/blog202406161539445.png)

主要功能：

- GitHub Discussions 与 Giscus 评论
- 博客、文档和友链申请使用独立评论映射
- 支持明暗主题、项目展示和友链
- 代码支持复制、自动换行和折叠
- 提供历史评论预演、迁移和断点续传工具

## 安装

项目使用 Node.js 22.22.2。建议通过 nvm 读取仓库中的 `.nvmrc`，并使用锁文件安装依赖：

```bash
git clone git@github.com:zhoujun134/zj-docusaurus-blogs.git
cd zj-docusaurus-blogs
nvm use
npm ci
```

## 本地运行

```bash
npm run start
```

启动后访问 <http://localhost:3000>。

## 构建与检查

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

生产静态文件会生成在 `build` 目录，可以部署到 Nginx 或其他静态网站托管服务。

## 评论配置

评论开关和 Giscus 配置位于 `docusaurus.config.ts` 的 `themeConfig.commentConfig`。文档和博客可以分别启用评论，博客文章还可以通过 Front Matter 的 `hide_comment: true` 单独关闭评论。

本地和部署环境需要配置 `.env.example` 中的三个公开 Giscus ID。GitHub Discussions、历史数据导出、预演、正式迁移和回滚步骤见 [评论迁移指南](scripts/comments/README.md)。
