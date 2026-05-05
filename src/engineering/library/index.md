# 前端库开发笔记

## 模块化

现代前端库通常优先提供 ESM 和 CommonJS。只有需要 `<script>` 标签或 CDN 直接加载时，才额外提供 UMD/IIFE 产物。

打包工具（如 Rollup、Webpack）会依据自身的 `mainFields` / `conditionNames` 配置解析 `package.json` 中的入口字段。

推荐通过 `exports` 明确声明导出入口，并保留 `main`、`module`、`types` 兼容旧工具。`browser` 不等同于 UMD，它通常表示浏览器环境入口或替换规则。

## 兼容性

兼容不同环境（Node.js、浏览器、各种打包工具）需要合理配置入口文件。

Polyfill 和转译（如 Babel）确保新语法在旧环境可运行。

使用 browserslist 配置目标环境，优化构建。

## 测试

测试金字塔：

- ✅ 单元测试：针对每个函数或模块进行隔离测试。
- 🔄 集成测试：测试模块之间的交互行为。
- 🧪 端到端测试（E2E）：模拟用户行为验证整体功能。

## 开源协议

寻找符合要求的协议：https://choosealicense.com/

可以使用 https://www.npmjs.com/package/license 通过命令直接生成：

```bash
npx license
```

## 版本

### 语义化版本控制

npm 包版本遵循 SemVer（语义化版本规范）：`<主版本号>.<次版本号>.<修订号>-<预发布标识>`

| 名称         | 描述                                  |
| ------------ | ------------------------------------- |
| `major`      | 不兼容 API 的变更                     |
| `minor`      | 向后兼容的新功能                      |
| `patch`      | 向后兼容的问题修复                    |
| `prerelease` | 添加预发布标签，如 alpha、beta、rc 等 |
| `prepatch`   | 预发布补丁版本，如 `1.0.1-beta.0`     |

### 使用命令

```bash
npm version patch      # 1.0.0 → 1.0.1
npm version minor      # 1.0.1 → 1.1.0
npm version major      # 1.1.0 → 2.0.0
npm version prerelease # 1.1.0 → 1.1.1-0
npm version prepatch --preid beta # 1.0.0 → 1.0.1-beta.0
```

> 会自动修改 `package.json` 中的 version 字段并生成 git 提交 tag。

## 发布

用于将当前包发布到 npm registry。

### 常用参数

| 参数               | 含义                                     |
| ------------------ | ---------------------------------------- |
| `--tag <tag>`      | 为该版本指定标签，如 `beta`、`latest` 等 |
| `--access public`  | 用于发布 scope 包（如 @scope/name）      |
| `--registry <url>` | 自定义 registry                          |

### 标签管理

- 默认发布会打上 `latest` 标签
- 使用 `--tag beta` 等可避免自动安装预发布版本

```bash
npm publish --tag beta --access public
```

安装 beta 版本：

```bash
npm install your-package@beta
```

### prepublishOnly 钩子

在执行 `npm publish` 前自动执行构建：

```json
"scripts": {
  "build": "rollup -c",
  "prepublishOnly": "npm run build"
}
```

## 示例配置（package.json 片段）

```json
{
  "name": "@renouc/cookie-util",
  "version": "0.0.2",
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "unpkg": "dist/index.umd.js",
  "browser": "dist/index.browser.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  },
  "scripts": {
    "build": "rollup -c",
    "test": "jest",
    "prepublishOnly": "npm run build"
  }
}
```

> `exports` 提供更精细的导出控制。现代工具会优先读取 `exports`，`main/module/browser` 主要用于兼容旧解析器或浏览器构建约定。

## 推荐实践小结

- 使用 `exports` 字段统一导出点，更好地支持 ESM 和 CJS。
- 使用 `prepublishOnly` 保证发布前构建。
- 使用 `--tag` 管理测试版本与正式版本。
- 使用 `npm version` 管理版本和打 tag。
- 发布 scope 包时记得加 `--access public`。
