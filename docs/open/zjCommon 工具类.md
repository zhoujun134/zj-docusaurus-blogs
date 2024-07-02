---
id: zj-common
slug: /open/zj-common
title: zj Common 通用异常处理工具类
date: 2023-09-23
author: zhouJun134
tags: [open]
keywords: [zj common，java，通用异常处理，json]

---

![背景](https://img.zbus.top//zbus/blog/202309241756137.webp)

# 1. zj Commom java 工具类

## 1.1 简介

常用的 工具类

+ com.zj.common.exception 异常处理相关的包
+ com.zj.common.file 文件处理相关的工具类
+ com.zj.common.json Json 转换的工具类
+ com.zj.common.mybatis mybatis 生成相关的 mapper.xml 文件的工具

 点击 [github 源码地址](https://github.com/zhoujun134/commom) 直达仓库，欢迎 star 和 follower
## 1.2 使用方法

在 maven 的 pom.xml 中。如果没有添加`repositories` ，可以添加一个 `repositories`, 如果添加了，就直接追加  `<repository>...</repository>` 中的内容。

````xml
    <repositories>
        <repository>
            <id>zj-maven</id>
            <url>https://gitee.com/junzhou134/maven/raw/master</url>
        </repository>
    </repositories>
````

然后再在 `<dependencies>...</dependencies>` 引入即可：

```xml
        <dependency>
            <groupId>com.zj</groupId>
            <artifactId>common</artifactId>
            <version>0.0.1</version>
        </dependency>
```

# 2. 异常处理类

在开发一些后端项目时，我们常常会定义一些通用的处理类，来处理异常信息，返回 `json` 数据时，等等场景，一般都是固定的格式，然而常常我们在每次新建项目时，都需要去新建这些实体类或者工具类，这里的 `com.zj.common.exception` 包下，提供了基础的一些异常处理工具。

## 2.1 `ResultCode` 统一返回 code 枚举

`com.zj.common.exception.ResultCode` 枚举类主要定义了错误的返回数据结构，其中主要包含 `code` 和 `message` 去描述一个异常信息，每次在处理一些业务异常时，我们通过增加枚举来描述异常的一些情况，这样的好处就是方便我们日常开发中的错误处理。更好的定位异常。

## 2.2 `BusinessException` 业务异常类

`com.zj.common.exception.BusinessException` 业务异常类，主要方便我们在抛一些业务异常时，进行统一处理。其中包含了 `com.zj.common.exception.ResultCode` 的一些描述，可以方便我们对异常描述和统一处理，使项目中的代码更加清晰。

## 2.3 `ValidateUtil` 最好的一种业务异常处理工具类

`com.zj.common.exception.ValidateUtil` 为什么是最好的一种业务异常处理工具类？

1. 减少   `if ... else ... ` 条件判断，在日常的开发中，我们常常需要判断某个数据是否为满足某个条件的情况，如果不满足条件，则抛出对应的业务异常，比如：

```java
...
    public void updateFill(MetaObject metaObject) {
        log.info("updateFill start ...");
        final LoginUserDTO currentUser = userUtils.getCurrentUser();
        if (Objects.isNull(currentUser) || StringUtils.isBlank(currentUser.getUsername())) {
            throw new BusinessException(ResultCode.DB_USER_NOT_LOGIN_NO_PERMIT);
        }
        LocalDateTime currentTime = LocalDateTime.now();
        this.setFieldValByName("updateTime", currentTime, metaObject);
        this.setFieldValByName("updateId", currentUser.getUsername(), metaObject);
    }
...
```

其中的 if 判断，可以直接使用工具类进行统一处理。如下: 可以看到上面的 5-7 行的代码，统一由 下面的第4 行代码代替了，意思也一样，简明的直到，这个地方做了异常判断。

```java
    public void updateFill(MetaObject metaObject) {
        log.info("updateFill start ...");
        final LoginUserDTO currentUser = userUtils.getCurrentUser();
        ValidateUtil.exceptionByTrue(Objects.isNull(currentUser) || StringUtils.isBlank(currentUser.getUsername()),
                ResultCode.DB_USER_NOT_LOGIN_NO_PERMIT);
        LocalDateTime currentTime = LocalDateTime.now();
        this.setFieldValByName("updateTime", currentTime, metaObject);
        this.setFieldValByName("updateId", currentUser.getUsername(), metaObject);
    }
```

`ValidateUtil` 包含的方法如图所示：

![](https://img.zbus.top//zbus/blog/202309241756710.webp)

| 方法名             | 参数                                                         | 描述                                                         |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| exceptionByNotNull | 1. object: 待判断的对象。<br />2.exception:  如果不满足条件，返回的异常信息 | 如果 object 不为 null， 则抛出对应的异常信息                 |
| exceptionByNull    | 1. object: 待判断的对象。<br />2.exception:  如果不满足条件，返回的异常信息 | 如果 object 为 null， 则抛出对应的异常信息                   |
| requireNonNull     | 1. object: 待判断的对象。<br />2.exception:  如果不满足条件，返回的异常信息 | 请求非空对象，如果为空，抛出对应的 exception 对象。如果不为空，直接返回对应的对象 |
| exceptionByTrue    | 1. flag: 是否满足条件 <br />2. resultCode: 如果不满足条件，则抛出对应的业务异常 | 如果不满足条件，则抛出对应的业务异常                         |
| exceptionByFalse   | 1. flag: 是否满足条件 <br />2. resultCode: 如果不满足条件，则抛出对应的业务异常 | 如果不满足条件，则抛出对应的业务异常                         |

# 3.  文件处理类 `FileUtils`

+ `List<String> readLines(String pathString)`: 获取 pathString 文件中的所有行数据。放在一个 List 中返回。
+ `Map<Integer, String> findContentByKeyWord(String pathString, String keyword)`: 从路径 pathString 中查询指定关键字 keyword 的文件内容。

# 4. json 转换工具类 `JsonUtil`

其中包含的方法如下：

![json 转换工具类](https://img.zbus.top//zbus/blog/202309241756314.webp)

# 5. mybatis 结果转换类 `MybatisResultMapUtil`

+ `String getResultMap(Class<?> clazz) `: 将 clazz 转换为 mybatis 的 xml 中使用的 resultMap。



## 6. etc. 待更新
