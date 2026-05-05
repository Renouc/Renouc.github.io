# 🌍 Node.js 环境变量详解与最佳实践

## 📌 什么是环境变量（Environment Variables）？

环境变量是由操作系统提供的一种配置机制，用于在**运行时**控制应用程序的行为，而不需要更改源代码。

在 Node.js 中，环境变量通过 `process.env` 访问：

```js
console.log(process.env.NODE_ENV); // 输出 'development' 或 'production'
```

---

## 🌐 环境变量为什么是「平台无关」的？

环境变量是操作系统层级的通用机制，并**不依赖于任何特定语言或框架**，因此被称为「平台无关」：

- ✅ 你可以在 **Linux/macOS/Windows** 设置环境变量；
- ✅ 可以在 **Node.js / Golang / Python / Java 等语言**中读取；
- ✅ 也可以通过 **Docker、Kubernetes、CI/CD 平台（如 GitHub Actions）**进行注入。

例如：

```bash
# Linux/macOS 设置变量并启动
NODE_ENV=production node app.js

# Windows (CMD)
set NODE_ENV=production && node app.js
```

这些变量会被注入到当前进程中，并可通过各语言的方式读取。

## 🔐 环境变量适合存放哪些信息？

环境变量非常适合配置「敏感信息」和「环境相关的参数」：

| 类型        | 示例                                       |
| ----------- | ------------------------------------------ |
| ✅ 敏感信息 | `DB_PASSWORD`, `JWT_SECRET`, `API_KEY`     |
| ✅ 环境差异 | `NODE_ENV`, `DB_HOST`, `PORT`, `LOG_LEVEL` |

为什么要用环境变量管理这些信息？

- 安全：不写死在代码里，避免被提交到 Git。
- 灵活：不同环境（开发/测试/生产）可分别配置。
- 可移植：部署到云服务器、CI/CD、容器非常方便。

## 📦 `.env` 文件 + `dotenv` 使用

安装依赖：

```bash
npm install dotenv
```

创建 `.env` 文件：

```text
NODE_ENV=development
PORT=4000
DB_URL=mongodb://localhost:27017/devdb
```

在入口文件加载它：

```js
require('dotenv').config();
console.log(process.env.PORT); // 输出 4000
```

支持自定义路径：

```js
require('dotenv').config({ path: './env/.env.production' });
```

## 🛠 使用 cross-env 跨平台设置变量

不同平台设置方式不同，建议使用 `cross-env` 统一：

```bash
npm install --save-dev cross-env
```

在 `package.json` 中配置：

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development node app.js",
    "start": "cross-env NODE_ENV=production node app.js"
  }
}
```

这样可以兼容 Windows / Linux / macOS 一键运行：

```bash
npm run dev
```

## 📁 多环境配置推荐做法

项目中可按不同环境拆分 `.env` 文件：

```
.env.development
.env.production
.env.test
```

然后在代码中按需读取：

```js
// config/env.js
const path = require('path');
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';

dotenv.config({
  path: path.resolve(__dirname, `../.env.${env}`),
});

module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  JWT_SECRET: process.env.JWT_SECRET,
};
```

使用示例：

```js
const config = require('./config/env');

console.log('当前环境:', config.NODE_ENV);
console.log('数据库地址:', config.DB_URL);
```

## 📦 启动脚本建议配置

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development node app.js",
    "start": "cross-env NODE_ENV=production node app.js",
    "test": "cross-env NODE_ENV=test jest"
  }
}
```

---

## ❓ 常见问题

### Q: `process.env.PORT` 是字符串还是数字？

A: **始终为字符串**，需要手动转换：

```js
const port = Number(process.env.PORT) || 3000;
```

### Q: 可以在其他语言中读取 `.env` 吗？

A: `.env` 文件只是文本文件，不会自动成为系统环境变量，其他语言（如 Go）也需要用类似的库或手动设置环境变量来读取。

例如 Go 中使用：

```go
import "os"

func main() {
    db := os.Getenv("DB_URL")
}
```

## ✅ 总结

| 特性       | 说明                               |
| ---------- | ---------------------------------- |
| 平台无关   | 操作系统统一机制，可被各种语言读取 |
| 不污染代码 | 敏感信息不写死在代码中             |
| 灵活配置   | 多环境灵活切换                     |
| 跨平台兼容 | 配合 `cross-env` 可统一开发脚本    |

## 📚 参考链接

- [dotenv GitHub](https://github.com/motdotla/dotenv)
- [cross-env GitHub](https://github.com/kentcdodds/cross-env)
