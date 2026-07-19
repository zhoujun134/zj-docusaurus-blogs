# GitHub Discussions 评论迁移

站点使用 Giscus 展示 GitHub Discussions。博客和文档进入“站点评论”分类，友链申请进入“友链申请”分类。

## GitHub 准备

目标仓库：`zhoujun134/zj-docusaurus-blogs`

仓库公开 ID：`R_kgDOMKBFkQ`

1. 在 GitHub 仓库 Settings > General > Features 中启用 Discussions。
2. 安装 [Giscus GitHub App](https://github.com/apps/giscus)，并授权访问目标仓库。
3. 创建“站点评论”和“友链申请”两个 Discussion 分类。
4. 通过 [Giscus 配置页](https://giscus.app/zh-CN)或 GitHub GraphQL API 获取两个分类 ID。
5. 在本地 `.env.local` 和部署平台中配置：

```dotenv
GISCUS_REPO_ID=R_kgDOMKBFkQ
GISCUS_COMMENTS_CATEGORY_ID=DIC_kwDOMKBFkc4DBhwl
GISCUS_FRIEND_CATEGORY_ID=DIC_kwDOMKBFkc4DBhxE
```

这些 ID 是公开配置。`GITHUB_TOKEN` 是迁移写入凭证，不得写入配置文件、提交到仓库或注入浏览器端代码。

## 导出格式

迁移输入是 UTF-8 JSON 数组。每条记录格式如下：

```json
{
  "commentId": "123",
  "articleId": "/blog/example",
  "articleTitle": "示例文章",
  "parentCommentId": null,
  "replyCommentId": null,
  "author": "原作者",
  "content": "评论内容",
  "createTime": "2024-05-01T12:30:00+08:00"
}
```

`commentId`、`articleId`、`author` 和 `content` 必填。也可以输入包含 `children` 的嵌套评论；子评论会继承父记录的文章信息。

旧友链申请的 `articleId` 使用 `@site/my-friends/links/apply`。迁移工具会将它们归入固定标识 `zbus-friend-applications`。

## 预演

迁移命令默认只做校验和计数，不连接 GitHub，也不会产生外部写入：

```bash
npm run comments:migrate -- --input /absolute/path/comments.json
```

输出包括 Discussion 分组数、评论总数、顶级评论数和回复数。遇到重复 ID、缺失字段、孤立回复或循环回复关系时，预演会失败。

## 正式迁移

使用仅限目标仓库、具备 Discussions 读写权限的细粒度 GitHub Token。在当前终端设置环境变量，然后显式添加 `--apply`：

```bash
export GITHUB_TOKEN='从 GitHub 获取的细粒度令牌'
export GISCUS_REPO_ID='R_kgDOMKBFkQ'
export GISCUS_COMMENTS_CATEGORY_ID='DIC_kwDOMKBFkc4DBhwl'
export GISCUS_FRIEND_CATEGORY_ID='DIC_kwDOMKBFkc4DBhxE'

npm run comments:migrate -- \
  --input /absolute/path/comments.json \
  --state /absolute/path/migration-state.json \
  --apply
```

不指定 `--state` 时，状态文件默认为输入文件同目录下的 `migration-state.json`。

迁移程序每次成功写入后都会原子更新状态文件。再次运行相同命令会跳过已记录的 Discussion 和评论，用于网络故障后续传并防止重复导入。请保留状态文件，不要提交其中的数据。

## 数据限制

- 历史内容统一由执行迁移的 GitHub 账号发布，无法伪装成原作者。
- GitHub 不允许回填原始创建时间；原作者、原时间和原评论 ID 会写入评论正文。
- 原始 HTML 会被转义为文本，避免导入可执行标签。
- 超过 GitHub 展示层级的回复会挂到对应顶级评论，并注明回复对象。

## 验证与回滚

迁移后抽样核对博客、文档和友链申请的作者、时间、正文及回复关系。确认稳定前，将旧评论数据库和接口保持只读至少 30 天。

前端出现问题时可以回退到迁移前的 Git 提交。不要删除已经迁移的 Discussions；修复后使用原状态文件继续执行。
