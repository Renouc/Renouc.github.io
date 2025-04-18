# TypeScript 类型安全保障 🛡️

## 概述 🌟

TypeScript 的核心优势之一是它强大的类型系统，可以在编译时捕获潜在的类型错误。本文将探讨 TypeScript 提供的类型安全保障机制，包括类型查询、类型守卫和类型断言守卫，这些工具可以帮助我们构建更加健壮、类型安全的应用程序。就像是给你的代码加上了安全带和防护罩，让你在高速行驶时依然能安枕无忧！🚀

## 类型查询操作符 typeof 🔍

TypeScript 中存在两种不同的 `typeof` 操作符：

1. **JavaScript 中的 `typeof`**：用于运行时检查变量类型，返回 `"string"` / `"number"` / `"object"` / `"undefined"` 等值
2. **TypeScript 的类型查询 `typeof`**：用于获取变量的 TypeScript 类型，即 **Type Query Operator**

下面是 TypeScript 类型查询操作符的示例：

```typescript
const str = "typescript";

const obj = { name: "typescript" };

const nullVar = null;
const undefinedVar = undefined;

const func = (input: string) => {
  return input.length > 10;
};

// 使用 typeof 进行类型查询
type Str = typeof str; // "typescript" (字面量类型)
type Obj = typeof obj; // { name: string; }
type Null = typeof nullVar; // null
type Undefined = typeof undefinedVar; // undefined
type Func = typeof func; // (input: string) => boolean
```

类型查询操作符 `typeof` 在实际开发中非常有用，特别是当你需要复用已有变量的类型时 🔄：

```typescript
// 在类型标注中使用 typeof
const func = (input: string) => {
  return input.length > 10;
};

// 复用函数类型
const func2: typeof func = (name: string) => {
  return name === "typescript";
};

// 在工具类型中使用 typeof
type FuncReturnType = ReturnType<typeof func>; // boolean
```

需要注意的是，`typeof` 返回的类型通常是最窄的推导结果，可以精确到字面量类型的级别。TypeScript 会自动区分逻辑代码中的 JavaScript `typeof` 和类型代码中的类型查询 `typeof`，你不必担心混淆 🙂。

另外，为了保持类型层和逻辑层的隔离，类型查询操作符后不允许使用表达式：

```typescript
const isInputValid = (input: string) => {
  return input.length > 10;
}

// ❌ 错误：不允许在类型查询操作符后使用表达式
let isValid: typeof isInputValid("typescript"); 
```

## 类型守卫 🛡️

TypeScript 提供了强大的类型控制流分析能力，它会根据代码逻辑自动收窄类型。这种能力称为**类型的控制流分析**（Control Flow Analysis），它能让 TypeScript 根据条件分支推断出更精确的类型。

### 基于 typeof 的类型守卫

最常见的类型守卫是使用 `typeof` 操作符：

```typescript
function processValue(value: string | number) {
  if (typeof value === "string") {
    // 在这个分支中，TypeScript 知道 value 是 string 类型
    return value.toUpperCase();
  } else {
    // 在这个分支中，TypeScript 知道 value 是 number 类型
    return value.toFixed(2);
  }
}
```

类型控制流分析就像一条河流 🌊，流经每个条件分支时都会收集类型信息，让类型变得更加精确：

```typescript
declare const strOrNumOrBool: string | number | boolean;

if (typeof strOrNumOrBool === "string") {
  // 在这里 strOrNumOrBool 是 string 类型
  strOrNumOrBool.charAt(1);
} else if (typeof strOrNumOrBool === "number") {
  // 在这里 strOrNumOrBool 是 number 类型
  strOrNumOrBool.toFixed();
} else if (typeof strOrNumOrBool === "boolean") {
  // 在这里 strOrNumOrBool 是 boolean 类型
  strOrNumOrBool === true;
} else {
  // 穷尽检查：如果所有类型都处理完毕，这里应该是 never 类型
  // 这是一种确保处理了所有可能类型的好方法 ✅
  const _exhaustiveCheck: never = strOrNumOrBool;
  throw new Error(`Unknown type: ${_exhaustiveCheck}`);
}
```

### 使用 is 关键字的自定义类型守卫

当我们将类型检查逻辑提取到单独的函数中时，简单的返回 `boolean` 并不足以传递类型信息。这时候，我们需要使用 TypeScript 提供的 **is 关键字**来创建自定义类型守卫：

```typescript
// ❌ 不会传递类型信息的函数
function isStringSimple(input: unknown): boolean {
  return typeof input === "string";
}

// ✅ 使用 is 关键字创建类型守卫
function isString(input: unknown): input is string {
  return typeof input === "string";
}

function processInput(input: string | number) {
  // 使用普通函数，TypeScript 无法收窄类型
  if (isStringSimple(input)) {
    // ❌ 错误：TypeScript 不知道 input 是 string 类型
    // input.toUpperCase();
  }
  
  // 使用类型守卫，TypeScript 可以收窄类型
  if (isString(input)) {
    // ✅ 正确：TypeScript 知道 input 是 string 类型
    input.toUpperCase();
  } else {
    // 在这个分支中，input 是 number 类型
    input.toFixed(2);
  }
}
```

自定义类型守卫的语法是 `parameterName is Type`，其中：
- `parameterName` 是函数的参数名
- `is Type` 表示如果函数返回 `true`，则参数的类型可以被收窄为 `Type`

需要注意的是，TypeScript 并不会验证类型守卫函数的逻辑是否真的能确保参数是声明的类型 ⚠️：

```typescript
// 危险但有效的类型守卫：逻辑与类型声明不匹配
function isNumber(input: unknown): input is number {
  // 错误的实现：即使返回 true，input 也可能不是 number 类型
  return typeof input === "string";
}

function process(input: string | number) {
  if (isNumber(input)) {
    // TypeScript 相信你的类型守卫，认为 input 是 number 类型
    // 但实际上这里的 input 很可能是 string 类型！
    // 这可能导致运行时错误
    console.log(input.toFixed(2));
  }
}
```

类型守卫非常灵活，可以用于各种复杂类型：

```typescript
// 判断是否为空值（false、""、0、null、undefined）
export type Falsy = false | "" | 0 | null | undefined;
export const isFalsy = (val: unknown): val is Falsy => !val;

// 判断是否为原始类型
export type Primitive = string | number | boolean | undefined;
export const isPrimitive = (val: unknown): val is Primitive =>
  ["string", "number", "boolean", "undefined"].includes(typeof val);
```

### 基于 in 的类型守卫

JavaScript 的 `in` 操作符用于检查属性是否存在于对象或其原型链中。在 TypeScript 中，它也可以用作类型守卫：

```typescript
interface User {
  name: string;
  email: string;
  loginCount: number;
}

interface Admin {
  name: string;
  email: string;
  adminSince: Date;
  privileges: string[];
}

function displayDetails(account: User | Admin) {
  console.log(`Name: ${account.name}, Email: ${account.email}`);
  
  // 使用 in 操作符区分类型
  if ("adminSince" in account) {
    // account 是 Admin 类型
    console.log(`Admin since: ${account.adminSince.toDateString()}`);
    console.log(`Privileges: ${account.privileges.join(", ")}`);
  } else {
    // account 是 User 类型
    console.log(`Login count: ${account.loginCount}`);
  }
}
```

### 基于 instanceof 的类型守卫

`instanceof` 操作符检查对象是否是某个类的实例，在 TypeScript 中可以用于收窄类型：

```typescript
class BasicUser {
  constructor(public name: string, public email: string) {}
  
  displayInfo() {
    console.log(`User: ${this.name}, ${this.email}`);
  }
}

class PremiumUser extends BasicUser {
  constructor(
    name: string,
    email: string,
    public memberSince: Date,
    public subscriptionTier: "silver" | "gold" | "platinum"
  ) {
    super(name, email);
  }
  
  upgradeTier(newTier: "silver" | "gold" | "platinum") {
    this.subscriptionTier = newTier;
  }
}

function processUser(user: BasicUser | PremiumUser) {
  // 基础信息对所有用户通用
  user.displayInfo();
  
  // 使用 instanceof 收窄类型
  if (user instanceof PremiumUser) {
    // 这里 TypeScript 知道 user 是 PremiumUser 类型
    console.log(`Member since: ${user.memberSince.toDateString()}`);
    console.log(`Tier: ${user.subscriptionTier}`);
    
    // 可以调用 PremiumUser 特有的方法
    if (user.subscriptionTier === "silver") {
      user.upgradeTier("gold");
    }
  }
}
```

### 可辨识联合类型

**可辨识联合类型**（Discriminated Unions 或 Tagged Union）是 TypeScript 中一种强大的模式，它通过共同的字面量属性（可辨识属性）来区分联合类型中的成员：

```typescript
// 使用 kind 属性作为可辨识属性
interface Circle {
  kind: "circle";  // 字面量类型作为标记
  radius: number;
}

interface Square {
  kind: "square";  // 字面量类型作为标记
  sideLength: number;
}

interface Rectangle {
  kind: "rectangle";  // 字面量类型作为标记
  width: number;
  height: number;
}

// 形状联合类型
type Shape = Circle | Square | Rectangle;

// 计算面积函数
function calculateArea(shape: Shape): number {
  // 使用可辨识属性区分不同的形状
  switch (shape.kind) {
    case "circle":
      // 这里 TypeScript 知道 shape 是 Circle 类型
      return Math.PI * shape.radius ** 2;
      
    case "square":
      // 这里 TypeScript 知道 shape 是 Square 类型
      return shape.sideLength ** 2;
      
    case "rectangle":
      // 这里 TypeScript 知道 shape 是 Rectangle 类型
      return shape.width * shape.height;
      
    default:
      // 穷尽检查：如果添加了新的形状类型但忘记处理，这里会捕获错误
      const _exhaustiveCheck: never = shape;
      throw new Error(`Unsupported shape: ${_exhaustiveCheck}`);
  }
}

// 使用示例
const circle: Circle = { kind: "circle", radius: 5 };
console.log(calculateArea(circle));  // 78.54...

const square: Square = { kind: "square", sideLength: 4 };
console.log(calculateArea(square));  // 16
```

可辨识联合类型的关键在于每个类型都有一个**可辨识属性**（Discriminant Property），这个属性通常是字面量类型，且在每个类型成员中取值不同。

除了共同的字面量属性外，结构上的差异也可以用来区分类型：

```typescript
interface ArrayConfig {
  data: string[];
  // 没有 maxLength 属性
}

interface StringConfig {
  data: string;
  maxLength: number;
}

type Config = ArrayConfig | StringConfig;

function processConfig(config: Config) {
  if (Array.isArray(config.data)) {
    // config 是 ArrayConfig 类型
    console.log(`Array data with ${config.data.length} items`);
  } else {
    // config 是 StringConfig 类型
    console.log(`String data with max length ${config.maxLength}`);
  }
}
```

需要注意的是，普通的 `typeof` 检查对可辨识联合类型中的对象类型不够精确：

```typescript
interface Dog {
  kind: "dog";
  bark(): void;
  dogName: string;
}

interface Cat {
  kind: "cat";
  meow(): void;
  catName: string;
}

type Pet = Dog | Cat;

function handlePet(pet: Pet) {
  // ❌ 这种检查不起作用，因为两者的 diffType 属性类型不同但都是对象类型
  if (typeof pet.dogName === "string") {
    // 错误：TypeScript 不能确定 pet 是 Dog 类型
    // pet.bark();
  }
  
  // ✅ 正确的做法是使用可辨识属性
  if (pet.kind === "dog") {
    // 正确：TypeScript 知道 pet 是 Dog 类型
    pet.bark();
    console.log(pet.dogName);
  } else {
    // 正确：TypeScript 知道 pet 是 Cat 类型
    pet.meow();
    console.log(pet.catName);
  }
}
```

## 类型断言守卫 🔒️

TypeScript 3.7 引入了一种特殊的类型守卫 —— **类型断言守卫**（Type Assertion Guards）。与普通类型守卫不同，类型断言守卫在条件不满足时会抛出错误，而不仅仅是收窄类型。

### 使用 asserts 关键字

断言守卫使用 `asserts` 关键字声明，表示如果函数成功返回（没有抛出错误），则其断言条件必定为真：

```typescript
import assert from "assert";

let name: any = "typescript";

// 使用 Node.js 的 assert 函数
assert(typeof name === "number");

// 如果断言通过（运行时不会），name 的类型在后续代码中被视为 number
name.toFixed();
```

TypeScript 3.7 引入了 `asserts` 关键字，专门用于声明断言守卫函数：

```typescript
// 声明一个简单的断言函数
function assert(condition: any, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

let value: unknown = "hello";

// 使用断言
assert(typeof value === "string");

// 断言通过后，TypeScript 知道 value 一定是 string 类型
value.toUpperCase();
```

在这个例子中，`asserts condition` 告诉 TypeScript：如果 `assert` 函数成功返回，那么传入的 `condition` 表达式在后续代码中必定为真。

### 结合 is 关键字的高级断言守卫

`asserts` 关键字可以与 `is` 关键字结合使用，创建更精确的类型断言守卫：

```typescript
// 声明一个断言 value 是 number 类型的函数
function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== "number") {
    throw new Error(`Expected number, got ${typeof value}`);
  }
}

let data: unknown = 42;

// 使用断言守卫
assertIsNumber(data);

// 断言通过后，TypeScript 知道 data 是 number 类型
console.log(data.toFixed(2));

// 如果断言失败，后续代码不会执行
```

使用 `asserts parameterName is Type` 语法的断言守卫比直接使用条件表达式更加灵活，因为它允许将类型检查逻辑封装在函数内部，实现更好的代码组织和复用 📦：

```typescript
// 创建一系列类型断言函数
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`Expected string, got ${typeof value}`);
  }
}

function assertIsArray<T>(value: unknown): asserts value is T[] {
  if (!Array.isArray(value)) {
    throw new Error("Expected array");
  }
}

function assertIsObject(value: unknown): asserts value is object {
  if (typeof value !== "object" || value === null) {
    throw new Error(`Expected object, got ${value === null ? "null" : typeof value}`);
  }
}

// 使用断言守卫处理 API 响应
function processAPIResponse(response: unknown) {
  assertIsObject(response);
  
  // 现在 TypeScript 知道 response 是对象类型
  if ("data" in response) {
    const { data } = response as { data: unknown };
    
    assertIsArray<unknown>(data);
    // 现在 TypeScript 知道 data 是数组类型
    
    console.log(`Processing ${data.length} items`);
    
    // 处理数组中的每个元素
    data.forEach(item => {
      // 进一步使用断言守卫细化类型...
    });
  }
}
```

## 最佳实践与总结 🎯

TypeScript 的类型守卫和断言守卫是构建类型安全应用程序的强大工具。以下是一些最佳实践建议：

1. **优先使用类型守卫而非类型断言**：类型守卫（`if (typeof x === 'string')`）比类型断言（`x as string`）更安全，因为它们基于运行时的实际类型 🛡️

2. **创建可重用的类型守卫函数**：将常用的类型检查逻辑提取到带有 `is` 关键字的函数中，提高代码复用性和可读性

3. **使用可辨识联合类型**：为复杂对象类型添加标签属性（如 `kind`, `type`），便于类型区分

4. **添加穷尽性检查**：在处理联合类型时，使用 `never` 类型和默认分支确保处理了所有可能的类型

5. **将断言守卫用于前置条件验证**：断言守卫非常适合验证函数参数，确保后续代码在有效输入的基础上运行

6. **区分类型守卫和断言守卫的适用场景**：
   - 类型守卫：类型分支处理，条件渲染等场景
   - 断言守卫：参数验证，前置条件检查等场景

通过合理运用这些技术，我们可以构建类型安全、易于维护的 TypeScript 应用程序。类型守卫将运行时的类型检查与静态类型系统无缝结合，让我们既能享受 TypeScript 强大的类型检查，又能灵活处理动态数据和复杂类型关系。💪