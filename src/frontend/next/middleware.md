# Next.js 中间件（Middleware）详解

## 1. 基本概念

中间件（Middleware）是 Next.js 提供的一个强大功能，允许你在请求到达路由处理之前执行代码，从而实现：

- 请求拦截和修改
- 响应修改和重定向
- 鉴权和访问控制
- 日志记录和监控
- 缓存控制
- A/B 测试

中间件在应用的边缘网络层执行，而不是在服务器端，这使得它非常适合实现需要在所有页面加载前执行的逻辑。

## 2. 基本用法

### 2.1 创建中间件文件

在 Next.js 项目中创建中间件非常简单，只需在项目根目录（与 `app` 或 `pages` 同级）创建 `middleware.ts` 或 `middleware.js` 文件：

```ts
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // 在这里编写中间件逻辑
  return NextResponse.next();
}
```

### 2.2 基础示例

以下是一个简单的鉴权中间件示例：

```ts
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // 检查请求中的角色参数
  const role = searchParams.get('role');
  if (role === 'admin') {
    // 允许请求继续
    return NextResponse.next();
  }

  // 重定向未授权用户到登录页面
  return NextResponse.redirect(new URL('/login', request.url));
}

// 设置匹配路径
export const config = {
  matcher: '/about/:path*',
};
```

这个示例中，中间件会拦截所有 `/about` 开头的请求，检查查询参数中的 `role` 是否为 `admin`，如果不是则重定向到登录页面。

## 3. 路径匹配配置

中间件可以配置为只在特定路径上执行，这通过 `config.matcher` 来设置。

### 3.1 基本匹配器

```ts
export const config = {
  // 字符串匹配
  matcher: '/about/:path*',

  // 或使用数组匹配多个路径
  matcher: ['/about/:path*', '/dashboard/:path*'],
};
```

匹配语法基于 [path-to-regexp](https://github.com/pillarjs/path-to-regexp) 库，支持复杂的路径模式。

### 3.2 高级匹配器

匹配器支持更复杂的条件判断，包括检查请求头、查询参数和 Cookie：

```ts
export const config = {
  matcher: [
    {
      source: '/api/:path*',
      has: [
        { type: 'header', key: 'Authorization', value: 'Bearer .*' },
        { type: 'query', key: 'userId' },
      ],
      missing: [{ type: 'cookie', key: 'session' }],
    },
  ],
};
```

这个示例中，中间件会匹配:

- 路径以 `/api/` 开头
- 请求头包含 `Authorization` 且值以 `Bearer ` 开头
- 查询参数包含 `userId`（值不限）
- Cookie 中不存在 `session`

### 3.3 动态匹配（不使用 matcher）

对于更灵活的控制，你可以不使用 `matcher` 配置，而是在中间件函数内部实现逻辑判断：

```ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 仅处理特定路径
  if (pathname.startsWith('/about')) {
    // 鉴权逻辑
    const { searchParams } = request.nextUrl;
    const role = searchParams.get('role');

    if (role === 'admin') {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 所有其他路径直接放行
  return NextResponse.next();
}
```

> 注意：不导出 `config` 配置时，中间件默认对所有路由执行。

## 4. Cookie 操作

中间件提供了便捷的 API 来读取和设置 Cookie。

### 4.1 读取 Cookie

```ts
export function middleware(request: NextRequest) {
  // 读取单个 Cookie
  const token = request.cookies.get('token');
  console.log(token); // { name: 'token', value: 'xxx' } 或 undefined

  // 获取 Cookie 值
  const tokenValue = token?.value;

  // 获取所有 Cookie
  const allCookies = request.cookies.getAll();
  console.log(allCookies); // [{ name: 'cookie1', value: 'value1' }, ...]

  // 检查 Cookie 是否存在
  const hasToken = request.cookies.has('token');

  return NextResponse.next();
}
```

### 4.2 设置和删除 Cookie

```ts
export function middleware(request: NextRequest) {
  // 创建响应对象
  const response = NextResponse.next();

  // 简单设置 Cookie
  response.cookies.set('theme', 'dark');

  // 设置带选项的 Cookie
  response.cookies.set('token', 'your-token-value', {
    httpOnly: true, // 禁止客户端 JavaScript 访问
    secure: true, // 仅通过 HTTPS 发送
    sameSite: 'strict', // CSRF 保护
    maxAge: 60 * 60 * 24, // 1天过期（秒）
    path: '/', // Cookie 作用路径
  });

  // 删除 Cookie
  response.cookies.delete('old-cookie');

  return response;
}
```

## 5. Header 操作

中间件可以读取和修改 HTTP 头信息。

### 5.1 读取请求头

```ts
export function middleware(request: NextRequest) {
  // 读取单个请求头
  const userAgent = request.headers.get('user-agent');
  const contentType = request.headers.get('content-type');

  // 检查请求头是否存在
  const hasAuth = request.headers.has('authorization');

  console.log(`User Agent: ${userAgent}`);

  return NextResponse.next();
}
```

### 5.2 设置响应头

```ts
export function middleware(request: NextRequest) {
  // 方法 1: 使用 NextResponse.next() 的选项
  const response = NextResponse.next({
    headers: {
      'x-custom-header': 'custom-value',
      'cache-control': 'public, max-age=3600',
    },
  });

  // 方法 2: 使用 response.headers API
  response.headers.set('x-powered-by', 'Next.js');
  response.headers.append('server-timing', 'db;dur=53');

  return response;
}
```

## 6. 响应处理

中间件提供多种方式处理请求和生成响应。

### 6.1 请求放行

```ts
// 允许请求继续到目标路由
return NextResponse.next();

// 带修改的请求放行
return NextResponse.next({
  headers: { 'x-modified-by': 'middleware' },
  // 可以添加其他修改
});
```

### 6.2 重定向

```ts
// 重定向到其他 URL
return NextResponse.redirect(new URL('/login', request.url));

// 带状态码的重定向（例如永久重定向）
return NextResponse.redirect(new URL('/new-page', request.url), {
  status: 301,
});
```

### 6.3 重写（改变路由而不重定向）

```ts
// 在不改变浏览器 URL 的情况下，将请求内部重写到另一个路由
return NextResponse.rewrite(new URL('/internal-page', request.url));
```

### 6.4 直接返回响应

```ts
// 返回 JSON 响应
return NextResponse.json(
  { message: 'Unauthorized', error: 'Missing authentication' },
  { status: 401 }
);

// 返回自定义响应
return new NextResponse(JSON.stringify({ success: false }), {
  status: 403,
  headers: {
    'content-type': 'application/json',
  },
});
```

## 7. 实用示例

### 7.1 基础鉴权中间件

```ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  // 保护的路径
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      // 存储原始URL以便登录后重定向回来
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}
```

### 7.2 国际化语言检测

```ts
export function middleware(request: NextRequest) {
  // 获取请求中的语言偏好
  const locale =
    request.cookies.get('NEXT_LOCALE') ||
    request.headers.get('accept-language')?.split(',')[0] ||
    'en';

  // 当访问根路径时重定向到本地化路径
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // 添加语言信息到所有响应中
  const response = NextResponse.next();
  response.headers.set('x-locale', locale);

  return response;
}
```

### 7.3 速率限制

```ts
// 简单的内存缓存实现（生产环境应使用 Redis 等分布式缓存）
const rateLimit = new Map();

export function middleware(request: NextRequest) {
  // 获取客户端 IP
  const ip = request.ip || 'unknown';

  if (request.nextUrl.pathname.startsWith('/api')) {
    // 检查限制
    const currentTimestamp = Date.now();
    const requestHistory = rateLimit.get(ip) || [];

    // 只保留最近 60 秒的请求
    const recentRequests = requestHistory.filter(
      (timestamp) => currentTimestamp - timestamp < 60 * 1000
    );

    // 判断是否超过限制 (每分钟 30 次)
    if (recentRequests.length >= 30) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // 记录新请求
    recentRequests.push(currentTimestamp);
    rateLimit.set(ip, recentRequests);
  }

  return NextResponse.next();
}
```

## 8. 最佳实践

1. **性能优化**：中间件在每个匹配的请求上执行，应尽量保持轻量和高效。

2. **错误处理**：添加 try-catch 块来捕获错误，避免中间件崩溃影响整个应用。

3. **使用边缘计算功能**：中间件运行在边缘网络，适合处理地理位置检测、A/B 测试等任务。

4. **仅在必要时使用重定向**：重定向会增加额外的网络往返，影响性能。

5. **适当的路径匹配**：使用精确的 matcher 配置，避免不必要的中间件执行。

## 参考资源

- [Next.js 中间件官方文档](https://nextjs.org/docs/advanced-features/middleware)
- [NextResponse API 参考](https://nextjs.org/docs/app/api-reference/functions/next-response)
- [Next.js Request API 参考](https://nextjs.org/docs/app/api-reference/functions/next-request)
