# TypeScript 内置类型与类型断言 🧩

## 内置类型 🔰

### any - 万能药 🦸‍♂️

嘿，有时候我们写 TS 代码不需要那么严格，对吧？想想 `console.log`，它啥都能接受 - 字符串、数字、对象... 啥都行！难道我们要把所有类型都用联合类型连起来？那也太疯狂了！

为了解决这个问题，TypeScript 给了我们一个"万能牌" - `any` 类型！它就像编程世界的"随身听"，啥都能塞进去：

```ts
log(message?: any, ...optionalParams: any[]): void
```

看，这里的 `message` 参数是 `any` 类型，后面的 `optionalParams` 也是 `any[]` 类型。这意味着你可以用任何类型、任意数量的参数来调用这个方法，太灵活了！✨

#### any 的特性

除了明确标注为 `any`，有些情况下变量会被自动推导为 `any`：

```ts
// 悄悄变成了 any
let foo;

// foo、bar 也都是 any
function func(foo, bar) {}
```

⚠️ 注意：如果你在 tsconfig 中开启了 `noImplicitAny`，上面这样写会报错。你得显式地指定它们为 `any` 类型，或者暂时关闭这个配置（不推荐哦）。

`any` 类型的变量简直像个变形金刚，想怎么变就怎么变：

```ts
// any 类型，随便怎么搞都行
let anyVar: any = '随便写点啥';

anyVar = false; // 变成布尔值？没问题！
anyVar = '再来点字符串'; // 再变回字符串？也没问题！
anyVar = {
  name: '张三', // 变成对象？完全OK！
};

anyVar = () => {}; // 变成函数？也行！

// 其他具体类型的变量也能接受 any 类型的值（这很危险！⚡）
const val1: string = anyVar;
const val2: number = anyVar;
const val3: () => {} = anyVar;
const val4: {} = anyVar;
```

你甚至可以对 `any` 类型的变量做任何操作，不管合不合理。TypeScript 此时就像是闭上眼睛的安检员，啥都放行：

```ts
let anyVar: any = null;

// 这些操作编译时不会报错，但运行时可能💥炸了
anyVar.foo.bar.baz();
anyVar[0][1][2].prop1;
```

#### any 的适用场景 🎯

`any` 类型的核心意义就是：**"我想干啥就干啥，没人管得着"** 🤪。它能兼容所有类型，也能够被所有类型兼容。这就像给了你一把"类型检查的后门钥匙"，随时可以跳过检查。但记住，跑起来出问题了，那可是你自己的责任哦！

适合使用 any 的几种情况：

1. **快速开发原型** - 当你只是想快速验证一个想法，不关心类型安全
2. **迁移 JavaScript 代码** - 逐步迁移大型 JS 项目到 TS 时的过渡方案
3. **处理动态内容** - 例如从 `eval()` 或某些特殊 API 返回的内容
4. **与某些动态特性交互** - 比如使用 `document.createElement` 创建的元素

但记住，能不用 `any` 就尽量不用！

### unknown - 谨慎的 any 🧐

`unknown` 类型像是 `any` 的谨慎表弟。它同样可以被赋予任何值，但当你想用它时，就没那么随意了：

```ts
let unknownVar: unknown = 'Hello';

unknownVar = false; // ✅ 可以赋值任何类型
unknownVar = '再来一次'; // ✅ 没问题
unknownVar = {
  name: 'Renouc',
};

unknownVar = () => {};

// 但是！不能直接赋值给其他具体类型 🚫
const val1: string = unknownVar; // ❌ 报错
const val2: number = unknownVar; // ❌ 报错
const val3: () => {} = unknownVar; // ❌ 报错
const val4: {} = unknownVar; // ❌ 报错

// 只能赋值给 any 和 unknown 类型
const val5: any = unknownVar; // ✅ 可以
const val6: unknown = unknownVar; // ✅ 可以
```

`any` 和 `unknown` 最大的区别是：`any` 就像个社牛，走到哪都是自己人；而 `unknown` 更像个社恐，只跟 `any` 和自己玩得来。简单说，`any` 放弃了所有的类型检查，而 `unknown` 保留了安全感。

这一点在访问属性时尤为明显：

```ts
let unknownVar: unknown;

unknownVar.foo(); // ❌ 报错：对象类型为 unknown
```

#### 类型守卫 - unknown 的安全使用方式 🛡️

要安全地使用 `unknown` 类型的值，必须先通过类型守卫（Type Guards）缩小它的类型范围。这就像先检查一下包裹里是什么，再决定怎么处理：

```ts
function processValue(value: unknown) {
  // 类型守卫：typeof 操作符
  if (typeof value === 'string') {
    // 在这个分支内，TypeScript 知道 value 是 string 类型
    return value.toUpperCase(); // ✅ 安全！
  }

  // 类型守卫：instanceof 操作符
  if (value instanceof Date) {
    // 在这个分支内，TypeScript 知道 value 是 Date 类型
    return value.toISOString(); // ✅ 安全！
  }

  // 类型守卫：自定义类型谓词
  if (isProduct(value)) {
    // 在这个分支内，value 被识别为 Product 类型
    return `￥${value.price}`; // ✅ 安全！
  }

  // 如果以上条件都不满足，我们仍然不知道 value 的具体类型
  return String(value); // 转成字符串处理
}

// 自定义类型谓词 (type predicate)，让 TypeScript 认识我们的类型
interface Product {
  name: string;
  price: number;
}

function isProduct(value: unknown): value is Product {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const product = value as Record<string, unknown>;

  return (
    typeof product.name === 'string' &&
    typeof product.price === 'number'
  );
}
```

类型守卫让我们能够安全地处理 `unknown` 类型，享受类型检查的好处，同时保持接收任意类型输入的灵活性。这比直接使用 `any` 类型要安全得多！

#### unknown 的适用场景 🔍

`unknown` 适合以下场景：

1. **处理 API 响应** - 从外部获取的数据，类型不确定

   ```ts
   async function fetchData(): Promise<unknown> {
     const response = await fetch('https://api.example.com/data');
     return response.json(); // 返回 unknown 而不是 any
   }

   // 安全地使用返回结果
   const data = await fetchData();
   if (typeof data === 'object' && data && 'users' in data) {
     // 现在可以安全地访问 data.users
   }
   ```

2. **处理用户输入** - 用户可能输入任何内容
3. **插件系统** - 当你不知道插件会传入什么类型的数据
4. **类型转换桥梁** - 作为不同类型系统之间的桥梁

### never - 永不存在的类型 🚫

`never` 类型表示那些永远不会出现的值。它是类型系统中的"幽灵" 👻，例如在联合类型中，它会直接消失：

```ts
type UnionWithNever = 'hello' | 123 | true | void | never;
```

如果你把鼠标放在这个类型上，你会发现显示的只有 `"hello" | 123 | true | void`，`never` 类型不见了！这是因为 `void` 表示"空类型"，就像函数不返回值时的类型；而 `never` 则是"什么都没有"的类型，它连"空"都不是。

关于类型兼容性：

```ts
declare let v1: never;
declare let v2: void;

v1 = v2; // ❌ 报错：void 不能赋给 never
v2 = v1; // ✅ 可以：never 可以赋给任何类型
```

在类型体系中，`never` 被称为 **Bottom Type**，是整个类型系统最底层的类型。它是所有类型的子类型，但只有 `never` 类型的值才能赋给 `never` 类型的变量。

#### never 的实际应用 🔧

`never` 的常见用途之一是表示那些永远不会正常返回的函数：

```ts
function throwError(): never {
  throw new Error('出错啦！💥');
}

function infiniteLoop(): never {
  while (true) {
    console.log('我永远不会停下来 🔄');
  }
}
```

`never` 还可以用来做穷尽性检查，确保你处理了所有可能的情况：

```ts
type Shape = Circle | Square;

function getArea(shape: Shape) {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.size ** 2;
    default:
      // 如果 Shape 新增了成员但忘了处理，这里会报错 🚨
      const exhaustiveCheck: never = shape;
      return exhaustiveCheck;
  }
}
```

不可能状态标记：

```ts
function processEvent(event: 'click' | 'scroll' | 'mousemove') {
  if (event === 'click') {
    // 处理点击
  } else if (event === 'scroll') {
    // 处理滚动
  } else if (event === 'mousemove') {
    // 处理鼠标移动
  } else {
    // 如果前面的条件覆盖了所有可能性，这里永远不会执行
    const exhaustiveCheck: never = event;
  }
}
```

有时你会无意中遇到 `never`。例如空数组出现在对象属性或缺少上下文类型的位置时，TypeScript 可能无法推断元素类型：

```ts
const state = {
  items: [],
};

state.items.push('hello'); // ❌ 类型"string"的参数不能赋给类型"never"的参数
```

这里 `items` 可能被推导为 `never[]`。解决方法很简单：给数组声明一个具体类型就好了 👍。

#### 类型运算中的 never 类型 🧮

`never` 在 TypeScript 的类型运算中扮演着重要角色，尤其是在构建高级类型时。这就像魔法师的工具箱里的秘密武器，能够帮你实现很多复杂的类型操作：

##### 交叉类型与 never

TypeScript 中交叉类型（用 `&` 连接）表示同时满足多个类型。但有些类型之间是互斥的，交叉后会得到 `never`：

```ts
// 原始类型之间是互斥的
type ImpossibleType = number & string; // never

// 有互斥属性的对象类型
type A = { type: 'a'; valueA: string };
type B = { type: 'b'; valueB: number };
type Intersection = A & B; // 包含互相冲突的 type 属性

// 使用互斥的交叉类型
const impossible: Intersection = {
  type: 'a', // ❌ 无法同时满足 'a' 和 'b'
  valueA: 'hello',
  valueB: 123,
};
```

这种情况下，IDE 可能会显示奇怪的错误，表明这个类型无法实例化，因为某些属性有冲突的要求，实际上就是 `never` 的表现。

##### 条件类型中的过滤器 🧹

`never` 在条件类型中常用作"过滤器"，可以从联合类型中剔除掉某些类型：

```ts
// TypeScript 内置的 Exclude 类型实现
type Exclude<T, U> = T extends U ? never : T;

// 使用示例
type Animals = 'cat' | 'dog' | 'fish' | 'bird';
type Mammals = 'cat' | 'dog';
type NonMammals = Exclude<Animals, Mammals>; // 'fish' | 'bird'

// 自定义：移除数组中的所有空值类型
type NonNullable<T> = T extends null | undefined ? never : T;
type Types = string | number | null | undefined;
type NonNullTypes = NonNullable<Types>; // string | number
```

##### 提取与排除类型 🔍

使用 `never` 配合条件类型，我们可以构建出提取或排除特定属性的工具类型：

```ts
// 提取对象中特定类型的属性键
type ExtractPropertyKeys<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// 使用示例
interface Person {
  name: string;
  age: number;
  isActive: boolean;
  updateInfo: () => void;
}

// 提取 Person 中所有函数类型的属性键
type FunctionKeys = ExtractPropertyKeys<Person, Function>; // "updateInfo"

// 提取 Person 中所有原始类型的属性键
type PrimitiveKeys = ExtractPropertyKeys<Person, string | number | boolean>; // "name" | "age" | "isActive"
```

##### 分布式条件类型 📊

`never` 在分布式条件类型中特别有用，可以帮助我们处理联合类型：

```ts
// 从联合类型 T 中移除 void
type RemoveVoid<T> = T extends void ? never : T;

// 应用到联合类型上，会自动分布处理
type Result = RemoveVoid<string | number | void>; // string | number

// 一个更复杂的例子：提取对象类型的可选键
type OptionalKeys<T> = {
  [K in keyof T]: {} extends Pick<T, K> ? K : never;
}[keyof T];

interface User {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
}

type UserOptionalKeys = OptionalKeys<User>; // "email" | "avatar"
```

##### 构建更安全的类型工具 🔒

在构建复杂的类型工具时，`never` 可以帮助我们处理边缘情况：

```ts
// 一个确保对象具有且仅具有特定键的类型工具
type StrictObject<T, K extends keyof any> = {
  [P in K]: P extends keyof T ? T[P] : never;
} & { [P in Exclude<keyof T, K>]?: never };

interface Config {
  port: number;
  host: string;
}

// 只允许 "port" 和 "host" 属性
function startServer(config: StrictObject<Config, 'port' | 'host'>) {
  // ...
}

startServer({ port: 8080, host: 'localhost' }); // ✅ 正确
startServer({ port: 8080, host: 'localhost', debug: true }); // ❌ 错误：不允许额外的 'debug' 属性
```

通过这些例子，我们可以看到 `never` 类型在类型系统中的强大作用。它不仅可以表示"不可能的值"，还可以作为类型运算的关键工具，帮助我们构建更精确、更安全的类型定义。在 TypeScript 的类型体操中，`never` 就像是无形的魔法，让不可能变成可能！✨

## 类型断言 🔄

### 基本类型断言

类型断言就像是你对 TypeScript 编译器说："相信我，我知道我在做什么！" 通过类型断言，你可以覆盖 TypeScript 的类型推导，手动指定一个值的类型。

```ts
let unknownVar: unknown;

// 告诉TS："相信我，它有foo方法！" 💪
(unknownVar as { foo: () => {} }).foo();
```

除了 `as` 语法外，你还可以用尖括号 `<>` 语法（但在 TSX 文件中可能会有冲突）：

```ts
// 尖括号语法
(<{ foo: () => {} }>unknownVar).foo();
```

### 类型断言 vs 类型转换 ⚖️

这是个容易混淆的概念！**类型断言不是类型转换**，它们有本质区别：

```ts
// 类型断言：只在编译时存在，运行时不会有任何效果
const value: unknown = '123';
const length: number = (value as string).length; // ✅ 编译通过

// 类型转换：实际在运行时转换值的类型
const value = '123';
const num = Number(value); // 123，实际转换为数字
```

类型断言好比告诉编译器"相信我的判断"，而类型转换是真的把一个值变成另一种类型。关键区别：

- **类型断言**：只发生在编译阶段，运行时无痕迹，不改变 JavaScript 输出
- **类型转换**：发生在运行时，会导致实际的 JavaScript 行为变化

记住，类型断言应当是万不得已时使用的招数。就像吃药一样，能不用尽量不用。TypeScript 的类型推导在大多数情况下已经够聪明了。

### 双重断言 - 断言的套娃 🪆

如果原类型和断言类型差太多，TypeScript 会提醒你可能出错：

```ts
const str: string = '你好';

// ❌ 报错：从string到带handler方法的对象，差太远了吧？
(str as { handler: () => {} }).handler();
```

此时需要先断言到 `unknown` 或 `any`，再断言到目标类型：

```ts
const str: string = '你好';

// 双重断言：先变成unknown，再变成目标类型 🔄
(str as unknown as { handler: () => {} }).handler();

// 使用尖括号也可以
(<{ handler: () => {} }>(<unknown>str)).handler();
```

这就像是先把东西变成一团泥巴（`unknown`），再捏成你想要的形状。

### 非空断言 - "它绝对有值！" ⚡

非空断言使用 `!` 符号，表示某个值一定不是 `null` 或 `undefined`：

```ts
declare const foo: {
  func?: () => {
    prop?: number | null;
  };
};

// ❌ 报错：func可能不存在，prop可能为null
foo.func().prop.toFixed();

// ✅ 使用非空断言：我保证它们存在！
foo.func!().prop!.toFixed();
```

注意，非空断言只是消除了类型检查错误，运行时如果真的是 `null`，还是会炸的 💣。比起非空断言，可选链（`?.`）通常是更安全的选择。

非空断言其实是类型断言的简写，相当于：

```ts
(
  (
    foo.func as () => {
      prop?: number;
    }
  )().prop as number
).toFixed();
```

### const 断言 - 让值更"硬" 🔒

TypeScript 3.4 引入的 `as const` 语法可以将表达式的类型变得更精确：

```ts
// 没有as const时：类型为 { x: number, y: number }
const point = { x: 10, y: 20 };

// 使用as const：类型为 { readonly x: 10, readonly y: 20 }
const pointExact = { x: 10, y: 20 } as const;

// 普通数组：string[]
const arr = ['a', 'b', 'c'];

// 使用as const：readonly ["a", "b", "c"]，变成了元组
const tupleArr = ['a', 'b', 'c'] as const;
```

`as const` 在处理不可变数据、字面量类型和元组时特别有用，让你的类型更精确，代码更安全。🔐

### 断言作为类型提示 📝

类型断言还有个实用功能：帮助你在实现复杂接口时偷懒 😉：

```ts
interface IStruct {
  foo: string;
  bar: {
    barPropA: string;
    barPropB: number;
    barMethod: () => void;
    baz: {
      handler: () => Promise<void>;
    };
  };
}

// ❌ 如果直接这样写，要实现所有属性，太麻烦了
const obj: IStruct = {}; // 报错

// ✅ 使用类型断言，可以只实现部分结构，还能保留类型提示
const obj = <IStruct>{
  bar: {
    baz: {},
  },
};
```

## 最佳实践 - TypeScript高手指南 🏆

1. 尽量避免 `any`，优先用 `unknown` 加类型守卫 🛡️
2. 类型断言只在确实需要时使用，不要滥用 ⚠️
3. 用 `never` 类型做穷尽性检查，提高代码健壮性 💪
4. 开启 `noImplicitAny` 和 `strictNullChecks` 配置，让TS保护你 🔒
5. 使用 `as const` 断言创建精确的只读类型 📌
6. 了解并利用 TypeScript 的类型运算能力，构建更精确的类型 🧮
7. 记住：类型系统是你的朋友，不是敌人！与它合作，不要对抗它 🤝
