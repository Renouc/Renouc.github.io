# Koa

Koa 是由 Express 背后的团队设计的新 Web 框架，旨在为 Web 应用程序和 API 提供更小、更具表现力、更强大的基础。通过利用异步函数，Koa 允许您放弃回调并大大增加错误处理。Koa 在其核心中没有捆绑任何中间件，它提供了一套优雅的方法，使编写服务器变得快速而有趣。

## 起步

### 安装

```bash
npm install koa
```

### Hello World

```js
const Koa = require('koa');
const app = new Koa();

app.use((ctx) => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```

## 中间件

洋葱模型是一种软件设计模式，它允许多个组件按顺序运行，每个组件都处理一部分任务。

```js
const Koa = require('koa');

const app = new Koa();

const middleware1 = async (ctx, next) => {
  console.log('----middleware1 start----');
  await next();
  ctx.body = {
    ...ctx.body,
    data: 'middleware1',
  };
  console.log('----middleware1 end----');
};

const middleware2 = async (ctx, next) => {
  console.log('----middleware2 start----');
  await next();
  console.log('----middleware2 end----');
};

const middleware3 = async (ctx, next) => {
  console.log('----middleware3 start----');
  await next();
  console.log('----middleware3 end----');
};

const middleware4 = async (ctx, next) => {
  console.log('----middleware4 start----');
  console.log('----middleware4 body start----');
  ctx.body = {
    code: 200,
    message: 'Hello World',
  };
  console.log('----middleware4 body end----');
  console.log('----middleware4 end----');
  next();
};

const middleware5 = async (ctx, next) => {
  console.log('----middleware5 start----');
  console.log('----middleware5 end----');
};

app.use(middleware1);
app.use(middleware2);
app.use(middleware3);
app.use(middleware4);
app.use(middleware5);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

上面例子的打印结果为:

```p
----middleware1 start----
----middleware2 start----
----middleware3 start----
----middleware4 start----
----middleware4 body start----
----middleware4 body end----
----middleware4 end----
----middleware5 start----
----middleware5 end----
----middleware3 end----
----middleware2 end----
----middleware1 end----
```

响应结果为：

```json
{
  "code": 200,
  "message": "Hello World",
  "data": "middleware1"
}
```

想要执行下一个中间件，需要调用 next() 函数。通过 await 语法，可以等待下一个中间件执行完毕。

## 路由

```bash
npm install @koa/router
```

@koa/router 是 koa 的路由模块，使用它可以实现路由的匹配。

```js
const Koa = require('koa');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router();

router.get('/', (ctx) => {
  ctx.body = '管理员首页';
});

router.get('/dashboard', (ctx) => {
  ctx.body = '管理仪表盘';
});

app.use(router.routes()).use(router.allowedMethods()); // 添加路由中间件

app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
```
