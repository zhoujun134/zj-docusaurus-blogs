---
slug: 2024-07-07-23-44-53-macos-zsh-install-and-config
title: macos(linux) 安装 zsh 和进行配置
authors:
  name: zhoujun134
  title: 不要等! 不管想做什么, 都要立刻动起来。
  url: https://github.com/zhoujun134
  image_url: https://img.zbus.top/zbus/logo.jpg
tags: [随笔]
---

对于经常换环境的用户来说，我觉得 zsh 真的是一个不错的 shell 工具，能够很漂亮的显示命令执行结果，而且 zsh 的配置文件非常简单，只需要一个配置文件即可。

![image-20240707234922711](https://img.zbus.top/zbus/blog202407072349788.png)

zsh 的官网地址: [点击跳转](https://ohmyz.sh)

## 安装 zsh

### macos 安装

mac 自带 zsh，通过 homebrew 安装即可

```bash
brew install zsh
```

### linux 安装

```bash
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
#没有梯子的使用国内镜像源
sh -c "$(curl -fsSL https://gitee.com/shmhlsy/oh-my-zsh-install.sh/raw/master/install.sh)"
```
或者使用 wget 下载脚本并安装：

```bash
sh -c "$(wget https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"
```

在 https://github.com/ohmyzsh/ohmyzsh/wiki/Themes 中查看内置的主题样式和对应的主题名。这些内置主题已经放在 ~/.oh-my-zsh/themes 目录下，不需要再下载。

```bash
cd ~/.oh-my-zsh/themes
```

![image-20240707235737715](https://img.zbus.top/zbus/blog202407072357746.png)

## zsh 配置

使用 vim 编辑 .zshrc，修改以下内容并保存：

```bash
vim ./.zshrc
```

```bash
#找到这一行修改
ZSH_THEME="要修改的主题名称"
```

最后，执行 source ~/.zshrc 配置生效

```bash
source ~/.zshrc
```

更多主题可以在这个链接内查看： https://github.com/ohmyzsh/ohmyzsh/wiki/Themes

### powerlevel10k （本人最喜欢的一个主题）

除了内置主题外，还可以选择其他开源的主题，强烈推荐尝试一下 powerlevel10k 主题，一个顶十个，项目地址为：https://github.com/romkatv/powerlevel10k

oh-my-zsh 安装这个款主题的方法：使用 git 将文件 clone 只指定文件夹 ～/.oh-my-zsh/custom/themes/powerlevel10k ，命令如下：

```bash
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
```

还是使用 vim 编辑 .zshrc的ZSH_THEME字段：

```bash
ZSH_THEME="powerlevel10k/powerlevel10k"
```

最后，执行 source ~/.zshrc 配置生效，和内置主题不同的是，这时会提示对主题进行配置，按照提示进行即可。

```bash
source ~/.zshrc
```

### 安装插件
配置完主题，美观度是有了，但是使用效率还没有提高，这就需要安装插件了

oh-my-zsh 已经内置了 git 插件，内置插件可以在 ～/.oh-my-zsh/plugins 中查看 ，下面介绍一下我常用的三个插件，更多插件可以在 awesome-zsh-plugins 里查看。

#### zsh-autosuggestions

[zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions) 是一个命令提示插件，当你输入命令时，会自动推测你可能需要输入的命令，按下右键可以快速采用建议。效果如下：

![image-20240708000128848](https://img.zbus.top/zbus/blog202407080001906.png)

安装步骤：

1. 把插件下载到本地的 ~/.oh-my-zsh/custom/plugins 目录：

```bash
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

2. 在 .zshrc 中，把 zsh-autosuggestions 加入插件列表：

```bash
plugins=(
    # other plugins...
    zsh-autosuggestions  # 插件之间使用空格隔开
)
```

3. 开启新的 Shell 或执行 `source ~/.zshrc`，就可以开始体验插件。

#### zsh-syntax-highlighting

[zsh-syntax-highlighting](https://link.zhihu.com/?target=https%3A//github.com/zsh-users/zsh-syntax-highlighting)是一个命令语法校验插件，在输入命令的过程中，若指令不合法，则指令显示为红色，若指令合法就会显示为绿色。效果如下：

![image-20240708000336783](https://img.zbus.top/zbus/blog202407080003819.png)

安装步骤：

1. 把插件下载到本地的 ~/.oh-my-zsh/custom/plugins 目录:

```bash
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting 
```

2. 在 .zshrc 中，把 zsh-autosuggestions 加入插件列表：

```bash
plugins=(
    # other plugins...
    zsh-autosuggestions
    zsh-syntax-highlighting
)
```

3. 开启新的 Shell 或执行 `source ~/.zshrc`，就可以开始体验插件。



#### z (文件夹自动跳转)

z 是一个文件夹快捷跳转插件，对于曾经跳转过的目录，只需要输入最终目标文件夹名称，就可以快速跳转，避免再输入长串路径，提高切换文件夹的效率。效果如下：

![image-20240708000627573](https://img.zbus.top/zbus/blog202407080006607.png)

安装步骤：

1. 由于 oh-my-zsh 内置了 z 插件，所以只需要在 .zshrc 中，把 z 加入插件列表：

```bash
plugins=(
     # other plugins...
     zsh-autosuggestions
     zsh-syntax-highlighting
     z
)
```

2. 开启新的 Shell 或执行 `source ~/.zshrc`，就可以开始体验插件了。

## alias 玩法

有时候我们经常会使用到一些常见的开发环境命令，可能会跟随着一连串的命令，这个时候，是非常不方便的，但是我们可以通过 `alias` 命令来对执行的命令设置一些别名。通过别名即可快速执行相应的命令。下面是我的一些常用别名和环境变量设置。就当做是备份吧。

```bash
## command
alias getIp="ifconfig | grep '\<inet\>' |sed 's/^[ \t]*//g'| cut -d' ' -f2"
alias glog="git log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"

## java
export JAVA_21_HOME=$(/usr/libexec/java_home -v21)
export JAVA_17_HOME=$(/usr/libexec/java_home -v17)
export JAVA_11_HOME=$(/usr/libexec/java_home -v11)

alias java21='export JAVA_HOME=$JAVA_21_HOME'
alias java17='export JAVA_HOME=$JAVA_17_HOME'
alias java11='export JAVA_HOME=$JAVA_11_HOME'
export PATH=$PATH:$JAVA_HOME/bin

## gralde
export GRADLE_HOME=/Users/zj/soft/gradle84
export GRADLE_HOME
export PATH=$PATH:$GRADLE_HOME/bin

## brew
export PATH=$PATH:/opt/homebrew/bin

## scala home
export SCALA_HOME=/Users/zj/soft/scala2130
export PATH=$PATH:$SCALA_HOME/bin

## zookeeper
export ZK_HOME=/Users/zj/soft/zookeeper364
export PATH=$PATH:$ZK_HOME/bin
alias zj-zk-start-server='/Users/zj/soft/zookeeper364/bin/zkServer.sh start'
alias zj-zk-stop-server='/Users/zj/soft/zookeeper364/bin/zkServer.sh stop'
alias zj-zk-restart-server='/Users/zj/soft/zookeeper364/bin/zkServer.sh restart'

## kafka
alias zj-kafka-start-server='/Users/zj/soft/kafka213-360/bin/kafka-server-start.sh -daemon /Users/zj/soft/kafka213-360/config/server.properties'
alias zj-kafka-stop-server='/Users/zj/soft/kafka213-360/bin/kafka-server-stop.sh'
```

