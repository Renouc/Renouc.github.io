# 🚀 Git 常用命令实用指南

## 📦 提交回退操作

根据是否已推送到远程仓库，选择合适的回退方式。

### 使用 `git revert`（适合已推送提交）

- 用于**撤销指定提交的影响**，保留原始提交历史。
- 会创建一个新的提交，操作安全可逆。

```bash
# 撤销最近一次提交
git revert HEAD

# 撤销指定提交
git revert <commit>

# 撤销多个提交
git revert <commit-1> <commit-2>

# 撤销但不立即提交（批量操作时使用）
git revert -n <commit>
```

> ✅ 推荐在远程分支或协作分支上使用。

### 使用 git reset（适合本地开发）

```bash
git reset <commit> [--arg]
```

![git_reset.png](https://img-bed.renouc.cn/v2/QoSD11L.png)

- 如果 `<commit>` 为 4，则会将 5 从 commit 记录中移除
- 如果 `<commit>` 为 2，则会将 3~5 从 commit 记录中移除

被移除的 commit 记录会根据 `--hard`、`--mixed`、`--soft` 选项进行不同处理

- `--soft`：移除 commit 但保留暂存区修改
- `--mixed`（默认）：移除 commit 并取消暂存
- `--hard`：移除 commit 并清除所有修改

### revert vs reset 对比总结

| 特性         | `git revert`                | `git reset`                  |
| ------------ | --------------------------- | ---------------------------- |
| 是否保留历史 | ✅ 创建新提交，保留完整历史 | ❌ 删除回退点之后的提交      |
| 数据安全性   | ✅ 安全，不丢失任何数据     | ⚠️ 有风险（尤其是 `--hard`） |
| 适用场景     | 已推送的提交，团队协作      | 本地开发，未推送的历史调整   |
| 操作结果     | 生成一次“反向提交”          | 改写 HEAD 指向，重写提交历史 |

## 🔍 查看提交历史

```bash
# 查看简洁的提交记录（每行一个提交）
git log --oneline

# 图形化展示提交历史（包含所有分支）
git log --graph --oneline --all

# 查看指定文件的修改记录及差异
git log -p <file-path>

# 查看最近 n 次提交
git log -n <number>
```

## 💾 暂存与提交操作

### 暂存修改（add）

```bash
# 暂存所有变动（新增、修改、删除）
git add .

# 暂存指定文件或目录
git add <file-path>
```

### 提交更改（commit）

```bash
# 提交已暂存的内容
git commit -m "提交说明"

# 修改最近一次提交信息（或追加暂存文件）
git commit --amend
```

> ⚠️ --amend 会更改提交哈希，建议仅在未推送前使用。

## 🌿 分支管理操作

### 分支创建与切换

```bash
# 创建并切换到新分支
git checkout -b <branch-name>

# 切换到已有分支
git checkout <branch-name>
```

> ✅ 建议使用 Git 2.23+ 的新命令：

```bash
git switch <branch-name>       # 切换分支
git switch -c <branch-name>    # 创建新分支并切换
```

### 合并与删除分支

```bash
# 将指定分支合并到当前分支
git merge <branch-name>

# 删除本地分支（已合并）
git branch -d <branch-name>

# 强制删除未合并分支
git branch -D <branch-name>
```

## 约定式提交

https://www.conventionalcommits.org/zh-hans/v1.0.0/