---
title: js装饰器
date: 2023-10-20 23:06:23
banner_img: https://w.wallhaven.cc/full/6d/wallhaven-6dejpx.jpg
index_img: https://w.wallhaven.cc/full/6d/wallhaven-6dejpx.jpg
categories: js随笔
tag: [js, 前端]
---

装饰器通常采用函数的形式，接受一个目标对象作为参数，然后返回一个新的对象，通常在新对象中会扩展或修改目标对象的功能。装饰器可以应用于类、方法、属性等。

<!-- more -->

## JavaScript 装饰器

JavaScript 装饰器的底层实现原理涉及到对象属性描述符和元编程，通常使用 Object.defineProperty 来实现。下面是一些关键概念和实现原理：

1. 属性描述符：在 JavaScript 中，每个对象的属性都有一个属性描述符，它包含属性的配置信息，如 value（属性的值），writable（是否可写），enumerable（是否可枚举），configurable（是否可配置）等。

2. 元编程：元编程是指在运行时修改对象的行为或结构。JavaScript 中，你可以使用元编程来操作属性描述符，以改变对象的行为。

3. Object.defineProperty：这是一个用于在对象上定义新属性或修改现有属性的方法。你可以使用它来设置属性描述符的各种特性。

装饰器的实现原理基于以上概念，通常遵循以下步骤：

1. 创建一个装饰器函数，它将接受目标对象、属性名称（或目标对象的原型）以及属性描述符作为参数。装饰器函数可以修改属性描述符或实现其他自定义行为。

2. 在装饰器函数内部，可以修改属性描述符，例如，添加新的方法或修改方法的行为。然后，使用 Object.defineProperty 来重新定义属性，以将装饰器的效果应用到目标对象上。

下面是一个伪代码示例，演示了如何实现一个简单的方法装饰器：

```js
function myMethodDecorator(target, methodName, descriptor) {
  const originalMethod = descriptor.value // 获取原始方法

  descriptor.value = function (...args) {
    // 在方法执行前添加自定义行为
    console.log(`Before calling ${methodName}`)

    // 调用原始方法
    const result = originalMethod.apply(this, args)

    // 在方法执行后添加自定义行为
    console.log(`After calling ${methodName}`)

    return result
  }

  return descriptor
}

class MyClass {
  @myMethodDecorator
  myMethod() {
    console.log('Original method is called.')
  }
}

const obj = new MyClass()
obj.myMethod()
```

在上述示例中，myMethodDecorator 装饰器函数接受目标类、方法名和属性描述符。它在描述符上修改了 value，以在方法执行前后添加自定义行为。

总之，JavaScript 装饰器的底层实现原理涉及元编程和 Object.defineProperty 来动态修改对象属性的配置信息，以实现对类、方法或属性的扩展和修改。这是一种强大的模式，使得代码可以更灵活、可维护和可扩展。
