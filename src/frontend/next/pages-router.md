# Pages Router

## 页面和布局

## 动态路由

### [slug]

| Route                  | Example URL | params          |
| ---------------------- | ----------- | --------------- |
| `pages/blog/[slug].js` | `/blog/a`   | `{ slug: 'a' }` |
| `pages/blog/[slug].js` | `/blog/b`   | `{ slug: 'b' }` |
| `pages/blog/[slug].js` | `/blog/c`   | `{ slug: 'c' }` |

### [...slug]

| Route                     | example url   | params                      |
| ------------------------- | ------------- | --------------------------- |
| `pages/shop/[...slug].js` | `/shop/a`     | `{ slug: ['a'] }`           |
| `pages/shop/[...slug].js` | `/shop/a/b`   | `{ slug: ['a', 'b'] }`      |
| `pages/shop/[...slug].js` | `/shop/a/b/c` | `{ slug: ['a', 'b', 'c'] }` |

### [[...slug]]

| Route                       | Example URL   | params                      |
| --------------------------- | ------------- | --------------------------- |
| `pages/shop/[[...slug]].js` | `/shop`       | `{ slug: undefined }`       |
| `pages/shop/[[...slug]].js` | `/shop/a`     | `{ slug: ['a'] }`           |
| `pages/shop/[[...slug]].js` | `/shop/a/b`   | `{ slug: ['a', 'b'] }`      |
| `pages/shop/[[...slug]].js` | `/shop/a/b/c` | `{ slug: ['a', 'b', 'c'] }` |
