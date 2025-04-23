# TypeScript 类型系统：结构化类型与标称类型的深入解析

## 结构化类型系统

在 TypeScript 中，类型检查是基于类型的结构（shape）而不是类型名称来进行的。这种特性被称为**结构化类型系统**。让我们通过一个简单的例子来理解这个概念：

```ts
class Cat {
  eat() {}
}

class Dog {
  eat() {}
}

function feedCat(cat: Cat) {}

feedCat(new Dog()); // 这行代码不会报错！
```

你可能觉得奇怪：`feedCat` 函数明明需要的是 `Cat` 类型，为什么传入 `Dog` 类型也能正常工作？这就是结构化类型系统的特点：**只要两个类型具有相同的结构，它们就被认为是兼容的**。

### 什么是结构化类型系统？

结构化类型系统（Structural Typing System）是一种基于类型结构进行类型兼容性判断的系统。它关注的是类型是否具有相同的属性和方法，而不是类型的名称。

这种特性也被称为**鸭子类型（Duck Typing）**，来源于"鸭子测试"的概念：**如果它走起来像鸭子，游泳像鸭子，叫起来像鸭子，那么它就是鸭子**。

### 类型兼容性的判断规则

1. **基本规则**：如果类型 B 具有类型 A 的所有属性和方法，那么 B 可以赋值给 A。

```ts
class Cat {
  eat() {}
}

class Dog {
  eat() {}
  bark() {} // 额外的方法不会影响兼容性
}

function feedCat(cat: Cat) {}

feedCat(new Dog()); // 仍然可以正常工作
```

2. **方法返回类型**：方法的返回类型必须兼容。

```ts
class Cat {
  eat(): boolean {
    return true;
  }
}

class Dog {
  eat(): number {
    return 599;
  }
}

function feedCat(cat: Cat) {}

feedCat(new Dog()); // 报错！返回类型不兼容
```

### 结构化类型 vs 鸭子类型

虽然这两个概念经常被混用，但它们实际上有一些区别：

- **结构化类型**：在编译时进行类型检查，要求类型结构完全匹配
- **鸭子类型**：在运行时进行类型检查，只关注实际使用的部分

在 TypeScript 中，我们使用的是结构化类型系统，因为类型检查是在编译时进行的。

### 结构化类型系统的应用场景

1. **接口实现**：
```ts
interface Animal {
  eat(): void;
}

class Cat implements Animal {
  eat() { console.log('Cat is eating'); }
}

class Dog {
  eat() { console.log('Dog is eating'); }
  bark() { console.log('Woof!'); }
}

const animal: Animal = new Dog(); // ✅ 可以
```

2. **对象字面量**：
```ts
interface Point {
  x: number;
  y: number;
}

const point: Point = { x: 1, y: 2 }; // ✅ 可以
const point2: Point = { x: 1, y: 2, z: 3 }; // ✅ 可以，额外属性不影响
```

3. **函数参数**：
```ts
interface Config {
  url: string;
  method: string;
}

function request(config: Config) {
  // ...
}

request({ url: '/api', method: 'GET', headers: {} }); // ✅ 可以
```

## 标称类型系统

与结构化类型系统相对的是**标称类型系统（Nominal Typing System）**。在这种系统中，类型兼容性是基于类型名称来判断的，而不是结构。

### 标称类型系统的特点

```ts
type USD = number;
type CNY = number;

const CNYCount: CNY = 200;
const USDCount: USD = 200;

function addCNY(source: CNY, input: CNY) {
  return source + input;
}

addCNY(CNYCount, USDCount); // 在标称类型系统中，这应该报错！
```

在这个例子中，虽然 `USD` 和 `CNY` 都是 `number` 类型，但在标称类型系统中，它们被认为是完全不同的类型。这样可以防止不同类型的数据被错误地混用。

### 标称子类型

在标称类型系统中，类型之间的继承关系必须显式声明：

```ts
class Cat { }
class ShorthairCat extends Cat { } // 显式声明继承关系
```

### TypeScript 中的标称类型

虽然 TypeScript 主要使用结构化类型系统，但我们可以通过一些技巧来模拟标称类型：

```ts
// 使用 unique symbol 创建唯一的品牌标记
type USD = number & { readonly __brand: unique symbol };
type CNY = number & { readonly __brand: unique symbol };

// 创建值
const CNYCount: CNY = 200 as CNY;
const USDCount: USD = 200 as USD;

function addCNY(source: CNY, input: CNY) {
  return source + input;
}

addCNY(CNYCount, USDCount); // 现在会报错！
```

### 标称类型的实际应用

1. **货币单位**：
```ts
type USD = number & { readonly __brand: unique symbol };
type CNY = number & { readonly __brand: unique symbol };

const usd: USD = 100 as USD;
const cny: CNY = 100 as CNY;

function convertUSDToCNY(usd: USD): CNY {
  return (usd * 7) as CNY;
}
```

2. **物理单位**：
```ts
type Meter = number & { readonly __brand: unique symbol };
type Kilometer = number & { readonly __brand: unique symbol };

const m: Meter = 1000 as Meter;
const km: Kilometer = 1 as Kilometer;

function convertMeterToKm(m: Meter): Kilometer {
  return (m / 1000) as Kilometer;
}
```

3. **ID 类型**：
```ts
type UserID = string & { readonly __brand: unique symbol };
type OrderID = string & { readonly __brand: unique symbol };

const userId: UserID = "123" as UserID;
const orderId: OrderID = "456" as OrderID;

function getUserOrders(userId: UserID): OrderID[] {
  // ...
}
```

### 两种类型系统的比较

| 特性 | 结构化类型系统 | 标称类型系统 |
|------|--------------|------------|
| 类型兼容性判断 | 基于结构 | 基于名称 |
| 灵活性 | 高 | 低 |
| 类型安全 | 相对较低 | 相对较高 |
| 常见语言 | TypeScript, Python | Java, C++ |

### 如何选择类型系统？

1. **使用结构化类型系统的场景**：
   - 需要高度灵活的类型系统
   - 处理大量相似但不同的类型
   - 需要快速原型开发
   - 与动态类型语言交互

2. **使用标称类型系统的场景**：
   - 需要严格的类型安全
   - 处理具有特定含义的类型（如货币、单位等）
   - 需要防止类型混淆
   - 大型项目中的类型约束

在实际开发中，我们应该根据具体需求选择合适的类型系统。结构化类型系统提供了更大的灵活性，而标称类型系统则提供了更强的类型安全保证。