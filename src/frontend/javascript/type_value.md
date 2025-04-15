# JavaScript 类型和值

## 1. 内置类型

JavaScript 中的值可以分为两大类：原始类型（Primitive Types）和引用类型（Reference Types）。

### 1.1 原始类型（Primitive Types）

- **number**: 数字类型，包括整数和浮点数
  ```javascript
  let num = 42;
  let float = 3.14;
  ```

- **string**: 字符串类型
  ```javascript
  let str = "Hello";
  let template = `World`;
  ```

- **boolean**: 布尔类型
  ```javascript
  let isTrue = true;
  let isFalse = false;
  ```

- **undefined**: 未定义类型
  ```javascript
  let x; // x 的值是 undefined
  ```

- **null**: 空值类型
  ```javascript
  let empty = null;
  ```

- **symbol**: 符号类型（ES6 新增）
  ```javascript
  let sym = Symbol('description');
  ```

- **bigint**: 大整数类型（ES2020 新增）
  ```javascript
  let bigNum = 9007199254740991n;
  ```

### 1.2 引用类型（Reference Types）

- **object**: 对象类型
  ```javascript
  let obj = { name: 'John' };
  let arr = [1, 2, 3];
  let date = new Date();
  ```

## 2. typeof 操作符

typeof 操作符用于检测值的类型，返回一个表示类型的字符串。

### 2.1 基本用法

```javascript
typeof 42;          // "number"
typeof "hello";     // "string"
typeof true;        // "boolean"
typeof undefined;   // "undefined"
typeof null;        // "object" (历史遗留问题)
typeof Symbol();    // "symbol"
typeof 42n;         // "bigint"
typeof {};          // "object"
typeof [];          // "object"
typeof function(){} // "function"
```

### 2.2 特殊注意事项

1. **null 的特殊性**
   - `typeof null` 返回 "object" 是一个历史遗留问题
   - 要准确判断 null，应该使用 `value === null`

2. **函数类型**
   - 函数是特殊的对象，`typeof` 返回 "function"
   - 包括普通函数、箭头函数、生成器函数等

## 3. typeof 的安全机制

### 3.1 变量检测

```javascript
// 安全地检查未声明的变量
if (typeof someVar === 'undefined') {
    console.log('变量未声明或未定义');
}

// 对比直接使用未声明变量会报错
if (someVar === undefined) { // ReferenceError
    // ...
}
```

### 3.2 特殊情况处理

1. **变量未声明 vs 变量已声明但未赋值**
   ```javascript
   let x;
   console.log(typeof x);    // "undefined"
   console.log(typeof y);    // "undefined" (y 未声明)
   ```

2. **暂时性死区（TDZ）与 typeof 的特例**
   ```javascript
   // 正常情况：typeof 对未声明变量是安全的
   console.log(typeof undeclaredVar);  // "undefined"
   
   // 但在暂时性死区中，typeof 会导致 ReferenceError
   console.log(typeof x);  // ReferenceError: x is not defined
   let x = 42;             // 这里的 let 声明导致了上面的暂时性死区
   ```
   
   - ES6 的暂时性死区打破了 typeof 操作符的安全机制
   - 当变量被 let/const 声明但尚未初始化时，typeof 不再安全
   - 这是 ES6 块级作用域实现的副作用

### 3.3 实用场景

1. **环境特性检测**
   ```javascript
   if (typeof localStorage !== 'undefined') {
       // 安全地使用 localStorage
   }
   ```

2. **API 兼容性检查**
   ```javascript
   if (typeof Promise !== 'undefined') {
       // 使用 Promise
   }
   ```

3. **类型检查工具函数**
   ```javascript
   function getType(value) {
       if (value === null) return 'null';
       return typeof value;
   }
   ```
