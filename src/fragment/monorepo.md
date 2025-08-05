# 🏢 Monorepo 项目实践指南

> _一个仓库统管多个项目，提高协作效率与代码复用_

想象一下，与其让你的团队在 10 个不同的仓库间来回切换，你可以把所有相关项目整合在同一个仓库中 - 这就是 `Monorepo`（单体仓库）的魅力所在！就像一个精心组织的工具箱，所有工具都在伸手可及的地方。

`Monorepo` 是一种将多个相关项目存放在同一个代码仓库中的项目管理策略。它特别适合那些彼此紧密协作的项目，就像一个和谐的大家庭，成员之间可以轻松沟通和分享资源。

## 📚 Monorepo 优势 - 为什么你会爱上它

- **依赖管理统一** 🔄 - 告别"在我的电脑上能运行"的噩梦！所有项目使用相同版本的依赖
- **代码共享无障碍** 🤝 - 就像邻居间借用工具一样简单，团队成员可以轻松复用代码和组件
- **原子提交** ⚛️ - 需要同时更新前端和后端？一次提交搞定所有变更
- **统一的工作流** 🌊 - 像指挥交响乐一样，所有项目遵循相同的构建、测试和部署流程
- **简化协作** 👨‍👩‍👧‍👦 - 不再为多仓库的权限问题头疼，新成员加入更快上手

> **🌟 真实案例**: React、Babel、Next.js 等知名项目都采用了 Monorepo 结构，证明其在大型项目中的实用性。

## 🛠️ 使用 pnpm 创建 Monorepo 工作空间 - 动手搭建你的王国

### 1. 安装 pnpm - 你的得力助手

`pnpm` 是一个飞速且节省空间的包管理器，就像 Monorepo 的最佳搭档。它通过硬链接共享模块，让你的磁盘空间不再"喘不过气"。

```bash
# 全局安装 pnpm
npm install -g pnpm

# 验证安装
pnpm --version
```

> **💡 小贴士**: 首次使用 pnpm？它比 npm 快约 2 倍，并且能节省高达 80% 的磁盘空间！

### 2. 初始化项目 - 奠定基础

就像建造一栋房子前需要打好地基一样，我们先创建并初始化项目：

```bash
# 创建项目目录
mkdir my-awesome-monorepo && cd my-awesome-monorepo

# 初始化项目
pnpm init
```

> **⚠️ 常见错误**: 确保你有足够的权限创建目录，并且路径中没有特殊字符。

### 3. 创建工作空间配置 - 规划你的领地

你的 Monorepo 就像一座城市，需要规划不同的区域。`pnpm-workspace.yaml` 就是你的城市规划图：

```bash
# 创建配置文件
touch pnpm-workspace.yaml
```

编辑配置文件，告诉 pnpm 哪些目录属于你的工作空间：

```yaml
packages:
  # 包含所有 packages 目录下的子项目，就像城市中的住宅区
  - 'packages/*'
  # 包含 apps 目录下的应用，如同城市中的商业区
  - 'apps/*'
  # 共享组件库，就像城市的公共设施
  - 'components'
  # 工具函数，相当于城市的基础设施
  - 'utils'
  # 排除测试目录，我们不想包含临时建筑
  - '!**/test/**'
  # 排除构建输出，这些是可以重新生成的
  - '!**/dist/**'
```

**📊 工作空间视觉结构:**

```
my-awesome-monorepo/
├── apps/             # 应用程序
│   ├── web/          # 网站前端
│   └── api/          # 后端API
├── packages/         # 可重用的包
│   ├── core/         # 核心功能
│   └── ui/           # UI组件库
├── components/       # 共享组件
├── utils/            # 实用工具
└── pnpm-workspace.yaml  # 工作空间配置
```

### 4. 创建子项目 - 构建你的小宇宙

现在，让我们在这个宇宙中创建一些星球：

```bash
# 创建目录结构
mkdir -p packages/core packages/ui apps/web

# 初始化各个子项目
cd packages/core && pnpm init && cd ../../
cd packages/ui && pnpm init && cd ../../
cd apps/web && pnpm init && cd ../../
```

> **💡 实用建议**: 为每个项目添加一个简短的 README.md，帮助团队理解其用途。
>
> **✅ 检查点**: 此时你应该有三个独立的 package.json 文件，分别位于三个子项目中。

## 📦 依赖管理技巧 - 掌握魔法

### 安装共享依赖 - 一劳永逸

就像家庭共享的厨房用具，有些工具是大家都需要的：

```bash
# 添加到根工作空间，所有子项目都能用
pnpm add typescript eslint prettier -D -w
```

> **🔍 解析**: `-D` 表示开发依赖，`-w` 表示安装到工作空间根目录。

### 安装特定项目的依赖 - 各取所需

有些工具只有特定家庭成员需要：

```bash
# 只为网站应用安装 React
pnpm add react react-dom --filter @myorg/web

# 只为UI库安装Storybook
pnpm add -D @storybook/react --filter @myorg/ui
```

> **⚠️ 避坑提示**: 确保 package.json 中的 name 字段与 filter 参数匹配，否则会找不到目标项目。

### 项目间的依赖关系 - 家人之间的互助

想在网站中使用你的 UI 组件库？就像兄弟姐妹之间的互相帮助：

```bash
# 将 ui 包添加为 web 应用的依赖
pnpm add @myorg/ui --workspace --filter @myorg/web
```

**🔄 项目依赖可视化:**

```
web应用
  ↓ 依赖
UI组件库
  ↓ 依赖
核心功能库
```

> **👨‍🏫 实际场景**: 想象你正在开发一个电商平台，`core` 包含购物车逻辑，`ui` 包含产品卡片组件，`web` 是实际网站。当你改进购物车功能时，UI 和网站会立即获得更新。

### 管理依赖版本 - 保持家庭和谐

在根目录创建 `.npmrc` 文件，让所有子项目和睦相处：

```
# 确保所有项目共享同一个锁文件，像家庭共享一本账簿
shared-workspace-lockfile=true

# 使本地包通过链接方式引用，改动即时生效，如同家人间的直接沟通
link-workspace-packages=true

# 使用特殊协议保存工作空间内部依赖关系，清晰标记家庭成员关系
save-workspace-protocol=true
```

**🔍 这些设置的作用:**

- `shared-workspace-lockfile=true`: 确保所有项目使用相同的依赖版本，防止冲突
- `link-workspace-packages=true`: 本地开发时立即看到变更效果，不需要重新安装
- `save-workspace-protocol=true`: 自动将内部依赖保存为 `"workspace:*"` 格式，区分内外部依赖

## 🔄 常用开发工作流 - 日常操作指南

### 1. 批量执行命令 - 群发指令

就像家长一声令下，所有孩子同时行动：

```bash
# 在所有项目中构建代码，一个指令统管全局
pnpm -r build

# 只在最近有改动的包中运行测试，专注于变化点
pnpm --filter-since=main test

# 高级过滤，构建除 core 外的所有 packages 项目
pnpm --filter="./packages/**" --filter="!./packages/core" build
```

> **🎯 实例**: 假设你只修改了 UI 组件，使用 `pnpm --filter-since=main build` 可以只重新构建受影响的包，节省大量时间。

### 2. 并行执行命令 - 多线操作

像变戏法一样同时启动多个应用：

```bash
# 同时启动所有应用的开发服务器
pnpm -r --parallel dev

# 更复杂的场景：同时启动前端和后端
pnpm --filter "@myorg/web" --filter "@myorg/api" --parallel dev
```

> **💪 性能提示**: 并行执行大大提高开发效率，但也会消耗更多系统资源。如果电脑配置较低，请适当减少并行任务。

### 3. 版本管理与发布 - 发布你的作品

像音乐专辑发行一样，精心管理你的软件版本：

```bash
# 设置版本管理工具
pnpm add @changesets/cli -D -w
pnpm changeset init

# 记录变更（交互式）
pnpm changeset

# 更新版本号和变更日志
pnpm version

# 发布所有有更新的包
pnpm publish -r
```

**🔄 典型发布流程:**

1. 开发新功能
2. 运行 `pnpm changeset` 记录变更
3. 提交代码并合并
4. CI 自动调用 `pnpm version` 和 `pnpm publish -r`

> **🎭 实际案例**: 如 Chakra UI 等流行库都使用 changesets 管理版本和发布。

## 📝 package.json 配置示例 - 复制粘贴就能用

### 根目录 package.json - 项目总指挥

就像一个总控制台，管理整个项目：

```json
{
  "name": "my-awesome-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "clean": "pnpm -r exec -- rm -rf node_modules dist .turbo",
    "new-package": "node tools/new-package.js"
  },
  "devDependencies": {
    "typescript": "^4.9.4",
    "eslint": "^8.30.0",
    "prettier": "^2.8.1",
    "@changesets/cli": "^2.26.0"
  }
}
```

> **💡 贴心功能**: 添加 `new-package` 脚本可以帮助自动创建新包，减少重复工作。

### 子项目 package.json - 模块具体配置

像是每个家庭成员的个人档案：

```json
{
  "name": "@myorg/ui",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "jest": "^29.0.0"
  }
}
```

> **🧩 模板提示**: 为不同类型的包（库、应用、工具等）创建标准化模板，确保一致性。

## 🌟 最佳实践 - 专家经验分享

### 📋 项目组织技巧

1. **包命名规范** 📛 - 使用组织前缀保持一致，如 `@myorg/ui`、`@myorg/core`

   ```json
   // 在每个 package.json 中
   { "name": "@myorg/package-name" }
   ```

2. **模块结构** 🏗️ - 采用逻辑分层，常见模式：
   ```
   核心库 → 领域库 → 功能库 → 应用
   ```
3. **配置共享** ⚙️ - 减少重复配置：

   ```json
   // tsconfig.base.json 在根目录
   { "compilerOptions": { /* 共享配置 */ } }

   // 子项目的 tsconfig.json
   { "extends": "../../tsconfig.base.json" }
   ```

4. **统一脚本命名** 📜 - 在所有包中使用相同的脚本名称：
   - `dev` - 开发模式
   - `build` - 生产构建
   - `test` - 运行测试
   - `lint` - 代码检查

5. **Git 工作流** 🌳 - 使用分支策略来管理多包更新：

   ```bash
   # 为新功能创建分支
   git checkout -b feature/awesome-feature

   # 开发完成后创建变更记录
   pnpm changeset

   # 提交所有更改
   git add . && git commit -m "feat: add awesome feature"
   ```

> **🚀 进阶提示**: 在团队中指定一名 "Monorepo 维护者"，专门负责监督包结构和依赖关系，避免混乱。

## 🔍 常见问题与解决方案 - 救急指南

### 🩹 依赖提升冲突

**症状**: 子项目依赖了同一个包的不同版本，导致行为不一致。

**解决方案**:

```
# 在 .npmrc 中设置
strict-peer-dependencies=true

# 然后修复冲突
pnpm -r up [有冲突的包] --latest
```

> **🔍 案例分析**: 一个项目依赖 React 17，另一个依赖 React 18，可能导致钩子行为不一致。强制统一版本解决问题。

### 🏗️ 构建顺序问题

**症状**: 构建失败，因为某个包依赖另一个尚未构建的包。

**解决方案**:

```bash
# 使用拓扑排序，自动计算正确的构建顺序
pnpm -r --workspace-concurrency=1 build

# 或手动指定顺序
pnpm --filter="@myorg/core" --filter="@myorg/ui" --filter="@myorg/web" build
```

> **🧩 实际情景**: 在构建前端应用前，必须先构建它依赖的组件库。

### 🐢 大型 Monorepo 性能

**症状**: 随着项目增多，每次构建都需要很长时间。

**解决方案**:

1. 安装 Turborepo

```bash
pnpm add turbo -D -w
```

2. 创建 turbo.json 配置

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    }
  }
}
```

3. 使用 turbo 执行命令

```bash
pnpm turbo build
```

> **⚡ 性能提升**: Turborepo 可以缓存构建结果，大型项目构建速度提升可达 10 倍。

## 🎓 学习资源 - 继续深造

### 官方文档与工具

- [pnpm 工作空间文档](https://pnpm.io/workspaces) - 官方指南，权威详尽
- [Turborepo](https://turborepo.org) - 高性能构建系统，适合大型 Monorepo
- [Changesets](https://github.com/changesets/changesets) - 简化版本和变更管理
- [Nx](https://nx.dev) - 另一个强大的 Monorepo 工具，专注于增量构建

### 示例项目

- [pnpm-monorepo-example](https://github.com/joelbonetr/pnpm-monorepo-example) - 简单易懂的示例
- [Chakra UI](https://github.com/chakra-ui/chakra-ui) - 真实世界的 Monorepo 案例

> **📚 进阶阅读**: [《Monorepo Tools》](https://monorepo.tools/)是深入了解各种 Monorepo 工具比较的优秀资源。

---

## 🎯 快速入门指南 - 5 分钟搭建 Monorepo

对于想快速开始的开发者，这里是简化版的步骤：

1. **安装工具**: `npm i -g pnpm`
2. **创建项目**: `mkdir my-monorepo && cd my-monorepo && pnpm init`
3. **添加配置**: 创建 `pnpm-workspace.yaml` 文件，内容为 `packages: ["packages/*"]`
4. **创建子项目**: `mkdir -p packages/core && cd packages/core && pnpm init`
5. **添加依赖**: `cd ../.. && pnpm add typescript -D -w`
6. **建立关系**: `pnpm add @myorg/core --workspace --filter @myorg/app`

就这么简单！你的 Monorepo 已经准备就绪，可以开始编码了。

> **🌟 记住**: Monorepo 不是目的，而是手段 - 它的价值在于简化协作和代码共享。
