# Ollama 笔记

Ollama 用来在本地运行和管理大语言模型。常见用途是本地对话、模型验证、离线开发，以及给应用提供一个本地 HTTP API。

## 安装与运行

安装后可以直接运行模型。本地没有对应模型时，Ollama 会先下载。

```bash
ollama run llama3.2
```

显式拉取模型：

```bash
ollama pull llama3.2
```

查看本地模型：

```bash
ollama list
```

查看正在运行的模型：

```bash
ollama ps
```

停止模型：

```bash
ollama stop llama3.2
```

如果服务没有自动启动，可以手动启动：

```bash
ollama serve
```

默认服务地址是：

```txt
http://localhost:11434
```

## 常用 CLI

模型管理：

```bash
ollama pull llama3.2
ollama list
ollama show llama3.2
ollama rm llama3.2
```

运行与停止：

```bash
ollama run llama3.2
ollama stop llama3.2
ollama ps
```

基于 `Modelfile` 创建自定义模型：

```bash
ollama create my-model -f Modelfile
```

## JavaScript SDK

安装：

```bash
npm install ollama
```

最小对话示例：

```ts
import ollama from 'ollama';

const response = await ollama.chat({
  model: 'llama3.2',
  messages: [
    {
      role: 'user',
      content: '用一句话解释什么是 RAG',
    },
  ],
});

console.log(response.message.content);
```

流式输出：

```ts
import ollama from 'ollama';

const stream = await ollama.chat({
  model: 'llama3.2',
  messages: [{ role: 'user', content: '写一个短摘要' }],
  stream: true,
});

for await (const part of stream) {
  process.stdout.write(part.message.content);
}
```

连接非默认服务地址：

```ts
import { Ollama } from 'ollama';

const client = new Ollama({
  host: 'http://localhost:11434',
});
```

## HTTP API

生成文本：

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Explain event loop in one sentence",
  "stream": false
}'
```

对话：

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [
    { "role": "user", "content": "你好" }
  ],
  "stream": false
}'
```

Embeddings：

```bash
curl http://localhost:11434/api/embed -d '{
  "model": "nomic-embed-text",
  "input": "Ollama local embeddings"
}'
```

## 常用配置

| 配置 | 作用 |
| --- | --- |
| `OLLAMA_HOST` | 服务监听地址 |
| `OLLAMA_MODELS` | 模型存储目录 |
| `OLLAMA_KEEP_ALIVE` | 模型空闲后保留时间 |
| `OLLAMA_NUM_PARALLEL` | 并行请求数量 |

示例：

```bash
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

配置建议：

- 本机开发保持默认地址即可。
- 对局域网开放时限制网络和访问来源。
- 模型目录放到空间充足的磁盘。
- 应用层要设置超时，避免模型冷启动拖住请求。

## 结论

本地验证优先使用 `ollama run` 和 CLI；应用集成优先使用 SDK 或 HTTP API。模型能力、上下文长度和运行速度取决于具体模型和本机硬件。
