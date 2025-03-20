---
title: cookie
date: 2024-09-21 14:27:48
tags:
  - cookie
categories:
  - cookie
---

Cookie 是直接存储在浏览器中的一小串数据。它们是 HTTP 协议的一部分，由 RFC 6265 规范定义。

Cookie 通常是由 Web 服务器使用响应 Set-Cookie HTTP-header 设置的。然后浏览器使用 Cookie HTTP-header 将它们自动添加到（几乎）每个对相同域的请求中。

document.cookie 属性用于读取和设置 Cookie。

<!-- more -->

### 读取 cookie

```js
consoloe.log(document.cookie); // "key1=value1; key2=value2; key3=value3"
```

### 设置 cookie

我们可以写入 document.cookie。但这不是一个数据属性，它是一个 [访问器（getter）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/get)。对其的赋值操作会被特殊处理。

```js
document.cookie = "user=Tom;";
```

运行上述代码，会新添加一个 cookie。这是因为 document.cookie= 操作不是重写整所有 cookie。它只设置代码中提到的 cookie user。

> 限制
> encodeURIComponent 编码后的 name=value 对，大小不能超过 4KB。因此，我们不能在一个 cookie 中保存大的东西。
> 每个域的 cookie 总数不得超过 20+ 左右，具体限制取决于浏览器。

cookie 还有其他的属性，如 path、domain、expires、secure 等。
可以通过 `;` 分隔来设置这些属性。

```js
document.cookie =
  "user=Tom; path=/; domain=example.com; expires=Tue, 24 Sep 2024 10:35:47 GMT";
```

### domain

只能将 domain 的值设置为当前域名或者当前域名的上级域名（如当前域名为 a.test.com，那么 domain 只能设置为 a.test.com 或 test.com）

不给 cookie 设置 domain 属性， 默认为当前域名。

### path

设置 path 后，只有访问了相匹配的路径才会携带 cookie；匹配为前缀匹配，如设置了 `path=/api`，那么访问 `/api` 和 `/api/a` 都会携带 cookie

不设置时，默认为根路径 `/`

### expires，max-age

expires 是用来设置 cookie 过期时间的；值的格式为 GMT，可以通过 date.toUTCString() 获取

```js
// 当前时间 +1 天
let date = new Date(Date.now() + 1000 * 60 * 60 * 24);
date = date.toUTCString();
document.cookie = "user=John; expires=" + date;
```

执行上述代码，会生成一个 名为 `user`的 cookie，在一天后的当前时间会被浏览器清除

max-age 也是用来设置过期时间的，不过它的值直接表示多少秒后过期，如果设置的值小于等于 0 则会立即被浏览器清除

```js
// cookie 会在一小时后失效
document.cookie = "user=John; max-age=3600";

// 删除 cookie（让它立即过期）
document.cookie = "user=John; max-age=0";
```

### secure

secure 设置后 cookie 只能在 https 环境下访问

不设置时，默认 http 和 https 都可访问

```js
// 设置 cookie secure（只在 HTTPS 环境下可访问）
document.cookie = "user=John; secure";
```
