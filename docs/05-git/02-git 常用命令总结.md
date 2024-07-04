---
slug: git-common-command-used2
title: 02-git 常用命令总结
date: 2023-12-04
authors:
  name: zhoujun134
  title: 不要等! 不管想做什么, 都要立刻动起来。
  url: https://github.com/zhoujun134
  image_url: https://img.zbus.top/zbus/logo.jpg
keywords: [git, command]
---

### 1.分支管理

#### 1.1 **创建本地分支**

````bash
git branch 分支名 # 创建新的本分支， # 单纯 git branch 会列出 当前所有分支
````

![](https://img.zbus.top//zbus/blog/202312040006977.webp)

#### 1.2. 切换本地分支

```bash
git checkout 分支名
```

![](https://img.zbus.top//zbus/blog/202312040006607.webp)

#### 1.3. 远程分支就是本地分支push到服务器上。比如master就是一个最典型的远程分支（默认）

```bash
git push origin zj13
```

![](https://img.zbus.top//zbus/blog/202312040007946.webp)

#### 1.4. **远程分支和本地分支需要区分好，所以，在从服务器上**拉取特定分支的时候，需要指定远程分支的名字。

```bash
git checkout --track origin/zj13
```

#### 1.**5.** **提交分支数据到远程服务器**

```bash
git push origin <local_branch_name>:<remote_branch_name>
```

#### 1.6 **删除分支**

```bash
git push origin :zj13 # 方式一， 删除远程分支 zj13 
git push origin --delete <BranchName> # 方式二 
git branch -d zj13 # 删除本地分支 zj13
```

![](https://img.zbus.top//zbus/blog/202312040007484.webp)

#### 1.**7.** **查看分支**

```bash
git branch -a
```

### 2. **情景：在做某个需求a时，先需要修改紧急bug b；发版时发的是远程 `dev` 的代码。**

#### 2.1 **方式一：（推荐）**

(1)本地已有分支`dev`，写了需求 a，先`commit`，即将工作区的内容提交到版本库中，否则切换到其他分支时，就会覆盖当前工作区的代码。（这步很重要）

(2)在本地创建`dev_bug`分支，从远程 `dev` 分支中 check（`git checkout -b dev_bug origin/dev`）

(3)在本地 `dev_bug`上修改 bug，并`commit`、`push`到远程 `dev` 上

(4)在本地变换到 `dev`，继续做需求 a

#### 2.2. 方式二：（推荐）

（1）本地已有分支`dev`，写了需求a，但是不要提交。

（2）执行`git stash`命令，将工作区的内容“储存起来”

（3）接着在`dev`分支上修改 bug，并提交，`push`

（4）执行`git stash pop `，恢复工作区原来的内容。

#### 2.3. 方式三

（1）本地已有分支`dev`，写了需求a，先`commit`，即将工作区的内容提交到版本库中，否则切换到其他分支时，就会覆盖当前工作区的代码。（这步很重要）

（2）执行`git log --pretty=oneline`，会显示所有的版本号，记住最新的那个版本号，记为A

（3）然后执行`git reset --hard HEAD^`，恢复到上个版本。

（4）本地新建分支`dev_debug`（`git checkout -b dev_debug`），这时`dev_debug`的代码是写需求a之前的版本。修复完bug后，提交并`push`到远程`dev`。

（5）本地切换到 `dev`分支，并回到最新的那个版本A ，执行命令 `git reset --hard ` `<A前几位>`，这时又回到需求a的开发。

### 3. git fetch

+ `git fetch`是将远程主机的最新内容拉到本地，用户在检查了以后决定是否合并到工作本机分支中。

+ `git pull` 则是将远程主机的最新内容拉下来后直接合并，即：`git pull = git fetch + git merge`，这样可能会产生冲突，需要手动解决。

将远程主机的最新内容拉下来

```bash
git fetch <远程主机名>  # 这个命令将某个远程主机的更新全部取回本地
```

如果只想取回特定分支的更新，可以指定分支名：

```bash
git fetch <远程主机名> <分支名>  # 注意之间有空格
```

**git fetch:只是从远程获取最新版本到本地,不会`merge`(合并)**

### 4.  git rebase

**git merge**是用来合并两个分支的。

```bash
git merge b  # 将b分支合并到当前分支
```

同样 `git rebase b`，也是把 b分支合并到当前分支

** `rebase` 工作流：**

```bash
git rebase 
while(存在冲突) {
    git status
    # 找到当前冲突文件，编辑解决冲突
    git add -u
    git rebase --continue
    if( git rebase --abort )
        break; 
}
```

** `merge` 工作流 : **

```bash
git pull  (或fetch && merge) 
# 编辑冲突文件
git pull
```

### 5. 解决冲突

在`rebase`的过程中，也许会出现冲突(`conflict`). 在这种情况，Git会停止`rebase`并会让你去解决 冲突；在解决完冲突后，用" `git add` "命令去更新这些内容的索引(`index`), 然后，你无需执行 `git commit`,只要执行:

```bash
git rebase   --continue
```

这样 git 会继续应用( apply )余下的补丁。

在任何时候，你可以用 `--abort`参数来终止`rebase`的行动，并且目前修改的分支会回到`rebase`开始前的状态。

```bash
  git rebase   --abort
```

### 6. git log

显示 commit 的 SHA1 值，创建作者和时间，提交信息。

![](https://img.zbus.top//zbus/blog/202312040007206.webp)

使用` --oneline `参数，only one line !只显示提交的 SHA1 值和提交信息，SHA1 还是缩短显示前几位。

这个命令，在你要根据信息去找提交的时候，比 `git log` 的效率要高点。

**按`q` 退出日志查看 **

```bash
git log --oneline
```

![](https://img.zbus.top//zbus/blog/202312040007766.webp)

图文并茂版

这次命令使用三个参数 --oneline， --decorate 和 --graph 。
–oneline 刚才就是哪个一句话情书的。
–graph 选项会绘制一个 ASCII 图像来展示提交历史的分支结构。
–decorate 是用来可以显示出指向提交的指针的名字，也就是 HEAD 指针, feature/test等分支名称，还有远程分支，标签等。

```bash
git log --graph --oneline --decorate
```

![](https://img.zbus.top//zbus/blog/202312040007148.webp)

#### 推荐日志查看命令

```bash
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative
```

效果比较炫酷，这个已经属于自定义格式了，git log 支持自定义样式的，有兴趣的娃子可以自己研究下。而且这个命令比较长，娃子们可以通过给这个命令设置别名解决：

```bash
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --date=relative"
```

这样以后直接输入 `git lg` 就行了。

### 7. 合并代码流程

#### 方法一

```bash
git fetch # 拉去远程最新的代码到本地
git rebase origin/master  
git rebase --continue
git log --oneline # 可省略
git push origin master
```

#### 方法二

```bash
git fetch # 拉去远程最新的代码到本地
git merge <远程分支名> 
git log --oneline # 可省略
git push origin master
```
