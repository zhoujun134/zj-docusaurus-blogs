---
slug: 02-javazheng-ze-biao-da-shi
title: 02-java正则表达式
authors:
  name: zhoujun134
  title: 不要等! 不管想做什么, 都要立刻动起来。
  url: https://github.com/zhoujun134
  image_url: https://img.zbus.top/zbus/logo.jpg
tags: [java, 后端]
image: https://img.zbus.top/zbus/blog202403150754487.webp
---
 
 项目开发中常用的正则表达式语法格式总结。文章对常见的正则表达式语法格式进行了总结，包括特殊符号、字符匹配、捕获组、Pattern类和Matcher类等。同时，也对Java中使用正则表达式的方法进行了介绍，包括matches、split、find、group、start、end、replace和reset等方法。 
<!-- truncate -->  
 在项目开发过程中，经常遇到正则表达式的一些使用场景，这里将常用的一些正则表达式做了整理和一些基础的语法格式做的总结。方便后续的查看和学习。

![背景](https://img.zbus.top//zbus/blog/202309241407767.webp)

## 常见语法格式

正则表达式（regex）是一个字符串，由字面值字符和特殊符号组成，是用来描述匹配一个字符串集合的模式，可以用来匹配、替换和拆分字符串。

例如可以检查一个字符串是否含有某种子字符串、将匹配的子字符串做替换或者从某个字符串中取出符合某个条件的子字符串等。

|            字符             |                             匹配                             |              示例              |
| :-------------------------: | :----------------------------------------------------------: |:----------------------------:|
|              .              |                   任意单个字符，除换行符外                   |                              |
|             \[]             |                     \[] 中的任意一个字符                     |                              |
|             \~              |                      \[] 内表示字符范围                      |    java 匹配 \[a~z]av\[a~g]    |
|              ^              |     在\[ ]内的开头，匹配除\[ ]内的字符之外的任意一个字符     |      java匹配`j[^b-f]va`       |
|             \|              |                              或                              |          x\|y匹配x或y           |
|             \\              |    将下一字符标记为特殊字符、文本、反向引用或八进制转义符    |          `\(`匹配`(`           |
| \| ;匹配位于一行及外围的;号 |                                                              |                              |
|             \*              |                   零次或多次匹配前面的字符                   |         zo\*匹配zoo或z          |
|              +              |                   一次或多次匹配前面的字符                   |         zo+匹配zo或zoo          |
|              ?              |                   零次或一次匹配前面的字符                   |          zo?匹配z或zo           |
|           `p{n}`            |               *n* 是非负整数。正好匹配 *n* 次                |     o{2} 匹配 food 中的两个 o      |
|           `p{n,}`           |               *n* 是非负整数。至少匹配 *n* 次                |       o{2}匹配foood中的所有o       |
|          `p{n,m}`           | *M* 和 *n* 是非负整数，其中 *n* `<=` *m*。匹配至少 *n* 次，至多 *m* 次 |     o{1,3}匹配fooood中的三个o      |
|           `\p{P}`           |         一个标点字符`!"#$%&'()*+,-./:;<=>?@[\]^_'{`          |     `J\p{P}a\`,`\`匹配J?a      |
|             \b              |                        匹配一个字边界                        | va\b匹配java中的va，但不匹配javar中的va |
|             \B              |                         非字边界匹配                         | va\B匹配javar中的va，但不匹配java中的va |
|             \d              |                         数字字符匹配                         |          1\[\d]匹配13          |
|             \D              |                        非数字字符匹配                        |       \[\D]java匹配Jjava       |
|             \w              |                           单词字符                           |        java匹配\[\w]ava        |
|             \W              |                          非单词字符                          |      \$java匹配\[\W]java       |
|             \s              |                           空白字符                           |       Java 2匹配Java\s2        |
|             \S              |                          非空白字符                          |       java匹配 j\[\S]va        |
|             \f              |                          匹配换页符                          |         等效于\x0c和\cL          |
|             \n              |                          匹配换行符                          |         等效于\x0a和\cJ          |

注意：

*   不要在重复词符中使用空白。如B{3,6} ，不能写成 B{3, 6}。
*   可以使用括号来将模式分组。(ab){3}匹配ababab , 而ab{3} 匹配 abbb。

## 捕获组

1, 捕获组是把多个字符当成一个单独单元进行处理的方法，它通过对括号内的字符分组来创建。

捕获组通过从左到右计算其括号来编号。

> 例如：在表达式 `((A)(B(C)))` 中，存在四个这样的组：
>
> *   ((A)(B(C)))
> *   (A)
> *   (B(C))
> *   (C)

2, 捕获组可以通过调用 matcher 对象的 groupCount 方法来查看表达式有多少个分组。（ groupCount 方法返回一个 int 值，来表示 matcher 对象当前有多少个捕获组）

3, 还有一个特殊的组零（ group(0) ），它代表整个表达式。（该组不包括在 groupCount 的返回值中）

4, 以 (?) 开头的组是纯的非捕获 组，它不捕获文本，也不针对组合计进行计数。

## Pattern 类 与Matcher 类

> Java的正则表达式是由java.util.regex的Pattern和Matcher类实现的。Pattern对象表示经编译的正则表达式。静态的compile( )方法负责将表示正则表达式的字符串编译成Pattern对象。

### 1.matches( )

```java
 boolean flag = str.matches(regex);
```

可以快速判断能否在str中找到regex。

### 2.split( )

```java
     String[ ]  ss = s.split(regex);
```

用regex把字符串分隔开来，返回String数组。

### 3.find( )

```java
     while(matcher.find(i)) {
         i++;
     }
```

Matcher.find( )的功能是发现CharSequence里的，与pattern相匹配的多个字符序列。

### 4. group()

> A(B(C))D 里面有三个组：
>
> group(0) 是 ABCD
>
> group(1) 是 BC
>
> group(2) 是 C

形式为 matcher.group( )

### 5. start( ) 和 end( )

如果匹配成功，start( )会返回此次匹配的开始位置，end( )会返回此次匹配的结束位置，即最后一个字符的下标加一。

如果之前的匹配不成功(或者没匹配)，那么无论是调用start( )还是end( )，都会引发一 个IllegalStateException。

```java
     matcher.start();
     matcher.end();
```

### 6.replace替换

```java
 replaceFirst(String replacement)将字符串里，第一个与模式相匹配的子串替换成replacement。
 replaceAll(String replacement)，将输入字符串里所有与模式相匹配的子串全部替换成replacement。
 String result = s.replaceAll(regex,ss);
 String result = s.replaceFirst(regex,ss);
```

### 7.reset( )

用reset( )方法可以给现有的Matcher对象配上个新的CharSequence。

如果不给参数，reset( )会把Matcher设到当前字符串的开始处。

```java
 m.reset("java");
```
