# 👏🏻 欢迎来到 [Z 不殊](https://zbus.top) 的小站

本站点基于 [Docusaurus](https://docusaurus.io/zh-CN/) 进行的构建，同时也做了一些修改，其中主要也参考了 [愧怍](https://kuizuo.cn/) 对于 Docusaurus 的修改。

![image-20240616153831842](https://img.zbus.top/zbus/blog202406161538926.png)

![image-20240616153908416](https://img.zbus.top/zbus/blog202406161539445.png)

本站实现的特点如下：

+ 自定义后端的评论表单，不依赖 Gitalk （网络不太行）
+ 自定义部分样式。
+ 支持后端发布内容到自己的 Docusaurus 站点。后端部署地址 [点击跳转]



## 如何安装

如果使用的是 npm， 首先克隆本站点的源码，然后进入到克隆下来的文件夹下，进行依赖包的安装：

```bash
git clone git@github.com:zhoujun134/zj-docusaurus-blogs.git		 # 01 使用 git 将本仓库的源码克隆下来。
cd zj-docusaurus-blogs                     # 02 进入到克隆下来的文件夹下
npm install 															 # 03 安装依赖包
```

## 如何运行

在 zj-docusaurus-blogs  目录下，打开控制台，执行 `npm run start` 即可完成本地的运行

```bash
npm run start
```

运行成功之后，访问 http://localhost:3000 应该就能看到该博客网站的效果。

## Build

```
npm run build
```

使用上面的命令可以生成对应的站点静态文件目录，生成的文件夹（build）我们可以部署在 nginx 等地方。

## 一些自定义配置

接下来就是讲解一些我们站点的一些自定义配置。主要包括，评论, 评论列表等。

### 启用评论

![image-20240616162345681](https://img.zbus.top/zbus/blog202406161623725.png)

该配置主要在 themeConfig 下的 commentConfig，其中主要包含了 docs 和 blog 的评论是否启用，默认是不启用的，需要自行开启，commentApiHost 为后端的评论接口api地址，主要

![image-20240616161142489](https://img.zbus.top/zbus/blog202406161611516.png)

在上面的配置中，我们将用到两个接口，一个是提交评论，一个是获取评论列表的接口。其接口的定义要求如下:

#### 提交评论接口

请求方式: POST

请求参数:

```javascript
export interface ICommentSubmitRequest {
    articleId?: string,						// 文章 id
    parentCommentId?: string,			// 父评论 id
    replyCommentId?: string,		  // 回复的评论 id
    author: string,								// 作者名称
    email: string,								// 作者邮箱
    content: string;							// 评论内容
}
```

响应参数:

```java
export interface IResult<boolean> {
    code: string
    message: string
    data?: boolean
}
```

#### 评论列表接口

请求方式: GET

请求参数:

```javascript
articleId: string    // 文章 id
```

响应参数:

IResult<ICommentInfo[]> 类型

```javascript
export interface IResult<T> {
    code: string
    message: string
    data?: T | any
}

export interface ICommentInfo {
    commentId?: string,
    author: string,
    content: string,
    createTime?: string,
    likeNum?: number,
    children?: ICommentInfo[],
    isShowSubmit?: boolean
}
```
