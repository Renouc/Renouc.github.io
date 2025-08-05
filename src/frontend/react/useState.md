# useState 原理解析

React 的 useState 钩子是函数组件中最常用的状态管理工具。

## 核心概念

useState 的核心思想基于以下几点：

1. **闭包保存状态**：通过 JavaScript 的闭包特性在组件渲染间保持状态
2. **状态数组**：React 内部使用数组存储所有状态值
3. **光标机制**：使用索引指针跟踪当前正在处理的状态

## 简易实现

下面是一个简化版的 useState 实现，帮助理解其内部原理：

```js
// 存储所有组件状态的数组
let states = [];
// 当前正在处理的状态索引
let stateCursor = 0;

function useState(initialValue) {
  // 保存当前状态的索引位置
  const currentIndex = stateCursor;

  // 仅在首次渲染时初始化状态
  if (states[currentIndex] === undefined) {
    states[currentIndex] = initialValue;
  }

  // 状态更新函数
  function setState(newValue) {
    // 支持函数式更新
    const valueToStore =
      typeof newValue === 'function'
        ? newValue(states[currentIndex])
        : newValue;

    // 更新状态值
    states[currentIndex] = valueToStore;

    // 触发组件重新渲染
    render();
  }

  // 获取当前状态值
  const value = states[currentIndex];

  // 移动到下一个状态
  stateCursor++;

  // 返回状态值和更新函数
  return [value, setState];
}

// 存放最新的组件实例
let currentAppInstance;

// 渲染函数
function render() {
  // 重置状态索引，确保每次渲染时从头开始
  stateCursor = 0;

  // 重新执行组件函数，获取最新渲染结果
  currentAppInstance = App();

  console.log('渲染结果：', currentAppInstance);
}

// 示例组件
function App() {
  // 多个状态的使用示例
  const [count, setCount] = useState(0);
  const [text, setText] = useState('Hello');

  return {
    count,
    text,
    increment: () => setCount((prev) => prev + 1),
    changeText: () => setText('World'),
  };
}

// 初次渲染
render();

// 模拟用户交互
currentAppInstance.increment(); // 触发 render，count +1
currentAppInstance.changeText(); // 触发 render，text 改变
```

## 为什么需要保持调用顺序

React 要求 Hook 必须在组件顶层调用，并且不能在条件语句、循环或嵌套函数中调用。这是因为 React 依赖于调用顺序来确定哪个状态对应哪个 useState 调用。

如果在条件语句中使用 useState：

```js
function BadComponent() {
  const [count, setCount] = useState(0);

  // 🚫 错误：条件渲染会破坏 useState 的调用顺序
  if (count > 0) {
    const [additionalState, setAdditionalState] = useState('');
  }

  // ...
}
```

上面的代码会导致状态索引混乱，因为 stateCursor 依赖于固定的调用顺序。

## 实际 React 实现的区别

真实的 React 实现比我们的示例复杂得多：

1. React 使用链表而非数组存储状态
2. 包含完整的调度系统，实现批量更新和优先级调度
3. 使用 Fiber 架构进行增量渲染
4. 添加了大量性能优化和错误处理

## 最佳实践

- 使用多个 useState 而非单个复杂对象管理相关状态
- 对于复杂状态逻辑，考虑使用 useReducer
- 使用函数式更新 (setState(prev => prev + 1)) 避免依赖旧状态值的问题
- 记住 useState 的更新是异步的，不要依赖即时更新
