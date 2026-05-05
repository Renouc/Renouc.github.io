# Next.js 中间件

Middleware 在请求进入页面或 API 之前运行，适合处理重定向、重写、简单鉴权、语言识别和请求头改写。它不适合承载复杂业务逻辑。

## 基本用法

在项目根目录或 `src` 目录下创建 `middleware.ts`。

```ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}
```

中间件默认会匹配所有路径。实际项目中应使用 `matcher` 限定范围。

```ts
export const config = {
  matcher: ['/dashboard/:path*'],
};
```

## matcher

匹配单个路径：

```ts
export const config = {
  matcher: '/about',
};
```

匹配多个路径：

```ts
export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*'],
};
```

排除静态资源和内部路径：

```ts
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

如果判断依赖运行时数据，可以在中间件里手动分支。

```ts
export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}
```

优先用 `matcher` 缩小执行范围，减少每次请求的额外开销。

## Cookie

读取请求 Cookie：

```ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

设置响应 Cookie：

```ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.cookies.set('visited', '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  return response;
}
```

删除 Cookie：

```ts
export function middleware() {
  const response = NextResponse.next();
  response.cookies.delete('token');
  return response;
}
```

## Header

读取请求头：

```ts
export function middleware(request: NextRequest) {
  const acceptLanguage = request.headers.get('accept-language');

  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}
```

改写传给后续处理的请求头：

```ts
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
```

设置响应头：

```ts
export function middleware() {
  const response = NextResponse.next();
  response.headers.set('x-from-middleware', 'true');
  return response;
}
```

## 重定向与重写

放行请求：

```ts
return NextResponse.next();
```

重定向会改变浏览器地址栏：

```ts
export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL('/login', request.url));
}
```

重写不会改变浏览器地址栏，只改变实际命中的资源：

```ts
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/maintenance';

  return NextResponse.rewrite(url);
}
```

直接返回响应：

```ts
export function middleware() {
  return new NextResponse('Forbidden', {
    status: 403,
  });
}
```

## 常见场景

基础鉴权：

```ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

语言识别：

```ts
const locales = ['zh-CN', 'en-US'];
const defaultLocale = 'zh-CN';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some((locale) => pathname.startsWith(`/${locale}`));

  if (hasLocale) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(url);
}
```

灰度路由：

```ts
export function middleware(request: NextRequest) {
  const group = request.cookies.get('experiment')?.value;

  if (group === 'new-home' && request.nextUrl.pathname === '/') {
    return NextResponse.rewrite(new URL('/home-new', request.url));
  }

  return NextResponse.next();
}
```

## 注意事项

- Middleware 运行在 Edge Runtime，不能依赖 Node.js 专属 API。
- 不要在中间件里执行重型计算或复杂数据库查询。
- 认证逻辑可以做“是否有 token”的快速判断，完整权限校验应放在服务端业务层。
- `matcher` 要避开 `_next/static`、图片、favicon 等静态资源。
- 重写适合内部路由映射，重定向适合让用户地址栏发生变化。
- 修改请求头时要创建新的 `Headers`，不要直接改原对象。

## 结论

Middleware 适合做请求进入应用前的轻量控制。实现时先明确匹配范围，再选择放行、重定向、重写或直接返回响应；复杂业务规则应回到服务端逻辑中处理。
