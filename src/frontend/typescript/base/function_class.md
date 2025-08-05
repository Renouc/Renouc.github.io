# 函数 与 class 🚀

## 函数 🧩

### 函数的类型签名 :writing_hand:

函数的类型描述了函数入参类型与函数返回值类型，使用:语法进行类型标注（就像给每个参数贴上标签一样）：

```typescript
function foo(name: string): number {
  return name.length; // 返回名字的长度，简单又实用！
}
```

TypeScript 的类型推导非常聪明 🧠，上例中的返回值类型可以省略，系统会自动推导为 number 类型。就像你的朋友知道你想吃什么一样！

在 JavaScript 中函数有多种声明方式，让我们看看在 TypeScript 中它们长什么样：

**1. 函数声明（经典方式） 👴**

```typescript
function foo(name: string): number {
  return name.length;
}
```

**2. 函数表达式（有点高级了） 🤓**

```typescript
const foo = function (name: string): number {
  return name.length;
};

// 或者使用变量类型声明（类型在前，实现在后）
const foo: (name: string) => number = function (name) {
  return name.length; // 长度计算器启动！
};
```

**3. 箭头函数（现代范儿） 🏹**

```typescript
// 直接标注参数和返回值
const foo = (name: string): number => {
  return name.length;
};

// 先声明函数类型，再实现函数体
const foo: (name: string) => number = (name) => {
  return name.length;
};
```

为了让代码更清爽，建议这样写（你的同事会感谢你的）：

方式一：简洁直接 ✨

```typescript
const foo = (name: string): number => name.length;
```

方式二：类型别名（给类型起个好听的名字） 🏷️

```typescript
type FuncFoo = (name: string) => number;

const foo: FuncFoo = (name) => name.length;
```

我们甚至可以用 interface 来描述函数（没错，函数也可以穿上 interface 的外套）：

```typescript
interface FuncFooStruct {
  (name: string): number; // 看起来有点奇怪，但它就是这么工作的！
}
```

这种被称为 Callable Interface，听起来很酷吧！😎

### 函数类型的兼容性 🤝

TypeScript 的函数类型兼容性基于"结构类型"系统，主要考虑参数类型和返回值类型：

```typescript
// 参数少的可以赋值给参数多的
type MoreParams = (x: number, y: number) => void;
type LessParams = (x: number) => void;

const moreFunc: MoreParams = (x, y) => {};
const lessFunc: LessParams = (x) => {};

// 正确：参数少的可以赋值给参数多的
const example1: MoreParams = lessFunc;

// 错误：参数多的不能赋值给参数少的
// const example2: LessParams = moreFunc;

// 返回值类型：子类型可以赋值给父类型
type ReturnString = () => string;
type ReturnStringOrNumber = () => string | number;

const funcReturnString: ReturnString = () => 'hello';
const funcReturnBoth: ReturnStringOrNumber = () =>
  Math.random() > 0.5 ? 'hello' : 42;

// 正确：string 是 string | number 的子类型
const example3: ReturnStringOrNumber = funcReturnString;

// 错误：string | number 不是 string 的子类型
// const example4: ReturnString = funcReturnBoth;
```

### void 类型 🕳️

在 TypeScript 中，没有返回值的函数应标记为 void 类型（就像黑洞，吞噬一切不返回任何东西）：

```typescript
// 没有 return 语句的函数
function foo(): void {
  // 这里什么都不返回，像个神秘人一样！
}

// 有 return 语句但不返回值的函数
function bar(): void {
  return; // 我回来了，但两手空空 🤷‍♂️
}
```

`void` 表示函数不需要有返回值，而 `undefined` 表示函数明确返回了空值（"这是我的礼物：一个空盒子！"）：

```typescript
function bar(): undefined {
  return undefined; // 正式地返回了"无"
}
```

### 可选参数与 rest 参数 🎭

TypeScript 的参数系统非常灵活，就像变形金刚一样！🤖

#### 可选参数（使用 ? 标记）

```typescript
function greet(name: string, age?: number): string {
  // 使用空值合并运算符(??)处理可选参数，该运算符在值为null或undefined时使用默认值
  const userAge = age ?? 18; // 没提供年龄？那就假设是18岁吧！
  return `${name} is ${userAge} years old`;
}

// 调用方式
greet('Alice'); // 有效
greet('Bob', 25); // 有效
```

#### 默认参数（懒人的福音）👏

```typescript
function greet(name: string, age: number = 18): string {
  return `${name} is ${age} years old`; // 默认都是18岁，多好！
}
```

**注意事项：**

- 可选参数必须放在必选参数之后（不能先点甜点再点主食）
- 设置了默认值的参数不需要使用 ? 标记（已经有安全网了）
- 对于简单类型，默认参数的类型可以省略（TypeScript 会猜）
- 对于复杂类型，还是乖乖写上类型吧（不要让 TS 猜太难的东西）

#### Rest 参数

Rest 参数允许接收不定数量的参数，作为数组处理：

```typescript
// 使用数组类型
function sum(first: number, ...rest: number[]): number {
  return rest.reduce((acc, val) => acc + val, first);
}

// 使用元组类型指定精确的参数结构
function createPerson(name: string, ...details: [number, boolean]): object {
  const [age, employed] = details;
  return { name, age, employed };
}

createPerson('Alice', 30, true); // 有效
createPerson('Bob', 25, true, 'extra'); // 错误：参数太多
```

### 函数重载

当一个函数根据不同参数类型返回不同类型结果时，可以使用**函数重载**来提供更精确的类型信息。这不仅能确保类型安全，还能提供准确的代码提示：

```typescript
// 问题：使用联合类型无法准确表达参数与返回值的关系
function format(value: string | number): string | number {
  if (typeof value === 'string') {
    return value.trim();
  }
  return value.toFixed(2);
}

// 调用时无法确定返回值类型
const result = format('hello'); // string | number
```

使用函数重载可以解决这个问题：

```typescript
// 重载签名 - 定义函数的多种调用方式
function format(value: string): string;
function format(value: number): string;
// 实现签名 - 包含所有重载情况的实际实现
function format(value: string | number): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  return value.toFixed(2);
}

// 调用时能够准确推断返回类型
const str = format('hello'); // string
const num = format(42); // string
```

**重要说明：**

1. TypeScript 的函数重载是通过多个函数声明+一个实现的方式实现的
2. 重载签名必须在实现签名之前声明
3. 调用函数时，TypeScript 会按照重载声明的顺序匹配合适的重载签名
4. 实现签名必须兼容所有的重载签名

一个更实际的例子：

```typescript
// 获取元素函数的重载
function getElement(id: string): HTMLElement | null;
function getElement(id: string, parent: HTMLElement): HTMLElement | null;
function getElement(id: string, parent?: HTMLElement): HTMLElement | null {
  const element = parent
    ? parent.querySelector(`#${id}`)
    : document.getElementById(id);
  return element;
}

// 使用时类型安全
const element1 = getElement('header'); // 从document查找
const element2 = getElement('item', someContainer); // 从指定容器查找
```

### 特殊函数类型

TypeScript 对 JavaScript 中的特殊函数类型提供了良好的类型支持：

#### 异步函数 (Async Functions)

```typescript
// 异步函数总是返回 Promise
async function fetchData(url: string): Promise<object> {
  try {
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return {}; // 返回空对象作为默认值
  }
}

// 使用
const data = await fetchData('https://api.example.com/data');
// 类型为 object
```

#### 生成器函数 (Generator Functions)

```typescript
// 简单生成器函数
function* createSequence(): Generator<number, void, undefined> {
  let i = 0;
  while (i < 3) {
    yield i++;
  }
}

// 实用示例：分页数据生成器
function* createPagedData<T>(
  fetchPage: (page: number) => Promise<T[]>,
  maxPages: number
): Generator<Promise<T[]>, void, undefined> {
  for (let page = 1; page <= maxPages; page++) {
    yield fetchPage(page);
  }
}

// 使用
const pageGenerator = createPagedData(
  (page) => fetch(`/api/items?page=${page}`).then((r) => r.json()),
  5
);

for (const pagePromise of pageGenerator) {
  const items = await pagePromise;
  console.log(items);
}
```

#### 异步生成器函数 (Async Generator Functions)

```typescript
async function* createAsyncSequence(): AsyncGenerator<number, void, undefined> {
  let i = 0;
  while (i < 3) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    yield i++;
  }
}

// 使用
for await (const num of createAsyncSequence()) {
  console.log(num); // 0, 1, 2 (每个数字之间有100ms延迟)
}
```

这些特殊函数类型各自有特定的语法和行为，但 TypeScript 都能为它们提供准确的类型检查和推断。

## Class

### 类与类成员的类型签名

类的主要结构包含：**构造函数**、**属性**、**方法**和**访问符（getter/setter）**，TypeScript 为这些成员提供了类型标注：

```typescript
class User {
  // 属性类型标注
  id: number;
  name: string;
  isActive?: boolean; // 可选属性

  // 构造函数参数类型标注
  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  // 方法参数和返回值类型标注
  displayInfo(prefix: string): string {
    return `${prefix}: ${this.name} (ID: ${this.id})`;
  }

  // getter 返回值类型标注
  get formattedName(): string {
    return this.name.toUpperCase();
  }

  // setter 参数类型标注 (不能有返回值类型标注)
  set formattedName(value: string) {
    this.name = value.trim();
  }
}
```

**注意事项：**

- setter 方法不允许标注返回值类型，因为它们总是返回 void
- 类的方法可以像普通函数一样使用函数重载
- 可选属性使用 `?` 标记，和对象类型类似

除了类声明，TypeScript 还支持类表达式：

```typescript
const Person = class {
  constructor(
    public name: string,
    public age: number
  ) {}

  greet(): string {
    return `Hello, I'm ${this.name}`;
  }
};

const john = new Person('John', 30);
```

### 类属性初始化简写

TypeScript 允许在类属性声明时直接初始化，简化代码：

```typescript
class Product {
  // 声明时初始化
  id: number = Math.random();
  name: string;
  price: number = 0;
  isAvailable: boolean = true;

  constructor(name: string, price?: number) {
    this.name = name;
    if (price !== undefined) {
      this.price = price;
    }
  }
}

const product = new Product('Phone');
console.log(product.id); // 随机生成的ID
console.log(product.price); // 0 (默认值)
```

### 访问修饰符

TypeScript 提供了多种访问修饰符来控制类成员的可见性：

```typescript
class Account {
  // 公共成员 - 默认，可在任何地方访问
  public balance: number;

  // 私有成员 - 仅在类内部可访问
  private transactions: string[];

  // TypeScript 4.0+的私有字段 - 真正的运行时私有，不仅是类型检查
  #secretKey: string;

  // 受保护成员 - 在类和子类中可访问，实例不可直接访问
  protected accountNumber: string;

  // 只读成员 - 初始化后不可修改
  readonly id: string;

  constructor(
    id: string,
    initialBalance: number,
    accountNumber: string,
    secretKey: string
  ) {
    this.id = id;
    this.balance = initialBalance;
    this.accountNumber = accountNumber;
    this.transactions = [];
    this.#secretKey = secretKey;
  }

  deposit(amount: number): void {
    this.balance += amount;
    this.logTransaction(`Deposit: +${amount}`);
  }

  private logTransaction(action: string): void {
    this.transactions.push(`${new Date().toISOString()} - ${action}`);
  }

  protected generateStatement(): string {
    return `Account ${this.accountNumber.slice(-4)}: ${this.balance}`;
  }

  // 访问私有字段
  validateKey(key: string): boolean {
    return this.#secretKey === key;
  }
}

// 访问修饰符的作用域
const account = new Account('acc123', 1000, '1234567890', 'secret123');
account.balance = 1500; // 正确 - public 成员
// account.accountNumber = "9876";  // 错误 - protected 成员
// account.transactions.push(...);  // 错误 - private 成员
// account.#secretKey = "hack";     // 错误 - 私有字段，语法错误
// account.id = "newId";            // 错误 - readonly 成员
```

**私有字段(#)与private修饰符的区别:**

```typescript
class PrivateExample {
  private tsPrivate: string = 'TypeScript private';
  #jsPrivate: string = 'JavaScript private';

  showPrivates() {
    console.log(this.tsPrivate); // 访问正常
    console.log(this.#jsPrivate); // 访问正常
  }
}

const example = new PrivateExample();
// example.tsPrivate; // 类型检查时报错，但运行时可以通过反射访问
// example.#jsPrivate; // 语法错误，真正的私有性，运行时完全无法访问
// Object.keys(example).includes("tsPrivate"); // true - 可以在运行时检测到
// Object.keys(example).includes("#jsPrivate"); // false - 运行时不可见
```

**构造函数参数简写**

TypeScript 提供了在构造函数参数上使用访问修饰符的简写语法，这会自动创建并初始化相应的类属性：

```typescript
class Customer {
  // 简写语法：自动创建并初始化相应的实例属性
  constructor(
    public name: string,
    private email: string,
    protected readonly id: string
  ) {
    // 不需要额外的赋值代码
  }

  updateEmail(newEmail: string): void {
    this.email = newEmail;
  }
}

const customer = new Customer('Alice', 'alice@example.com', 'cust-001');
console.log(customer.name); // "Alice" - public 属性可以访问
// console.log(customer.email); // 错误 - 私有属性不能从外部访问
```

**访问修饰符总结：**

- `public`：在任何地方都可访问（默认值）
- `private`：只在类内部可访问（TypeScript类型检查）
- `#property`：真正的私有字段（JavaScript 运行时私有）
- `protected`：在类内部和子类中可访问
- `readonly`：只能在声明或构造函数中赋值，之后不能修改

### 静态成员

在 TypeScript 中，使用 `static` 关键字标识静态成员：

```typescript
class Calculator {
  static PI: number = 3.14159;

  static multiply(a: number, b: number): number {
    return a * b;
  }

  instanceMethod(): void {
    // 实例方法中访问静态成员需要通过类名
    console.log(Calculator.PI);
  }
}

// 直接通过类访问静态成员
console.log(Calculator.PI);
console.log(Calculator.multiply(5, 3));
```

**静态成员与实例成员的区别：**

- 静态成员直接挂载在类构造函数上，不需要实例化即可访问
- 实例成员挂载在原型上，需要通过实例访问
- 静态成员不会被实例继承，只属于定义它的类（及其子类）
- 实例成员可以通过原型链传递，能够被实例继承

静态成员的典型应用场景：

- 工具类或工具方法的集合
- 配置常量或默认值存储
- 单例模式实现
- 工厂方法

```typescript
// 工具类示例
class StringUtils {
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static reverse(str: string): string {
    return str.split('').reverse().join('');
  }
}

// 单例模式示例
class Database {
  private static instance: Database | null = null;
  private connectionString: string;

  private constructor(connectionString: string) {
    this.connectionString = connectionString;
    console.log(`Connected to: ${connectionString}`);
  }

  static getInstance(connectionString: string): Database {
    if (!Database.instance) {
      Database.instance = new Database(connectionString);
    }
    return Database.instance;
  }

  query(sql: string): any[] {
    console.log(`Executing query: ${sql}`);
    return [];
  }
}

// 使用单例
const db1 = Database.getInstance('mysql://localhost:3306/mydb');
const db2 = Database.getInstance('mysql://localhost:3306/mydb');
console.log(db1 === db2); // true - 同一个实例
```

### 继承、实现与抽象类

#### 类继承

TypeScript 使用 `extends` 关键字实现继承：

```typescript
// 基类/父类
class Animal {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  move(distance: number = 0): void {
    console.log(`${this.name} moved ${distance}m.`);
  }
}

// 派生类/子类
class Dog extends Animal {
  breed: string;

  constructor(name: string, breed: string) {
    super(name); // 必须调用父类构造函数
    this.breed = breed;
  }

  // 重写父类方法
  override move(distance: number = 5): void {
    console.log(`${this.name} is running...`);
    super.move(distance); // 调用父类方法
  }

  bark(): void {
    console.log('Woof! Woof!');
  }
}

const dog = new Dog('Rex', 'German Shepherd');
dog.move(10); // "Rex is running..." 然后 "Rex moved 10m."
dog.bark(); // "Woof! Woof!"
```

#### 类型守卫与instanceof

使用 `instanceof` 操作符可以在继承层次中安全地检查对象类型：

```typescript
class Animal {
  eat(): void {
    console.log('Animal eating...');
  }
}

class Bird extends Animal {
  fly(): void {
    console.log('Bird flying...');
  }
}

class Fish extends Animal {
  swim(): void {
    console.log('Fish swimming...');
  }
}

function moveAnimal(animal: Animal) {
  animal.eat(); // 所有动物都能吃

  // 类型守卫：根据具体类型调用特定方法
  if (animal instanceof Bird) {
    animal.fly(); // 安全：已经确认是Bird类型
  } else if (animal instanceof Fish) {
    animal.swim(); // 安全：已经确认是Fish类型
  }
}

moveAnimal(new Bird()); // "Animal eating..." 然后 "Bird flying..."
moveAnimal(new Fish()); // "Animal eating..." 然后 "Fish swimming..."
```

**继承关系中的重要概念：**

- 子类可以访问父类的 `public` 和 `protected` 成员，但不能访问 `private` 成员
- 使用 `super` 关键字调用父类构造函数和方法
- TypeScript 4.3+ 引入了 `override` 关键字，确保重写的方法在父类中存在

#### 抽象类

抽象类是一种特殊的类，它不能被直接实例化，只能被继承：

```typescript
abstract class Shape {
  // 抽象属性(没有实现)
  abstract color: string;

  // 抽象方法(没有实现)
  abstract calculateArea(): number;

  // 抽象访问器
  abstract get name(): string;

  // 普通方法(有实现)
  displayInfo(): void {
    console.log(
      `This is a ${this.name} with area ${this.calculateArea()}sq units`
    );
  }
}

class Circle extends Shape {
  radius: number;
  color: string; // 实现抽象属性

  constructor(radius: number, color: string) {
    super();
    this.radius = radius;
    this.color = color;
  }

  // 实现抽象方法
  calculateArea(): number {
    return Math.PI * this.radius * this.radius;
  }

  // 实现抽象访问器
  get name(): string {
    return 'circle';
  }
}

// const shape = new Shape();  // 错误：不能创建抽象类的实例
const circle = new Circle(5, 'red');
circle.displayInfo(); // "This is a circle with area 78.54sq units"
```

**抽象类特性：**

- 使用 `abstract` 关键字声明抽象类和抽象成员
- 抽象成员必须在派生类中实现
- 抽象类可以包含已实现的方法和属性
- 在 TypeScript 中不能声明静态的抽象成员

#### 接口实现

接口可以用来定义类应该具有的结构：

```typescript
interface Vehicle {
  start(): void;
  stop(): void;
  fuelLevel: number;
}

class Car implements Vehicle {
  fuelLevel: number = 100;

  constructor(
    public make: string,
    public model: string
  ) {}

  start(): void {
    console.log(`${this.make} ${this.model} started`);
  }

  stop(): void {
    console.log(`${this.make} ${this.model} stopped`);
  }
}

const myCar = new Car('Toyota', 'Corolla');
myCar.start(); // "Toyota Corolla started"
```

接口也可以描述类的构造函数签名（Newable Interface）：

```typescript
interface Shape {
  color: string;
  area(): number;
}

interface ShapeConstructor {
  new (color: string): Shape;
  defaultColor: string;
}

class Rectangle implements Shape {
  static defaultColor: string = 'blue';

  constructor(public color: string) {}

  area(): number {
    // 简化实现
    return 10;
  }
}

// 函数接受类而非实例
function createColoredShape(ctor: ShapeConstructor, color?: string): Shape {
  return new ctor(color || ctor.defaultColor);
}

const myShape = createColoredShape(Rectangle);
console.log(myShape.color); // "blue"
```

### 装饰器

TypeScript 实验性地支持装饰器，可用于修改类、方法、属性或参数的行为：

```typescript
// 启用experimentalDecorators编译选项后可用

// 类装饰器
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

// 方法装饰器
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };

  return descriptor;
}

@sealed
class Example {
  @log
  multiply(a: number, b: number): number {
    return a * b;
  }
}

const example = new Example();
example.multiply(2, 3);
// 输出:
// Calling multiply with: [2, 3]
// Result: 6
```

通过接口和抽象类，TypeScript 提供了灵活而强大的方式来定义和实现类之间的关系。
