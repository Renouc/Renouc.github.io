# Rollup 配置文件

## 智能提示

使用 JSDoc 类型提示

```js
// rollup.config.js
/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  /* 你的配置 */
};
export default config;
```

使用 `defineConfig` 辅助函数，它提供无需 JSDoc 注释即可使用智能感知的功能：

```js
// rollup.config.js
import { defineConfig } from "rollup";

export default defineConfig({
  /* 你的配置 */
});
```

通过 `--configPlugin` 选项直接使用 TypeScript 编写配置文件。

```ts
import type { RollupOptions } from "rollup";

const config: RollupOptions = {
  /* 你的配置 */
};
export default config;
```

> `--configPlugin <plugin>`
> 允许指定 Rollup 插件来转译或控制解析配置文件。主要好处是可以使用非 JavaScript 的配置文件。

> 例如，如果你安装了 @rollup/plugin-typescript，则以下内容将允许你使用 TypeScript 编写配置文件：`rollup --config rollup.config.ts --configPlugin @rollup/plugin-typescript`