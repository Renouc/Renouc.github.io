# Monorepo 项目实践

Monorepo 是把多个相关项目放在同一个仓库中管理。它适合共享代码频繁、版本需要协同、构建发布链路有关联的项目。

## 适用场景

适合使用 Monorepo 的情况：

- 前端应用、组件库、工具包需要共同演进。
- 多个包之间存在频繁联调。
- 希望统一依赖版本、代码规范和发布流程。
- 改动经常跨多个项目，需要一次 review 和一次 CI 覆盖。

不一定适合的情况：

- 项目之间几乎没有共享代码。
- 团队、权限、发布节奏完全独立。

## pnpm workspace 配置

创建基本目录：

```txt
my-monorepo/
├── apps/
│   └── web/
├── packages/
│   ├── ui/
│   └── utils/
├── package.json
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

根目录 `pnpm-workspace.yaml`：

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

根目录 `package.json`：

```json
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter @acme/web dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm build && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "typescript": "^5.0.0"
  }
}
```

子包命名建议使用统一作用域：

```json
{
  "name": "@acme/utils",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest run"
  }
}
```

## 依赖管理

安装根依赖：

```bash
pnpm add -D typescript prettier eslint -w
```

给指定项目安装依赖：

```bash
pnpm --filter @acme/web add react react-dom
pnpm --filter @acme/ui add -D storybook
```

安装工作区内部包：

```bash
pnpm --filter @acme/web add @acme/ui --workspace
```

生成的依赖建议保留 `workspace:*`：

```json
{
  "dependencies": {
    "@acme/ui": "workspace:*"
  }
}
```

`workspace:*` 的好处是明确依赖来自当前仓库，避免误装 npm registry 上的同名包。发布时，pnpm 会按实际版本改写。

常见依赖分层：

| 依赖类型 | 放置位置 |
| --- | --- |
| 全仓统一工具，如 TypeScript、ESLint | 根目录 `devDependencies` |
| 应用运行依赖，如 React、Next.js | 对应 app 的 `dependencies` |
| 包自身运行依赖 | 对应 package 的 `dependencies` |
| 使用方必须提供的依赖，如 React | package 的 `peerDependencies` |

## 常用命令

递归执行所有包的脚本：

```bash
pnpm -r build
pnpm -r test
```

只执行指定包：

```bash
pnpm --filter @acme/web dev
```

执行某个目录下的所有包：

```bash
pnpm --filter './packages/*' build
```

执行受当前分支改动影响的包：

```bash
pnpm --filter "...[origin/main]" test
```

排除某个包：

```bash
pnpm --filter '!@acme/docs' build
```

让 pnpm 按依赖拓扑顺序执行构建：

```bash
pnpm -r --sort build
```

并行启动多个开发服务：

```bash
pnpm --parallel --filter './apps/*' dev
```

## 包之间的依赖关系

应用依赖内部 UI 包：

```json
{
  "name": "@acme/web",
  "dependencies": {
    "@acme/ui": "workspace:*"
  }
}
```

UI 包依赖工具包：

```json
{
  "name": "@acme/ui",
  "dependencies": {
    "@acme/utils": "workspace:*"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0"
  }
}
```

内部包之间应避免循环依赖。出现循环时，优先把共享类型或工具下沉到更底层的 package。

## 发布流程

多个 npm 包需要协同发布时，可以使用 Changesets。

初始化：

```bash
pnpm add -D @changesets/cli -w
pnpm changeset init
```

记录变更：

```bash
pnpm changeset
```

更新版本和 changelog：

```bash
pnpm changeset version
```

发布：

```bash
pnpm build
pnpm changeset publish
```

发布前检查：

- `package.json` 的 `name`、`version`、`main`、`module`、`types` 正确。
- `files` 只包含需要发布的产物。
- `peerDependencies` 没有被误放进 `dependencies`。
- 内部 `workspace:*` 依赖可以被发布流程正确改写。

## CI 建议

最小 CI 流程：

```bash
pnpm install --frozen-lockfile
pnpm -r lint
pnpm -r test
pnpm -r build
```

仓库变大后，再引入 Turborepo 或 Nx 做任务缓存和影响范围计算。不要一开始就把任务编排工具作为 Monorepo 的前提。

## 常见问题

依赖版本冲突时，先确认依赖应该属于根目录、应用还是包自身。不要为了消除警告把所有依赖都提升到根目录。

构建顺序错误时，检查内部包是否声明了 `workspace:*` 依赖，并使用递归拓扑构建。

包体重复时，检查库包是否把 React、Vue 等依赖放进了 `dependencies`。组件库通常应该用 `peerDependencies` 声明由使用方提供。

开发服务互相依赖时，优先明确端口和环境变量，不要让包在启动阶段隐式启动另一个服务。

## 结论

Monorepo 的价值在于把有关联的项目放进同一套依赖、构建、测试和发布流程里。关键不是目录放在一起，而是依赖边界清楚、命令可过滤、发布可追踪、CI 能按影响范围运行。
