# SOLID 设计原则

## S: 单一职责原则 (Single Responsibility Principle - SRP)

### 原则定义

一个类（或模块、函数、组件）应该只有一个变化的理由，亦即只负责一项职责。若一个对象承担了太多职责，当需求变化时，会导致不必要的改动，影响可维护性。

### 在 React 中的体现

#### 1. 拆分组件

- 如果一个组件既负责数据获取、又负责展示、还负责表单校验、再加上路由跳转控制，就违反了单一职责。

- 合理做法：把数据获取逻辑抽离到一个自定义 Hook（如 `useFetchData`），把展示逻辑放在纯展示组件里，把校验逻辑放到一个独立的工具函数或 Hook 中，把路由跳转通过 `props` 或 `Context` 传入。

```jsx
// 示例：将用户列表页拆分成多个职责单一的部分

// 1. useUsers.js（自定义 Hook，负责数据获取与状态管理）
import { useState, useEffect } from 'react';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { users, loading, error };
}

// 2. UserList.jsx（纯展示组件，只负责把数据渲染成列表）
import React from 'react';

export function UserList({ users }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// 3. UserListPage.jsx（组合组件，负责把 Hook 与展示组件结合，并处理加载/错误状态）
import React from 'react';
import { useUsers } from './useUsers';
import { UserList } from './UserList';

export function UserListPage() {
  const { users, loading, error } = useUsers();

  if (loading) return <p>加载中...</p>;
  if (error) return <p>加载出错：{error.message}</p>;

  return (
    <div>
      <h1>用户列表</h1>
      <UserList users={users} />
    </div>
  );
}
```