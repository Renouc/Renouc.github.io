# useState 魔法揭秘 🧙‍♂️✨

## useState 原理 🔍

React 的 useState Hook 看似简单，背后却暗藏玄机！让我们揭开它的神秘面纱

`useState` 原理简易实现

```js
let index = 0;
const map = {};
const callbacks = {};

function useState(initialValue) {
  const currentIndex = index++;
  map[currentIndex] = initialValue;

  function subscribe(callback) {
    if (!callbacks[currentIndex]) {
      callbacks[currentIndex] = [];
    }
    callbacks[currentIndex].push(callback);
  }

  function setValue(newValue) {
    const prevValue = map[currentIndex];
    const nextValue =
      newValue instanceof Function ? newValue(prevValue) : newValue;
    map[currentIndex] = nextValue;
    callbacks[currentIndex].forEach((callback) =>
      callback(nextValue, prevValue)
    );
  }

  return [map[currentIndex], setValue, subscribe];
}

const [count, setCount, subscribe] = useState(0);

const [count2, setCount2, subscribe2] = useState(0);

const [count3, setCount3, subscribe3] = useState(0);

subscribe((newValue, prevValue) => {
  console.log("✨ count 改变了", `${prevValue} -> ${newValue}`);
});

subscribe2((newValue, prevValue) => {
  console.log("🌈 count2 改变了", `${prevValue} -> ${newValue}`);
});

subscribe3((newValue, prevValue) => {
  console.log("🔥 count3 改变了", `${prevValue} -> ${newValue}`);
});

setCount(1);
setCount(2);
setCount(3);

setCount2(1);
setCount2(2);
setCount2(3);
```

## 🎭 代码解析 - 这段代码做了什么？

1. **状态存储仓库** 📦 - `map` 对象像个巨大的保险箱，存储了所有状态值
2. **独一无二的钥匙** 🔑 - `index` 变量为每个状态提供唯一标识符
3. **魔法信使** 📨 - `callbacks` 对象储存了一群小精灵，随时准备通知你状态发生了变化
4. **记忆术** 🧠 - JavaScript 闭包让每个状态"记住"自己的索引

### 🚀 使用流程 - 当我们调用 useState

```js
const [count, setCount, subscribe] = useState(0);
```

这里发生了什么魔法？🪄

1. 🏁 获取当前 `index` 值（假设是 0）并递增它
2. 📝 将初始值 `0` 存入 `map[0]`
3. 🎁 返回三件宝物：当前值、设置函数和订阅函数

### 💫 当 setCount 被调用时...

```js
setCount(1);
// 或使用函数式更新
setCount((prevCount) => prevCount + 1);
```

这时候发生了什么？

1. 📊 获取旧值 (例如 `0`)
2. 🧮 计算新值 (例如 `1` 或通过函数计算 `0+1=1`)
3. 📥 更新存储在 `map[0]` 中的值
4. 📣 通知所有订阅者："嘿，状态变化啦！"

## 🎭 订阅机制 - 窥探状态变化

```js
subscribe((newValue, prevValue) => {
  console.log("✨ count 改变了", `${prevValue} -> ${newValue}`);
});
```

这就像给你的状态安装了一个监视器 👁️，每当值发生变化，它就会立即通知你！

## 🔮 与 React 真实实现的区别

这个简易实现很棒，但实际上 React 内部做了更多复杂的事情：

### 1. 数据结构不同 🏗️

**简易实现** 使用普通对象，而 **React 实现** 使用复杂的链表结构 (称为 Fiber)：

```js
// React 内部简化表示 (并非实际代码)
{
  memoizedState: {
    baseState: initialValue,
    queue: updateQueue,
    next: nextHook // 指向下一个 hook
  }
}
```

### 2. 渲染模型差异 🖼️

**简易实现**：状态更新只是通知订阅者

**React 实现**：状态更新会引发整个组件重新渲染，Hooks 按顺序重新执行

### 3. 批量更新与调度 ⚡

**简易实现**：立即处理每个状态更新

**React 实现**：实现了批量更新机制，基于优先级的调度系统，可以中断低优先级的更新

### 4. Hook 规则实现 📏

**简易实现**：不强制任何规则

**React 实现**：严格依赖 Hook 调用顺序，有严格的检查机制

## 🔧 常见问题与解决方案

### 1. 状态连续性丢失问题 🧭

如果我们尝试在 React 函数组件中使用这个简易实现，会出现一个严重问题：**每次组件重新渲染时，状态会"迷路"**。

这是因为函数组件在每次渲染时会重新执行整个函数体:

```jsx
function Counter() {
  // 每次渲染时都会执行这行代码
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

当组件第一次渲染，`useState(0)` 使用 `index = 0`，将 `0` 存入 `map[0]`。

用户点击按钮后，调用 `setCount(1)` 把 `map[0]` 更新为 `1`，然后 React 重新渲染组件。

在第二次渲染时，`useState(0)` 再次执行，但 `index` 已经变成了 `1`，导致：
- 创建新的状态项 `map[1] = 0`（回到初始值）
- 返回的 `count` 仍然是 `0`，而不是更新后的 `1`
- **之前在 `map[0]` 中更新的值完全被"遗忘"** 🚫

这就是所谓的"状态迷路" - 不仅是浪费内存，而是组件**完全失去了追踪状态变化的能力**。用户界面永远停留在初始状态，无法反映用户操作带来的变化。😱

**React 解决方案**：React 通过巧妙的设计解决了这个问题：
- 每次渲染前重置内部的 Hook 索引计数器 🔄
- 使用持久化的 Fiber 节点存储状态，确保组件能够找到它自己的状态 🔐
- 严格依赖 Hook 调用顺序来匹配状态 📏
- 提供开发时检查确保 Hook 规则被遵守 🛡️

> 这就是为什么 React 文档强调 Hook 必须在每次渲染中以完全相同的顺序被调用！

### 2. 状态共享问题 👥

简易实现使用全局变量，不同组件的状态可能会混在一起。

**React 解决方案**：每个组件实例都有自己的 Fiber 节点，Hooks 状态与特定组件实例关联。

## 🚀 React Hook 使用技巧

### Hook 使用的黄金法则 👑

1. **顺序至上** 📋 - Hook 必须以相同的顺序调用
2. **顶层调用** 🏔️ - 只在函数组件或自定义 Hook 的顶层调用
3. **不要在条件语句中使用** 🚫 - 即使看起来很合理，也不要这样做！

### 函数式更新的威力 💪

当新状态依赖于旧状态时，总是使用函数式更新：

```js
// ❌ 可能出问题
setCount(count + 1);

// ✅ 总是安全的
setCount((prevCount) => prevCount + 1);
```

## 💡 最佳实践

1. **将相关状态组合** 🧩 - 考虑使用对象组合相关状态
2. **使用自定义 Hook 抽象逻辑** 🏭 - 创建可复用的逻辑单元

