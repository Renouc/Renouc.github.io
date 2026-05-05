# React 渲染机制

React 的核心价值不是“比手写 DOM 更快”，而是把 UI 更新变成可预测的数据驱动流程。渲染机制可以从虚拟 DOM、Fiber 和调度三层理解。

## 前端框架解决的问题

React 本身是 UI 库，主要负责组件化和声明式渲染。实际项目中的“React 技术栈”通常还包括路由、状态管理、构建工具和框架层能力。

框架或技术栈要解决的核心问题：

- 用声明式写法代替手动 DOM 操作。
- 让状态变化稳定驱动视图变化。
- 将页面、组件、数据和工程流程组织成可维护结构。

React 不直接内置路由和全局状态方案，所以常见组合是 React、React Router、Zustand 或 Redux、Vite 或 Next.js。

## 虚拟 DOM

虚拟 DOM 是描述 UI 的普通对象结构。它记录节点类型、属性和子节点，不直接依赖浏览器 DOM。

```js
const vnode = {
  type: 'div',
  props: { className: 'container' },
  children: [{ type: 'span', props: null, children: ['Hello'] }],
};
```

React 更新时大致分三步：

1. 生成新的虚拟 DOM。
2. 比较新旧结构，找出需要变更的部分。
3. 把变更提交到宿主环境，比如浏览器 DOM。

虚拟 DOM 的意义主要有两个：

- 将 UI 描述与真实 DOM 解耦，方便跨平台渲染。
- 用一致的数据结构承接 diff、调度和提交流程。

它不是所有场景下的性能银弹。简单页面里直接操作 DOM 可能更快；React 的优势在于复杂交互下的可维护性和更新一致性。

## Fiber

Fiber 是 React 内部的工作单元，也可以理解为组件树的一种链表化表示。每个 Fiber 节点记录当前组件对应的类型、状态、子节点、兄弟节点和父节点。

常见字段：

| 字段 | 含义 |
| --- | --- |
| `type` | 解析后的组件或原生标签类型 |
| `elementType` | JSX 对应的原始类型 |
| `child` | 第一个子 Fiber |
| `sibling` | 下一个兄弟 Fiber |
| `return` | 父 Fiber |
| `pendingProps` | 本次渲染输入 |
| `memoizedProps` | 上次提交后的 props |
| `memoizedState` | 上次提交后的 state |
| `flags` | 本次需要执行的副作用标记 |

Fiber 解决的问题是：渲染工作可以被拆成小块，中间可以让出主线程。旧的递归渲染一旦开始就很难中断，组件树很大时会阻塞交互。

## 调度与优先级

React 渲染分为 render 和 commit 两个阶段。

| 阶段 | 作用 | 是否可中断 |
| --- | --- | --- |
| render | 计算新的 Fiber 树和副作用 | 可以中断 |
| commit | 把变更提交到宿主环境 | 不可中断 |

调度的关键是给不同更新分配不同优先级：

- 输入、点击等用户交互优先级高。
- 页面过渡、列表筛选等可以延后。
- 空闲任务可以在主线程空闲时执行。

当高优先级任务到来时，React 可以暂停低优先级渲染，先处理更紧急的更新。这样可以减少长任务导致的卡顿。

## 最小堆在调度中的作用

最小堆是一种适合取最小值的优先队列。堆顶总是优先级最高或过期时间最早的任务。

数组实现的最小堆可以通过索引计算父子节点：

```txt
parent(i) = Math.floor((i - 1) / 2)
left(i) = 2 * i + 1
right(i) = 2 * i + 2
```

核心操作复杂度：

| 操作 | 复杂度 |
| --- | --- |
| `peek` 读取堆顶 | `O(1)` |
| `push` 插入任务 | `O(log n)` |
| `pop` 取出堆顶 | `O(log n)` |

简化实现：

```ts
class MinHeap {
  private heap: number[] = [];

  push(value: number) {
    this.heap.push(value);
    this.siftUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const value = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.siftDown(0);
    return value;
  }

  peek() {
    return this.heap[0];
  }

  private siftUp(index: number) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[parent] <= this.heap[index]) break;
      [this.heap[parent], this.heap[index]] = [
        this.heap[index],
        this.heap[parent],
      ];
      index = parent;
    }
  }

  private siftDown(index: number) {
    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let smallest = index;

      if (left < this.heap.length && this.heap[left] < this.heap[smallest]) {
        smallest = left;
      }

      if (right < this.heap.length && this.heap[right] < this.heap[smallest]) {
        smallest = right;
      }

      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [
        this.heap[smallest],
        this.heap[index],
      ];
      index = smallest;
    }
  }
}
```

在调度系统中，堆可以用来维护“最早过期任务”或“最高优先级任务”，让调度器快速决定下一步处理什么。

## 总结

- 虚拟 DOM 是 UI 描述层，让更新流程可计算、可跨平台。
- Fiber 是工作单元，让大渲染任务可以被拆分和调度。
- render 阶段可中断，commit 阶段必须一次性完成。
- 最小堆适合维护任务优先级，是调度器常见的数据结构。
- React 的性能模型重点不是避免所有计算，而是让计算有优先级、有边界、可恢复。
