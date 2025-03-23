# this 的绑定

当一个函数被调用时，会创建一个会话记录（有时也称为执行上下文）。这个记录会包含函数在哪里被调用（调用栈）、函数的调用方式、传入的参数信息等。`this` 就是这个记录中的其中一个属性。

`this` 的值是在函数被调用时确定，而不是在函数被定义时确定。

## 默认绑定

非严格模式下，直接调用函数 `this` 绑定为全局对象（浏览器中为 `window`）。

```js
function foo() {
  console.log(this);
}

foo(); // window
```

严格模式下，直接调用函数 `this` 绑定为 `undefined`。

```js
"use strict";
function foo() {
  console.log(this);
}
foo(); // undefined
```

> [!NOTE] 注意：
> 默认绑定，决定 this 绑定对象的并不是调用位置是否为严格模式，
> 而是函数体是否处于严格模式。函数体处于严格模式 `this` 绑定到 `undefind`，
> 否则 `this` 会绑定到全局对象

```js
function foo1() {
  console.log(this);
}

(function () {
  "use strict";
  function foo2() {
    console.log(this);
  }
  foo1(); // window
  foo2(); // undefined
})();
```

## 隐式绑定

对象的方法调用中，`this` 绑定为调用该方法的对象。

```js
const obj = {
  a: 2,
  foo() {
    console.log(this.a);
  },
};

function foo2() {
  console.log(this.a);
}

var a = 1;
obj.foo2 = foo2;

obj.foo(); //  2
obj.foo2(); // 2
foo2(); // 1
```

对象属性引用链中只有最后一层在调用位置中起作用。

```js
const obj = {
  a: 1,
  foo() {
    console.log(this.a);
  },
};

const obj2 = {
  a: 2,
  obj,
};

obj2.obj.foo(); // 1
```

> [!NOTE] 注意：
> 当将对象的方法赋值给其他变量时，会发生隐式丢失

```js
const obj = {
  a: 1,
  foo() {
    console.log(this.a);
  },
};

const obj2 = {
  a: 2,
};

const foo2 = obj.foo;

obj2.foo = obj.foo;

var a = 3;
obj.foo(); // 1
obj2.foo(); // 2
foo2(); // 3
```

## 显示绑定

### call 和 apply

使用 `call` 或者 `apply` 直接执行函数，`this` 绑定为第一个参数。

它们的区别是， `call` 除了第一个参数外，还可以传入多个参数作为被绑定函数的参数，而 `apply` 则是传入一个参数数组，数组内的元素作为被绑定函数的参数。

```js
const obj = {
  total: 1,
};

function sum(num1, num2) {
  console.log(this.total + num1 + num2);
}

sum.call(obj, 2, 3);
sum.apply(obj, [2, 3]);
```

### bind

bind 会返回一个新函数，这个函数的 `this` 绑定为 bind 调用时传递的第一个参数。

```js
const obj = {};

function foo() {
  console.log(this);
}

const bar = foo.bind(obj);
bar(); // obj
```

`bind` 可以解决隐式丢失的问题，因为 `bind` 的新函数无法重新绑定 `this`（new 调用函数除外）。

```js
const obj1 = {
  a: 1,
};

const obj2 = {
  a: 2,
};

const obj3 = {
  a: 3,
};

function foo() {
  // this.a = 4;
  console.log(this.a);
}

const bar = foo.bind(obj1);

obj2.foo = foo;
obj3.foo = bar;

bar(); // 1
obj2.foo(); // 2
obj3.foo(); // 1

bar.call(obj2); // 1
new bar(); // undefined
```

`bind` 具有函数柯里化的功能。
```js
function foo(a, b) {
    console.log(this.num + a + b);
}

const obj = {
    num: 1,
}

const bar = foo.bind(obj, 1)
bar(2) // 4
```
> [!info] 注意：
> 当 不需要使用this，而只是想使用 `apply` 的参数展开或者 `bind` 的柯里化功能时，可以使用 `null` 来进行占位。
> 不过此时的绑定是默认绑定，将 `this` 指向全局对象。


## new 绑定
> [!info]
> 在 JavaScript 中，构造函数与传统面向对象语言有所不同。构造函数只是一些使用 `new` 操作符时被调用的函数。并不属于某个类，也不会实例化一个类。
> 他们甚至不能说是一种特殊的函数类型，它们只是被 `new` 操作符调用的普通函数而已。
> 实际上并不存在所谓的 “构造函数”，只有对于函数的 “构造调用”。

使用 new 调用函数，或者说发生构造函数调用时，会自动执行以下操作：

1. 创建一个全新的对象
2. 这个新对象会被执行[[Prototype]]连接
3. 这个新对象会绑定到函数调用的 `this`
4. 如果函数没有返回其他对象，那么 `new` 表达式中的函数会自动返回这个新对象

```js
function foo(a) {
  this.a = a;
}

const bar = new foo(2);
console.log(bar.a); // 2
```

## 箭头函数

箭头函数的 `this` 是根据外层（函数或者全局）作用域来决定的，会继承外层函数调用的 this 绑定。箭头函数的绑定无法被修改（`new` 也不行）

```js
function foo() {
  return () => {
    // 继承foo的this
    console.log(this.a);
  };
}

const obj1 = {
  a: 1,
};

const obj2 = {
  a: 2,
};

const bar = foo.call(obj1);
bar.call(obj2); // 1
```

```js
function fn1() {
  console.log("fn1", this);

  function fn2() {
    console.log("fn2", this);
  }

  const fn3 = () => {
    console.log("fn3", this);
  };

  fn2();
  fn3();
  new fn2();
}

const obj = { a: 1 };
fn1.call(obj);

// fn1 { a: 1 }
// fn2 window
// fn3 { a: 1 }
// fn2 {}
```
