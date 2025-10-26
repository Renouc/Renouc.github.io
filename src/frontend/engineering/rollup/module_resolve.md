# 模块解析

Rollup 天生只理解「纯 ES 模块文件」，默认不会“像 Node 一样”去解析依赖。

因此，无论是第三方依赖（lodash）还是 Node 内置模块（fs），Rollup 都需要额外的插件来识别和处理。

## 解析 Node 内置模块以及三方依赖

Rollup 提供了 `@rollup/plugin-node-resolve` 插件，用于解析 Node 内置模块以及三方依赖。

```js
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'main.js',
  output: {
    file: 'bundle.js',
    format: 'es',
  },
  plugins: [resolve()],
};
```

## 解析 CommonJS 模块

下面这段代码在使用 Rollup 打包时会报错，`lodash` 是一个 CommonJS 模块，Rollup 默认不支持解析。

```js
// main.js
import _ from 'lodash';

console.log(_.add(1, 2));
```

可以安装 `@rollup/plugin-commonjs` 插件来解析 CommonJS 模块。

```js
// rollup.config.js
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'main.js',
  output: {
    file: 'bundle.js',
    format: 'es',
  },
  plugins: [commonjs()],
};
```

## 控制打包范围：external 与 globals

如果开发一个库，不希望把 React 等依赖打包进库中，而是在使用时由用户提供。

可以在 Rollup 配置中添加 `external` 选项，指定哪些模块不应该被打包。

```js
// rollup.config.js
export default {
  input: 'main.js',
  output: {
    file: 'bundle.js',
    format: 'es',
  },
  plugins: [commonjs()],
  external: ['react'],
};
```

当创建 `iife` 或 `umd` 格式的 bundle 时，你需要通过 `output.globals` 选项提供全局变量名，以替换掉外部引入。

```js
// rollup.config.js
export default {
  input: 'main.js',
  output: {
    file: 'bundle.js',
    format: 'es',
    globals: {
      react: 'React',
    },
  },
  plugins: [commonjs()],
  external: ['react'],
};
```
