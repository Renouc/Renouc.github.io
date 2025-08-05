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
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { users, loading, error };
}

// 2. UserList.jsx（纯展示组件，只负责把数据渲染成列表）
import React from 'react';

export function UserList({ users }) {
  return (
    <ul>
      {users.map((user) => (
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

#### 2. 职责分层

- 数据层（Data Layer）：与 API 通信或与后端对接的逻辑，通常封装在 `utils` 或自定义 Hook 中（如上例的 `useUsers`）。

- 业务层（Business Logic Layer）：一些纯业务逻辑、状态计算、表单校验等，可以放在单独的模块里，比如 `utils/validateForm.js`、`utils/calculatePrice.js` 等。

- 展示层（Presentation Layer）：真正的 UI 组件，只关心如何把传入的 `props` 渲染成页面，不做异步、网络请求、全局状态管理等操作。

#### 3.侧重职责的“树形结构”

- React 组件本身往往是树形的：父组件可以协调子组件，不进行过多计算。子组件则只专注自己的渲染。

- 保持组件职责单一，让组件彼此之间“职责分工明确”，减少耦合。

## O: 开闭原则 (Open/Closed Principle - OCP)

### 原则定义

对扩展开放，对修改关闭。意思是当需求需要新增功能或变更时，应通过扩展已有代码（如继承、组合、插件化等）来完成，而不是修改原有组件或类的源代码，以免引入潜在风险或破坏已有功能。

### 在 React 中的体现

#### 1. 组件组合与复用

避免直接修改已有组件，而是通过 组件组合（Composition）来扩展功能。

例如：有一个 `Button` 组件，如果你想让它在不同场景下显示不同样式或行为，不要直接改动 `Button.jsx`，而是通过传入不同的 `props`（如 `variant`, `size`, `onClick`）或者使用 高阶组件（HOC）/渲染属性（Render Props）来扩展。

```jsx
// 基础的 Button 组件
export function Button({ variant = 'primary', onClick, children }) {
  const className = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
}

// 在不修改 Button 源码的情况下，通过组合扩展
import { Button } from './Button';
import { ReactComponent as LoadingIcon } from './loading.svg';

export function LoadingButton(props) {
  return (
    <Button {...props}>
      <LoadingIcon style={{ marginRight: 8 }} />
      {props.children}
    </Button>
  );
}
```

#### 2. 使用 Hook 复用逻辑

- 当你需要给某个组件增加新特性（比如表单校验、节流、权限检查等），可通过 Hook 来扩展，而不是在组件内部堆砌 if/else。这样既能减少对原组件的修改，也能保证新的需求点易于维护。

```jsx
// usePermission.js：一个示例 Hook，用于检查用户权限
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function usePermission(requiredRole) {
  const { user } = useContext(AuthContext);
  return user?.roles.includes(requiredRole);
}

// 在业务组件中扩展权限检查，而不修改业务组件内部代码太多
import React from 'react';
import { usePermission } from '../hooks/usePermission';

export function AdminPanel({ children }) {
  const hasAccess = usePermission('admin');

  if (!hasAccess) return <p>无权限访问</p>;
  return <div>{children}</div>;
}
```

#### 3.自定义 Hook + 配置

- 有时业务需求类似，只是具体逻辑或阈值不同，可以把可变的部分以参数形式传入。Hook 与组件都只做“抽象与组合”，保证函数/组件本身不改动就能扩展。

```jsx
// useDebounce.js：通用节流 Hook
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// 在某个搜索组件中使用
import React, { useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';

export function SearchInput({ onSearch }) {
  const [input, setInput] = useState('');
  const debouncedInput = useDebounce(input, 500);

  React.useEffect(() => {
    if (debouncedInput) {
      onSearch(debouncedInput);
    }
  }, [debouncedInput, onSearch]);

  return (
    <input
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="搜索..."
    />
  );
}
```

## L: 里氏替换原则 (Liskov Substitution Principle - LSP)

### 原则定义

子类（或派生类）必须能够替换其基类（父类），且程序的行为不发生改变。换句话说，子类在扩展父类时，不能破坏父类原有的功能预期。

在 React/前端场景中，虽然我们并不常用到类继承，但同样可以把这一原则理解为“可替换性”和“契约一致性”：

- 如果有一组组件或 Hook 它们采用同样的接口规范，应该能相互替换而不影响整体逻辑。

- 如果你在某处期望传入一个“按钮”，无论是 `Button`、`IconButton` 还是 `LinkButton`，都应该在接口上保持一致（比如都接收 `onClick`、`disabled`、`children` 等常见 props）。

### 在 React 中的体现

#### 1. 遵循组件公共 API 规范

例如，当你定义一系列不同类型的按钮组件时，保持 `disabled`、`onClick`、`className` 等常用属性的语义一致，这样父组件在使用时无需关心具体实现，只需将 props 传给子组件即可。

```jsx
// 定义一个标准按钮接口：props 包含 onClick、disabled、children 等
// BaseButton.jsx
export function BaseButton({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// IconButton.jsx：在不改变接口的情况下扩展
import { BaseButton } from './BaseButton';
import { ReactComponent as Icon } from './icon.svg';

export function IconButton({ onClick, disabled, children }) {
  return (
    <BaseButton onClick={onClick} disabled={disabled}>
      <Icon style={{ marginRight: 4 }} />
      {children}
    </BaseButton>
  );
}

// LinkButton.jsx：在不改变接口的情况下扩展为链接样式
import { BaseButton } from './BaseButton';

export function LinkButton({ onClick, disabled, children, href }) {
  if (href) {
    // 将按钮表现为链接
    return (
      <a href={href} className={disabled ? 'link-disabled' : 'link-active'}>
        {children}
      </a>
    );
  }
  return (
    <BaseButton onClick={onClick} disabled={disabled}>
      {children}
    </BaseButton>
  );
}
```

这样在父组件里可以这样写，而不需要关注具体是哪个按钮实现：

```jsx
import { IconButton } from './IconButton';
import { LinkButton } from './LinkButton';

export function Toolbar() {
  return (
    <div>
      <IconButton onClick={() => alert('图标按钮')} disabled={false}>
        图标按钮
      </IconButton>
      <LinkButton href="/home" disabled={false}>
        跳转首页
      </LinkButton>
    </div>
  );
}
```

#### 2. Hook 的可替换性

- 当多个 Hook 具有相同输出格式时，可以相互替换。比如你在一个组件里使用 `useUserData` 或 `useMockUserData`，只要它们都返回 `{ data, loading, error }`，调用方无需修改即可切换。

```jsx
// useUserData.js
export function useUserData() {
  // 实际从后端获取
  return { data: { name: 'Alice' }, loading: false, error: null };
}

// useMockUserData.js
export function useMockUserData() {
  // 测试环境下使用，模拟延迟和错误等
  return { data: { name: 'TestUser' }, loading: false, error: null };
}
```

在组件里可以这样写：

```jsx
import { useUserData as useUserDataReal } from '../hooks/useUserData';
import { useMockUserData } from '../hooks/useMockUserData';

const useUserData =
  process.env.NODE_ENV === 'production' ? useUserDataReal : useMockUserData;

export function Profile() {
  const { data, loading, error } = useUserData();

  if (loading) return <p>加载中...</p>;
  if (error) return <p>加载出错</p>;

  return <div>用户名：{data.name}</div>;
}
```

无论用 `useUserDataReal` 还是 `useMockUserData`，外部代码都能以统一形式消费，符合里氏替换原则。

## I: 接口隔离原则 (Interface Segregation Principle - ISP)

### 原则定义

不应该强迫客户端依赖它们不需要的接口。换言之，一个类似于“胖接口”（包含很多功能）应拆分成多个“瘦接口”，让实现者或使用者只关心自己需要的那一部分。

在前端/React 中，没有像后端那样的显式“接口”定义，但可以把接口理解成组件的 props、Hook 的返回值、Context 的提供值等。ISP 提示我们不要让组件或 Hook 暴露过多与业务无关的属性，保持接口最小化。

### 在 React 中的体现

#### 1. 组件 props “窄接口”

- 如果一个组件接收了很多 props（超过 5 ～ 6 个），可能意味着这个组件职责过重，或者接口不够聚焦。可以考虑拆分接口，或者让部分功能由父组件来负责。

- 例如：一个 Modal 组件，最初设计为接收 `title`, `content`, `onClose`, `onConfirm`, `onCancel`, `footerButtons`, `size`, `visible`, `maskClosable` 等大量 props，就显得接口过于庞大。

- 改进方式：将 `footerButtons`、`size`、`maskClosable` 等可选配置抽离到 `ModalConfig` 里，或使用 Context/Provider 注入默认值，让 `Modal` 只聚焦 “标题 + 内容 + 关闭回调” 这样的最小接口。

```jsx
// 改进前（接口臃肿）
function Modal({
  title,
  content,
  onClose,
  onConfirm,
  onCancel,
  footerButtons,
  size,
  visible,
  maskClosable,
}) {
  // ...渲染逻辑
}

// 改进后：拆分出配置：
function Modal({
  title,
  content,
  onClose,
  footerButtons = [{ text: '关闭', onClick: onClose }],
  size = 'medium',
  maskClosable = true,
  visible,
}) {
  // ...渲染逻辑
}

// 父组件中：
<Modal
  title="提示"
  content={<p>确定要删除吗？</p>}
  onClose={() => setShowModal(false)}
  footerButtons={[
    { text: '取消', onClick: () => setShowModal(false) },
    { text: '确定', onClick: handleDelete },
  ]}
  size="small"
  maskClosable={false}
  visible={showModal}
/>;
```

#### 2. 自定义 Hook 返回值“瘦接口”

避免让 Hook 返回一个巨大的对象，包含大多数都不需要的属性，而是根据不同场景拆分为多个小 Hook。

- 例如：一个 useForm Hook 同时返回 { values, errors, touched, isValid, handleChange, handleBlur, handleSubmit, resetForm, setFieldValue, validateField }，如果某个页面只需要 values 和 handleChange，其他都用不到，就显得不够聚焦。可以拆分成两个 Hook：

- useFormValues：只返回 values、handleChange、handleBlur。

- useFormValidation：只返回 errors, isValid, validateField。

```jsx
// useFormValues.js
import { useState } from 'react';

export function useFormValues(initialValues) {
  const [values, setValues] = useState(initialValues);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(e) {
    // ...可以在这里触发 touched 状态
  }

  return { values, handleChange, handleBlur };
}

// useFormValidation.js
import { useState } from 'react';

export function useFormValidation(values, validateFn) {
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  function validateField(name, value) {
    const errorMsg = validateFn(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    setIsValid(Object.values(errors).every((e) => !e));
  }

  return { errors, isValid, validateField };
}

// 在组件里需要才组合
import { useFormValues } from '../hooks/useFormValues';
import { useFormValidation } from '../hooks/useFormValidation';

function LoginForm() {
  const { values, handleChange, handleBlur } = useFormValues({
    username: '',
    password: '',
  });
  const { errors, isValid, validateField } = useFormValidation(
    values,
    (name, val) => {
      // 简单示例：非空校验
      if (!val) return `${name} 不能为空`;
      return '';
    }
  );

  // ...表单提交流程
}
```

#### 3. Context 的细粒度切分

- 如果你把整个应用状态都放在一个巨大的 Context 里，然后在许多组件里通过 useContext(GlobalContext) 来获取，却只想要其中的一两个字段，这会导致不必要的重渲染，也违背接口隔离原理。

- 改进：根据功能或领域，将全局状态拆分成多个专门的 Context。例如：AuthContext、ThemeContext、CartContext 等，组件只订阅自己关心的 Context。

## D: 依赖倒置原则 (Dependency Inversion Principle - DIP)

### 原则定义

- 高层模块不应该依赖低层模块，二者都应该依赖抽象。

- 抽象不应该依赖细节，细节应该依赖抽象。

也就是说，尽量不要让上层逻辑直接依赖具体实现，而是依赖于接口或抽象，使得实现可以随时替换。

### 在 React 中的体现

#### 1. 通过 Props 或 Context 注入依赖

不要在组件内部直接 import 某些具体实现，而是通过 props 或 Context 把需要的服务/函数/数据注入进来。这样，上层组件只依赖于“抽象接口”（一个回调函数、一个对象），而不依赖于具体实现。

```jsx
// DataService.js：一个具体的数据服务实现
export class DataService {
  fetchUsers() {
    return fetch('/api/users').then((res) => res.json());
  }
}

// IUserService.js：抽象接口（在 JS/TS 中用接口或类型声明）
// 在 JS 中可以用文档说明，或在 TS 中写 interface IUserService { fetchUsers(): Promise<User[]>; }

// UserList.jsx：接受一个抽象的 service，调用它来获取数据
import React, { useEffect, useState } from 'react';

export function UserList({ userService }) {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    userService.fetchUsers().then(setUsers);
  }, [userService]);

  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}

// 在更高层注入具体实现
import React from 'react';
import { DataService } from './DataService';
import { UserList } from './UserList';

const dataService = new DataService();

export function App() {
  return <UserList userService={dataService} />;
}
```

这样，如果将来需要把数据服务换成 MockService、GraphQLService、RESTfulService 等，只需要在注入时替换具体的实现即可，UserList 组件本身不需要改动。

#### 2. Hook 与抽象依赖解耦

- 如果你在 Hook 内部硬编码调用 localStorage、window.fetch 等浏览器 API，当需要在服务端渲染（SSR）或测试时，就会带来不便。可以把具体的存储和请求函数，作为参数传给 Hook，使其依赖于“抽象接口”而非具体实现。

```jsx
// useToken.js：将 storage 依赖抽象出来
import { useState, useEffect } from 'react';

export function useToken(storage, key = 'token') {
  const [token, setToken] = useState(storage.getItem(key) || '');

  function saveToken(newToken) {
    storage.setItem(key, newToken);
    setToken(newToken);
  }

  function clearToken() {
    storage.removeItem(key);
    setToken('');
  }

  return { token, saveToken, clearToken };
}

// 在组件中，只需要按需传入 window.localStorage 或者某个测试时的 mockStorage
import React from 'react';
import { useToken } from '../hooks/useToken';

export function AuthButton() {
  const { token, saveToken, clearToken } = useToken(window.localStorage);
  return (
    <div>
      {token ? (
        <button onClick={clearToken}>退出登录</button>
      ) : (
        <button onClick={() => saveToken('my-token')}>登录</button>
      )}
    </div>
  );
}
```

#### 3. Context + Provider 作为抽象层

- 在较大的应用里，如果你有一个“配置中心”（Config Service）、“权限服务”（Auth Service）等，可以通过 Context 和 Provider，把这些服务以“抽象接口”的形式传递给组件，而不在组件里直接 import 具体的实现。这样更容易做单元测试，也更容易替换实现。

```jsx
// AuthContext.jsx
import React, { createContext, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ authService, children }) {
  return (
    <AuthContext.Provider value={authService}>{children}</AuthContext.Provider>
  );
}

export function useAuthService() {
  const service = useContext(AuthContext);
  if (!service) {
    throw new Error('必须在 AuthProvider 中使用 useAuthService');
  }
  return service;
}
```

在应用根组件里注入具体实现：

```jsx
import React from 'react';
import { AuthProvider } from './AuthContext';
import { RealAuthService } from './RealAuthService';
import { AppRoutes } from './AppRoutes';

export default function App() {
  const authService = new RealAuthService();
  return (
    <AuthProvider authService={authService}>
      <AppRoutes />
    </AuthProvider>
  );
}
```

在任意子组件里使用：

```jsx
import React from 'react';
import { useAuthService } from '../context/AuthContext';

export function ProfilePage() {
  const auth = useAuthService();
  const user = auth.getCurrentUser();
  return <div>欢迎，{user.name}</div>;
}
```

如果以后想改用 MockAuthService 或 SSOAuthService，只需要在最顶层更换注入即可，符合依赖倒置原则。

## 小结与最佳实践建议

### 1. 保持组件/Hook 模块化、职责单一

- 组件只负责渲染，数据获取或业务逻辑通过 Hook 或工具函数完成。

- Hook 只负责某种状态或业务逻辑，输出最小化接口。

### 2. 多用组合，少用继承

- React 本身也鼓励“组合优于继承”。尽量通过 props、Render Props、HOC 或者自定义 Hook 来扩展功能，而不是继承类组件或对组件进行深度修改。

### 3. 定义“契约”（接口/类型）

- 如果你使用 TypeScript，可以给组件或 Hook 定义明确的 interface 或 type，这样在代码里就更容易遵循 ISP 与 DIP，要消除显性依赖时也更直观。

### 4. 利用 Context + Provider 进行依赖注入

- 把“可替换的服务”抽象到 Context 里，以便在不同环境下替换实现（生产环境 VS 测试环境），这也是遵循依赖倒置原则的一种方式。

### 5. 避免“巨无霸组件”与“胖 Hook”

- 代码可读性和可维护性最关键。若发现一个组件/Hook 已包含 200 行代码、逻辑分叉多、props/返回值过多，就要警惕是否违反了 SOLID 原则，是否需要拆分或重构。

### 6. 编写文档与注释，明确责任边界

- 在团队协作时，给每个组件或 Hook 写一个简短的说明，解释它负责什么、不负责什么，方便他人了解和替换。
