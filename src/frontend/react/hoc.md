# 高阶组件

## 什么是高阶组件

**高阶组件（HOC）** 是 React 中的一种设计模式，本质上是一个函数，接收一个组件作为参数并返回一个新的组件。

它不会修改原组件，而是通过组合的方式为组件增加额外逻辑，从而实现逻辑复用和关注点分离。

## 为什么需要高阶组件

在复杂项目中，多个组件可能共享相同逻辑，例如：

- 权限控制（未登录跳转登录页）

- 数据请求（loading、error 处理）

- 埋点统计

- 主题或配置注入

- 路由守卫

如果每个组件都写重复逻辑，代码会冗余且难维护。通过 HOC 可以将这类逻辑抽离，实现复用。

## HOC vs Hooks

在 React 早期，HOC 是类组件中主要的逻辑复用手段。

但随着 Hooks 的出现，逻辑可以直接通过函数抽离并复用，结构更加扁平清晰。

因此在现代 React 项目中，HOC 逐渐被自定义 Hook 所取代，但在老项目或需要兼容类组件时仍然有价值。

| 对比点   | HOC               | Hooks                |
| -------- | ----------------- | -------------------- |
| 逻辑复用 | 通过组件包装实现  | 通过函数直接共享逻辑 |
| 嵌套结构 | 容易产生嵌套地狱  | 逻辑扁平化，清晰易读 |
| 类型支持 | TS 泛型需额外处理 | TS 支持天然更好      |
| 适合场景 | 老项目、类组件    | 新项目、函数组件     |

> **总结**：现代项目优先选择 Hooks，但老项目或类组件仍可使用 HOC。

## 示例

```jsx
const UserList = ({ users }) => (
  <ul>
    {users.map((user) => (
      <li key={user.id}>{user.name}</li>
    ))}
  </ul>
);

function withLoading(WrappedComponent) {
  return function EnhancedComponent({ isLoading, ...props }) {
    if (isLoading) return <div>Loading...</div>;
    return <WrappedComponent {...props} />;
  };
}

const UserListWithLoading = withLoading(UserList);

<UserListWithLoading isLoading={true} users={[]} />;
```
- `UserList` 专注于渲染，不关心数据状态。

- `withLoading` 统一管理 Loading 逻辑，便于复用。