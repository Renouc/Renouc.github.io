# 字面量与枚举 🎯

## 字面量类型 📌

字面量类型是 TypeScript 提供的超强类型约束能力，它允许你将类型精确到**具体的值**！主要包括**字符串字面量类型**、**数字字面量类型**、**布尔字面量类型**和**对象字面量类型**：

```ts
const str: 'typescript' = 'typescript'; // 只能是这个具体的字符串
const num: 599 = 599; // 只能是这个具体的数字
const bool: true = true; // 只能是 true，不能是 false
```

为什么说字面量类型比原始类型更精确？看这个例子就明白了：

```ts
// 报错！不能将类型""linbudu599""分配给类型""linbudu""
const str1: 'linbudu' = 'linbudu599';

// 这两个都没问题，因为 string 类型可以接受任何字符串
const str2: string = 'linbudu';
const str3: string = 'linbudu599';
```

原始类型就像一个大篮子🧺，可以装下各种同类型的值，而字面量类型就像一个只能装特定物品的精确模具🔒，要求**值和类型完全一致**。

单独使用字面量类型比较少见（限制太死了😅），它通常和联合类型（`|`）一起使用，表达"这些值中的一个"：

```ts
// 限制属性只能是特定的值
interface Tmp {
  bool: true | false; // 等同于 boolean，但语义更明确
  num: 1 | 2 | 3; // 只能是这三个数字之一
  str: 'js' | 'ts' | 'react'; // 只能是这三个字符串之一
}

// 实际应用：定义请求状态
type RequestStatus = 'loading' | 'success' | 'error';
// 实际应用：定义按钮大小
type ButtonSize = 'small' | 'medium' | 'large';
```

## 联合类型 ⚔️

联合类型可以理解为"或"的关系，它代表了**一组类型的可用集合**。只要最终赋值的类型属于联合类型的成员之一，就符合这个类型约束：

```ts
interface Tmp {
  mixed: true | string | 599 | {} | (() => {}) | (1 | 2);
}
```

使用联合类型时有几点需要注意：

- 对于联合类型中的函数类型，需要使用括号`()`包裹起来 🔒
- 函数类型并不存在字面量类型，`(() => {})` 就是一个合法的函数类型
- 联合类型可以嵌套，但最终都会被展平到第一级（`(1 | 2)` 等同于直接写 `1 | 2`）

### 实际应用：用联合类型实现互斥属性 🔥

联合类型的一个强大用途是通过多个对象类型的联合，实现**互斥属性**（属性之间有依赖关系）：

```ts
// VIP用户与普通用户的结构不同
interface User {
  user:
    | {
        vip: true; // 是VIP用户
        expires: string; // 有过期时间
      }
    | {
        vip: false; // 非VIP用户
        promotion: string; // 有促销信息
      };
}

declare var tmp: User;

// TypeScript能够通过判断进行类型收窄！
if (tmp.user.vip) {
  console.log(tmp.user.expires); // ✅ 类型安全访问
  // console.log(tmp.user.promotion);  // ❌ 错误，VIP用户没有promotion属性
}
```

我们也可以通过类型别名来复用一组字面量联合类型：

```ts
// 定义API响应码
type ApiCode = 10000 | 10001 | 50000;

// 定义请求状态
type Status = 'success' | 'failure' | 'pending';
```

## 对象字面量类型 🧩

对象字面量类型就是一个值为具体对象的类型，对象内的每个属性都必须是字面量值：

```ts
interface Tmp {
  obj: {
    name: '王富贵'; // 必须精确匹配这个值
    age: 18; // 必须精确匹配这个值
  };
}

const tmp: Tmp = {
  obj: {
    name: '王富贵',
    age: 18,
  },
};
```

对象字面量类型要求实现每个属性的每个值都**精确匹配**，使用场景较少，一般用于需要非常严格约束的场合。

> 🌟 **要点**: 无论是原始类型还是对象类型的字面量类型，它们的本质都是**类型而不是值**。它们在编译时会被擦除，存储在类型空间而非值空间。

## 枚举 🏛️

枚举在JavaScript中本来不存在，但在许多其他语言中是常见功能（如Java、C#、Swift）。它非常适合用来表示一组相关的常量。

如果用JavaScript表达，枚举类似于你写过的常量文件：

```js
// 传统的常量定义方式
export default {
  Home_Page_Url: 'url1',
  Setting_Page_Url: 'url2',
  Share_Page_Url: 'url3',
};

// 或是这样：
export const PageUrl = {
  Home_Page_Url: 'url1',
  Setting_Page_Url: 'url2',
  Share_Page_Url: 'url3',
};
```

使用TypeScript的枚举改写，会变成这样：

```ts
enum PageUrl {
  Home_Page_Url = 'url1',
  Setting_Page_Url = 'url2',
  Share_Page_Url = 'url3',
}

const home = PageUrl.Home_Page_Url; // "url1"
```

枚举的优势非常明显：

1. 提供更好的类型提示和自动补全 ✨
2. 这些常量被真正地约束在一个命名空间下
3. 可以让代码更有语义化和可读性

### 数字枚举 🔢

如果不指定枚举值，TypeScript会使用数字枚举，从0开始自增：

```ts
enum Items {
  Foo, // 0
  Bar, // 1
  Baz, // 2
}

// 访问方式
const foo = Items.Foo; // 0
```

如果只为部分成员指定了枚举值，规则是：

- 未赋值的成员会从0开始自增
- 某个成员赋值后，之后的成员会从该值开始自增

```ts
enum Items {
  Foo, // 0
  Bar = 599,
  Baz, // 600 (自动递增)
}
```

数字枚举还支持使用计算值（如函数返回值）：

```ts
const returnNum = () => 100 + 499;

enum Items {
  Foo = returnNum(), // 599，使用计算值（延迟求值）
  Bar = 599, // 必须显式赋值
  Baz, // 600 (自动递增)
}
```

> ⚠️ **注意**: 关于使用计算值（延迟求值）的重要规则：**当枚举中使用了计算值成员后，其后的第一个成员必须显式初始化**。这是因为TypeScript需要在编译时知道如何计算后续成员的值，而计算值只能在运行时确定。这个规则适用于所有位置的计算值成员，包括第一个成员。

```ts
// 正确示例：计算值后面的成员有显式初始化
const getValue = () => 100;
enum Correct {
  A = getValue(), // 计算值作为第一个成员
  B = 10, // B必须显式初始化
  C, // 现在C可以自动递增，值为11
}

// 错误示例：计算值后面未显式初始化成员
enum Wrong {
  A = getValue(), // 计算值
  B, // 错误！B没有初始化器，编译器无法确定B的值
  C, // C同样有问题
}

// 正确示例：中间使用计算值
enum AlsoCorrect {
  A = 0, // 显式初始化
  B = getValue(), // 计算值
  C = 20, // C必须显式初始化
  D, // D可以自动递增，值为21
}
```

### 字符串枚举与混合枚举 🔤

TypeScript也支持字符串枚举值和混合枚举：

```ts
// 字符串枚举
enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}

// 混合枚举
enum Mixed {
  Num = 599,
  Str = '王富贵',
}
```

### 枚举的双向映射 🔄

枚举和对象的一个重要区别：**枚举支持双向映射**（但仅限于数字枚举）：

```ts
enum Items {
  Foo, // 0
  Bar, // 1
  Baz, // 2
}

const fooValue = Items.Foo; // 0，从名称到值
const fooKey = Items[0]; // "Foo"，从值到名称
```

这是怎么实现的？看看编译后的代码就明白了：

```js
'use strict';
var Items;
(function (Items) {
  Items[(Items['Foo'] = 0)] = 'Foo'; // 同时赋值 Items["Foo"]=0 和 Items[0]="Foo"
  Items[(Items['Bar'] = 1)] = 'Bar';
  Items[(Items['Baz'] = 2)] = 'Baz';
})(Items || (Items = {}));
```

> ⚠️ **注意**: 只有数字枚举才支持双向映射，字符串枚举只有单向映射（键到值）。

### 常量枚举 🚀

常量枚举是一种特殊的枚举，使用 `const enum` 声明：

```ts
const enum Items {
  Foo, // 0
  Bar, // 1
  Baz, // 2
}

const fooValue = Items.Foo; // 0
```

常量枚举与普通枚举的区别：

1. 只能通过枚举成员访问枚举值（不能反向通过值访问成员）
2. 编译后没有额外的枚举对象，而是直接内联替换为值
3. 性能更好，生成的代码更少

看编译产物就明白了：

```js
// 编译后的代码，直接内联了值
const fooValue = 0; /* Foo */
```

> 🛠️ **高级提示**: 常量枚举的行为会受到 `--isolatedModules` 以及 `--preserveConstEnums` 等配置项的影响。

## 类型推导中的字面量类型 🕵️

TypeScript有时会自动推导出字面量类型，看这个例子：

```ts
let str1 = 'hello'; // 被推导为 string
const str2 = 'hello'; // 被推导为字面量类型 'hello'

const user = {
  name: '王富贵', // 被推导为 string
  age: 18, // 被推导为 number
};
```

为什么会这样？这与变量声明方式有关：

- `let` 声明的变量可以再次赋值，所以推导为宽泛的类型
- `const` 声明的原始类型变量不可变，所以可以精确推导为字面量类型
- 对象的属性默认可变，所以推导为宽泛类型，即使对象本身用 `const` 声明

如果你想让对象属性也是字面量类型，可以使用类型断言：

```ts
const user = {
  name: '王富贵',
  age: 18,
} as const; // 现在user.name是字面量类型 "王富贵"，而不是string
```

## 最佳实践 💯

1. **使用联合类型收窄接口**

   ```ts
   // 不好：使用string，太宽泛
   interface Config {
     theme: string;
   }

   // 好：使用字面量联合类型，提供精确约束
   interface Config {
     theme: 'light' | 'dark' | 'system';
   }
   ```

2. **使用枚举管理应用常量**

   ```ts
   // 为API状态码定义枚举
   enum ApiStatusCode {
     Success = 200,
     BadRequest = 400,
     Unauthorized = 401,
     NotFound = 404,
     ServerError = 500,
   }

   // 使用
   if (response.code === ApiStatusCode.Success) {
     // 处理成功情况
   }
   ```

3. **优先使用常量枚举减少生成的代码**

   ```ts
   const enum Direction {
     Up,
     Down,
     Left,
     Right,
   }
   ```

4. **根据数据类型选择合适的枚举类型**
   - 数字枚举：适合有序或可计算的值
   - 字符串枚举：提供更好的调试体验和可读性

## 总结 📝

字面量类型和枚举都是TypeScript中非常强大的特性：

- **字面量类型** 让你能够将类型精确到具体的值，结合联合类型使用时特别有用
- **联合类型** 能够表达"或"的关系，实现互斥属性等复杂类型场景
- **枚举** 提供了一种组织相关常量的方式，比普通对象有更多类型检查优势

灵活运用这些特性，能让你的代码更加健壮、可读性更强，并且能捕获更多潜在错误！🚀
