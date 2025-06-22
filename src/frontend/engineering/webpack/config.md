# 配置文件

## 配置文件智能提示

```js
// webpack.config.mjs
/**
 * @type {import('webpack').Configuration}
 */
export default {
  // 配置...
};
```

或者

```js
// webpack.config.mjs
/**
 * @returns {import('webpack').Configuration}
 */
export default (env, argv) => {
  env.NODE_ENV = process.env.NODE_ENV;
  return {
    // 配置...
  };
};
```
