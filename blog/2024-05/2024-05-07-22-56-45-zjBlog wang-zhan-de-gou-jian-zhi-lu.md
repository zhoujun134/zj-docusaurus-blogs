---
slug: zjBlog wang-zhan-de-gou-jian-zhi-lu
title: zjBlog 网站的构建之路
authors:
  name: zhoujun134
  title: 不要等! 不管想做什么, 都要立刻动起来。
  url: https://github.com/zhoujun134
  image_url: https://img.zbus.top/zbus/logo.jpg
tags: [随笔]
image: https://img.zbus.top/zbus/blog202403140854791.png
---
 
 作者分享了自己创建博客的经历，尝试过多个开源博客项目，但都存在一些限制和不喜欢的地方，于是决定自己书写一个博客。经过努力，终于完成了第一版的系统，基于 Vue3 + TypeScript + Element-Plus 构建前端，Java 语言编写的 SpringBoot 构建后端，数据库采用 Mysql + Redis。博客已经实现了多个功能，如文章列表、归档、文章分类卡片等，未来还计划优化页面渲染、访问数统计、评论提交限制等功能。 
<!-- truncate -->  
 ![img](https://img.zbus.top/zbus/blog202405070816095.jpg)

👨‍💻 对于博客的建设，经历了一段时间的折腾，反反复复可能都不能满意，其中尝试过，WordPress， hexo, docusaurus, halo 等这些开源的博客项目， 但是都多多少少有一些限制和不喜欢的地方，最终还是放弃了它们。

因此, 便有了自己书写一个博客的想法。经过这段时间的倒腾，也算是把第一版的系统样子做了出来， 其中从前端的不会，到各种找资源，各种学习，css 的一些样式真的比较生疏，为什么要倒腾？ 一是想自学一下前端，方便以后自己开发一些页面，二是为了做一些自定义的内容，方便自己以后能够将自己想表达的东西，呈现出来。因此，便有了这个站点。

**前端:** 基于 vue3 + typeScript + element-plus 构建。[点击访问源代码](https://zbus.top)

**后端:** 基于 java 语言编写，使用了 springboot 构建，数据库采用的是 Mysql + redis。[点击访问源代码](https://zbus.top)

Notice: 由于前端页面是边学边写的，可能会存在一些 bug，欢迎大家评论和留言，我将不断改进，也希望大家共同进步。

这个博客主要包含了 PC 端和移动端的页面构建，其中 PC 端的大致形式如下图:

![mnggiflab-video-to-gif](https://img.zbus.top/zbus/blog202405072254203.gif)

移动端的大致形式: 

![移动端](https://img.zbus.top/zbus/blog202405070823007.gif)

## 目前已经实现的功能

### 2024年5月7日 （update）

- [x] 文章列表
- [x] 归档
- [x] 文章分类卡片
- [x] 文章标签卡片
- [x] 文章评论
- [x] 发布文章（目前支持发布文章），现有缺乏编辑文章的按钮。
- [x] 友链页
- [x] 搜索框卡片

## 待优化项

### 前端项目：

- [ ] 页面渲染的优化，ts 文件规整一下，
- [ ] 访问数统计卡片
- [ ] markdown 内容页，优化代码显示区域的格式。


### 后端项目

- [ ] 访问监控（异常请求的监控，防止恶意请求）
- [ ] 评论提交限制，防止恶意提交。
- [ ] 实现定时任务，按天和周进行周报总结网站的访问日志。
- [ ] 接入 AI 的能力，动态渲染部分内容。

❤️ ❤️ ❤️ 

以上就是当前这个项目所实现的一部分内容，欢迎大家评论和指正！

![img](https://img.zbus.top/zbus/blog202405070838514.jpg)