# uv 项目管理

uv 是 Astral 提供的 Python 项目与包管理工具。它可以管理项目依赖、解析并锁定依赖版本、创建和同步虚拟环境，以及在项目环境中运行命令。

理解 uv 项目模式时，先分清三个文件或目录的职责：

| 文件              | 职责                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------ |
| `pyproject.toml`  | 项目元信息、Python 版本约束、直接依赖、依赖组和工具配置。                                  |
| `uv.lock`         | uv 解析出的完整依赖锁定结果，建议提交到版本控制，用于保证团队和 CI 的依赖结果一致。        |
| `.venv/`          | 当前机器上的项目虚拟环境，由 uv 创建和更新，是本地生成目录，不提交。                       |
| `.python-version` | 当前项目默认请求的 Python 版本，可通过 `uv python pin` 生成。                              |

核心关系可以理解为：

```text
pyproject.toml  --lock-->  uv.lock  --sync-->  .venv
```

其中：

- locking：根据项目依赖声明解析并更新 `uv.lock`。
- syncing：根据 `uv.lock` 和当前选择的依赖组、extras、Python 版本、平台，把对应包安装到 `.venv`。

`uv.lock` 是跨环境的锁定结果，`.venv` 是当前机器实际安装出来的环境。`.venv` 不一定等于整个 `uv.lock`，因为锁文件里可能包含当前平台不需要的包、未启用的 extras，或未同步的依赖组。

## Python 版本

`requires-python` 和 `.python-version` 不是同一件事：

- `requires-python` 写在 `pyproject.toml` 中，表示项目兼容的 Python 版本范围。
- `.python-version` 表示这个项目默认请求使用哪个 Python 版本。

例如项目可以声明兼容 `>=3.11,<3.13`，但本地默认使用 `3.12`：

```bash
uv python pin 3.12
```

`.python-version` 应该落在 `requires-python` 允许的范围内，否则 uv 在创建或使用项目环境时可能失败。

## 新项目工作流

创建项目：

```bash
uv init demo
cd demo
```

固定项目默认 Python 版本：

```bash
uv python pin 3.12
```

添加依赖：

```bash
uv add requests
uv add --dev pytest ruff
```

运行命令：

```bash
uv run python main.py
uv run pytest
uv run ruff check .
```

这里通常不需要在 `uv add` 后再执行一次 `uv sync`，因为 `uv add` 默认已经会：

1. 修改 `pyproject.toml`
2. 更新 `uv.lock`
3. 同步当前项目环境 `.venv`

也就是说，添加依赖后的本地环境通常已经可用。

## 什么时候需要 `uv sync`

`uv sync` 的职责不是“添加依赖后的下一步”，而是把当前项目环境同步到锁文件描述的状态。

常见场景：

- 刚拉取已有项目，需要创建 `.venv` 并安装依赖。
- 删除了 `.venv`，需要重建项目环境。
- 切换分支或拉取代码后，`pyproject.toml` / `uv.lock` 发生变化。
- 手动修改了 `pyproject.toml`，需要让环境重新对齐。
- CI 中需要按锁文件恢复可复现环境。
- 想执行一次 exact sync，移除当前环境里不属于同步目标的多余包。

例如拉取已有项目后：

```bash
git clone <repo-url>
cd <repo>
uv sync
```

如果只是运行项目命令，也可以直接使用：

```bash
uv run pytest
```

`uv run` 会在运行前确保项目环境满足依赖要求。和 `uv sync` 不同，`uv run` 默认只做必要同步，不会像 `uv sync` 一样执行 exact sync 清理多余包。

## 命令职责

### `uv add`

`uv add` 用于向项目添加依赖：

```bash
uv add requests
uv add --dev pytest
```

默认行为：

- 把依赖写入 `pyproject.toml`。
- 更新 `uv.lock`。
- 同步当前项目环境。

常用选项：

- `--dev`：添加到开发依赖组。
- `--no-sync`：只更新依赖声明和锁文件，不同步环境。
- `--frozen`：只更新依赖声明，不解析、不更新锁文件，也不同步环境。

### `uv lock`

`uv lock` 用于创建或更新 `uv.lock`：

```bash
uv lock
```

已有 `uv.lock` 时，uv 会优先保留锁文件中已有的版本。只要依赖约束仍然允许当前锁定版本，就不会因为远端发布了新版本而自动升级。

常用选项：

- `uv lock --check`：检查锁文件是否与项目元信息一致，不一致则失败。
- `uv lock --upgrade`：允许升级所有依赖。
- `uv lock --upgrade-package requests`：只升级指定依赖。

### `uv sync`

`uv sync` 用于更新项目环境：

```bash
uv sync
```

默认行为：

- 如果 `.venv` 不存在，会创建项目虚拟环境。
- 同步前会检查并在必要时更新 `uv.lock`。
- 执行 exact sync，移除不属于当前同步目标的多余包。
- 默认同步 `dev` 依赖组。
- 默认不安装 optional dependencies，也就是 extras。

常用选项：

- `uv sync --locked`：要求 `uv.lock` 已经是最新状态；如果需要改锁文件则失败。
- `uv sync --frozen`：使用现有 `uv.lock`，不检查它是否过期。
- `uv sync --no-dev`：不同步 `dev` 依赖组。
- `uv sync --no-default-groups`：不同步默认依赖组。
- `uv sync --extra name`：同步指定 extra。
- `uv sync --all-extras`：同步所有 extras。
- `uv sync --inexact`：保留环境中多余的包。

CI 通常更适合使用：

```bash
uv sync --locked
```

这样可以避免流水线里隐式修改 `uv.lock`。

部署环境还应根据项目需要决定是否排除开发依赖、是否启用 extras。例如：

```bash
uv sync --locked --no-dev
```

### `uv run`

`uv run` 用于在项目环境中执行命令：

```bash
uv run python main.py
uv run pytest
```

在项目中执行时，uv 会先确保项目环境可用并满足依赖要求，再运行命令。需要 exact sync 行为时可以使用：

```bash
uv run --exact pytest
```

常用选项：

- `uv run --locked ...`：运行前要求锁文件已是最新状态。
- `uv run --frozen ...`：使用现有锁文件，不检查是否过期。
- `uv run --no-sync ...`：跳过环境同步。

## 常用判断

| 问题                             | 结论                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------- |
| `.venv` 要提交吗？               | 不提交，它是本地生成目录。                                                   |
| `uv.lock` 要提交吗？             | 建议提交，用于保证团队、CI 和部署环境使用一致的依赖解析结果。                |
| `uv add` 后还要 `uv sync` 吗？   | 通常不需要，`uv add` 默认已经会同步当前项目环境。                            |
| `uv sync` 什么时候用？           | 拉取已有项目、重建 `.venv`、切换分支、CI 恢复环境，或需要显式对齐环境时使用。 |
| `uv sync` 是否等价于安装依赖？   | 可以粗略类比，但更准确是按锁文件同步项目环境。                               |
| `uv sync` 是否会删除包？         | 默认会删除不属于当前同步目标的多余包；需要保留时使用 `--inexact`。           |
| `uv run` 是否会自动同步环境？    | 会，但默认是必要同步，不会像 `uv sync` 一样 exact 清理多余包。               |
| 新版本发布后锁文件会自动升级吗？ | 不会。已有锁文件会优先保留当前版本，升级需要显式使用 `--upgrade`。           |
| CI 应该用什么命令？              | 常见组合是 `uv sync --locked` 后执行 `uv run ...`。                          |

## 速查

| 目标                       | 命令                                     |
| -------------------------- | ---------------------------------------- |
| 创建项目                   | `uv init demo`                           |
| 固定项目默认 Python 版本   | `uv python pin 3.12`                     |
| 添加运行时依赖             | `uv add package-name`                    |
| 添加开发依赖               | `uv add --dev package-name`              |
| 更新锁文件                 | `uv lock`                                |
| 检查锁文件是否最新         | `uv lock --check`                        |
| 升级全部依赖               | `uv lock --upgrade`                      |
| 升级指定依赖               | `uv lock --upgrade-package package-name` |
| 同步项目环境               | `uv sync`                                |
| 按锁文件同步，禁止改锁文件 | `uv sync --locked`                       |
| 运行项目命令               | `uv run command`                         |

## 参考链接

- [uv 官方文档](https://docs.astral.sh/uv/)
- [uv 项目管理](https://docs.astral.sh/uv/concepts/projects/)
- [uv 锁定与同步](https://docs.astral.sh/uv/concepts/projects/sync/)
- [uv 依赖管理](https://docs.astral.sh/uv/concepts/projects/dependencies/)
- [uv 命令参考](https://docs.astral.sh/uv/reference/cli/)
