# Rollup 代码分割（Code Splitting）详解

代码分割（Code Splitting）是现代前端构建中非常重要的优化手段。它的目标是：**将一个大的 JavaScript 文件拆分成多个小文件（chunk）**，从而减少首次加载时间，让浏览器只加载当前需要的部分。

本文将详细介绍 Rollup 如何实现代码分割、有哪些配置方式、适用场景及常见注意事项。

## 一、什么是代码分割

在传统构建中，所有代码会被打包进一个单一文件：

```
bundle.js
```

当项目逐渐庞大时，首屏加载会变得非常缓慢。而通过代码分割，我们可以让 Rollup 按需拆分文件，例如：

```
build/
├── main-[hash].js
├── vendor-[hash].js
└── lodash-es-[hash].js
```

这样，浏览器在访问首页时，只需加载必要的 `main.js` 文件，而其他模块会在需要时再加载。

## 二、实现代码分割的方式

### 1️⃣ 使用 `import()` 动态导入模块

动态导入是最直观的代码分割方式，适用于“按需加载”的场景，如路由懒加载。

```js
import('lodash-es').then(({ add }) => {
  console.log(add(1, 2));
});
```

**特点：**

- Rollup 会自动为被动态导入的模块创建单独的 chunk。
- 仅在 `esm` 格式输出中支持。
- 动态导入路径必须是静态可解析的字符串。

### 2️⃣ 多入口自动分割

当多个入口文件依赖相同模块时，Rollup 会自动抽取公共依赖。

```js
import { defineConfig } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
  input: ['src/main.js', 'src/main2.js'],
  output: {
    dir: 'build',
    format: 'esm',
  },
  plugins: [nodeResolve(), commonjs()],
});
```

**输出结构：**

```
build/
├── main.js
├── main2.js
└── shared-[hash].js
```

> ✅ 适合多页面应用（MPA）或多个独立入口的项目。

### 3️⃣ 手动配置 `manualChunks`

Rollup 允许通过 `output.manualChunks` 手动控制如何拆分代码。

#### （1）对象形式

```js
export default defineConfig({
  input: 'src/main.js',
  output: {
    dir: 'build',
    format: 'esm',
    manualChunks: {
      'lodash-es': ['lodash-es'],
    },
  },
  plugins: [nodeResolve(), commonjs()],
});
```

**效果：**

- 将 `lodash-es` 单独打包成一个文件 `lodash-es.js`。

#### （2）函数形式

```js
export default defineConfig({
  input: 'src/main.js',
  output: {
    dir: 'build',
    format: 'esm',
    manualChunks: (id) => {
      if (id.includes('node_modules')) {
        return 'vendor';
      }
      if (id.includes('sum.js')) {
        return 'sum';
      }
    },
  },
  plugins: [nodeResolve(), commonjs()],
});
```

**效果：**

- 第三方依赖会打包到 `vendor.js`；
- `sum.js` 模块单独打包。

> ✅ 适合组件库、复杂应用中精确控制 chunk 的划分。

## 三、chunks 文件命名与路径控制

可以通过以下配置来自定义 chunk 命名：

```js
output: {
  dir: 'build',
  format: 'esm',
  chunkFileNames: 'chunks/[name]-[hash].js',
  entryFileNames: '[name]-[hash].js',
  assetFileNames: 'assets/[name]-[hash].[ext]',
}
```

**说明：**

- `chunkFileNames`：代码分割生成的 chunk 名称；
- `entryFileNames`：入口文件的名称；
- `assetFileNames`：静态资源（CSS、图片）的命名规则；
- 可使用 `[name]`, `[hash]`, `[format]`, `[ext]` 等变量。

> ✅ `[hash]` 方便浏览器缓存更新。

## 四、`preserveModules`：保持模块结构输出

如果希望每个模块文件在打包后仍保持独立（例如构建 npm 包时），可以使用：

```js
output: {
  dir: 'build',
  format: 'esm',
  preserveModules: true,
  preserveModulesRoot: 'src',
}
```

这会让 Rollup 按源文件目录结构输出：

```
build/
├── utils/
│   └── sum.js
└── main.js
```

> ⚠️ 注意：`preserveModules` 与代码分割机制不同，它不会提取共享依赖，而是保持模块一一对应。

## 五、实战场景

### ✅ 路由懒加载（SPA）

```js
const About = () => import('./pages/About.js');
```

Rollup 会将 `About.js` 单独生成一个 chunk，在访问该路由时才加载。

### ✅ 公共依赖抽取（组件库）

```js
manualChunks: {
  react: ['react', 'react-dom'];
}
```

这样可避免多个组件重复引入 React 依赖，提升加载性能。

## 六、进阶技巧与优化

### 1️⃣ 结合 Tree-Shaking

Rollup 的 Tree-Shaking 会在代码分割时同时生效，确保每个 chunk 仅包含被实际使用的导出。

### 2️⃣ 分析打包结果

可以使用插件 `rollup-plugin-visualizer` 查看 chunk 体积分布：

```js
import visualizer from 'rollup-plugin-visualizer';

plugins: [visualizer({ open: true })];
```

生成的报告有助于发现可以进一步分割或合并的模块。

### 3️⃣ 缓存优化策略

- 使用 `[hash]` 避免浏览器缓存老文件；
- 尽量将第三方依赖打入独立 vendor chunk，方便长缓存。

## 七、常见注意事项

| ⚠️ 问题               | 说明                                                           |
| --------------------- | -------------------------------------------------------------- |
| **动态导入失效**      | 仅在 `esm` 输出下生效，`cjs` 格式无效。                        |
| **import() 参数错误** | 动态路径必须可静态解析，不能拼接字符串。                       |
| **多入口冲突**        | 如果入口过多且依赖交叉复杂，建议配合 `manualChunks` 精确控制。 |

## ✅ 总结

| 场景              | 推荐方案                |
| ----------------- | ----------------------- |
| 路由或页面懒加载  | `import()` 动态导入     |
| 多页面应用（MPA） | 多入口自动分割          |
| 组件库或大项目    | `manualChunks` 精细拆分 |
| 输出模块化 npm 包 | `preserveModules`       |

Rollup 的代码分割机制灵活且高效，结合动态导入与手动控制，可以显著提升应用加载性能和可维护性。
