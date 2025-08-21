# 📒 Node.js 判断路径是否存在 — 笔记

## 1. 旧方法（不推荐）

- **`fs.exists(path, callback)`**
- **`fs.existsSync(path)`**

👉 这些 API **已被废弃（deprecated）**，因为会带来 **竞态条件**（检查和实际使用之间可能被删除/修改）。
⚠️ 不要在新代码中使用。

## 2. 推荐方法一：`fs.stat`

**作用**：获取文件/目录的属性，如果不存在则抛错。

```js
const fs = require("fs");

// 异步
fs.stat("somePath", (err, stats) => {
  if (err) {
    if (err.code === "ENOENT") {
      console.log("❌ 路径不存在");
    }
    return;
  }
  console.log(stats.isFile() ? "文件" : "目录");
});

// 同步
try {
  const stats = fs.statSync("somePath");
  console.log(stats.isDirectory() ? "目录" : "文件");
} catch (err) {
  if (err.code === 'ENOENT') console.log('❌ 路径不存在');
}
```

📌 特点：

- ✅ 能判断路径是否存在
- ✅ 能区分 **文件 / 目录**
- ❌ 不能判断读写权限

## 3. 推荐方法二：`fs.access`

**作用**：检查路径是否能以指定权限访问。

```js
const fs = require("fs");

fs.access("somePath", fs.constants.F_OK, (err) => {
  console.log(err ? "❌ 不存在" : "✅ 存在");
});

fs.access("somePath", fs.constants.R_OK, (err) => {
  console.log(err ? "❌ 不可读" : "✅ 可读");
});

fs.access("somePath", fs.constants.W_OK, (err) => {
  console.log(err ? "❌ 不可写" : "✅ 可写");
});
```

📌 特点：

- ✅ 可检查 **是否存在**（`F_OK`）
- ✅ 可检查 **权限**（读/写/执行）
- ❌ 不能区分文件和目录

## 4. 推荐方法三（现代写法）：`fs.promises`

使用 `async/await` 更直观。

```js
const fs = require("fs").promises;

async function checkPath(path) {
  try {
    const stats = await fs.stat(path);
    if (stats.isFile()) {
      console.log("✅ 文件存在");
    } else if (stats.isDirectory()) {
      console.log("✅ 目录存在");
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("❌ 路径不存在");
    }
  }
}

checkPath("somePath");
```

## 5. 封装工具函数

方便在项目中直接使用：

```js
const fs = require("fs").promises;

async function exists(path) {
  try {
    await fs.stat(path);
    return true;
  } catch (err) {
    if (err.code === "ENOENT") return false;
    throw err; // 其他错误继续抛出
  }
}
```

用法：

```js
if (await exists("somePath")) {
  console.log("✅ 存在");
} else {
  console.log("❌ 不存在");
}
```

## 6. 总结对比

| 方法                       | 是否推荐       | 能判断存在 | 能区分文件/目录 | 能检查权限 |
| -------------------------- | -------------- | ---------- | --------------- | ---------- |
| `fs.exists` / `existsSync` | ❌ 过时        | ✅         | ❌              | ❌         |
| `fs.stat` / `statSync`     | ✅             | ✅         | ✅              | ❌         |
| `fs.access` / `accessSync` | ✅             | ✅         | ❌              | ✅         |
| `fs.promises.stat`         | ✅（现代写法） | ✅         | ✅              | ❌         |

## 7. 最佳实践

- **只关心存在性** → `fs.stat`（try/catch 判断）
- **需要文件/目录信息** → `fs.stat`
- **需要权限检测** → `fs.access`
