# Node.js 文件系统常用操作

Node.js 里处理文件系统时，优先使用 `fs/promises`。它的错误模型清晰，适合和 `async/await` 配合，也能避免旧 API 在存在性检查和删除目录时的边界问题。

## 判断路径是否存在

不要在新代码里使用 `fs.exists`。它只能回答“有没有”，无法给出权限和类型信息，而且容易让代码写成“先检查再使用”的竞态模式。

更稳定的写法是直接执行目标操作，并处理 `ENOENT`。如果只是需要判断路径是否存在，可以用 `stat` 封装一个小工具。

```ts
import { stat } from 'node:fs/promises';

export async function pathExists(path: string) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}
```

如果还要区分文件和目录，直接读取 `Stats`。

```ts
import { stat } from 'node:fs/promises';

const info = await stat('README.md');

if (info.isFile()) {
  console.log('file');
}

if (info.isDirectory()) {
  console.log('directory');
}
```

如果关心的是权限，而不是类型，使用 `access`。

```ts
import { access, constants } from 'node:fs/promises';

await access('README.md', constants.R_OK);
await access('README.md', constants.W_OK);
```

需要注意的是，`access` 也不能替代最终操作。文件可能在检查后被删除或修改，所以写文件、读文件、删文件时仍然要处理真实操作抛出的错误。

## 删除文件和目录

现代 Node.js 里优先使用 `rm`。它可以统一处理文件和目录，也支持递归删除与不存在时忽略错误。

```ts
import { rm } from 'node:fs/promises';

await rm('dist', {
  recursive: true,
  force: true,
});
```

常用选项：

| 选项 | 作用 |
| --- | --- |
| `recursive` | 删除目录时递归处理子文件 |
| `force` | 目标不存在时不抛出 `ENOENT` |
| `maxRetries` | Windows 下遇到临时占用时重试 |
| `retryDelay` | 重试间隔，单位毫秒 |

旧接口的边界要分清：

| API | 适用场景 | 备注 |
| --- | --- | --- |
| `fs.rm` / `fs.promises.rm` | 文件、目录、递归删除 | 推荐 |
| `fs.unlink` | 只删除文件 | 不接收 `recursive`、`force` |
| `fs.rmdir` | 删除空目录 | 不建议继续使用 |

`force: true` 只表示目标不存在时不报错，不代表任何错误都会被吞掉。权限不足、文件被占用、路径类型不匹配仍然会抛错。

## 推荐封装

业务代码里可以保留两个小函数：一个判断存在性，一个删除构建产物。不要把所有错误都吞掉，否则会掩盖权限和路径配置问题。

```ts
import { rm, stat } from 'node:fs/promises';

export async function exists(path: string) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

export async function removeGenerated(path: string) {
  await rm(path, {
    recursive: true,
    force: true,
  });
}
```

如果删除用户传入的路径，先限制允许删除的根目录，避免误删项目外文件。

```ts
import path from 'node:path';

function assertInsideWorkspace(target: string, workspace: string) {
  const absoluteTarget = path.resolve(target);
  const absoluteWorkspace = path.resolve(workspace);

  if (!absoluteTarget.startsWith(absoluteWorkspace + path.sep)) {
    throw new Error(`Refuse to remove outside workspace: ${target}`);
  }
}
```

## 常见错误

| 错误码 | 常见原因 | 处理方向 |
| --- | --- | --- |
| `ENOENT` | 路径不存在 | 判断是否允许忽略 |
| `EACCES` / `EPERM` | 权限不足 | 检查权限、占用或系统目录 |
| `EBUSY` | 文件被占用 | 等待占用释放，必要时重试 |
| `EISDIR` | 把目录当文件处理 | 改用 `rm` 或先判断类型 |
| `ENOTDIR` | 把文件当目录处理 | 检查路径拼接 |

## 结论

- 判断存在性用 `stat`，判断权限用 `access`。
- 最终读写删操作仍然要自己处理错误。
- 删除文件和目录统一用 `fs.promises.rm`。
- `force: true` 只忽略不存在，不忽略权限、占用和类型错误。
