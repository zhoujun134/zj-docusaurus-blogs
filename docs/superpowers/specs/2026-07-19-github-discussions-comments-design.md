# GitHub Discussions 评论迁移设计

## 背景与目标

项目当前使用自建评论接口加载和提交博客、文档评论，并复用同一组件接收友链申请。本次改造将评论系统迁移到 Giscus 与 GitHub Discussions，停止浏览器端对自建评论接口的依赖，同时提供一次性迁移工具导入现有历史评论。

目标包括：

- 博客文章、文档页面和友链申请均使用 GitHub Discussions。
- 保留现有 `docs`、`blog` 评论开关以及博客 front matter 的 `hide_comment` 行为。
- 保留友链申请说明卡片和申请格式提示。
- 评论主题自动跟随 Docusaurus 的浅色、深色和系统主题。
- 历史评论按原文章和回复关系迁移，并支持预演、中断恢复和重复执行保护。
- GitHub Token 只用于本地迁移程序，不进入前端包、仓库或部署产物。

## 方案选择

采用 `@giscus/react` 接入 GitHub Discussions。

未选择 Utterances，因为 GitHub Issues 的分类、回复和互动能力弱于 Discussions。未选择自建 GitHub OAuth 与 GraphQL 前端，因为这会继续引入认证后端、令牌保护、限流和长期维护成本。

## GitHub 侧准备

目标仓库为 `zhoujun134/zj-docusaurus-blogs`。实施前需要：

1. 在仓库设置中启用 GitHub Discussions。
2. 安装并授权 Giscus GitHub App 访问该仓库。
3. 创建专用分类“站点评论”，用于博客和文档评论。
4. 创建专用分类“友链申请”，用于友链页面。
5. 获取仓库 `repoId` 以及两个分类的 `categoryId`。

这些 ID 不是秘密，可以保存在 Docusaurus 配置中；具备写入 Discussions 权限的 Token 必须仅通过本地环境变量提供。

## 页面与 Discussion 映射

为避免域名、文章标题或 URL 参数变化导致映射失效，使用 Giscus 的 `specific` 映射模式，并生成稳定评论键。

评论键规则：

- 博客和文档：前缀 `zbus-comment:` 加标准化 pathname，例如 `zbus-comment:/blog/example`
- 友链申请：`zbus-friend-applications`

`normalized-pathname` 的规则为：

- 只使用 pathname，不包含 query 和 hash。
- 确保以 `/` 开头。
- 根路径以外移除末尾 `/`。
- 保留 Docusaurus 实际生成的大小写和 Unicode 字符。

迁移创建的 Discussion 标题必须包含完整评论键。例如：

```text
[评论] 不确定性的互联网环境 · zbus-comment:/blog/bu-que-ding-xing-de-hu-lian-wang-huan-jing
```

Giscus 组件使用同一个评论键作为 `term`，从而找到预先迁移的 Discussion，而不是创建重复讨论。

## 前端架构

### 配置

将现有 `themeConfig.commentConfig` 扩展为：

```ts
{
  docs: true,
  blog: true,
  provider: 'giscus',
  giscus: {
    repo: 'zhoujun134/zj-docusaurus-blogs',
    repoId: process.env.GISCUS_REPO_ID ?? '',
    commentsCategory: '站点评论',
    commentsCategoryId: process.env.GISCUS_COMMENTS_CATEGORY_ID ?? '',
    friendCategory: '友链申请',
    friendCategoryId: process.env.GISCUS_FRIEND_CATEGORY_ID ?? ''
  }
}
```

这些构建环境变量保存公开 GitHub 标识，不是运行时秘密。GitHub 侧准备完成后，将真实值配置到本地 `.env` 和部署平台；如果缺失，组件不加载第三方脚本，并显示可诊断的配置错误。

### 组件边界

- `Comments`：继续作为博客和文档的公共入口，负责读取配置、生成评论键、选择分类并渲染提示与 Giscus。
- `GiscusComments`：只负责 Giscus 参数、主题同步和加载降级。
- `commentKey` 工具：纯函数，负责路径标准化和评论键生成，供前端与迁移脚本共享或保持同一测试向量。
- 现有 `CommentForm`、`CommentList`、评论 HTML 清理代码和 `articleApi` 评论请求在迁移完成后删除。
- 评论显隐逻辑 `shouldShowComments` 保留，不改变用户可见规则。

### 主题和加载行为

- Giscus 仅在浏览器环境加载。
- Docusaurus `colorMode` 为 `dark` 时使用 Giscus `dark` 主题，其余使用 `light`。
- 切换主题时通过 React 属性更新 Giscus，不刷新页面。
- 加载区域保留稳定最小高度，减少 iframe 加载引起的布局跳动。
- GitHub 或 Giscus 不可用时显示简短错误提示和“前往 GitHub Discussion”备用链接，不影响正文阅读。

### 友链申请

友链页面继续展示现有申请说明与 YAML 示例，但不再展示用户名、邮箱和评论内容表单。Giscus 使用固定评论键 `zbus-friend-applications` 和“友链申请”分类。

用户通过 GitHub 登录后按照页面给出的 YAML 格式提交申请。所有申请集中在同一个 Discussion 中，便于审核和回复。

## 历史评论迁移

### 输入格式

迁移工具接受 UTF-8 JSON 文件。顶层为评论数组，每条记录包含：

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

嵌套导出数据在迁移前被展平。`commentId`、`articleId`、`author`、`content` 为必填字段；缺失标题时使用标准化 pathname；缺失时间时明确标记“原系统未记录”。

### 迁移流程

1. 校验完整输入文件，发现重复 ID、孤立回复或无效文章路径时停止，不产生 GitHub 写入。
2. 按评论键分组，并区分普通页面与友链申请分类。
3. 查询分类中是否已经存在包含该评论键的 Discussion。
4. 不存在时通过 GitHub GraphQL `createDiscussion` 创建；存在时复用。
5. 先迁移顶级评论，再按父子关系迁移回复。
6. 每次成功写入后立即保存迁移状态文件，将旧评论 ID 映射到 GitHub Discussion Comment node ID。
7. 遇到 GitHub 限流、网络故障或进程终止时安全退出；再次运行时跳过已记录项目。

### 历史身份和时间

GitHub 不允许迁移程序伪装成原评论作者，也不允许回填 `createdAt`。所有历史内容将由执行迁移的 GitHub 账号发布，并在正文中保留来源信息：

```markdown
> 历史评论迁移
> 原作者：张三
> 原发布时间：2024-05-01 12:30:00 +08:00
> 原评论 ID：123

原评论正文
```

原评论正文作为普通 Markdown 文本写入，不允许原始 HTML 直接执行。迁移程序对可能破坏引用块或代码围栏的内容进行安全格式化，但不改变可读语义。

### 回复层级

GitHub Discussions 支持对评论进行回复，但展示层级与原系统可能不同。迁移工具保留顶级评论与直接回复关系；更深层回复挂到对应的顶级评论下，并在正文中注明“回复原作者”，避免信息丢失。

### 预演和外部写入保护

迁移程序默认执行 `--dry-run`，只输出计划创建的 Discussion、评论和回复数量。真实写入必须显式传入 `--apply`，并通过环境变量 `GITHUB_TOKEN` 提供权限。

首次真实迁移属于外部不可逆写入操作，执行前需要再次确认目标仓库、分类、评论数量和使用账号。Token 至少需要目标仓库 Discussions 的读写权限。

## 切换与回滚

迁移顺序：

1. 完成 GitHub 配置和迁移工具测试。
2. 导出旧评论并停止旧系统的新评论写入。
3. 执行 dry-run，核对分组、数量和异常记录。
4. 执行历史迁移并抽样检查 Discussion。
5. 部署 Giscus 前端。
6. 新前端不再包含旧评论表单和接口调用代码，但通过 Git 历史保留可回退版本。
7. 保留旧评论数据库和接口只读备份至少 30 天；后端下线由后端项目单独处理。

如果前端切换失败，可以回退到前一版本继续读取旧接口。已经迁移到 GitHub 的 Discussions 不删除，避免破坏审计记录；修复后通过状态文件继续迁移或重新启用 Giscus。

## 测试与验收

自动化测试包括：

- pathname 标准化和评论键生成。
- 博客、文档、友链选择正确的分类和 term。
- `docs`、`blog` 与 `hide_comment` 显隐规则保持不变。
- Giscus 配置缺失时不加载 iframe，并显示错误提示。
- 浅色与深色主题参数正确。
- 迁移输入校验、分组、父子排序、正文格式化和幂等状态恢复。
- dry-run 不调用 GitHub 写入 mutation。

人工验收包括：

- 博客和文档各选择一个页面，确认评论不会串页。
- 友链申请集中进入专用 Discussion。
- 登录、发表评论、回复和切换主题可用。
- 移动端无水平溢出，iframe 加载不遮挡正文。
- 抽样比较旧数据库和 GitHub 中的作者、时间、正文及回复关系。
- 生产构建与主要页面均无控制台错误。

## 完成标准

- 新评论完全通过 Giscus 写入 GitHub Discussions。
- 浏览器不再调用现有评论列表和提交接口。
- 历史评论迁移工具能够 dry-run、断点续传并防止重复导入。
- 用户确认迁移抽样结果后，旧评论系统进入只读保留阶段。
- 所有自动化检查和生产构建通过。
