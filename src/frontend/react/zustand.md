# Zustand 状态管理库使用指南

`Zustand` 是一个轻量、直观、灵活的状态管理库，在 `React` 生态中非常受欢迎。它提供了简单的 API，无需样板代码，特别适用于中小型应用或者局部全局状态管理。

## 基础使用

### 1. 创建一个 Store

```ts
// stores/counter.ts
import { create } from "zustand";

interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  incrementBy: (amount: number) => void;
  reset: () => void;
}

const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  incrementBy: (amount) => set((state) => ({ count: state.count + amount })),
  reset: () => set({ count: 0 }),
}));

export default useCounterStore;
```

### 2. 在组件中使用

```tsx
// components/Counter.tsx
import React from "react";
import useCounterStore from "@/stores/counter";

function Counter() {
  const count = useCounterStore((state) => state.count);
  const { increment, decrement, incrementBy, reset } = useCounterStore();
  
  return (
    <div>
      <h3>计数器: {count}</h3>
      <div>
        <button onClick={increment}>+1</button>
        <button onClick={decrement}>-1</button>
        <button onClick={() => incrementBy(5)}>+5</button>
        <button onClick={reset}>重置</button>
      </div>
    </div>
  );
}

export default Counter;
```

## 使用细节与最佳实践

### 1. 正确订阅状态才会触发组件更新

❌ **错误示例：**
```tsx
function Counter() {
  // getState() 获取的是快照，不会订阅状态变化
  const count = useCounterStore.getState().count;
  const increment = useCounterStore((state) => state.increment);
  
  return (
    <div>
      <div>{count}</div> {/* 状态更新时不会重新渲染 */}
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

✅ **正确示例：**
```tsx
function Counter() {
  // 通过 selector 订阅状态
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  
  return (
    <div>
      <div>{count}</div> {/* 状态更新时会重新渲染 */}
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

### 2. 精确订阅状态避免不必要的重新渲染

❌ **订阅整个 store：**
```tsx
function UserProfile() {
  // 订阅了整个 store，任何状态变化都会触发重新渲染
  const store = useUserStore();
  
  return <div>{store.user.name}</div>;
}
```

✅ **精确订阅特定状态：**
```tsx
function UserProfile() {
  // 只订阅 user.name，只有这个值变化才会重新渲染
  const userName = useUserStore((state) => state.user.name);
  
  return <div>{userName}</div>;
}
```

### 3. 使用浅比较优化性能

**方法一：使用 `useStoreWithEqualityFn`**
```tsx
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

function TodoList() {
  const { todos, addTodo, removeTodo } = useStoreWithEqualityFn(
    useTodoStore,
    (state) => ({
      todos: state.todos,
      addTodo: state.addTodo,
      removeTodo: state.removeTodo,
    }),
    shallow
  );
  
  return (
    <div>
      {todos.map(todo => (
        <div key={todo.id}>
          {todo.text}
          <button onClick={() => removeTodo(todo.id)}>删除</button>
        </div>
      ))}
      <button onClick={() => addTodo('新任务')}>添加</button>
    </div>
  );
}
```

**方法二：使用 `subscribeWithSelector` 中间件**
```tsx
import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

const useTodoStore = create(
  subscribeWithSelector((set) => ({
    todos: [],
    addTodo: (text) => set((state) => ({
      todos: [...state.todos, { id: Date.now(), text }]
    })),
    removeTodo: (id) => set((state) => ({
      todos: state.todos.filter(todo => todo.id !== id)
    })),
  }))
);

function TodoList() {
  const { todos, addTodo, removeTodo } = useTodoStore(
    (state) => ({
      todos: state.todos,
      addTodo: state.addTodo,
      removeTodo: state.removeTodo,
    }),
    shallow
  );
  
  return (
    <div>
      {todos.map(todo => (
        <div key={todo.id}>
          {todo.text}
          <button onClick={() => removeTodo(todo.id)}>删除</button>
        </div>
      ))}
      <button onClick={() => addTodo('新任务')}>添加</button>
    </div>
  );
}
```

**说明：**
- 在 Zustand v4+ 中，默认的 store hook 不再接受第二个相等性函数参数
- 如果需要使用自定义相等性函数，有两种方式：
  1. 使用 `useStoreWithEqualityFn` from `zustand/traditional`
  2. 在创建 store 时使用 `subscribeWithSelector` 中间件
- `shallow` 用于浅比较 selector 返回的对象，避免因为对象引用变化导致的不必要重新渲染

**最佳实践（推荐）：**
```tsx
// 分别订阅每个状态（最简单，性能最好）
function TodoList() {
  const todos = useTodoStore((state) => state.todos);
  const addTodo = useTodoStore((state) => state.addTodo);
  const removeTodo = useTodoStore((state) => state.removeTodo);
  
  return (
    <div>
      {todos.map(todo => (
        <div key={todo.id}>
          {todo.text}
          <button onClick={() => removeTodo(todo.id)}>删除</button>
        </div>
      ))}
      <button onClick={() => addTodo('新任务')}>添加</button>
    </div>
  );
}
```

## 高级用法

### 1. 异步操作

```ts
interface UserStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: (id: string) => Promise<void>;
}

const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  fetchUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const user = await api.getUser(id);
      set({ user, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));
```

### 2. 中间件使用

```ts
import { devtools, persist } from 'zustand/middleware';

const useCounterStore = create<CounterStore>()(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      {
        name: 'counter-storage', // localStorage 键名
      }
    ),
    {
      name: 'counter-store', // DevTools 中显示的名称
    }
  )
);
```

### 3. Store 组合

```ts
// 将大的 store 拆分成小的 slice
const createCounterSlice = (set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
});

const createUserSlice = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
});

const useAppStore = create((set, get) => ({
  ...createCounterSlice(set, get),
  ...createUserSlice(set, get),
}));
```