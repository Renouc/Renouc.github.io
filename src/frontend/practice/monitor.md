# 前端监控

本文将探讨前端监控的几个关键领域，包括错误、性能、用户行为和 API 请求的监控。

## 现成平台

在自建监控系统之前，了解市面上成熟的监控平台是很有必要的。它们通常提供开箱即用的强大功能。

1.  **Sentry**
    - 业界领先的错误监控平台，功能强大。
    - 可独立部署（Self-hosted），方便数据私有化。
    - 对 Source Map 支持非常友好，能精确定位到源码位置。

## 错误监控

错误监控是前端监控最基础、最重要的一环。

### 1. JS 运行时错误

通过监听全局事件来捕获大部分运行时错误。

- `window.onerror`：

  ```javascript
  window.onerror = function (message, source, lineno, colno, error) {
    console.log('捕获到错误：', { message, source, lineno, colno, error });
    // 在这里上报错误
    return true; // 返回 true 可阻止错误在控制台抛出
  };
  ```

- `window.addEventListener('error', ...)`：
  能捕获到更详细的错误信息，并且可以捕获资源加载失败的错误。
  ```javascript
  window.addEventListener(
    'error',
    (event) => {
      console.log('捕获到错误：', event);
      // 脚本错误 event.message, event.filename, event.lineno, event.colno, event.error
      // 资源加载错误 event.target 可以获取到加载失败的 DOM 元素
      // 在这里上报错误
    },
    true
  ); // 使用捕获阶段，能更早地捕获错误
  ```

### 2. Promise 错误

未被 `catch` 的 Promise 错误不会被 `onerror` 或 `error` 事件捕获，需要专门监听。

```javascript
window.addEventListener('unhandledrejection', (event) => {
  console.log('捕获到未处理的 Promise 异常：', event.reason);
  // event.reason 通常是 Error 对象
  // 在这里上报错误
});
```

### 3. 资源加载错误

当页面上的静态资源（如 `<img>`, `<script>`, `<link>`）加载失败时，`window.addEventListener('error', ...)` 在捕获阶段可以监听到。

```javascript
window.addEventListener(
  'error',
  (event) => {
    const target = event.target;
    if (target && (target.src || target.href)) {
      console.log('资源加载错误:', target.src || target.href);
      // 上报资源加载错误
    }
  },
  true
);
```

### 4. 框架错误

- **Vue**: `app.config.errorHandler`
- **React**: 使用 Error Boundaries (错误边界)

## 性能监控

性能监控关注页面的加载速度和响应性，核心指标是 Web Vitals。

### 核心性能指标

- **FP (First Paint - 首次绘制)**: 浏览器首次在屏幕上渲染任何像素的时间点。
- **FCP (First Contentful Paint - 首次内容绘制)**: 浏览器首次渲染 DOM 内容（文本、图片等）的时间点。
- **LCP (Largest Contentful Paint - 最大内容绘制)**: 视口中最大可见内容元素渲染完成的时间。
- **FID (First Input Delay - 首次输入延迟)**: 用户首次与页面交互（点击、输入等）到浏览器实际响应该交互的时间。
- **CLS (Cumulative Layout Shift - 累积布局偏移)**: 页面加载过程中所有意外布局偏移的累积分数。
- **TTFB (Time to First Byte - 首字节时间)**: 浏览器从发起请求到接收到第一个字节响应的时间。

### 如何采集性能数据

可以使用 `PerformanceObserver` API 来监听和采集这些指标，比手动计算更准确。

```javascript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.startTime);
    // entry.name 可能是 'first-paint', 'first-contentful-paint', 'largest-contentful-paint' 等
    // 在这里上报性能数据
  }
});
// 订阅需要观察的性能指标
observer.observe({ entryTypes: ['paint', 'lcp', 'fid', 'cls'] });
```

## 用户行为监控

了解用户如何与页面交互，可以帮助优化产品设计和用户体验。

### 1. 点击行为采集

通过事件委托，在根节点监听所有点击事件。

```javascript
document.addEventListener(
  'click',
  (e) => {
    const target = e.target;
    // 获取元素的标识，如 id, class, data-tracker 属性等
    const identifier =
      target.id || target.className || target.getAttribute('data-tracker');
    if (identifier) {
      console.log(`用户点击了: ${identifier}`);
      // 上报点击行为
    }
  },
  true
);
```

### 2. 页面滚动深度

可以使用 `IntersectionObserver` 来判断关键元素是否进入视口，从而了解用户滚动到了页面的哪个部分。

### 3. Session Replay

通过 `rrweb` 等库记录 DOM 的所有变化和用户交互（鼠标移动、点击、滚动），实现会话回放，精准复现用户操作场景。

## 页面访问痕迹采集

主要指 PV (Page View) 和 UV (Unique Visitor) 的统计，这是衡量网站流量和用户规模的基础指标。

- **PV (Page View - 页面浏览量)**
  - 用户每打开一个页面，就记为一个 PV。
  - 刷新页面或通过链接跳转到新页面，都会增加 PV。
  - PV 主要衡量用户访问的页面总数，反映了网站的被访问热度。

- **UV (Unique Visitor - 独立访客数)**
  - 指在特定时间段内（通常是一天）访问网站的独立用户数量。
  - 通过用户标识（如 Cookie、设备 ID 或登录账户）来区分不同用户。
  - 同一个用户在统计周期内多次访问只记为一个 UV。
  - UV 反映了实际访问网站的用户规模。

### SPA 路由监控实现

在 SPA (单页面应用) 中，由于页面跳转不涉及整个 HTML 的重新加载，所以需要额外关注前端路由的变化来准确统计 PV。

#### 1. 监听 `history` 模式

`history` 模式下，路由变化主要由 `history.pushState`、`history.replaceState` 和浏览器前进/后退操作触发。

- 浏览器的前进/后退会触发 `popstate` 事件，可以直接监听。
- `pushState` 和 `replaceState` 方法本身不会触发任何事件，需要通过重写（Wrap）这两个方法来添加自定义的通知逻辑。

```javascript
// 创建一个统一的路由变化处理函数
function handleRouteChange() {
  console.log('路由发生变化:', window.location.href);
  // 在此处上报 PV 数据
}

// 1. 重写 pushState
const originalPushState = history.pushState;
history.pushState = function (...args) {
  // 调用原始方法
  const result = originalPushState.apply(this, args);
  // 手动触发自定义事件
  window.dispatchEvent(new Event('pushstate'));
  return result;
};

// 2. 重写 replaceState
const originalReplaceState = history.replaceState;
history.replaceState = function (...args) {
  const result = originalReplaceState.apply(this, args);
  window.dispatchEvent(new Event('replacestate'));
  return result;
};

// 3. 监听事件
window.addEventListener('popstate', handleRouteChange); // 监听浏览器前进后退
window.addEventListener('pushstate', handleRouteChange); // 监听 pushState 调用
window.addEventListener('replacestate', handleRouteChange); // 监听 replaceState 调用
```

#### 2. 监听 `hash` 模式

`hash` 模式的路由变化会触发 `hashchange` 事件，直接监听即可。

```javascript
window.addEventListener('hashchange', () => {
  console.log('Hash 路由变化:', window.location.href);
  // 在此处上报 PV 数据
});
```

## API 请求监控

监控 API 的成功率、耗时和返回内容，是保障业务稳定性的关键。

### 1. 重写 `fetch`

```javascript
const originalFetch = window.fetch;
window.fetch = function (...args) {
  const startTime = Date.now();
  return originalFetch
    .apply(this, args)
    .then((res) => {
      const duration = Date.now() - startTime;
      console.log(
        `请求 ${args[0]} 成功，耗时 ${duration}ms, 状态码 ${res.status}`
      );
      // 上报成功数据
      return res;
    })
    .catch((err) => {
      const duration = Date.now() - startTime;
      console.error(`请求 ${args[0]} 失败，耗时 ${duration}ms`, err);
      // 上报失败数据
      throw err;
    });
};
```

### 2. 重写 `XMLHttpRequest`

对于 `XMLHttpRequest`，需要重写 `open` 和 `send` 方法，并在 `load` 和 `error` 事件中进行监听。

对于 `axios` 等库，使用其提供的拦截器（Interceptors）会更加方便。
