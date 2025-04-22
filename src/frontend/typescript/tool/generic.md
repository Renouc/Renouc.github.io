# TypeScript 泛型：类型参数化编程 🧩

## 概述 🌟

泛型是 TypeScript 中最重要的特性之一，它允许我们创建可重用的组件，这些组件可以处理多种类型而不是单一类型。泛型就像是类型系统中的变量，让我们能够编写更灵活、更可复用的代码。本文将深入探讨 TypeScript 中泛型的各种应用场景和最佳实践。

## 类型别名中的泛型 🔄

类型别名中的泛型主要用于创建可复用的工具类型。让我们从一个简单的例子开始：

```typescript
// 创建一个排除特定类型的工具类型
type ExcludeType<T, U> = T extends U ? never : T;

// 使用示例
type Result = ExcludeType<"a" | "b" | "c", "a">; // "b" | "c"
```

### 泛型约束与默认值

泛型可以设置默认值和约束条件，这让我们能够创建更灵活和安全的类型：

```typescript
// 带有默认值的泛型
type Factory<T = string> = T | number | boolean;

// 使用默认值
const value1: Factory = "default"; // 使用默认类型 string
const value2: Factory<number> = 42; // 显式指定类型

// 带有约束的泛型
type StatusCode<T extends number> = T extends 200 | 404 | 500
  ? "valid"
  : "invalid";

// 使用约束
type ValidStatus = StatusCode<200>; // "valid"
type InvalidStatus = StatusCode<999>; // "invalid"
// type ErrorStatus = StatusCode<"200">; // 错误：类型 "string" 不满足约束 "number"
```

泛型约束使用 `extends` 关键字，它表示：

- 字面量类型是其基础类型的子类型（如 `"hello" extends string`）
- 联合类型的子集是其父集的子类型（如 `1 | 2 extends 1 | 2 | 3`）
- 更具体的对象类型是更抽象类型的子类型（如 `{ name: string } extends {}`）

在 TypeScript 中，泛型参数存在默认约束。在 TypeScript 3.9 版本以前，这个默认约束是 `any`，而在 3.9 版本以后则为 `unknown`。这意味着当你声明泛型参数时，如果没有指定约束，它会自动具有 `unknown` 的约束。

为了避免不必要的类型约束，TypeScript ESLint 提供了 [no-unnecessary-type-constraint](https://typescript-eslint.io/rules/no-unnecessary-type-constraint/) 规则。这个规则可以帮助你避免声明与默认约束相同的泛型约束。例如：

```typescript
// ❌ 不必要的约束
type Unnecessary<T extends unknown> = T;

// ✅ 正确的写法
type Correct<T> = T;
```

使用这个规则可以帮助你保持代码的简洁性，避免冗余的类型约束声明。

### 多泛型关联

多个泛型参数可以相互关联，创建更复杂的类型关系：

```typescript
// 条件类型工具
type Conditional<Type, Condition, TruthyResult, FalsyResult> =
  Type extends Condition ? TruthyResult : FalsyResult;

// 使用示例
type Result1 = Conditional<"typescript", string, "valid", "invalid">; // "valid"
type Result2 = Conditional<42, string, "valid", "invalid">; // "invalid"

// 关联泛型参数
type ProcessInput<
  Input,
  SecondInput extends Input = Input,
  ThirdInput extends Input = SecondInput
> = {
  first: Input;
  second: SecondInput;
  third: ThirdInput;
};

// 使用示例
type Result3 = ProcessInput<string>; // { first: string; second: string; third: string }
type Result4 = ProcessInput<string, "literal">; // { first: string; second: "literal"; third: "literal" }
```

## 对象类型中的泛型 📦

泛型在对象类型中的应用非常广泛，特别是在 API 响应和数据结构定义中：

```typescript
// 通用响应接口
interface ApiResponse<TData = unknown> {
  code: number;
  message: string;
  data: TData;
}

// 用户信息接口
interface UserInfo {
  id: number;
  name: string;
  email: string;
}

// 分页响应接口
interface PaginatedResponse<TItem> {
  items: TItem[];
  total: number;
  page: number;
  pageSize: number;
}

// 使用示例
type UserResponse = ApiResponse<UserInfo>;
type UserListResponse = ApiResponse<PaginatedResponse<UserInfo>>;

// 实际使用
async function fetchUser(id: number): Promise<UserResponse> {
  // 实现获取用户信息的逻辑
}

async function fetchUsers(page: number): Promise<UserListResponse> {
  // 实现获取用户列表的逻辑
}
```

## 函数中的泛型 🛠️

### 泛型函数基础

泛型函数让我们能够创建可处理多种类型的函数。在 TypeScript 中，泛型参数可以根据其确定时机分为两种：

1. **调用时确定的泛型**：

```typescript
// 使用类型别名定义
type Fn1 = <T>(arg: T) => T;

// 直接定义函数
function fn1<T>(arg: T): T {
  return arg;
}

// 使用时自动推断类型
const result1 = fn1("hello"); // 类型是 "hello"
const result2 = fn1(42); // 类型是 42
```

2. **类型标签时确定的泛型**：

```typescript
// 使用类型别名定义
type Fn2<T> = (arg: T) => T;

// 直接定义函数
function fn2<T>(arg: T): T {
  return arg;
}

// 使用时必须指定具体类型
const processor1: Fn2<string> = (arg) => arg;
const processor2: Fn2<number> = (arg) => arg;
```

这两种方式的区别和适用场景：

- **调用时确定的泛型**：

  - 泛型参数在函数调用时才确定
  - 可以保持输入值的字面量类型
  - 提供更精确的类型推断
  - 适合需要动态类型处理的场景

- **类型标签时确定的泛型**：
  - 泛型参数在定义类型时就确定
  - 适合需要预先知道具体类型的场景
  - 类型约束更严格，但灵活性较低
  - 常用于定义具体的类型结构

### 泛型函数实践

让我们通过实际场景来演示两种函数泛型的区别：

1. **调用时确定的泛型** - 适合需要动态类型处理的场景：

```typescript
// 验证规则类型
type ValidationRule<T> = {
  field: keyof T;
  required?: boolean;
  type?: "string" | "number" | "boolean";
  min?: number;
  max?: number;
};

// 验证结果类型
type ValidationResult = {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
};

// 数据验证函数
type Validator = <T>(data: T, rules: ValidationRule<T>[]) => ValidationResult;

// 使用示例
const validate: Validator = (data, rules) => {
  // 实现验证逻辑
  // ...
  return { isValid: true, errors: [] };
};

// 验证用户数据
const user = { name: "typescript", age: 5 };

const userResult = validate(user, [
  { field: "name", required: true },
  { field: "age", min: 0 },
]); // 自动推断类型

// 验证产品数据
const product = { id: 1, price: 99.99 };
const productResult = validate(product, [
  { field: "id", type: "number" },
  { field: "price", min: 0 },
]); // 自动推断类型
```

2. **类型标签时确定的泛型** - 适合需要预先知道具体类型的场景：

```typescript
// 数据处理器接口
type DataProcessor<T> = (data: T) => T;

// 用户数据处理
const userProcessor: DataProcessor<{ name: string; age: number }> = (data) => ({
  ...data,
  name: data.name.toUpperCase(),
});

// 产品数据处理
const productProcessor: DataProcessor<{ id: number; price: number }> = (
  data
) => ({
  ...data,
  price: data.price * 1.1, // 增加 10% 的价格
});

// 使用示例
const processedUser = userProcessor({ name: "typescript", age: 5 });
const processedProduct = productProcessor({ id: 1, price: 99.99 });
```

这两种方式的区别在实际应用中的体现：

- **调用时确定的泛型**：

  - 适合处理多种类型的数据
  - 类型推断更灵活
  - 不需要预先知道具体类型
  - 常用于工具函数和通用处理逻辑

- **类型标签时确定的泛型**：
  - 适合特定类型的数据处理
  - 类型约束更严格
  - 需要预先定义具体类型
  - 常用于特定领域的业务逻辑

## Class 中的泛型 🏗️

泛型类让我们能够创建可处理多种类型的类：

```typescript
// 泛型队列类
class Queue<T> {
  private items: T[] = [];

  constructor(initialItems: T[] = []) {
    this.items = initialItems;
  }

  // 入队
  enqueue(item: T): void {
    this.items.push(item);
  }

  // 出队
  dequeue(): T | undefined {
    return this.items.shift();
  }

  // 获取队列长度
  get length(): number {
    return this.items.length;
  }

  // 清空队列
  clear(): void {
    this.items = [];
  }
}

// 使用示例
const numberQueue = new Queue<number>([1, 2, 3]);
numberQueue.enqueue(4);
const firstNumber = numberQueue.dequeue(); // number | undefined

const stringQueue = new Queue<string>();
stringQueue.enqueue("hello");
const firstString = stringQueue.dequeue(); // string | undefined
```

## 泛型工具类型 🧰

TypeScript 提供了一些内置的泛型工具类型：

```typescript
// Partial<T> - 使所有属性变为可选
type PartialUser = Partial<UserInfo>;
// { id?: number; name?: string; email?: string; }

// Readonly<T> - 使所有属性变为只读
type ReadonlyUser = Readonly<UserInfo>;
// { readonly id: number; readonly name: string; readonly email: string; }

// Pick<T, K> - 从类型中选择部分属性
type UserName = Pick<UserInfo, "name">;
// { name: string; }

// Record<K, T> - 创建键值对类型
type UserMap = Record<string, UserInfo>;
// { [key: string]: UserInfo; }
```

## 最佳实践与总结 🎯

1. **优先使用泛型而非 any**：

   - 泛型提供了类型安全，而 any 会失去类型检查
   - 使用泛型可以让代码更可维护和可预测

2. **合理使用泛型约束**：

   - 使用 extends 关键字添加必要的约束
   - 避免过度约束，保持灵活性

3. **注意泛型推断**：

   - TypeScript 会自动推断泛型类型
   - 在必要时显式指定泛型类型

4. **避免泛型滥用**：

   - 只在真正需要类型参数化时使用泛型
   - 不要为了使用泛型而使用泛型

5. **使用内置工具类型**：
   - 利用 TypeScript 提供的泛型工具类型
   - 根据需要创建自定义工具类型

通过合理使用泛型，我们可以：

- 提高代码的复用性
- 增强类型安全性
- 减少重复代码
- 创建更灵活的 API

记住，泛型是 TypeScript 类型系统的强大工具，但也要注意适度使用，避免过度设计。💪
