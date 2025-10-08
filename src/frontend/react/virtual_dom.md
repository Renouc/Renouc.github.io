# 虚拟 DOM

## 1. 概念与定义

> **虚拟 DOM（Virtual DOM, VDOM）** 是一种用来描述真实 DOM 的抽象数据结构。
>
> 它通常通过 **JS 对象** 实现，包含节点类型、属性和子节点等信息，但本质上不依赖浏览器，也不局限于 JS。

**示例：**

```js
{
  type: 'div',
  props: { className: 'container' },
  children: [
    { type: 'span', props: null, children: ['Hello'] }
  ]
}
```

用于描述：

```html
<div class="container"><span>Hello</span></div>
```

## 2. 虚拟 DOM 出现的原因

### 2.1 真实 DOM 的问题

1. **性能开销大**

   * DOM 更新会触发浏览器重排（Reflow）和重绘（Repaint）。
   * 频繁更新容易导致页面卡顿。

2. **手动维护复杂**

   * 手动查找并更新 DOM 节点易出错。
   * 难以保证视图和状态同步。

### 2.2 虚拟 DOM 的价值

* 通过在 **内存中计算最小差异**，一次性批量更新真实 DOM，降低不必要的开销。
* 让 UI 描述与宿主环境解耦，从而实现跨平台渲染。

## 3. 虚拟 DOM 更新流程

虚拟 DOM 的更新分为三个阶段：

```
Render → Diff → Patch
```

1. **Render**：生成新的虚拟 DOM 树。
2. **Diff**：比较新旧两棵虚拟 DOM 树，找出差异。
3. **Patch**：将差异一次性应用到真实 DOM。

## 4. Diff 算法

传统 Diff 算法复杂度为 `O(n^3)`，无法在实际场景中使用。

**优化策略：React/Vue → O(n)**

1. **同层比较，不跨层级**

   * 只比较同一层级的节点，不做跨层比较。

2. **通过 key 标识列表节点**

   * 使用 `key` 来追踪节点，减少无效重建。

**示例：**

```jsx
{list.map(item => <li key={item.id}>{item.name}</li>)}
```

## 5. 跨平台能力

虚拟 DOM 只描述 UI，不依赖浏览器，可以映射到不同宿主环境。

| 宿主环境         | 渲染目标      |
| ------------ | --------- |
| 浏览器          | 真实 DOM 元素 |
| React Native | 原生控件      |
| Canvas/WebGL | 图形元素      |
| 服务端 SSR      | 字符串 HTML  |

**示例：** React Native 与 Web 端共享同一套虚拟 DOM 结构，但渲染结果不同。

## 6. 性能优化手段

1. **最小化更新**：通过 Diff 算法减少不必要的 DOM 操作。
2. **批量更新**：一次性将差异同步到真实 DOM。
3. **异步调度**：如 React Fiber，将大任务拆分为小任务，防止长时间阻塞主线程。

## 7. 虚拟 DOM 的优缺点

| 优点          | 缺点                |
| ----------- | ----------------- |
| 减少 DOM 操作次数 | 首次渲染更慢            |
| 让 UI 更新可预测  | 占用额外内存            |
| 支持跨平台渲染     | 简单场景不一定比直接 DOM 更快 |

## 8. 简易实现示例

```js
function createElement(type, props, ...children) {
  return { type, props, children };
}

function render(vnode) {
  if (typeof vnode === 'string') return document.createTextNode(vnode);
  const el = document.createElement(vnode.type);
  for (const key in vnode.props) {
    el.setAttribute(key, vnode.props[key]);
  }
  vnode.children.forEach(child => el.appendChild(render(child)));
  return el;
}

const vdom = createElement('div', { class: 'container' },
  createElement('span', null, 'Hello Virtual DOM')
);
document.body.appendChild(render(vdom));
```

## 9. 局限性

1. 首次渲染比直接操作 DOM 多了一层虚拟计算。
2. 虚拟 DOM 树占用额外内存。
3. 少量简单更新场景下，直接操作 DOM 可能更快。

## 10. 综合表达模板

虚拟 DOM 是一种用来描述真实 DOM 的抽象数据结构。
它通常用 JS 对象实现，包含节点类型、属性、子节点等信息，用来表示页面结构。

它的主要作用是性能优化。真实 DOM 节点很重，频繁创建和更新会触发大量重排重绘，导致性能下降。
虚拟 DOM 通过 Diff 算法比较新旧两棵树，精确找到最小差异，再一次性批量更新真实 DOM，从而降低无效操作，优化渲染性能。

此外，虚拟 DOM 也让 UI 描述与宿主环境解耦。因为它本质只是抽象描述，所以不仅可以渲染到浏览器 DOM，也可以渲染到原生控件、Canvas 等，实现跨平台渲染。
比如 React Native 就是通过同一套虚拟 DOM 描述，映射到不同平台的组件。

## 11. 总结

> **一句话记忆**：
> 虚拟 DOM 先在内存中计算最小差异，再一次性同步到真实 DOM，既减少无效操作，又支持跨平台渲染。
