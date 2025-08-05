# 原始类型与对象类型 🚀

## 原始类型 🧱

嘿！JavaScript 的原始类型有 8 种（感谢 ES2020 给我们带来的 BigInt 👏），这些类型在 TypeScript 中都有对应的类型注解。除了 `null` 和 `undefined` 这两个"特殊宝贝"外，其他类型基本上与 JavaScript 中的数据类型概念一一对应。

```ts
const name: string = 'renouc'; // 字符串，你好呀~ 👋
const age: number = 24; // 数字，计算必备 🔢
const male: boolean = false; // 布尔值，不是 true 就是 false 🤔
const undef: undefined = undefined; // 未定义，空空如也 🌫️
const nul: null = null; // 空值，有盒子但没东西 📦
const obj: object = { name, age, male }; // 对象，万物皆对象 🧰
const bigintVar1: bigint = 9007199254740991n; // 超大整数，大到天花板都不够高 🚀
const bigintVar2: bigint = BigInt(9007199254740991);
const symbolVar: symbol = Symbol('unique'); // 独一无二的值 ✨
```

## null 和 undefined 🤷‍♂️

在 JavaScript 中，`null` 和 `undefined` 是两兄弟，但性格不同 - `null` 表示"**这里有值，但是个空值**"（就像空盒子 📦），而 `undefined` 表示"**根本没有值**"（连盒子都没有 🌫️）。在 TypeScript 中，它们都是**有明确意义的类型**。

当你没有开启 `strictNullChecks` 这个"严格模式"时，它们会被当作其他类型的"小弟"（子类型），比如 string 类型会包含 null 和 undefined：

```ts
const tmp1: null = null;
const tmp2: undefined = undefined;

// 下面这两行代码只有在你"放松警惕"（关闭 strictNullChecks）时才行得通 😉
const tmp3: string = null; // 仅在关闭 strictNullChecks 时成立
const tmp4: string = undefined; // 仅在关闭 strictNullChecks 时成立
```

不过，开启 `strictNullChecks`（强烈推荐！👮‍♀️）后，TypeScript 就不再让你随便把 null 或 undefined 赋值给其他类型了，除非你明确说"我允许"。这就像严格的门卫，不让不速之客进门 🚫。

## void 🕳️

在 JavaScript 中，`void` 是个**操作符**，它的工作就是执行表达式但把结果扔掉，永远返回 undefined。有点像你做了一堆工作然后装作什么都没发生的样子 😎。

1. 基本语法长这样：

```js
void expression;
// 或者这样也可以
void expression;
```

无论 expression 是什么复杂的表达式，void 都会冷酷地返回 undefined 🥶。

2. 它有什么用？看这里：

阻止链接跳转（超实用！）

```html
<!-- 点击链接不会跳走，就像被粘住了一样 🍯 -->
<a href="javascript:void(0);">点我点我，我不会跑！</a>

<!-- 点击执行函数但页面纹丝不动 -->
<a href="javascript:void(someFunction());">做点事但别跳转</a>
```

立即执行函数表达式（IIFE）- 前端老炮儿都懂的技巧 😏

```js
// 传统写法
void (function () {
  console.log('我立刻就执行了！');
})();

// 现代写法（更常见）
(function () {
  console.log('我也立刻执行了，但我更时髦！');
})();
```

在 TypeScript 中，`void` 摇身一变成了**类型**，表示函数**不关心返回什么**或**压根儿不返回**：

```ts
function fn1(): void {} // 啥也不返回 🤐
function fn2(): void {
  return; // 空手而归 🙌
}
function fn3(): undefined {
  return undefined; // 明确地返回了"无" 👻
}
```

`fn1`和`fn2`的返回值类型是 `void`，而`fn3`明确返回了 `undefined`。

> 虽然 fn3 返回 undefined，但你还是可以用 void 标注它，因为在类型的世界里，它们都是在说"没啥有用的东西返回" 🤷‍♂️。主要区别：void 是"我不在乎返回值"，undefined 是"我明确返回了个空气"。

你可以把 void 想象成一个黑洞 🕳️，而 null 和 undefined 是实实在在的值。有趣的是，undefined 可以赋给 void 类型（就像你可以往黑洞里扔东西），但反过来不行：

```ts
const voidVar1: void = undefined; // 完全没问题 👌

const voidVar2: void = null; // 除非关闭 strictNullChecks，否则会报错 ❌
```

## 数组 📚

在 TypeScript 中，声明数组有两种"口味"：

```ts
const arr1: string[] = []; // 更常见的方式，像读英语一样直观 👍

const arr2: Array<string> = []; // 用泛型的高级写法，有些场景更清晰 🧐
```

## 元组 📏

当普通数组不够用时，元组（Tuple）来救场！它就像一个"量身定制"的数组，你可以精确规定每个位置的类型：

```ts
// 普通数组：类型相同，长度随意
const arr3: string[] = ['王', '富', '贵'];

console.log(arr3[599]); // TypeScript不会拦你，但运行时会得到undefined 😅
```

这时元组就派上用场了，它会严格检查索引访问：

```ts
// 元组：固定长度，每个位置类型可以不同
const arr4: [string, string, string] = ['王', '富', '贵'];

console.log(arr4[599]); // TypeScript直接报错：别想越界访问！🚨
```

你甚至可以把元组的某些位置标记为可选的（带问号）：

```ts
const arr6: [string, number?, boolean?] = ['王富贵'];
// 也可以这么写，逗号更明显
// const arr6: [string, number?, boolean?] = ['王富贵', , ,];
```

对于可选成员，在严格模式下，它的类型会被看作 `类型 | undefined` 的联合类型。此时元组的长度也变得灵活了：

```ts
type TupleLength = typeof arr6.length; // 1 | 2 | 3，长度可变 🔄
```

TypeScript 4.0 还加入了**具名元组**，让你的代码可读性爆表 📈：

```ts
// 每个元素都有名字，看着就明白是啥
const person: [name: string, age: number, male: boolean] = ['王富贵', 25, true];
```

## 对象 🏗️

在 TypeScript 中，描述对象结构有两种主要方式：接口（interface）和类型别名（type）。接口就像是建筑蓝图，规定了对象需要长啥样：

```ts
interface IDescription {
  name: string; // 必须有名字
  age: number; // 必须有年龄
  male: boolean; // 必须有性别标识
}

const obj1: IDescription = {
  name: '王富贵',
  age: 25,
  male: true,
};
```

这意味着：

- 每个属性必须**类型匹配**，就像拼图一样要对上 🧩
- 不能随便加属性或少属性，无论是直接声明还是后续赋值，都要遵守蓝图！

### 给属性加"修饰符" 🎨

有时候，我们需要让某些属性变得"特殊"一点：

可选属性（加个问号，瞬间变随意）：

```ts
interface IDescription {
  name: string; // 这个必须有
  age: number; // 这个也必须有
  male?: boolean; // 可有可无，看心情 🤔
  func?: Function; // 也是可选的
}

const obj2: IDescription = {
  name: '张三',
  age: 25,
  // male和func没写，但没关系，它们是可选的～ 😌
};
```

只读属性（加个readonly，变得"看不改"）：

```ts
interface IDescription {
  readonly name: string; // 只能看不能改！
  age: number;
}

const obj3: IDescription = {
  name: '张三',
  age: 25,
};

// 想改名字？不存在的！TypeScript会阻止你 🛑
obj3.name = '李四'; // 错误：name是只读的，别想动它！
```

数组和元组也能标记为只读，但与对象不同：

- 整个数组/元组才能标记为只读，不能只锁定某个元素 🔒
- 一旦标记为只读，push、pop等修改方法全部失效，数组变成了"看起来像数组但不能动"的 `ReadonlyArray`

```ts
// 只读数组，别想改我！
const readonlyArr: readonly string[] = ['a', 'b', 'c'];
// 或者这么写
const readonlyArr2: ReadonlyArray<string> = ['a', 'b', 'c'];

// 想push？没门！🚪
readonlyArr.push('d'); // 错误：ReadonlyArray上没有push方法
```

## type vs interface 🥊

这是一场有趣的"类型擂台赛"！

`interface` 主要用来描述**对象和类的结构**，像是制定规范；而 `type` 更灵活，可以给各种类型起别名，组合出复杂类型，简直是"变形金刚" 🤖：

```ts
// interface：适合描述对象结构
interface User {
  name: string;
  age: number;
}

// type：百变星君，各种类型都能定义
type UserId = string; // 类型别名
type UserOrAdmin = User | Admin; // 联合类型，二选一
type GetUser = () => User; // 函数类型
type UserRecord = Record<string, User>; // 字典类型
```

主要区别（选择困难症看这里 👀）：

- `interface` 能被继承和实现，像是家族传承
- `interface` 能合并声明，多次定义会自动合并
- `type` 支持联合类型、交叉类型等高级操作，更灵活
- `type` 能为基本类型和复杂类型起别名

虽然很多时候 `type` 能替代 `interface`，但根据团队约定和实际需求选择适合的方式才是正道 🧘‍♂️。

## object vs Object vs {} 🤯

这三个容易混淆的类型，让人头大！下面帮你区分清楚：

1. **Object**（大写O）：万物之源，几乎接受一切类型（关闭严格检查时甚至接受null和undefined）：

```ts
// 在关闭 strictNullChecks 时有效
const tmp1: Object = undefined;
const tmp2: Object = null;
const tmp3: Object = void 0;

// 以下在任何情况下都有效，Object真的很包容
const tmp4: Object = '王富贵';
const tmp5: Object = 599;
const tmp6: Object = { name: '王富贵' };
const tmp7: Object = () => {};
const tmp8: Object = [];
```

2. **装箱类型**（String, Number等）：原始类型的"豪华包装版"，不推荐使用 🙅‍♂️：

```ts
// 在关闭 strictNullChecks 时有效
const tmp9: String = undefined;
const tmp10: String = null;

// 只接受字符串和String对象
const tmp12: String = '王富贵';
const tmp13: String = new String('王富贵');

// 其他类型？没门！
const tmp14: String = 599; // 错误！
const tmp15: String = { name: '王富贵' }; // 错误！
```

> **最佳实践**：别用这些装箱类型，它们只会让生活更复杂！用小写版本（string, number等）就好 👍

3. **object**（小写o）：专门表示非原始类型，也就是对象、数组、函数这一家子：

```ts
// 原始类型统统拒绝！（关闭 strictNullChecks 后可以）
const tmp20: object = '王富贵'; // 错误！
const tmp21: object = 599; // 错误！
const tmp22: object = true; // 错误！

// 非原始类型欢迎光临！
const tmp23: object = { name: '王富贵' }; // ✅
const tmp24: object = () => {}; // ✅
const tmp25: object = []; // ✅
```

4. **{}**（空对象类型）：看似啥都没有，实际上接受任何非null/undefined的值，是个"陷阱" 🕳️：

```ts
// 在关闭 strictNullChecks 时才有效
const tmp26: {} = undefined;
const tmp27: {} = null;

// 惊喜：几乎什么都能赋值！
const tmp28: {} = '王富贵'; // ✅
const tmp29: {} = 599; // ✅
const tmp30: {} = { name: '王富贵' }; // ✅
```

但是！虽然能赋值，却不能访问或修改任何自定义属性，这很"坑" 😱：

```ts
const obj: {} = { name: '王富贵' };

// 以下全部报错！
console.log(obj.name); // 错误：{}上不存在属性"name"
obj.age = 18; // 错误：{}上不存在属性"age"
```

这是因为 `{}` 类型只包含所有类型共有的方法（如 Object 原型上的 toString），自定义属性全部不可见。

### 最佳实践 💡

为了让代码更健壮，记住这几条：

- **永远不要用** `Object` 或 `String` 这种大写的装箱类型，不值得 🚫
- 想表示非原始类型但不确定具体是啥，用 `object`
- 更推荐用这些精确的类型：
  - `Record<string, unknown>` 表示对象（更安全）
  - `unknown[]` 表示数组
  - `(...args: any[]) => any` 表示函数
- 避开 `{}` 这个陷阱，它几乎和 `any` 一样危险 ⚠️

掌握了这些，你的 TypeScript 技能已经 +10 了！开心编码吧！😄
