# Streaming

Streaming 用来把模型或 agent 的执行过程实时暴露给应用。它解决的不是模型能力问题，而是交互体验、过程观察和长任务反馈问题。

最常见的场景：

- 聊天界面逐字输出
- 展示 agent 当前执行到哪一步
- 工具执行时推送进度
- 长任务执行过程中避免用户等待空白页

## 两类 Stream

LangChain 中要先区分两类流式输出：

| 类型             | 关注点                         |
| ---------------- | ------------------------------ |
| `model.stream()` | 模型生成内容的分块输出         |
| `agent.stream()` | agent 执行过程中的状态和事件   |

如果只是展示模型回答，用 `model.stream()` 就够了。如果需要看到 agent 的工具调用、步骤进度或自定义事件，就需要 `agent.stream()`。

## Model Stream

最小模型流式调用：

```ts
import { initChatModel } from 'langchain';

const model = await initChatModel('<model-name>', {
  temperature: 0,
});

const stream = await model.stream([
  { role: 'user', content: '用三句话解释 LangChain streaming。' },
]);

for await (const chunk of stream) {
  process.stdout.write(String(chunk.content ?? ''));
}
```

这个模式适合纯文本输出。它只关心模型正在生成什么，不关心 agent 步骤、工具调用或业务进度。

## Agent Stream Modes

`agent.stream()` 支持不同的 `streamMode`。常用模式有：

| 模式       | 作用                         | 适合场景                     |
| ---------- | ---------------------------- | ---------------------------- |
| `updates`  | 每个 agent 步骤后的状态更新  | 展示执行进度、调试工具调用   |
| `messages` | LLM token / message chunk    | 展示模型实时输出             |
| `custom`   | 应用自定义事件               | 展示检索、查询、导入等进度   |

这三个模式解决的问题不同，不应混用成同一个概念。

## 覆盖范围

本文只覆盖 LangChain agent 常用 streaming 模式，不等于整个 LangChain / LangGraph streaming 体系。

暂不展开的内容：

- reasoning / thinking token：通常在 `messages` 模式下通过 `contentBlocks` 读取，不是新的 `streamMode`。
- tool call streaming：可以在 `messages` 中看到模型发出的工具调用片段，完整工具生命周期更适合放到 LangGraph 里讲。
- LangGraph 专属模式：如 `values`、`tools`、`debug`，属于更底层的 graph streaming。
- subgraph streaming：涉及子图、嵌套流程和复杂状态，适合等 LangGraph 章节再展开。
- streaming filter：生产环境中可能需要过滤某些内部模型调用或节点输出。

因此，这篇文章的目标是先建立 LangChain agent streaming 的主干认知：看步骤、看模型输出、看应用自定义事件。

## Updates

`updates` 用来看 agent 的步骤进度。一次工具调用通常会经历：

1. 模型判断需要调用工具
2. 工具执行并返回结果
3. 模型基于工具结果生成最终回答

示例：

```ts
import { createAgent, tool } from 'langchain';
import * as z from 'zod';

const getWeather = tool(
  async ({ city }) => `The weather in ${city} is sunny.`,
  {
    name: 'get_weather',
    description: 'Get weather for a city.',
    schema: z.object({
      city: z.string(),
    }),
  },
);

const agent = createAgent({
  model: '<model-name>',
  tools: [getWeather],
});

for await (const chunk of await agent.stream(
  {
    messages: [{ role: 'user', content: '上海天气怎么样？' }],
  },
  {
    streamMode: 'updates',
  },
)) {
  console.log(chunk);
}
```

`updates` 更适合开发调试和执行进度展示，不适合直接当作最终回答渲染。

## Messages

`messages` 用来拿到模型输出的 token 或 message chunk，同时带有元数据。它适合聊天 UI 实时展示模型文本。

示例：

```ts
for await (const [token, metadata] of await agent.stream(
  {
    messages: [{ role: 'user', content: '解释 tool calling。' }],
  },
  {
    streamMode: 'messages',
  },
)) {
  console.log(metadata.langgraph_node);
  console.log(JSON.stringify(token.contentBlocks, null, 2));
}
```

`metadata` 可以用来判断 token 来自哪个节点。复杂 agent 中，不是所有 token 都一定应该展示给用户。

## Custom

`custom` 用来发送应用自己定义的进度事件。它适合工具或节点内部有长时间操作时使用。

示例：

```ts
import type { LangGraphRunnableConfig } from '@langchain/langgraph';

const searchDocs = tool(
  async ({ query }, config: LangGraphRunnableConfig) => {
    config.writer?.({ step: 'search_start', query });

    const results = await searchKnowledgeBase(query);

    config.writer?.({
      step: 'search_done',
      count: results.length,
    });

    return results.map((item) => item.title).join('\n');
  },
  {
    name: 'search_docs',
    description: 'Search internal documents.',
    schema: z.object({
      query: z.string(),
    }),
  },
);

const agent = createAgent({
  model: '<model-name>',
  tools: [searchDocs],
});

for await (const event of await agent.stream(
  {
    messages: [{ role: 'user', content: '查一下 LangChain streaming。' }],
  },
  {
    streamMode: 'custom',
  },
)) {
  console.log(event);
}
```

`custom` 的价值是把业务进度显式推给外部，而不是让用户只能等最终结果。

## Multiple Modes

同一次执行可以同时监听多个模式：

```ts
for await (const [mode, chunk] of await agent.stream(
  {
    messages: [{ role: 'user', content: '查资料并总结 LangChain streaming。' }],
  },
  {
    streamMode: ['updates', 'messages', 'custom'],
  },
)) {
  if (mode === 'updates') {
    console.log('agent update:', chunk);
  }

  if (mode === 'messages') {
    const [token, metadata] = chunk;
    console.log('node:', metadata.langgraph_node);
    console.log('content:', JSON.stringify(token.contentBlocks, null, 2));
  }

  if (mode === 'custom') {
    console.log('custom event:', chunk);
  }
}
```

多模式适合调试和复杂 UI。普通聊天界面通常只需要 `messages`，最多再加 `custom` 显示工具进度。

## 错误与中断

streaming 一旦进入 UI，就必须处理半截输出。

最小错误处理：

```ts
try {
  for await (const chunk of await model.stream([
    { role: 'user', content: '解释 streaming 的错误处理。' },
  ])) {
    process.stdout.write(String(chunk.content ?? ''));
  }
} catch (error) {
  console.error('stream failed:', error);
}
```

需要关注：

- stream 过程中模型请求失败
- 工具执行失败
- 用户主动取消请求
- 前端连接断开
- 已输出的半截内容是否要保留

取消通常要在应用层通过 `AbortController` 或请求生命周期处理。不要假设 stream 一定会自然结束。

## 使用边界

不要为了“看起来更实时”滥用 streaming。

适合 streaming 的场景：

- 输出较长
- 模型响应较慢
- agent 需要调用工具
- 用户需要看到任务进度

不太需要 streaming 的场景：

- 短文本分类
- 结构化抽取
- 后端批处理
- 固定 workflow 的内部中间步骤

尤其是 structured output，很多时候应该等完整结果返回后再校验，而不是边流式边消费。

## 关键结论

- `model.stream()` 适合流式展示模型文本。
- `agent.stream()` 适合观察 agent 步骤、模型输出和业务进度。
- `updates` 看步骤，`messages` 看模型 token，`custom` 看应用自定义事件。
- 多模式可以组合，但 UI 应明确区分不同事件来源。
- streaming 必须处理错误、取消和半截输出。

参考：

- [LangChain Streaming](https://docs.langchain.com/oss/javascript/langchain/streaming)
- [LangGraph Streaming](https://docs.langchain.com/oss/javascript/langgraph/streaming)
