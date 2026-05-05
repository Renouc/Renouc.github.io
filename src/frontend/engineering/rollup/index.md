# Rollup 核心机制

Rollup 更适合构建库和偏 ESM 的产物。它的核心优势来自静态模块图、Tree Shaking 和可控的输出结构。

## 类型提示

普通 JavaScript 配置可以通过 JSDoc 获得类型提示。

```js
// rollup.config.js
/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'esm',
  },
};

export default config;
```

更常用的方式是 `defineConfig`。

```js
import { defineConfig } from 'rollup';

export default defineConfig({
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'esm',
  },
});
```

如果配置文件用 TypeScript，可以通过 `--configPlugin` 让 Rollup 转译配置。

```bash
rollup --config rollup.config.ts --configPlugin @rollup/plugin-typescript
```

## 模块解析

Rollup 默认只处理标准 ES Module。第三方依赖、Node 解析规则和 CommonJS 都需要插件补齐。

解析 npm 包和 Node 解析规则：

```js
import { defineConfig } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default defineConfig({
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'esm',
  },
  plugins: [nodeResolve()],
});
```

解析 CommonJS：

```js
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'esm',
  },
  plugins: [commonjs()],
};
```

做库构建时，通常不把 React、Vue 等 peer dependency 打进包里。

```js
export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.mjs',
      format: 'esm',
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'MyLibrary',
      globals: {
        react: 'React',
      },
    },
  ],
  external: ['react'],
};
```

`external` 决定哪些模块不打包，`output.globals` 只在 `umd` 或 `iife` 这类浏览器全局格式里有意义。

如果外部依赖需要替换为 CDN 地址，可以使用 `output.paths`。

```js
export default {
  input: 'src/index.js',
  external: ['d3'],
  output: {
    file: 'dist/index.js',
    format: 'amd',
    paths: {
      d3: 'https://d3js.org/d3.v7.min.js',
    },
  },
};
```

## Tree Shaking

Rollup 基于 ES Module 的静态导入导出构建依赖图，然后从入口开始标记实际使用的导出，生成代码时删除未使用的部分。

要让 Tree Shaking 稳定生效，需要满足几个条件：

- 使用 `import` / `export`，少用动态 `require`。
- 模块顶层减少副作用。
- 对确实无副作用的调用加纯函数标记。
- 包发布时正确声明 `sideEffects` 或避免入口文件做隐式初始化。

纯函数标记用于告诉压缩和打包工具：这个调用未被使用时可以删除。

```js
const value = /*#__PURE__*/ createExpensiveObject();
```

具名导出通常比“一个默认对象导出全部成员”更容易被精确删除。

```js
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}
```

动态导入会触发代码分割，被动态导入模块内部仍然可以继续 Tree Shaking。

## 代码分割

Rollup 的代码分割需要输出到目录，并使用支持分块的格式，通常是 `esm`。

动态导入会自动生成独立 chunk。

```js
const page = await import('./pages/detail.js');
page.render();
```

多入口会自动抽取共享模块。

```js
import { defineConfig } from 'rollup';

export default defineConfig({
  input: ['src/admin.js', 'src/client.js'],
  output: {
    dir: 'dist',
    format: 'esm',
  },
});
```

需要稳定拆包时使用 `manualChunks`。

```js
export default {
  input: 'src/index.js',
  output: {
    dir: 'dist',
    format: 'esm',
    manualChunks(id) {
      if (id.includes('node_modules')) {
        return 'vendor';
      }
    },
  },
};
```

常用输出命名：

```js
output: {
  dir: 'dist',
  format: 'esm',
  entryFileNames: '[name]-[hash].js',
  chunkFileNames: 'chunks/[name]-[hash].js',
  assetFileNames: 'assets/[name]-[hash][extname]',
}
```

如果希望发布 npm 包时保持源文件模块结构，可以使用 `preserveModules`。它不是传统代码分割，而是按源模块一对一输出。

```js
output: {
  dir: 'dist',
  format: 'esm',
  preserveModules: true,
  preserveModulesRoot: 'src',
}
```

## 实践建议

- 应用构建优先评估 Vite，库构建可以直接用 Rollup。
- 库里的 peer dependency 通常放进 `external`。
- 需要 Tree Shaking 的公共工具函数优先使用具名导出。
- 只有在缓存策略或包体分析明确需要时，才手动拆 `manualChunks`。
- 构建结果异常时先看模块格式、插件顺序、`external` 和输出格式。
