# JSX

`React` 通过 `JSX` 语法来描述 UI。

- 本质 ：
  `JSX` 是语法糖，通过工具（如 Babel/TypeScript）转换为 `React.createElement()` 或 `jsx/jsxs` 函数调用，最终生成虚拟 DOM 对象 。
- React 17 前后差异 ：

  - Classic 模式 ：直接转换为 `React.createElement(...)`，需显式导入 `React`。
  - Automatic 模式 （React 17+）：通过新运行时函数（如 `jsx/jsxs`）生成虚拟 DOM，无需显式导入 `React`。

- [在线尝试](https://babeljs.io/repl)

- [Automatic 模式 JSX 转换的官方介绍](https://zh-hans.legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)

## 编译 JSX

### 使用 Babel 编译

1. 安装

```bash
npm install --save-dev @babel/cli @babel/preset-react
```

或者

```bash
npm install --save-dev @babel/cli @babel/plugin-transform-react-jsx
```

2. 配置

创建 `babel.config.js` 文件

如果使用 `@babel/preset-react`，配置如下：

```js
module.exports = {
  presets: [
    [
      "@babel/preset-react",
      {
        runtime: "classic",
        pure: false, // 是否开启纯函数模式（为了便于阅读编译后的代码，这里设置为false）
      },
    ],
  ],
};
```

如果使用 `@babel/plugin-transform-react-jsx`，配置如下：

```js
module.exports = {
  plugins: [
    [
      "@babel/plugin-transform-react-jsx",
      {
        runtime: "automatic",
        pure: false,
      },
    ],
  ],
};
```

> 两种方式，都可以通过配置 `runtime` 来更改 jsx 编译结果。支持的值为 `classic`、`automatic`，默认为 `classic`。

### 使用 TypeScript 编译

`tsconfig.json` 文件配置：

```json
{
  "compilerOptions": {
    "module": "ES6",
    "jsx": "react",
    "outDir": "dist", // 编译输出目录
    "rootDir": "src", // 被编译的文件所在目录
    "allowJs": true // 允许编译 js 文件
  }
}
```

> `jsx` 配置为 `react` 时，相当于`classic`，为 `react-jsx` 时，相当于 `automatic`。如果将`jsx`配置删除，则不会编译 jsx 语法。

## 编译产物

以下是使用 `jsx` 语法描述的一个组件

```jsx
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
);
```

`classic` 模式下，编译结果为：

```js
var element = React.createElement(
  "div",
  { id: "foo" },
  React.createElement("a", null, "bar"),
  React.createElement("b", null)
);
```

`automatic` 模式下，编译结果为:

```js
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var element = _jsxs("div", {
  id: "foo",
  children: [_jsx("a", { children: "bar" }), _jsx("b", {})],
});
```

> 示例代码：https://github.com/Renouc/react-learn/tree/main/jsx-demo
