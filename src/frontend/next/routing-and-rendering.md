# Next.js 路由与渲染

Next.js 同时支持 App Router 和 Pages Router。新项目优先使用 App Router；维护老项目时，需要理解 Pages Router 的动态路由规则和数据获取方式。

## App Router 文件约定

App Router 以 `app` 目录为核心，目录结构就是路由结构。

| 文件 | 作用 |
| --- | --- |
| `page.tsx` | 当前路由段的页面内容 |
| `layout.tsx` | 持久布局，跨子路由保留状态 |
| `template.tsx` | 每次导航都会重新挂载的布局包装 |
| `loading.tsx` | 当前路由段的 Suspense fallback |
| `error.tsx` | 当前路由段的错误边界，必须是客户端组件 |
| `not-found.tsx` | 当前路由段的 404 UI |

页面组件接收 `params` 和 `searchParams`。Next.js 15+ 中它们是 Promise，在服务端组件中可以直接 `await`；Next.js 13/14 中通常是普通对象，老项目迁移时要按当前版本写法处理。

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <h1>{slug}</h1>;
}
```

客户端组件不能声明为 `async`，可以用 React 的 `use` 读取 Promise。

```tsx
'use client';

import { use } from 'react';

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  return <h1>{slug}</h1>;
}
```

## Pages Router 动态路由

Pages Router 以 `pages` 目录为核心，动态路由通过文件名表达。

| 文件 | 匹配路径 | `query` 结果 |
| --- | --- | --- |
| `pages/blog/[slug].tsx` | `/blog/a` | `{ slug: 'a' }` |
| `pages/shop/[...slug].tsx` | `/shop/a/b` | `{ slug: ['a', 'b'] }` |
| `pages/shop/[[...slug]].tsx` | `/shop` | `{ slug: undefined }` |

三种动态段的差异：

- `[slug]`：必选单段。
- `[...slug]`：必选多段。
- `[[...slug]]`：可选多段，可以匹配父路径。

Pages Router 的页面级数据获取通常依赖 `getStaticProps`、`getStaticPaths`、`getServerSideProps`。这些能力仍然适合维护老项目，但新项目不建议再主动选它作为默认路由系统。

## 布局、模板和加载状态

`layout.tsx` 会包裹同级和子级页面，路由切换时尽量复用。

```tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>;
}
```

根布局是 `app/layout.tsx`，必须包含 `html` 和 `body`。

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

`template.tsx` 和 `layout.tsx` 的区别在于生命周期。`layout` 适合保留导航栏、侧栏、播放器等状态；`template` 适合希望每次进入页面都重置的场景。

`loading.tsx` 会自动包住当前路由段下的页面内容，相当于给页面加了一个 Suspense 边界。

```tsx
export default function Loading() {
  return <p>Loading...</p>;
}
```

## 错误页和 not-found

`error.tsx` 必须是客户端组件，因为它依赖 React Error Boundary。

```tsx
'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <button onClick={() => reset()}>重试</button>;
}
```

`not-found.tsx` 有两个触发来源：

- 组件中调用 `notFound()`。
- 访问不存在的路由。

子目录里的 `not-found.tsx` 只会处理该路由段内主动调用 `notFound()` 的场景。直接访问不存在路径时，最终由根级 `app/not-found.tsx` 处理。

```tsx
import { notFound } from 'next/navigation';

export default function Page({ found }: { found: boolean }) {
  if (!found) {
    notFound();
  }

  return <div>Detail</div>;
}
```

## 渲染模式

App Router 中默认是服务端组件。是否动态渲染主要由数据获取、缓存策略和动态 API 决定。

| 模式 | 触发方式 | 适用场景 |
| --- | --- | --- |
| 静态渲染 | 默认缓存、构建期可确定 | 文档、营销页、变化少的内容 |
| 动态渲染 | 使用 `cookies()`、`headers()`、`no-store` 等 | 用户态页面、实时数据 |
| ISR | `next: { revalidate }` | 内容会变，但不需要每次请求实时 |
| 客户端渲染 | `'use client'` 和浏览器状态 | 强交互组件、依赖浏览器 API |

常见写法：

```tsx
export default async function Page() {
  const data = await fetch('https://example.com/api/posts', {
    next: { revalidate: 60 },
  }).then((res) => res.json());

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

如果请求必须每次实时获取：

```tsx
await fetch('https://example.com/api/profile', {
  cache: 'no-store',
});
```

## 迁移时的判断标准

- 新页面优先放在 `app` 目录，用服务端组件作为默认选择。
- 只在需要浏览器状态、事件处理或浏览器 API 时加 `'use client'`。
- Pages Router 里的动态路由可以先保持原状，不必为了迁移而一次性重写。
- 页面共享外壳用 `layout`，进入页面需要重置状态时用 `template`。
- 404 UI 放根级 `app/not-found.tsx`，业务对象不存在时在页面里调用 `notFound()`。
