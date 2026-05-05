# Node.js 标准流详解

在 Node.js 中，标准流（Standard Streams）是与操作系统交互的基础机制。常见的标准流包括：

- **stdin**（Standard Input）：标准输入流，用于接收用户输入或其他程序的输出。
- **stdout**（Standard Output）：标准输出流，用于输出正常信息。
- **stderr**（Standard Error）：标准错误流，用于输出错误信息。

这些流在 Node.js 中是 `process` 对象的属性，可以直接访问：

```js
process.stdin; // 标准输入流
process.stdout; // 标准输出流
process.stderr; // 标准错误流
```

## 一、标准流详解

### 1. `stdin`（标准输入流）

`stdin` 是一个 **可读流**，通常用于接收键盘输入或其他程序通过管道传入的数据。

示例：读取用户输入

```js
process.stdin.on('data', (chunk) => {
  console.log(`用户输入：${chunk.toString()}`);
});
```

### 2. `stdout`（标准输出流）

`stdout` 是一个 **可写流**，用于输出正常的日志或结果。

示例：

```js
process.stdout.write('Hello, Node.js!\n');
```

### 3. `stderr`（标准错误流）

`stderr` 也是一个 **可写流**，专门用于输出错误日志，和 `stdout` 不会互相干扰。

示例：

```js
process.stderr.write('发生错误：文件不存在\n');
```

### 4. 其他常见流

除了以上三个标准流，Node.js 还有其他常见的流对象：

- **文件流**：通过 `fs.createReadStream()` 和 `fs.createWriteStream()` 创建。
- **HTTP 请求和响应流**：`http.IncomingMessage` 和 `http.ServerResponse`。
- **自定义流**：通过 `stream` 模块自定义可读或可写流。

## 二、命令行重定向

在命令行中，我们可以使用 **重定向符号** 控制标准流的输出或输入。

### 1. 基础重定向

| 符号  | 含义                     | 示例                        |
| ----- | ------------------------ | --------------------------- |
| `>`   | 将 `stdout` 重定向到文件 | `node app.js > output.log`  |
| `2>`  | 将 `stderr` 重定向到文件 | `node app.js 2> error.log`  |
| `>>`  | 追加 `stdout` 到文件     | `node app.js >> output.log` |
| `2>>` | 追加 `stderr` 到文件     | `node app.js 2>> error.log` |
| `<`   | 从文件作为 `stdin` 输入  | `node app.js < input.txt`   |

### 2. 合并输出

将 `stdout` 和 `stderr` 合并到同一个文件：

```bash
node app.js > all.log 2>&1
```

解释：

- `>` 表示将标准输出写入 `all.log`。
- `2>&1` 表示将标准错误（2）重定向到标准输出（1）。

### 3. 同时输出到不同文件

将标准输出和标准错误分别输出到不同文件：

```bash
node app.js > app.log 2> error.log
```

解释：

- `stdout` 写入 `app.log`。
- `stderr` 写入 `error.log`。

## 三、管道符 `|`

管道符 `|` 可以将一个命令的输出，作为另一个命令的输入。

示例：统计 Node.js 输出的行数

```bash
node app.js | wc -l
```

解释：

- `node app.js` 输出到 `stdout`。
- `|` 将输出传递给 `wc -l` 进行行数统计。

## 四、结合使用

重定向与管道符可以组合使用，例如：

```bash
node app.js 2> error.log | grep "success" > result.log
```

解释：

- `2> error.log`：将错误输出重定向到 `error.log`。
- `| grep "success"`：从标准输出中过滤包含 `success` 的行。
- `> result.log`：将过滤后的结果写入 `result.log`。

## 五、总结

Node.js 的标准流为与操作系统和其他程序的交互提供了基础能力：

- `stdin` 用于接收输入。
- `stdout` 用于输出正常信息。
- `stderr` 用于输出错误信息。

结合命令行中的 **重定向** 和 **管道符**，可以实现灵活的数据流转，适应各种日志管理、调试和数据处理场景。
