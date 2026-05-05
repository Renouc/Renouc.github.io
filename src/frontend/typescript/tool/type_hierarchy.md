# TypeScript 类型层级系统：从 never 到 any 的完整指南 🎯

## 引言

TypeScript 的类型系统是其最强大的特性之一，它不仅能帮助我们在开发时捕获错误，还能提供更好的代码提示和文档。理解类型层级系统是掌握 TypeScript 类型系统的关键。本文将带你从最底层的 never 类型开始，逐步探索直到最顶层的 any 类型，全面了解 TypeScript 的类型层级关系。🚀

### 类型兼容性判断

在开始之前，我们需要了解 TypeScript 如何判断类型之间的兼容性。主要有以下几种方式：

1. 赋值兼容性：通过赋值操作判断类型兼容性 🔄
2. 条件类型：使用 extends 关键字判断类型兼容性 ⚡
3. 类型断言：通过类型断言判断类型兼容性 🎭

```ts
// 赋值兼容性
let x: string = 'hello';
let y: any = x; // OK，string 可以赋值给 any

// 条件类型
type IsString<T> = T extends string ? true : false;
type A = IsString<'hello'>; // true
type B = IsString<123>; // false

// 类型断言
let z: unknown = 'hello';
let w: string = z as string; // OK，通过类型断言
```

## 类型层级链：核心概念 🔗

让我们先通过一个完整的类型层级链来了解 TypeScript 的类型层级关系：

```ts
type TypeChain = never extends 'renouc' // 1: never 是所有类型的子类型
  ? 'renouc' extends 'renouc' | '599' // 2: 字面量类型是其联合类型的子类型
    ? 'renouc' | '599' extends string // 3: 联合类型是原始类型的子类型
      ? string extends String // 4: 原始类型是其包装类型的子类型
        ? String extends Object // 5: 包装类型是 Object 的子类型
          ? Object extends any // 6: Object 是 any 的子类型
            ? any extends unknown // 7: any 是 unknown 的子类型
              ? unknown extends any // 8: unknown 也是 any 的子类型
                ? 8
                : 7
              : 6
            : 5
          : 4
        : 3
      : 2
    : 1
  : 0;
```

## 从底层到顶层：类型层级详解 📊

### never 类型：万物之始 🌱

never 类型是 TypeScript 类型系统中最底层的类型，它是所有类型的子类型。这意味着 never 类型可以赋值给任何其他类型，但没有任何类型可以赋值给 never 类型。

```ts
let x: never;
let y: string = x; // OK，never 可以赋值给任何类型
// x = y; // Error，其他类型不能赋值给 never
```

### 字面量类型与原始类型 📝

字面量类型是 TypeScript 中最具体的类型，它们是其对应原始类型的子类型。

```ts
let x: 'hello' = 'hello';
let y: string = x; // OK，字面量类型是原始类型的子类型
// x = y; // Error，原始类型不能赋值给字面量类型
```

### 联合类型与交叉类型 🔄

联合类型表示一个值可以是多个类型中的任意一个，而交叉类型表示一个值必须同时满足多个类型的要求。

```ts
type A = string | number;
type B = string & number; // never，因为不存在同时是 string 和 number 的值

let x: A = 'hello'; // OK
x = 123; // OK
// x = true; // Error
```

### 包装类型与对象类型 📦

原始类型有其对应的包装类型，包装类型是 Object 的子类型。

```ts
let x: string = 'hello';
let y: String = new String('hello');
let z: Object = y; // OK，包装类型是 Object 的子类型
```

### any 与 unknown：类型之巅 👑

any 和 unknown 是 TypeScript 类型系统中最顶层的类型，它们可以接受任何类型的值。但是它们的行为有很大的不同：

```ts
// any 类型（不推荐使用）⚠️
let x: any = 'hello';
x = 123; // OK，可以接受任何类型的值
x.toUpperCase(); // OK，可以调用任何方法（但运行时可能出错）
let y: number = x; // OK，any 可以赋值给任何类型

// unknown 类型（推荐使用）✅
let a: unknown = 'hello';
a = 123; // OK，可以接受任何类型的值
// a.toUpperCase(); // Error，不能直接调用方法
// let b: number = a; // Error，不能直接赋值给其他类型
if (typeof a === 'string') {
  a.toUpperCase(); // OK，经过类型检查后可以使用
  let b: string = a; // OK，经过类型检查后可以赋值
}
```

## 特殊类型关系 🔗

### 类继承关系 🏗️

类的继承关系会影响类型兼容性，子类可以赋值给父类，但反之则不行。

```ts
class Animal {
  name: string;
}

class Dog extends Animal {
  bark(): void {}
}

let animal: Animal = new Dog(); // OK
// let dog: Dog = new Animal(); // Error
```

### 接口实现关系 📝

接口的实现关系也会影响类型兼容性，实现接口的类可以赋值给接口类型。

```ts
interface Animal {
  name: string;
}

class Dog implements Animal {
  name: string;
  bark(): void {}
}

let animal: Animal = new Dog(); // OK
```

### 泛型类型关系 🎭

泛型类型之间的关系比较复杂，需要考虑协变、逆变和不变性。

```ts
class Animal {
  name = '';
}

class Dog extends Animal {
  bark() {}
}

type Covariant<T> = {
  readonly value: T;
};

type Contravariant<T> = (value: T) => void;

type Invariant<T> = {
  get: () => T;
  set: (value: T) => void;
};

const dogBox: Covariant<Dog> = { value: new Dog() };
const animalBox: Covariant<Animal> = dogBox; // OK，Dog 可以作为 Animal 读取

const animalHandler: Contravariant<Animal> = (value) => {};
const dogHandler: Contravariant<Dog> = animalHandler; // OK，能处理 Animal 的函数也能处理 Dog

const dogState: Invariant<Dog> = {
  get: () => new Dog(),
  set: (value) => {},
};

// const animalState: Invariant<Animal> = dogState; // Error，同时读写时通常是不变的
```

### 数组与元组关系 📊

数组和元组之间的关系也遵循类型层级规则。

```ts
let x: [string, number] = ['hello', 123];
let y: (string | number)[] = x; // OK
// x = y; // Error
```

## 实际应用场景 🛠️

### 类型保护 🛡️

类型保护可以帮助我们在运行时确定值的具体类型。

```ts
function isString(x: unknown): x is string {
  return typeof x === 'string';
}

let x: unknown = 'hello';
if (isString(x)) {
  x.toUpperCase(); // OK
}
```

### 类型断言 🎭

类型断言允许我们手动指定值的类型。

```ts
let x: any = 'hello';
let y: string = x as string; // OK
```

### 条件类型 ⚡

条件类型可以根据类型关系创建新的类型。

```ts
type NonNullable<T> = T extends null | undefined ? never : T;
type A = NonNullable<string | null>; // string
```

### 类型收窄 🔍

类型收窄可以帮助我们缩小值的可能类型范围。

```ts
function process(x: string | number) {
  if (typeof x === 'string') {
    x.toUpperCase(); // OK
  } else {
    x.toFixed(); // OK
  }
}
```

## 最佳实践与总结 📚

### 类型设计原则 🎯

1. 优先使用具体的类型
2. 避免使用 any，改用 unknown
3. 合理使用类型断言
4. 利用类型推断

### 常见错误与解决方案 ⚠️

1. 类型断言滥用
2. 过度使用 any（应该使用 unknown）
3. 忽略类型检查
4. 错误使用类型保护

### 性能考虑 ⚡

1. 类型检查对编译时间的影响
2. 类型复杂度的平衡
3. 类型推导的优化
