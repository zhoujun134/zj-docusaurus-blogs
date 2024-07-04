---
slug: flexmark-java-used
title: java 使用 flexmark-java 进行 markdown 文件生成对应的 html 代码
authors:
  name: zhoujun134
  title: 不要等! 不管想做什么, 都要立刻动起来。
  url: https://github.com/zhoujun134
  image_url: https://img.zbus.top/zbus/logo.jpg
tags: [java, 后端]
---

# java 使用 flexmark-java 进行 markdown 文件生成对应的 html 代码

![img](https://img.zbus.top/zbus/blog202406022029096.jpg)

flexmark-java 的官方文档地址: [点击跳转](https://github.com/vsch/flexmark-java)

Flexmark-java 一个通过 java 语言即可实现将 markdown 内容转换为对应的 html 代码的库，其对 markdown 拥有很好的一个支持。在进行博客构建之时，遇到的一个重要问题就是将 markdown 文件渲染为对应的 html 内容呈现出来。最初在前端实现是使用的 [marked](https://github.com/markedjs/marked) 库, 由于自己对于前端的使用并不够熟练，所以在进行很多定制化的渲染 markdown 的内容时，都需要去研究前端的一些逻辑和实现，变得十分麻烦，同时，对于后端的接口数据返回上，直接返回 markdown 内容也不是很安全，所以便有了，在后端进行实现对应的转换逻辑比较好。

Flexmark-java 在网上详细的使用文档，感觉都比较少，对于官网给出的使用文档介绍的比较粗糙。所以，我将在这里记录一些自己对于 flexmark 的使用总结。

## 开胃菜

引入 flexmark-java 的 maven 依赖，在 pom.xml 文件中，添加如下内容: 

```xml
        <!-- markdown 文件转为 html 文件-->
        <dependency>
            <groupId>com.vladsch.flexmark</groupId>
            <artifactId>flexmark-all</artifactId>
            <version>0.64.8</version>
        </dependency>
```

测试用例: 

```java
package com.zj.zs.markdown;

import com.vladsch.flexmark.ext.autolink.AutolinkExtension;
import com.vladsch.flexmark.ext.emoji.EmojiExtension;
import com.vladsch.flexmark.ext.emoji.EmojiImageType;
import com.vladsch.flexmark.ext.emoji.EmojiShortcutType;
import com.vladsch.flexmark.ext.gfm.strikethrough.StrikethroughExtension;
import com.vladsch.flexmark.ext.gfm.tasklist.TaskListExtension;
import com.vladsch.flexmark.ext.tables.TablesExtension;
import com.vladsch.flexmark.ext.toc.TocExtension;
import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.ast.Document;
import com.vladsch.flexmark.util.data.DataHolder;
import com.vladsch.flexmark.util.data.MutableDataSet;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
/**
 * @ClassName MarkdownTest
 * @Author zj
 * @Description markdown 文件测试
 * @Date 2024/3/17 16:00
 * @Version v1.0
 **/
public class MarkdownTest {

    final private static DataHolder OPTIONS = new MutableDataSet().set(Parser.EXTENSIONS, Arrays.asList(
                    TocExtension.create(),
                    // 自定义扩展，为<pre>标签添加line-numbers的class，用于prism库代码左侧行号展示
                    AutolinkExtension.create(),
                    EmojiExtension.create(),
                    StrikethroughExtension.create(),
                    TaskListExtension.create(),
                    TablesExtension.create()
            ))// set GitHub table parsing options
            .set(TablesExtension.WITH_CAPTION, false)
            .set(TablesExtension.COLUMN_SPANS, false)
            .set(TablesExtension.MIN_HEADER_ROWS, 1)
            .set(TablesExtension.MAX_HEADER_ROWS, 1)
            .set(TablesExtension.APPEND_MISSING_COLUMNS, true)
            .set(TablesExtension.DISCARD_EXTRA_COLUMNS, true)
            .set(TablesExtension.HEADER_SEPARATOR_COLUMN_MATCH, true)
            // setup emoji shortcut options
            // uncomment and change to your image directory for emoji images if you have it setup
//                .set(EmojiExtension.ROOT_IMAGE_PATH, emojiInstallDirectory())
            .set(EmojiExtension.USE_SHORTCUT_TYPE, EmojiShortcutType.GITHUB)
            .set(EmojiExtension.USE_IMAGE_TYPE, EmojiImageType.IMAGE_ONLY);
    static final Parser PARSER = Parser.builder(OPTIONS).build();
    static final HtmlRenderer RENDERER = HtmlRenderer.builder(OPTIONS)
            // 缩进 2 字符
            .indentSize(2)
            .build();

    public static void main(String[] args) throws IOException {
        List<String> lines = Files.readAllLines(Path.of("/Users/zj/IdeaProjects/work/zjBootBlog/README.md"));
        String content = String.join("\n", lines);
        Document document = PARSER.parse(content);
        String html = RENDERER.render(document);
        System.out.println("generate html : " + html);
    }
}
```

上面的代码可以将 README.md 中的 markdown 文件内容生成对应的 html 代码、

例如我的 README.md 文件内容为:

````markdown
# 个人使用的 spring boot 脚手架

## 项目描述

## 表
```sql
create table zs_article
(
    title       varchar(255) default ''    null comment '标题',
    id          bigint auto_increment comment '主键' primary key,
    content     longtext                   null comment '内容',
    create_time datetime     default NOW() null comment '创建时间'
        
) comment '文章页面';
```
![1121212](https://img.zbus.top/zbus/blog202405102246409.jpg)
````

生成出来的 html 代码为: 

```html
<h1 id="个人使用的-spring-boot-脚手架">个人使用的 spring boot 脚手架</h1>
<h2 id="项目描述">项目描述</h2>
<h2 id="表">表</h2>
<pre><code class="language-sql">create table zs_article
(
    title       varchar(255) default ''    null comment '标题',
    id          bigint auto_increment comment '主键' primary key,
    content     longtext                   null comment '内容',
    create_time datetime     default NOW() null comment '创建时间'
        
) comment '文章页面';
</code></pre>
<p><img src="https://img.zbus.top/zbus/blog202405102246409.jpg" alt="1121212" /></p>
```

## 自定义对于图片的渲染逻辑

比如上面我们生成的图片代码，需要在对应的 img 标签，放在一个容器 div 中，同时给它设置一些，定制化的 class 属性，比如，自定以的类，和图片放大缩小所用到的属性 data-zoomable （参考[medium-zoom](https://github.com/francoischalifour/medium-zoom) 的使用，或者访问我的介绍文章:  [vue3+ts 实现图片点击放大缩小的效果](https://zbus.top/web/detail/3dc7696cc83c4424aaeb060f3bc9f093)）。

那么对于 flexmark 如何实现呢，即自定义 图片的解析逻辑，这里我们就需要使用到 NodeRenderer 类进行实现。实现 `NodeRenderingHandler.CustomNodeRenderer<T>` 接口。其中的 render 方法就是我们进行自定义逻辑的实现，如下：

```java
 public class ImageCustomNodeRenderer implements NodeRenderingHandler.CustomNodeRenderer<Image> {
        @Override
        public void render(@NotNull Image node, @NotNull NodeRendererContext context, @NotNull HtmlWriter html) {

            html.line();
            // 渲染包裹图片的 div 标签
            html.withAttr()
                    .attr("class", "zj-blog-content-img-container")
                    .tag("div");

            html.line();
            html.indent();
            // 开始渲染图片标签
            html.srcPosWithTrailingEOL(node.getChars()).withAttr()
                    .attr("class", "zj-blog-content-img")
                    .attr("data-zoomable", "")
                    .attr("src", node.getUrl())
                    .attr("alt", node.getText())
                    .tag("img");
            html.line();
            // 关闭图片 img
            html.tag("/img");
            // 新起一行
            html.line();
            // 关闭 div
            html.tag("/div");
            html.line();
        }
    }
```

实现了 NodeRenderingHandler.CustomNodeRenderer 接口之后，需要将这个自定义的节点解析类注入到我们的 html 解析器配置 (即:  OPTIONS 配置)，注入的方式是使用 HtmlRendererExtension 的方式，

比如我们这里自定义实现的图片扩展器。

```java
package com.zj.zs.service.markdown.extension.img;

import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.util.data.MutableDataHolder;
import org.jetbrains.annotations.NotNull;

/**
 * @ClassName CustomExtension
 * @Author zj
 * @Description
 * @Date 2024/5/31 08:28
 * @Version v1.0
 **/
public class CustomImageExtension implements HtmlRenderer.HtmlRendererExtension {
    @Override
    public void rendererOptions(@NotNull MutableDataHolder options) {

    }

    @Override
    public void extend(@NotNull HtmlRenderer.Builder htmlRendererBuilder, @NotNull String rendererType) {
        htmlRendererBuilder.nodeRendererFactory(new CustomImageNodeRenderer.Factory());
    }

    public static CustomImageExtension create() {
        return new CustomImageExtension();
    }
}
```

上面的类中，我们使用了 CustomImageNodeRenderer 类来承载刚刚我们自定的解析逻辑，其具体的实现逻辑如下：

```java
package com.zj.zs.service.markdown.extension.img;

import com.vladsch.flexmark.ast.Image;
import com.vladsch.flexmark.html.HtmlWriter;
import com.vladsch.flexmark.html.renderer.NodeRenderer;
import com.vladsch.flexmark.html.renderer.NodeRendererContext;
import com.vladsch.flexmark.html.renderer.NodeRendererFactory;
import com.vladsch.flexmark.html.renderer.NodeRenderingHandler;
import com.vladsch.flexmark.util.data.DataHolder;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.util.HashSet;
import java.util.Set;

/**
 * @ClassName CustomImageNodeRenderer
 * @Author zj
 * @Description
 * @Date 2024/6/1 10:35
 * @Version v1.0
 **/
public class CustomImageNodeRenderer implements NodeRenderer {
    @Override
    public @Nullable Set<NodeRenderingHandler<?>> getNodeRenderingHandlers() {
        HashSet<NodeRenderingHandler<?>> set = new HashSet<>();
        set.add(imageNodeRenderingHandler());
        return set;
    }

    private NodeRenderingHandler<Image> imageNodeRenderingHandler() {
        return new NodeRenderingHandler<>(Image.class, new ImageCustomNodeRenderer());
    }

    public static class Factory implements NodeRendererFactory {
        @NotNull
        @Override
        public NodeRenderer apply(@NotNull DataHolder options) {
            return new CustomImageNodeRenderer();
        }
    }
}
```

再回到我们的解析代码，把 CustomImageExtension 注入即可实现对应的自定义图片解析逻辑。具体的代码是，如下: 

```java
package com.zj.zs.markdown;

import com.vladsch.flexmark.ext.autolink.AutolinkExtension;
import com.vladsch.flexmark.ext.emoji.EmojiExtension;
import com.vladsch.flexmark.ext.emoji.EmojiImageType;
import com.vladsch.flexmark.ext.emoji.EmojiShortcutType;
import com.vladsch.flexmark.ext.gfm.strikethrough.StrikethroughExtension;
import com.vladsch.flexmark.ext.gfm.tasklist.TaskListExtension;
import com.vladsch.flexmark.ext.tables.TablesExtension;
import com.vladsch.flexmark.ext.toc.TocExtension;
import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.ast.Document;
import com.vladsch.flexmark.util.data.DataHolder;
import com.vladsch.flexmark.util.data.MutableDataSet;
import com.zj.zs.service.markdown.extension.img.CustomImageExtension;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;

import static com.zj.zs.service.markdown.extension.toc.CustomTocNodeRenderer.TOC_HTML;

/**
 * @ClassName MarkdownTest
 * @Author zj
 * @Description markdown 文件测试
 * @Date 2024/3/17 16:00
 * @Version v1.0
 **/
public class MarkdownTest {

    final private static DataHolder OPTIONS = new MutableDataSet().set(Parser.EXTENSIONS, Arrays.asList(
                    TocExtension.create(),
      							// 自定义的图片解析扩展器
                    CustomImageExtension.create(),
                    // 自定义扩展，为<pre>标签添加line-numbers的class，用于prism库代码左侧行号展示
                    AutolinkExtension.create(),
                    EmojiExtension.create(),
                    StrikethroughExtension.create(),
                    TaskListExtension.create(),
                    TablesExtension.create()
            ))// set GitHub table parsing options
            .set(TablesExtension.WITH_CAPTION, false)
            .set(TablesExtension.COLUMN_SPANS, false)
            .set(TablesExtension.MIN_HEADER_ROWS, 1)
            .set(TablesExtension.MAX_HEADER_ROWS, 1)
            .set(TablesExtension.APPEND_MISSING_COLUMNS, true)
            .set(TablesExtension.DISCARD_EXTRA_COLUMNS, true)
            .set(TablesExtension.HEADER_SEPARATOR_COLUMN_MATCH, true)
            // setup emoji shortcut options
            // uncomment and change to your image directory for emoji images if you have it setup
//                .set(EmojiExtension.ROOT_IMAGE_PATH, emojiInstallDirectory())
            .set(EmojiExtension.USE_SHORTCUT_TYPE, EmojiShortcutType.GITHUB)
            .set(EmojiExtension.USE_IMAGE_TYPE, EmojiImageType.IMAGE_ONLY);
    static final Parser PARSER = Parser.builder(OPTIONS).build();
    static final HtmlRenderer RENDERER = HtmlRenderer.builder(OPTIONS)
            // 缩进 2 字符
            .indentSize(2)
            .build();

    public static void main(String[] args) throws IOException {
        List<String> lines = Files.readAllLines(Path.of("/Users/zj/IdeaProjects/work/zjBootBlog/README.md"));
        String content = String.join("\n", lines);
        Document document = PARSER.parse(content);
        String html = RENDERER.render(document);
        System.out.println("test html : " + html);
    }
}
```

最终我们生成的代码如下: 

```html
<h1 id="个人使用的-spring-boot-脚手架">个人使用的 spring boot 脚手架</h1>
<h2 id="项目描述">项目描述</h2>
<h2 id="表">表</h2>
<pre><code class="language-sql">create table zs_article
(
    title       varchar(255) default ''    null comment '标题',
    id          bigint auto_increment comment '主键' primary key,
    content     longtext                   null comment '内容',
    create_time datetime     default NOW() null comment '创建时间'
        
) comment '文章页面';
</code></pre>
<p>
<div class="zj-blog-content-img-container">
  <img class="zj-blog-content-img" data-zoomable="" src="https://img.zbus.top/zbus/blog202405102246409.jpg"
       alt="1121212">
  </img>
</div>
</p>
```

可以看到上面，我们的图片渲染成功的添加了一个 div 包裹，并且包含了自定义的 class 属性和 data-zoomable 属性。

## 自定义代码渲染逻辑

其实现过程和图片的实现逻辑类似。这里直接上代码，CustomPreCodeExtension 类主要的扩展类。

```java
package com.zj.zs.service.markdown.extension.preCode;

import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.util.data.MutableDataHolder;
import org.jetbrains.annotations.NotNull;

/**
 * @ClassName CustomPreCodeExtension
 * @Author zj
 * @Description
 * @Date 2024/6/1 12:29
 * @Version v1.0
 **/
public class CustomPreCodeExtension implements HtmlRenderer.HtmlRendererExtension {

    @Override
    public void rendererOptions(@NotNull MutableDataHolder mutableDataHolder) {

    }

    @Override
    public void extend(@NotNull HtmlRenderer.Builder htmlRendererBuilder, @NotNull String rendererType) {
        htmlRendererBuilder.nodeRendererFactory(new CustomPreCodeNodeRenderer.Factory());
    }

    public static CustomPreCodeExtension create() {
        return new CustomPreCodeExtension();
    }
}
```

CustomPreCodeNodeRenderer 类实际的渲染逻辑实现类。

```java
package com.zj.zs.service.markdown.extension.preCode;

import com.vladsch.flexmark.ast.FencedCodeBlock;
import com.vladsch.flexmark.html.HtmlWriter;
import com.vladsch.flexmark.html.renderer.*;
import com.vladsch.flexmark.parser.Parser;
import com.vladsch.flexmark.util.data.DataHolder;
import com.vladsch.flexmark.util.misc.CharPredicate;
import com.vladsch.flexmark.util.sequence.BasedSequence;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.util.HashSet;
import java.util.Set;

/**
 * @ClassName CustomPreCodeNodeRenderer
 * @Author zj
 * @Description
 * @Date 2024/6/1 12:35
 * @Version v1.0
 **/
public class CustomPreCodeNodeRenderer implements NodeRenderer {
    final private boolean codeContentBlock;

    public CustomPreCodeNodeRenderer(DataHolder options) {
        codeContentBlock = Parser.FENCED_CODE_CONTENT_BLOCK.get(options);
    }
    @Override
    public @Nullable Set<NodeRenderingHandler<?>> getNodeRenderingHandlers() {
        HashSet<NodeRenderingHandler<?>> set = new HashSet<>();
        set.add(preCodeNodeRenderingHandler());
        return set;
    }

    private NodeRenderingHandler<FencedCodeBlock> preCodeNodeRenderingHandler() {
        return new NodeRenderingHandler<>(FencedCodeBlock.class, new PreCodeCustomNodeRenderer(codeContentBlock));
    }


    public static class Factory implements NodeRendererFactory {
        @NotNull
        @Override
        public NodeRenderer apply(@NotNull DataHolder options) {
            return new CustomPreCodeNodeRenderer(options);
        }
    }

    public static class PreCodeCustomNodeRenderer implements NodeRenderingHandler.CustomNodeRenderer<FencedCodeBlock> {
        private final boolean codeContentBlock;

        public PreCodeCustomNodeRenderer(boolean codeContentBlock) {
            this.codeContentBlock = codeContentBlock;
        }

        @Override
        public void render(@NotNull FencedCodeBlock node, @NotNull NodeRendererContext context, @NotNull HtmlWriter html) {

            BasedSequence info = node.getInfo();
            html.line();
            html.srcPosWithTrailingEOL(node.getChars())
                    .withAttr()
                    .tag("pre")
                    .openPre();
            if (info.isNotNull() && !info.isBlank()) {
                BasedSequence language = node.getInfoDelimitedByAny(CharPredicate.SPACE_TAB);
                // 增加行号控制
                String className = context.getHtmlOptions().languageClassPrefix + language.unescape() + " line-numbers";
                html.attr("class", className);
            } else {
                String noLanguageClass = context.getHtmlOptions().noLanguageClass.trim();
                if (StringUtils.isNotBlank(noLanguageClass)) {
                    html.attr("class", noLanguageClass);
                }
            }
            html.srcPosWithTrailingEOL(node.getContentChars()).withAttr(CoreNodeRenderer.CODE_CONTENT).tag("code");
            if (codeContentBlock) {
                context.renderChildren(node);
            } else {
                html.text(node.getContentChars().normalizeEndWithEOL());
            }
            html.tag("/code");
            html.tag("/pre").closePre();
            html.lineIf(context.getHtmlOptions().htmlBlockCloseTagEol);
        }
    }
}
```

其实现的主要自定义逻辑是在使用 prism 组件渲染所需要的 自定义 class 属性  line-numbers。

## 自定义列表渲染逻辑

主要是我的博客渲染是对于列表的显示有一些自定义的 class 类，所以这里也进行了一些列表的自定义渲染逻辑。

对应的处理逻辑和图片的处理逻辑一样。

CustomListExtension 类的实现逻辑如下:

```java
package com.zj.zs.service.markdown.extension.list;

import com.vladsch.flexmark.html.HtmlRenderer;
import com.vladsch.flexmark.util.data.MutableDataHolder;
import org.jetbrains.annotations.NotNull;

/**
 * @ClassName CustomListExtension
 * @Author zj
 * @Description
 * @Date 2024/6/1 12:03
 * @Version v1.0
 **/
public class CustomListExtension implements HtmlRenderer.HtmlRendererExtension {
    @Override
    public void rendererOptions(@NotNull MutableDataHolder mutableDataHolder) {

    }
    @Override
    public void extend(@NotNull HtmlRenderer.Builder htmlRendererBuilder, @NotNull String rendererType) {
        htmlRendererBuilder.nodeRendererFactory(new CustomListNodeRenderer.Factory());
    }

    public static CustomListExtension create() {
        return new CustomListExtension();
    }
}
```

列表的实际渲染逻辑 CustomListNodeRenderer 类。

```java
package com.zj.zs.service.markdown.extension.list;

import com.vladsch.flexmark.ast.BulletList;
import com.vladsch.flexmark.ast.OrderedList;
import com.vladsch.flexmark.html.HtmlWriter;
import com.vladsch.flexmark.html.renderer.NodeRenderer;
import com.vladsch.flexmark.html.renderer.NodeRendererContext;
import com.vladsch.flexmark.html.renderer.NodeRendererFactory;
import com.vladsch.flexmark.html.renderer.NodeRenderingHandler;
import com.vladsch.flexmark.util.data.DataHolder;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.util.HashSet;
import java.util.Set;

/**
 * @ClassName CustomListNodeRenderer
 * @Author zj
 * @Description
 * @Date 2024/6/1 12:04
 * @Version v1.0
 **/
public class CustomListNodeRenderer implements NodeRenderer {
    @Override
    public @Nullable Set<NodeRenderingHandler<?>> getNodeRenderingHandlers() {
        HashSet<NodeRenderingHandler<?>> set = new HashSet<>();
        set.add(bulletListNodeRenderingHandler());
        set.add(orderedListNodeRenderingHandler());
        return set;
    }

    private NodeRenderingHandler<BulletList> bulletListNodeRenderingHandler() {
        return new NodeRenderingHandler<>(BulletList.class, new BulletListCustomNodeRenderer());
    }

    private NodeRenderingHandler<OrderedList> orderedListNodeRenderingHandler() {
        return new NodeRenderingHandler<>(OrderedList.class, new OrderedListCustomNodeRenderer());
    }

    public static class Factory implements NodeRendererFactory {
        @NotNull
        @Override
        public NodeRenderer apply(@NotNull DataHolder options) {
            return new CustomListNodeRenderer();
        }
    }

    /**
     * 有序列表处理
     */
    public static class OrderedListCustomNodeRenderer implements NodeRenderingHandler.CustomNodeRenderer<OrderedList> {
        @Override
        public void render(@NotNull OrderedList node, @NotNull NodeRendererContext context, @NotNull HtmlWriter html) {
            html.line().indent();
            html.withAttr()
                    .attr("class", "zj-custom-ul")
                    .tag("ol");
            // 渲染列表项
            context.renderChildren(node);
            html.tag("/ol");
        }
    }
    /**
     * 无序列表处理
     */
    public static class BulletListCustomNodeRenderer implements NodeRenderingHandler.CustomNodeRenderer<BulletList> {
        @Override
        public void render(@NotNull BulletList node, @NotNull NodeRendererContext context, @NotNull HtmlWriter html) {

            html.line().indent();
            html.withAttr()
                    .attr("class", "zj-custom-ul")
                    .tag("ul");
            // 渲染列表项
            context.renderChildren(node);
            html.tag("/ul");
        }
    }
}
```

同样在使用的时候，我们都需要将上面的自定义扩展 HtmlRendererExtension 注入到解析器的配置中才会生效！

好了，以上就是我在使用 flexmark 的一些总结吧，希望对大家有所帮助，欢迎大家，留言交流。

![img](https://img.zbus.top/zbus/blog202406022116847.jpg)

