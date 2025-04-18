# TypeScript 类型工具：创建与组合 🧩

## 概述 🌟

在 TypeScript 的类型系统中，类型工具可以根据使用目的分为**类型创建**与**类型安全保护**两大类。本文将专注于类型创建工具，它们的作用是基于已有的类型创建新的类型，包括类型别名、联合类型、交叉类型、索引类型与映射类型。让我们一起探索这些强大的工具吧！想象一下，这些工具就像乐高积木 🧱，让我们能够搭建出各种精巧的类型结构~

## 类型别名 ✍️

### 基础用法 🔤

类型别名是 TypeScript 类型编程中最基础也最重要的功能之一，它使用 `type` 关键字来为现有类型创建一个新名称。就像给自己的好朋友起一个昵称一样简单！😊

```typescript
// 创建基本类型的别名
type StringType = string;
type NumberType = number;

// 为联合类型创建别名
type StatusCode = 200 | 301 | 400 | 500 | 502;
type PossibleDataTypes = string | number | (() => unknown);

// 使用类型别名
const status: StatusCode = 502;
```

类型别名的主要作用是对类型进行封装和复用。它可以应用在各种场景，就像是给常用的东西贴上标签，方便以后快速取用 🏷️：

```typescript
// 函数类型别名
type Handler = (e: Event) => void;

const clickHandler: Handler = (e) => {};
const moveHandler: Handler = (e) => {};
const dragHandler: Handler = (e) => {}; // 看，多整洁！👌

// 对象类型别名
type Person = {
  name: string;
  age: number;
};

const user: Person = {
  name: "TypeScript",
  age: 11  // 永远年轻！🎂
};
```

### 工具类型 🛠️

当类型别名接受泛型参数时，它就升级成了**工具类型**。工具类型就像函数一样，接收类型参数并返回新的类型。这简直就是类型世界的"变形金刚"！🤖

```typescript
// 基本工具类型
type Factory<T> = T | number | string;

// 使用工具类型
type BooleanOrNumOrStr = Factory<boolean>;
const foo: BooleanOrNumOrStr = true; // 也可以是 number 或 string
```

实际开发中常用的简单工具类型示例，这些小帮手会让你的编码生活轻松不少 💪：

```typescript
// 可能为空的类型（就像有时候快递可能会丢失 📦）
type MaybeNull<T> = T | null;

// 可能为数组的类型（单个苹果或一筐苹果 🍎）
type MaybeArray<T> = T | T[];

// 可能为 Promise 的类型（同步或异步都能处理 ⏱️）
type MaybePromise<T> = T | Promise<T>;

// 函数示例：确保输入始终是数组
function ensureArray<T>(input: MaybeArray<T>): T[] {
  return Array.isArray(input) ? input : [input];
}
```

## 联合类型 🔀

### 基本概念与语法 📝

**联合类型**（Union Types）表示一个值可以是多种类型之一。使用竖线（`|`）分隔每个类型，有点像"二选一"或"多选一"的感觉。就像点外卖时可以选择中餐或西餐，但不能同时是两种 🍜🍔：

```typescript
type StringOrNumber = string | number;

// 可以是字符串
const value1: StringOrNumber = "Hello";
// 也可以是数字
const value2: StringOrNumber = 42;
// 但不能是其他类型
// const value3: StringOrNumber = true; // 错误：布尔值不能赋给 string | number 类型
```

联合类型在实际开发中非常常见，就像是给变量提供了多种可能性，让它不拘一格 🎭：

```typescript
// 函数参数可接受多种类型
function printId(id: number | string) {
  console.log(`ID: ${id}`);
}

// 可能的API响应状态（生活就像API，充满了各种状态 😂）
type ApiResponse = 
  | { status: "success"; data: any }
  | { status: "error"; error: string }
  | { status: "loading" };

// 使用联合类型处理复杂场景
type Route = 
  | { path: "/users"; search: { sortBy: "name" | "age" } }
  | { path: "/user"; params: { id: string } }
  | { path: "/settings" };
```

### 类型收窄 🔍

在使用联合类型时，你只能访问所有成员类型共有的属性和方法。如果需要访问特定类型的属性，必须先进行类型收窄（有点像给类型"划重点"）。这就像是你有一把万能钥匙 🔑，但要用在特定的锁上，先得确认是哪种锁：

```typescript
function getLength(value: string | string[]) {
  // length 是 string 和 string[] 都有的属性
  return value.length;
}

function process(value: string | number) {
  // 错误：number 类型没有 toUpperCase 方法
  // return value.toUpperCase();

  // 正确：使用类型守卫进行类型收窄
  if (typeof value === "string") {
    return value.toUpperCase(); // 这里 value 的类型被收窄为 string
  } else {
    return value * 2; // 这里 value 的类型被收窄为 number
  }
}
```

## 交叉类型 🤝

### 基本概念与语法 📐

如果联合类型（`|`）表示"或"关系，那么交叉类型（`&`）就表示"与"关系。交叉类型要求同时满足所有成员类型的要求，就像是多种特性的"大集合"。这就像是超级英雄合体，同时拥有多种超能力！💪

```typescript
interface NameStruct {
  name: string;
}

interface AgeStruct {
  age: number;
}

// 交叉类型：同时具有 name 和 age 属性
type ProfileStruct = NameStruct & AgeStruct;

const profile: ProfileStruct = {
  name: "TypeScript",
  age: 11
}; // ✅ 同时包含两个接口的所有属性
```

### 合并规则 🧩

1. **原始类型交叉**：两个不兼容的原始类型交叉会得到 `never` 类型，因为不存在同时属于两种原始类型的值（有点像圆和方不可能同时存在）。就像猫和狗没法合体成"猫狗" 🐱🐶：

```typescript
type StrAndNum = string & number; // never
```

2. **对象类型交叉**：对象类型的交叉是属性的合并，同名属性的类型也会进行交叉。这就像把两套家具组合到一个房间里 🏠：

```typescript
type Struct1 = {
  primitiveProp: string;
  objectProp: {
    name: string;
  };
};

type Struct2 = {
  primitiveProp: number;
  objectProp: {
    age: number;
  };
};

type Composed = Struct1 & Struct2;

// 同名原始类型属性交叉为 never（水火不容 💧🔥）
type PrimitivePropType = Composed["primitiveProp"]; // never

// 同名对象类型属性会合并（和平共处 ☮️）
type ObjectPropType = Composed["objectProp"]; // { name: string; age: number; }
```

3. **联合类型交叉**：两个联合类型的交叉结果是它们的交集（就像两个集合取共同部分）。就像朋友圈的共同好友 👥：

```typescript
type UnionIntersection1 = (1 | 2 | 3) & (1 | 2); // 1 | 2
type UnionIntersection2 = (string | number | symbol) & string; // string
```

### 联合与交叉类型对比 📊

联合类型和交叉类型看似相反，但各有适用场景，就像刀叉一样，各司其职 🍴：


| 特性 | 联合类型 (\|) | 交叉类型 (&) |
|------|--------------|--------------|
| 表达的关系 | "或" - 满足任一成员类型 | "与" - 同时满足所有成员类型 |
| 主要用途 | 表示值可以是多种类型之一 | 合并多个类型的特性 |
| 对象类型时 | 只能访问共有属性 | 包含所有类型的所有属性 |
| 原始类型时 | 可以是任一原始类型 | 通常得到 `never` |
| 示例 | `string \| number` | `NameStruct & AgeStruct` |


```typescript
// 联合类型：可以是任一类型（就像选择题 ✅）
function render(content: string | HTMLElement) {
  // ...
}

// 交叉类型：同时具有多个特性（就像填空题 📝）
type Admin = User & { privileges: string[] };
```

## 索引类型 🔑

索引类型是 TypeScript 中一个重要的概念，它包含三个相关但不同的功能。掌握这些功能，就像拥有了对象属性的"万能钥匙"！打开各种类型的大门，让代码更加灵活自如 🚪

### 索引签名类型 📝

索引签名类型允许我们在接口或类型别名中定义具有动态键名但固定键值类型的对象。就像一个抽屉，你不知道里面具体有什么，但知道都是同一类物品 🗄️：

```typescript
// 所有键值都是字符串类型的对象
interface StringRecord {
  [key: string]: string;
}

const dictionary: StringRecord = {
  name: "TypeScript",
  version: "4.7",  // 必须是字符串
  // count: 42      // 错误：类型必须是字符串
};
```

索引签名类型的特点：

1. 可以混合具体属性和索引签名（固定的椅子和随意摆放的装饰品 🪑）：

```typescript
interface StringRecord {
  id: string;              // 具体属性
  [key: string]: string;   // 索引签名
}
```

2. 索引签名的键类型只能是 `string`、`number` 或 `symbol`（钥匙只有这三种材质 🔑）：

```typescript
interface ValidRecord {
  [key: string]: any;   // ✅
  [key: number]: any;   // ✅
  [key: symbol]: any;   // ✅
}
```

3. 当混合具体属性时，具体属性的类型必须是索引签名类型的子类型（大盒子里的小盒子必须符合大盒子的规则 📦）：

```typescript
interface MixedRecord {
  name: string;            // ✅ string 是 string 的子类型
  // count: number;        // ❌ number 不是 string 的子类型
  [key: string]: string;
}

// 使用联合类型解决（加宽大盒子的规格 📏）
interface BetterMixedRecord {
  name: string;
  count: number;
  [key: string]: string | number;  // 使用联合类型
}
```

### 索引类型查询 (keyof) 🔍

`keyof` 操作符可以获取一个类型的所有键名，并将它们组合成一个联合类型，就像是获取对象的"钥匙串"。这就像是知道一栋房子里有哪些房间的名称，而不需要真正进去 🏠：

```typescript
interface Person {
  name: string;
  age: number;
  address: string;
}

type PersonKeys = keyof Person; // "name" | "age" | "address"
```

对于带有数字索引的类型，`keyof` 会保留数字索引的类型（数字钥匙和文字钥匙 🔢🔤）：

```typescript
interface WithNumberIndex {
  [index: number]: string;
  length: number;
}

type Keys = keyof WithNumberIndex; // number | "length"
```

`keyof any` 会生成所有可能的对象键类型的联合：`string | number | symbol`。就像是万能钥匙串，啥锁都能配 🗝️！

### 索引类型访问 🔎

索引类型访问允许我们使用类型作为索引来访问其他类型的属性类型，就像使用钥匙打开特定的锁。这就像是知道了房间名，还能知道里面放的是什么家具 🛋️：

```typescript
interface Person {
  name: string;
  age: number;
}

// 使用字面量类型进行访问
type NameType = Person["name"]; // string
type AgeType = Person["age"];   // number

// 使用类型变量进行访问
type PropType<T, K extends keyof T> = T[K];
type PersonNameType = PropType<Person, "name">; // string
```

当使用联合类型进行索引访问时，结果是每个成员访问结果的联合（用一串钥匙打开一排锁 🔐）：

```typescript
interface Person {
  name: string;
  age: number;
  address: string;
}

// 使用 keyof 获取所有属性类型的联合
type AllValueTypes = Person[keyof Person]; // string | number
```

## 映射类型 🔄

### 基本语法 ⚙️

映射类型是 TypeScript 中最强大的类型工具之一，它允许我们基于现有类型的属性创建新类型。映射类型的语法类似于索引签名，但使用 `in` 关键字来遍历一组键。这有点像对象属性的"批量处理机"，就像是一条生产线，把所有零件都处理一遍 🏭：

```typescript
type Stringify<T> = {
  [K in keyof T]: string;
};

interface Person {
  name: string;
  age: number;
  isAdmin: boolean;
}

// 将所有属性转换为字符串类型
type StringifiedPerson = Stringify<Person>;
/* 等价于：
{
  name: string;
  age: string;
  isAdmin: string;
}
*/
```

映射类型的工作原理类似于这样的伪代码，就像一个小机器人按部就班地工作 🤖：

```javascript
// 伪代码
function Stringify(T) {
  const result = {};
  for (const K of Object.keys(T)) {
    result[K] = string;
  }
  return result;
}
```

### 常用映射类型模式 📋

TypeScript 提供了几种内置的映射类型，它们展示了映射类型的强大功能。这些就像是厨房里的各种小工具，各有特色 👨‍🍳：

1. **克隆类型**：创建与源类型完全相同的类型（就像复制一把钥匙 🔑）

```typescript
type Clone<T> = {
  [K in keyof T]: T[K];
};
```

2. **可选映射**：将所有属性变为可选（给每个属性加上"也许需要"的标签 🏷️）。这就像是购物清单上的"非必需品" 🛒：

```typescript
type Partial<T> = {
  [K in keyof T]?: T[K];
};

// 使用示例
interface Required {
  id: number;
  name: string;
}

type Optional = Partial<Required>;
/* 等价于：
{
  id?: number;
  name?: string;
}
*/
```

3. **只读映射**：将所有属性变为只读（给属性加上"请勿触摸"的标签 🚫）。这就像是博物馆里的展品，看看就好，不要动手 🏛️：

```typescript
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

// 使用示例
interface Mutable {
  id: number;
  name: string;
}

type Immutable = Readonly<Mutable>;
/* 等价于：
{
  readonly id: number;
  readonly name: string;
}
*/
```

4. **Pick 映射**：从类型中选择部分属性（就像从糖果盒中挑选最喜欢的几种 🍬）。这就像是自助餐，只拿你想吃的 🍽️：

```typescript
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 使用示例
interface Person {
  name: string;
  age: number;
  address: string;
}

type NameAndAge = Pick<Person, "name" | "age">;
/* 等价于：
{
  name: string;
  age: number;
}
*/
```

## 总结与实践建议 💡

TypeScript 的类型创建工具让我们能够基于现有类型构建更复杂、更精确的类型。本文介绍的五种类型工具各有特点，就像一套厨师刀具，每把刀都有其独特用途 🔪：

- **类型别名** ✍️：提供了类型复用的基础设施，是其他高级类型工具的基础
- **联合类型** 🔀：让我们可以表示"多选一"的类型关系，增加类型的灵活性
- **交叉类型** 🤝：允许我们组合多个类型的特性，实现类型的"叠加"
- **索引类型** 🔑：使我们能够安全地操作对象属性类型，增强类型的动态性
- **映射类型** 🔄：提供了强大的类型转换和批量修改能力，是高级类型编程的利器

### 实践建议 🌟

1. **循序渐进** 🐢：先掌握类型别名和联合类型这两个基础工具，再逐步学习更复杂的类型工具。就像学习烹饪，先炒个鸡蛋，再做红烧肉 🍳
2. **组合使用** 🧩：不同类型工具可以组合使用，发挥更强大的类型描述能力。就像乐高积木，单块不起眼，组合起来却能创造无限可能 🏗️
3. **保持简洁** ✂️：过于复杂的类型定义会降低代码可读性，应当适度使用。记住爱因斯坦的话："一切应该尽可能简单，但不能更简单" 🧠
4. **注释类型** 📝：为复杂的类型定义添加注释，解释其用途和工作原理。就像给美食加上说明，让大家知道这道菜有多美味 🍲
5. **复用内置类型** 📦：TypeScript 提供了许多实用的内置类型工具，如 `Partial`、`Readonly`、`Pick` 等。不要重复造轮子，站在巨人的肩膀上前进 🚀

熟练掌握这些类型工具，是进行 TypeScript 高级类型编程的关键。在实际开发中合理使用这些工具，可以极大提高代码的类型安全性和可维护性。加油！你已经向成为 TS 类型忍者迈出了重要一步了！🥷 学完这些，你的代码一定会变得更加强壮，就像喝了蛋白粉的程序 💪😄

