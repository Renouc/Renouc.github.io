# Nextjs 中间件

Next.js 中间件是一个特殊的路由，它允许你定义在请求到达路由之前或之后运行的代码。

中间件可以访问请求和响应对象，并允许你修改它们。

## 示例

在 `app` 或 `pages` 同级目录下创建 `middleware.ts` 文件。

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const role = searchParams.get("role");
  if (role === "admin") {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

// 设置匹配路径
export const config = {
  matcher: "/about/:path*",
};
```

> 上面的示例，会匹配 `/about/:path*` 路径下的所有请求。不满足条件的请求，会重定向到 `/login` 路径。

## 匹配路径

### 匹配器

`matcher` 可以是一个字符串或字符串数组，被匹配的请求会执行 `middleware` 函数。

`matcher` 的匹配语法来自于 [path-to-regexp](https://github.com/pillarjs/path-to-regexp)。

```ts
export const config: MiddlewareConfig = {
  matcher: "/about/:path*",
};

// 还可以使用数组
export const config: MiddlewareConfig = {
  matcher: ["/about/:path*", "/dashboard/:path*"],
};
```

`matcher` 的强大可远不止正则表达式，matcher 还可以判断查询参数、cookies、headers：

```ts
export const config: MiddlewareConfig = {
  matcher: [
    {
      source: "/api/*",
      has: [
        { type: "header", key: "Authorization", value: "Bearer Token" },
        { type: "query", key: "userId", value: "123" },
      ],
      missing: [{ type: "cookie", key: "session", value: "active" }],
    },
  ],
};
```

> 在这个例子中，不仅匹配了路由地址，还要求 `header` 的 `Authorization` 必须是 `Bearer Token`，查询参数的 `userId` 为 123，且 `cookie` 里的 `session` 值不是 active。

### 不使用匹配器

如果匹配过于复杂，可以不使用匹配器，直接在 `middleware` 函数里判断请求是否满足条件。

```ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 只处理特定路径
  if (pathname.startsWith("/about")) {
    const { searchParams } = request.nextUrl;
    const role = searchParams.get("role");

    if (role === "admin") {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 对于其他路径，直接放行
  return NextResponse.next();
}
```

> 不具名导出 `config` 配置，所有的路径都会执行 `middleware` 函数。

## 读取和设置 cookie

```ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const cookies = request.cookies;

  // 假设 传入的cookie为 name=renouc; age=18
  // 获取 单个cookie
  const cookie = cookies.get("name");
  console.log("🍇 cookie：", cookie); // { name: 'renouc' }

  // 获取 所有cookie
  const allCookies = cookies.getAll();
  console.log("🍇 allCookies：", allCookies); // [ { name: 'name', value: 'renouc' }, { name: 'age', value: '18' } ]

  // 判断cookie是否存在
  const isCookieExist = cookies.has("name");
  console.log("🍇 isCookieExist：", isCookieExist); // true

  // 设置cookie
  const response = NextResponse.next();

  // 简单设置cookie
  response.cookies.set("name", "value");

  // 详细的设置cookie
  response.cookies.set("name", "value", {
    httpOnly: true,
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 30,
    path: "/",
  });

  // 删除cookie
  response.cookies.delete("name");

  return response;
}

export const config = {
  matcher: "/about/:path*",
};
```

## 读取和设置 headers

### 读取 `headers`

```ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // 获取请求头
  console.log(request.headers.get("x-a"));

  // 判断请求头是否存在
  console.log(request.headers.has("x-a")); // false
  console.log(request.headers.has("cookie")); // true

  return NextResponse.next();
}

export const config = {
  matcher: "/about/:path*",
};
```

### 设置 `headers`

```ts
import { NextResponse } from "next/server";

export function middleware() {
  const response = NextResponse.next();
  response.headers.set("x-custom-header", "hello world");
  return response;
}

export const config = {
  matcher: "/about/:path*",
};
```

```ts
import { NextResponse } from "next/server";

export function middleware() {
  const response = NextResponse.next({
    headers: {
      "x-custom-header": "hello world",
    },
  });
  return response;
}

export const config = {
  matcher: "/about/:path*",
};
```

## 直接响应
```ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const role = searchParams.get("role");
  if (role === "admin") {
    return NextResponse.next();
  }

  //   return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
  //     status: 401,
  //     headers: {
  //       "content-type": "text/plain",
  //     },
  //   });

  // 或者
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export const config = {
  matcher: "/about/:path*",
};
```

> 更多 NextResponse 的信息，参考 [NextResponse](https://nextjs.org/docs/app/api-reference/functions/next-response)。