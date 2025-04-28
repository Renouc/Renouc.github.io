# 类型小知识

## 对象字面量的额外属性检查（Excess Property Checks）

在 TypeScript 中，**对象字面量**在赋值或作为函数参数时，会触发"额外属性检查"（Excess Property Checks）。这是 TypeScript 设计用来帮助开发者捕捉拼写错误或不小心多写属性的机制。

### 现象说明

假设有如下类型和函数：

```ts
type Article = {
  title: string;
  content: string;
};

function printArticle(article: Article) {
  console.log(article.title, article.content);
}
```

#### 1. 直接传递对象字面量

```ts
printArticle({
  title: "Hello",
  content: "World",
  author: "John" // ❌ 报错：对象字面量有多余属性 author
});
```

TypeScript 会报错：

```
Argument of type '{ title: string; content: string; author: string; }' is not assignable to parameter of type 'Article'.
  Object literal may only specify known properties, and 'author' does not exist in type 'Article'.
```

#### 2. 先赋值给变量再传递

```ts
const obj = {
  title: "Hello",
  content: "World",
  author: "John"
};

printArticle(obj); // ✅ 不报错
```

此时 TypeScript 只检查 `obj` 是否兼容 `Article` 类型（即至少有 `title` 和 `content`），不会报多余属性的错。

### 为什么会有这种差异？

这种设计是为了在开发过程中提供更好的类型安全：

1. **直接传字面量时**：TypeScript 假设你正在创建一个新对象，所以会严格检查所有属性，防止拼写错误或多余属性。
2. **变量赋值/传参时**：TypeScript 认为你可能是在处理一个已经存在的对象，所以只检查必要的属性是否存在。

### 解决方法

如果你想直接传字面量且不报错，可以使用类型断言：

```ts
printArticle({
  title: "Hello",
  content: "World",
  author: "John"
} as Article); // ✅ 使用类型断言
```

或者只传必要的属性：

```ts
printArticle({
  title: "Hello",
  content: "World"
}); // ✅ 只传必要的属性
```

---

### 总结

- **直接传对象字面量**：TypeScript 会做额外属性检查，不能有类型定义之外的属性。
- **变量赋值/传参**：只要类型兼容，多余属性不会报错。
- **适用场景**：这种机制特别适合在开发过程中捕捉拼写错误或不小心多写的属性。

---

**参考链接：**

- [TypeScript Handbook: Excess Property Checks](https://www.typescriptlang.org/docs/handbook/2/objects.html#excess-property-checks)
- [TypeScript Handbook: Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
