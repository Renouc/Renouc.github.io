# 🧹 Node.js 删除 API 使用笔记

## 📖 删除 API 能力对比

| 方法名                        | 异步/同步       | 是否支持目录   | 是否递归删除 | 是否支持 force | 是否推荐            |
| ----------------------------- | --------------- | -------------- | ------------ | -------------- | ------------------- |
| fs.rm(path, options, cb)      | 异步（回调）    | ✅             | ✅           | ✅             | ✅ 推荐             |
| fs.rmSync(path, options)      | 同步            | ✅             | ✅           | ✅             | ✅ 推荐             |
| fs.promises.rm(path, options) | 异步（Promise） | ✅             | ✅           | ✅             | ✅ 推荐（现代项目） |
| fs.unlink(path, cb)           | 异步（回调）    | ❌（仅文件）   | ❌           | ❌             | ❌ 不推荐           |
| fs.unlinkSync(path)           | 同步            | ❌（仅文件）   | ❌           | ❌             | ❌ 不推荐           |
| fs.rmdir(path, options, cb)   | 异步（回调）    | ✅（仅空目录） | ⚠️ 有限支持  | ❌             | ⚠️ 弃用             |
| fs.rmdirSync(path, options)   | 同步            | ✅（仅空目录） | ⚠️ 有限支持  | ❌             | ⚠️ 弃用             |

## ⚠️ 重要说明：`fs.rm*` ≠ `fs.rmdir*`

- **`fs.rm*` 系列包括：`fs.rm`、`fs.rmSync`、`fs.promises.rm`，是 Node.js 新增的统一删除接口，功能强大，支持递归删除、强制删除等多种选项。**

- **`fs.rmdir` 和 `fs.rmdirSync` 是旧接口，只针对目录删除，且不支持 `force`，只在部分 Node.js 版本支持有限递归删除，已被官方废弃。**

## ✅ 推荐使用的配置（仅适用于 `fs.rm*` 系列）

```ts
{
  recursive: true,
  force: true,
  maxRetries?: number,
  retryDelay?: number,
  glob?: boolean // 仅异步的 fs.rm 支持
}
```

| 选项         | 说明                                          | 适用范围               |
| ------------ | --------------------------------------------- | ---------------------- |
| `recursive`  | 是否递归删除目录及其中内容                    | ✅ 仅 `fs.rm*` 支持    |
| `force`      | 文件或目录不存在时不抛错                      | ✅ 仅 `fs.rm*` 支持    |
| `maxRetries` | 删除失败时的最大重试次数（仅 Windows 下生效） | ✅ 仅 `fs.rm*` 支持    |
| `retryDelay` | 重试的时间间隔（毫秒）                        | ✅ 仅 `fs.rm*` 支持    |
| `glob`       | 是否启用通配符匹配（仅异步 `fs.rm` 支持）     | ✅ 仅异步 `fs.rm` 支持 |

> ❗️ `fs.rmdir*` 和 `fs.unlink*` 等旧接口**不支持这些选项**，传入会导致错误。

## ✅ 正确示例

```ts
import { rm } from 'fs/promises';

await rm('output/logs', {
  recursive: true,
  force: true,
});
```

```ts
import fs from 'fs';

fs.rmSync('build', {
  recursive: true,
  force: true,
});
```

## ❌ 错误示例（避免）

```ts
// rmdir 不支持 force，传入会抛错
fs.rmdirSync('some-dir', { recursive: true, force: true });

// unlink 不支持 options 参数
fs.unlink('file.txt', { force: true });
```

## ❗️ 可能仍会抛出的错误（即使使用 force: true）

| 错误码               | 场景说明                             |
| -------------------- | ------------------------------------ |
| `EACCES` / `EPERM`   | 权限不足 / 尝试删除系统关键路径      |
| `EBUSY`              | 文件或目录被系统占用（Windows 常见） |
| `EISDIR` / `ENOTDIR` | 路径类型不符（文件当目录或反之）     |
| `EMFILE` / `ENFILE`  | 打开文件过多                         |
| `ELOOP`              | 符号链接循环引用                     |

## 🧪 实用工具函数示例

```ts
import { rm } from 'fs/promises';

export async function safeRemove(path: string) {
  try {
    await rm(path, { recursive: true, force: true });
    console.log(`✅ 删除成功: ${path}`);
  } catch (err: any) {
    console.error(`❌ 删除失败: ${path}`);
    console.error(`错误代码: ${err.code}, 信息: ${err.message}`);
  }
}
```

## 🧼 总结建议

- ✅ 统一使用 `fs.rm\*` 系列（支持文件和目录删除）
- ⚠️ `{ recursive: true, force: true }` 仅适用于 `fs.rm`，不要用于 `unlink / rmdir`
- ✅ `fs.promises.rm` 适用于现代 `async/await` 异步项目
- ⚠️ 权限问题、占用文件等系统级错误依然需要 `try/catch`
