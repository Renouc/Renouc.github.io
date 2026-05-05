# 使用 SSE 实现流式 AI 回复

在构建 AI 聊天应用时，**流式输出（streaming response）** 是提升用户体验的关键手段之一。用户无需等待完整响应，而是可以“逐字”看到 AI 的回答，仿佛正在与人对话。

实现流式输出有多种方式：`WebSocket`、`HTTP Chunked`、`SSE` 等。其中 SSE（Server-Sent Events） 是一种轻量、基于 HTTP 的单向流技术，非常适合实现流式 AI 回复。

下面示例使用的是 `fetch POST + text/event-stream`：服务端输出 SSE 数据格式，前端手动读取流。它不是传统 `EventSource` 用法，因为 `EventSource` 只支持 GET 请求。

## 💻 server.js 示例代码

```js
const express = require('express');

const PORT = 3000;

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.post('/api/chat', (req, res) => {
  const { message } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 模拟 AI 回复：这里直接使用用户输入作为回复
  const simulatedReply = message.split('').join('');

  let i = 0;

  const interval = setInterval(() => {
    if (i < simulatedReply.length) {
      const char = simulatedReply[i];
      res.write(`data: ${char}\n\n`);
      i++;
    } else {
      clearInterval(interval);
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  }, 100); // 每 100ms 输出一个字

  req.on('close', () => {
    clearInterval(interval);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

## 💻 前端请求方式

```html
<input id="input" />
<button onclick="send()">Send</button>
<pre id="output"></pre>

<script>
  async function send() {
    const output = document.getElementById('output');
    output.textContent = ''; // 清空上次内容
    const input = document.getElementById('input').value;

    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const event of events) {
        const content = event
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trimStart())
          .join('\n');

        if (content === '[DONE]') {
          reader.cancel();
          return;
        }

        output.textContent += content;
      }
    }
  }
</script>
```
