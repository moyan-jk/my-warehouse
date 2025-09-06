# Git 常用配置命令行速查表

这份速查表包含了 Git 中最常用的配置命令及其解释，帮助你快速设置和定制你的 Git 环境。

## 基础配置

### 1. 设置用户信息
```bash
# 全局设置用户名
git config --global user.name "你的用户名"

# 全局设置邮箱
git config --global user.email "你的邮箱@example.com"

# 仅对当前仓库设置用户信息
git config user.name "你的用户名"
git config user.email "你的邮箱@example.com"
```
**解释**：设置提交代码时显示的用户信息，这将出现在你的所有提交记录中。`--global` 选项表示全局设置，不加则仅对当前仓库有效。

### 2. 查看配置信息
```bash
# 查看所有配置
git config --list

# 查看指定配置项
git config user.name
git config user.email
```
**解释**：`--list` 选项列出所有当前的 Git 配置，包括全局和本地配置。也可以直接指定配置项名称来查看其值。

## 编辑器和工具配置

### 3. 配置默认文本编辑器
```bash
# 配置默认编辑器为 VS Code
git config --global core.editor "code --wait"

# 配置默认编辑器为 Notepad++
git config --global core.editor "notepad++ -multiInst -notabbar -nosession -noPlugin"

# 配置默认编辑器为 Vim
git config --global core.editor "vim"
```
**解释**：设置 Git 在需要编辑文本时（如提交信息、合并冲突等）使用的默认编辑器。`--wait` 参数确保编辑器关闭后 Git 才继续执行。

### 4. 配置差异比较工具
```bash
# 配置差异比较工具为 VS Code
git config --global diff.tool vscode
git config --global difftool.vscode.cmd "code --wait --diff $LOCAL $REMOTE"

# 使用 difftool 查看差异
git difftool <文件名>
```
**解释**：设置 Git 使用的差异比较工具，这里以 VS Code 为例。配置后可以使用 `git difftool` 命令以图形化方式查看文件差异。

## 格式和样式配置

### 5. 配置自动换行处理
```bash
# 全局设置自动转换换行符
git config --global core.autocrlf true  # Windows 系统
git config --global core.autocrlf input  # macOS/Linux 系统
git config --global core.safecrlf true  # 检查换行符问题
```
**解释**：`core.autocrlf` 控制 Git 如何处理文本文件中的换行符。`true` 表示在检出文件时将 LF 转换为 CRLF，提交时再转换回 LF；`input` 表示提交时将 CRLF 转换为 LF，检出时不转换。

### 6. 配置颜色显示
```bash
# 全局启用所有颜色显示
git config --global color.ui true

# 单独配置各部分的颜色
git config --global color.branch auto
git config --global color.diff auto
git config --global color.status auto
```
**解释**：启用 Git 命令输出的颜色高亮，使输出更加清晰易读。`auto` 表示让 Git 自动决定是否使用颜色。

## 实用功能配置

### 7. 配置命令别名
```bash
# 配置常用命令别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.ci commit
git config --global alias.br branch
git config --global alias.unstage "reset HEAD --"
git config --global alias.last "log -1 HEAD"
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
```
**解释**：为常用的 Git 命令创建简短的别名，提高工作效率。例如，`git st` 等同于 `git status`，`git lg` 显示格式化的提交历史。

### 8. 配置忽略文件权限变化
```bash
# 忽略文件权限变化
git config --global core.filemode false
```
**解释**：设置 Git 忽略文件权限的变化，避免因文件权限改变而导致的不必要的提交。这在跨平台协作时特别有用。

### 9. 配置远程仓库 URL
```bash
# 查看当前远程仓库配置
git remote -v

# 修改远程仓库 URL
git remote set-url origin git@github.com:用户名/仓库名.git

# 添加新的远程仓库
git remote add upstream git@github.com:原始作者/仓库名.git
```
**解释**：`git remote set-url` 用于修改现有远程仓库的 URL，`git remote add` 用于添加新的远程仓库。这在切换仓库地址或添加上游仓库时很有用。

### 10. 配置分支自动跟踪
```bash
# 配置分支自动跟踪
git config --global branch.autosetupmerge true
git config --global branch.autosetuprebase always
```
**解释**：`branch.autosetupmerge` 设为 `true` 时，Git 会自动设置新分支跟踪同名的远程分支。`branch.autosetuprebase` 设为 `always` 时，Git 会自动使用 rebase 而非 merge 来整合远程更改。

## 高级配置

### 11. 配置提交模板
```bash
# 创建提交模板文件
echo "# 提交主题

# 详细描述

# 相关 Issue" > ~/.gitmessage

# 配置使用提交模板
git config --global commit.template ~/.gitmessage
```
**解释**：设置提交模板可以帮助你规范提交信息的格式。配置后，使用 `git commit` 命令时会自动打开模板文件。

### 12. 配置缓存服务器
```bash
# 配置 Git 缓存服务器
git config --global http.proxy http://proxy.example.com:8080
git config --global https.proxy https://proxy.example.com:8080

# 取消代理设置
git config --global --unset http.proxy
git config --global --unset https.proxy
```
**解释**：在需要通过代理服务器访问网络时，可以配置 Git 使用代理。`--unset` 选项用于取消已设置的代理。

## 配置文件位置
- 全局配置文件：`~/.gitconfig` 或 `~/.config/git/config`
- 本地仓库配置文件：`.git/config`（位于仓库根目录）

你可以直接编辑这些配置文件，也可以使用 `git config` 命令进行配置。