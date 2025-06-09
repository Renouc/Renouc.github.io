# 处理中文输入法下的回车搜索问题

## 📌 问题背景

在实现 `<input>` 输入框中按回车（Enter）进行搜索的功能时，常用 `onKeyDown` 或 `onKeyPress` 监听回车键。

但在**中文输入法模式**下（例如拼音），按下 Enter 其实是用来**确认中文候选字**的，不应该触发搜索行为。如果不做处理，会导致“搜索过早触发”。

## ✅ 正确做法：使用 `onKeyDown` + Composition 事件判断

```tsx
import React, { useState } from "react";

function SearchInput() {
  const [isComposing, setIsComposing] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isComposing) {
      console.log("触发搜索：", e.target.value);
      // 执行搜索逻辑
    }
  };

  return (
    <input
      type="text"
      onKeyDown={handleKeyDown}
      onCompositionStart={() => setIsComposing(true)} // 开始拼音输入
      onCompositionEnd={() => setIsComposing(false)} // 完成输入，关闭拼音
    />
  );
}
```

### 🔍 Composition 事件说明

| 事件名             | 说明                     |
| ------------------ | ------------------------ |
| `compositionstart` | 用户开始拼音或语音输入   |
| `compositionend`   | 用户选择候选字、输入完成 |

> ✅ 只有在 `isComposing === false` 时再触发搜索，才能确保用户完成中文输入。

---

## ❌ 不推荐做法：使用 `onKeyPress`

虽然 `onKeyPress` 在大多数输入法中不会触发回车事件（因此“看起来没问题”），但存在以下缺点：

- ⚠️ **已被废弃**：React 官方已不推荐使用。
- ❌ 各浏览器表现不一致。
- ❌ 无法精确控制 composition 状态。

---

## ✅ 推荐使用事件组合对比

| 方法         | 是否触发中文拼音确认 | 是否推荐  | 说明                      |
| ------------ | -------------------- | --------- | ------------------------- |
| `onKeyDown`  | ✅ 会触发            | ✅ 推荐   | 可结合 `composition` 判断 |
| `onKeyPress` | ❌ 多数不会触发      | ❌ 不推荐 | 行为不可靠，已废弃        |
| `onKeyUp`    | ✅ 会触发            | ⚠️ 不推荐 | 不利于拦截默认行为        |

## 🛠️ 封装成自定义 Hook

为了提升复用性与可读性，可将该逻辑封装为一个 React 自定义 Hook：

```tsx
import { useState, useCallback } from "react";

export function useEnterSearch(callback: () => void) {
  const [isComposing, setIsComposing] = useState(false);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !isComposing) {
        callback();
      }
    },
    [isComposing, callback]
  );

  return {
    onKeyDown: handleKeyDown,
    onCompositionStart: () => setIsComposing(true),
    onCompositionEnd: () => setIsComposing(false),
  };
}
```

使用示例：

```tsx
const { onKeyDown, onCompositionStart, onCompositionEnd } = useEnterSearch(
  () => {
    console.log("搜索被触发");
  }
);

<input
  type="text"
  onKeyDown={onKeyDown}
  onCompositionStart={onCompositionStart}
  onCompositionEnd={onCompositionEnd}
/>;
```

## ✅ 总结

- 中文输入状态下，回车不应该立即搜索。
- 正确做法是使用 `onKeyDown + composition` 判断是否处于拼音输入中。
- 避免使用已废弃的 `onKeyPress`。
- 推荐将逻辑抽离成 Hook，提高复用性和可维护性。

📂 建议将此模式纳入组件库或开发规范中，减少误用和兼容性问题。
