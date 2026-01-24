# Ollama 笔记

> 目示例中的变量统一用 `<...>` 占位，避免歧义 ✅

## 1. Ollama 是什么？🙂

- Ollama 是一个让你在本机快速运行大语言模型（以及部分多模态模型）的工具：提供 **CLI** + **本地 HTTP API**。
- 默认本地服务地址：`http://localhost:11434`。
  - REST API：`http://localhost:11434/api/*`
  - OpenAI 兼容 API：`http://localhost:11434/v1/*`
- 本地运行时，Ollama 不会把你的对话内容发送到 ollama.com（如果你主动使用云模型/云 API，则另当别论）。

## 2. Ollama 有什么用？✨

常见用途（按“本地优先”思路）：

- 本地 Chat / 文本生成：开发、写作、自动化脚本
- Embeddings：把文本变成向量，用于语义检索 / RAG
- 结构化输出、工具调用、视觉（取决于模型与能力开关）
- 作为“本地模型网关”：让 IDE / Agent 工具通过 `http://localhost:11434` 统一接入

## 3. 快速开始 🚀

```bash
# 运行一个模型（交互式；本地没有会先拉取）
ollama run <model>

# 显式拉取模型
ollama pull <model>

# 启动服务（通常安装后会自动在后台运行；需要时可手动启动）
ollama serve
```

## 4. 常用 CLI 🛠️

```bash
# 模型管理
ollama pull <model>
ollama ls
ollama rm <model>

# 运行/停止
ollama run <model>
ollama ps
ollama stop <model>

# 登录 / 登出（用于访问 ollama.com 的云能力、发布模型、拉取私有模型等）
ollama signin
ollama signout

# 自定义模型
ollama create <choose-a-model-name> -f <path/to/Modelfile>
ollama show --modelfile <model>

# 复制模型（常用于兼容默认 OpenAI 模型名，如 gpt-3.5-turbo）
ollama cp <source-model> <alias-model-name>

# 启动集成（示例：opencode；不同集成名称不同）
ollama launch <integration>

# 仅写入配置但不启动（如果该集成支持）
ollama launch <integration> --config
```

交互模式小技巧 ✍️

- 多行输入：用 `"""` 包起来

```text
>>> """Hello,
... world!
... """
```

- 多模态模型：把图片路径写进 prompt（前提：模型支持图像）🖼️

```bash
ollama run <multimodal-model> "What's in this image? <path/to/image.png>"
```

## 5. 官方 SDK（JavaScript / TypeScript）🧩

Ollama 提供官方 JS/TS 库（npm 包名：`ollama`）。

### 5.1 安装

```bash
npm i ollama
```

### 5.2 最小示例（TS）

```ts
import ollama from 'ollama';

const resp = await ollama.chat({
  model: '<model>',
  messages: [{ role: 'user', content: '<prompt>' }],
});

console.log(resp.message.content);
```

### 5.3 流式输出（TS）📡

说明：REST API 默认会 streaming；但 SDK 默认不 streaming，需要显式 `stream: true`。

```ts
import ollama from 'ollama';

const stream = await ollama.chat({
  model: '<model>',
  messages: [{ role: 'user', content: '<prompt>' }],
  stream: true,
});

for await (const part of stream) {
  process.stdout.write(part.message.content ?? '');
}
```

### 5.4 直连 ollama.com（TS，可选）☁️

> 适用于“直接调用云 API（https://ollama.com）”。如果你只用本地模型，这段可忽略。

```ts
import { Ollama } from 'ollama';

const client = new Ollama({
  host: 'https://ollama.com',
  headers: {
    Authorization: 'Bearer <OLLAMA_API_KEY>',
  },
});

const resp = await client.chat({
  model: '<cloud-model>',
  messages: [{ role: 'user', content: '<prompt>' }],
});

console.log(resp.message.content);
```

### 5.5 浏览器使用（TS，可选）🌐

```ts
import ollama from 'ollama/browser';
```

## 6. HTTP API（/api）🔌

- Base URL（本地）：`http://localhost:11434/api`
- Base URL（云）：`https://ollama.com/api`

### 6.1 生成：POST /api/generate

`/api/generate` 等 endpoint 默认会 streaming 返回 NDJSON；需要一次性 JSON 时传 `"stream": false`。

```bash
curl http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "<model>",
    "prompt": "<prompt>",
    "stream": false
  }'
```

### 6.2 对话：POST /api/chat

```bash
curl http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "<model>",
    "messages": [
      {"role": "user", "content": "<prompt>"}
    ],
    "stream": false
  }'
```

### 6.3 Embeddings：POST /api/embed 🧬

- CLI 输出是 JSON 数组：

```bash
ollama run <embedding-model> "<text>"

echo "<text>" | ollama run <embedding-model>
```

- API：`/api/embed` 返回 **L2 归一化（unit-length）** 的向量

```bash
curl http://localhost:11434/api/embed \
  -H "Content-Type: application/json" \
  -d '{
    "model": "<embedding-model>",
    "input": ["<text-1>", "<text-2>"]
  }'
```

## 7. OpenAI 兼容接口（/v1，可选）🔁

- Base URL：`http://localhost:11434/v1`

```bash
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "<model>",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

如果某些工具写死了默认模型名（如 `gpt-3.5-turbo`），可用：

```bash
ollama cp <source-model> gpt-3.5-turbo
```

## 8. 鉴权与常用配置 ✅⚙️

- 本地访问 `http://localhost:11434`：不需要鉴权。
- 云 API `https://ollama.com/api`：需要鉴权（API Key 或 `ollama signin`）。

常见环境变量（服务端）：

- `OLLAMA_HOST`：修改监听地址（默认 `127.0.0.1:11434`；需要暴露到局域网可设为 `0.0.0.0:11434`）
- `OLLAMA_ORIGINS`：配置允许的 CORS origins
- `OLLAMA_CONTEXT_LENGTH`：设置默认上下文长度（tokens）
- `OLLAMA_MODELS`：更改模型存储目录

## 参考（官方）📚

- Docs Home: https://docs.ollama.com/
- Quickstart: https://docs.ollama.com/quickstart
- API Introduction: https://docs.ollama.com/api/introduction
- API Streaming: https://docs.ollama.com/api/streaming
- Embeddings: https://docs.ollama.com/capabilities/embeddings
- OpenAI compatibility: https://docs.ollama.com/api/openai-compatibility
- Authentication: https://docs.ollama.com/api/authentication
- FAQ: https://docs.ollama.com/faq
- Context length: https://docs.ollama.com/context-length
- Windows: https://docs.ollama.com/windows
- Ollama JS SDK (GitHub): https://github.com/ollama/ollama-js
