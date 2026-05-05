# SOLID 设计原则

SOLID 是一组面向对象设计原则，也可以用于前端组件、Hook、服务模块和业务流程拆分。它的目标不是制造抽象，而是让改动范围更小、依赖关系更清楚。

## 单一职责原则

### 定义

一个模块应该只有一个变化原因。这里的“职责”不是文件只能做一件小事，而是它不应该同时响应多个方向的业务变化。

### 反例

下面的组件同时负责请求、筛选、展示和埋点。任何一个方向变化都会改它。

```tsx
function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        window.analytics.track('users_loaded');
      });
  }, []);

  const visibleUsers = users.filter((user) => user.name.includes(keyword));

  return (
    <section>
      <input value={keyword} onChange={(event) => setKeyword(event.target.value)} />
      {visibleUsers.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </section>
  );
}
```

### 改法

把数据、筛选和展示拆开。组件只组合结果。

```tsx
function useUsers() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  return users;
}

function filterUsers(users: User[], keyword: string) {
  return users.filter((user) => user.name.includes(keyword));
}

function UserListView({ users }: { users: User[] }) {
  return users.map((user) => <div key={user.id}>{user.name}</div>);
}

function UserList() {
  const users = useUsers();
  const [keyword, setKeyword] = useState('');
  const visibleUsers = filterUsers(users, keyword);

  return (
    <section>
      <input value={keyword} onChange={(event) => setKeyword(event.target.value)} />
      <UserListView users={visibleUsers} />
    </section>
  );
}
```

### 检查点

- 修改接口地址时，是否会影响 UI 组件？
- 修改展示样式时，是否会影响数据请求？
- 测试一个函数时，是否需要同时 mock 网络、路由和浏览器 API？
- 文件名是否很难准确描述它的职责？

## 开闭原则

### 定义

软件实体应该对扩展开放，对修改关闭。新增能力时，优先通过新增实现、配置或组合扩展，而不是频繁修改稳定分支。

### 反例

每新增一种支付方式，都要修改同一个函数。

```ts
function pay(type: 'wechat' | 'alipay', amount: number) {
  if (type === 'wechat') {
    return wechatPay(amount);
  }

  if (type === 'alipay') {
    return alipayPay(amount);
  }

  throw new Error('Unsupported payment');
}
```

### 改法

把变化点抽成策略表。新增支付方式时新增实现和注册项。

```ts
type PaymentType = 'wechat' | 'alipay';
type PaymentHandler = (amount: number) => Promise<void>;

const paymentHandlers: Record<PaymentType, PaymentHandler> = {
  wechat: wechatPay,
  alipay: alipayPay,
};

function pay(type: PaymentType, amount: number) {
  const handler = paymentHandlers[type];

  if (!handler) {
    throw new Error(`Unsupported payment: ${type}`);
  }

  return handler(amount);
}
```

如果业务枚举仍然频繁变化，可以把注册能力开放出去。

```ts
const handlers = new Map<string, PaymentHandler>();

export function registerPayment(type: string, handler: PaymentHandler) {
  handlers.set(type, handler);
}

export function pay(type: string, amount: number) {
  const handler = handlers.get(type);
  if (!handler) throw new Error(`Unsupported payment: ${type}`);
  return handler(amount);
}
```

### 检查点

- 新增一种类型时，是否总要修改一个很长的 `if` 或 `switch`？
- 稳定流程和变化点是否混在同一层？
- 分支里的代码是否可以被命名为独立策略？
- 扩展点是否真的被多个场景使用，而不是提前设计？

## 里氏替换原则

### 定义

子类型应该能够替换父类型，并保持调用方的预期不变。换句话说，继承或实现接口后，不能削弱原有契约。

在 TypeScript 中，这个原则更多体现为类型契约和运行行为一致。

### 反例

接口承诺所有 `Storage` 都能 `get` 和 `set`，但实现里偷偷不支持写入。

```ts
interface Storage {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

class ReadonlyStorage implements Storage {
  get(key: string) {
    return localStorage.getItem(key);
  }

  set() {
    throw new Error('Readonly');
  }
}
```

调用方拿到 `Storage` 后会合理认为 `set` 可用，运行时却失败。

### 改法

把能力拆成更准确的契约。

```ts
interface ReadableStorage {
  get(key: string): string | null;
}

interface WritableStorage extends ReadableStorage {
  set(key: string, value: string): void;
}

class BrowserStorage implements WritableStorage {
  get(key: string) {
    return localStorage.getItem(key);
  }

  set(key: string, value: string) {
    localStorage.setItem(key, value);
  }
}

class ReadonlyStorage implements ReadableStorage {
  get(key: string) {
    return localStorage.getItem(key);
  }
}
```

### 检查点

- 子类或实现类是否抛出“我不支持这个方法”？
- 子类型是否收紧了入参要求？
- 子类型是否返回了调用方不预期的空值或异常？
- 接口是否把不总是存在的能力写成了必选能力？

## 接口隔离原则

### 定义

调用方不应该依赖自己用不到的接口。接口越胖，实现成本越高，测试和替换也越困难。

前端中常见问题是组件 props、Hook 返回值或 service 接口过大。

### 反例

按钮只需要 `name`，却被迫接收完整用户对象。

```tsx
type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  permissions: string[];
};

function UserButton({ user }: { user: User }) {
  return <button>{user.name}</button>;
}
```

当 `User` 结构变化时，这个按钮也会被牵连。

### 改法

让组件只依赖自己需要的数据。

```tsx
type UserButtonProps = {
  name: string;
};

function UserButton({ name }: UserButtonProps) {
  return <button>{name}</button>;
}
```

服务接口也一样。读列表的页面不应该依赖创建、删除、导出等能力。

```ts
interface UserReader {
  list(): Promise<User[]>;
  get(id: string): Promise<User>;
}

interface UserWriter {
  create(input: CreateUserInput): Promise<User>;
  remove(id: string): Promise<void>;
}
```

### 检查点

- 组件 props 是否传入了大对象，但只使用其中一两个字段？
- mock 一个依赖时，是否必须实现很多当前测试用不到的方法？
- 修改某个字段类型时，是否触发大量无关组件报错？
- 一个接口是否同时描述读取、写入、导出、上传等多类能力？

## 依赖倒置原则

### 定义

高层业务不应该直接依赖低层细节，而应该依赖抽象。抽象不应该被具体实现牵着走，具体实现应该符合抽象。

它解决的问题是：业务逻辑被网络请求、存储、第三方 SDK 等细节绑死，导致测试和替换困难。

### 反例

业务函数直接依赖 `fetch` 和具体 URL。

```ts
async function loadUserName(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();

  return user.name;
}
```

测试这个函数时必须 mock 全局 `fetch`，切换数据来源也要改业务代码。

### 改法

让业务依赖抽象的数据源。

```ts
interface UserRepository {
  getById(id: string): Promise<{ id: string; name: string }>;
}

async function loadUserName(id: string, repository: UserRepository) {
  const user = await repository.getById(id);
  return user.name;
}

const httpUserRepository: UserRepository = {
  async getById(id) {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  },
};
```

React 中可以通过 props、Context 或构造函数注入依赖，关键是让业务依赖稳定契约，而不是直接依赖请求库或 SDK。

### 检查点

- 业务逻辑是否直接调用第三方 SDK、浏览器 API 或固定 URL？
- 单元测试是否需要 mock 大量全局对象？
- 替换存储或请求库时，是否会影响核心业务函数？
- 抽象是否稳定，还是只是把具体实现换了个名字？

## 使用边界

SOLID 不是要求所有代码都抽象化。小页面、一次性脚本、稳定性要求低的内部工具，可以保持直接实现。

判断是否需要拆分时，优先看真实变化原因，而不是行数。一个 200 行文件如果只有一个变化原因，可以保留；一个 40 行函数如果同时处理鉴权、计费、通知和持久化，就应该拆。
