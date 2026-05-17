# Memory 与 State

Memory 解决的是“应用是否记得之前发生了什么”。它不是让模型拥有永久记忆，而是应用把需要保留的信息保存下来，并在合适的时候放回上下文。

## 两类记忆

| 类型              | 范围             | 典型内容                         |
| ----------------- | ---------------- | -------------------------------- |
| Short-term memory | 单个 thread      | 当前对话消息、工具结果、中间状态 |
| Long-term memory  | 跨 thread/session | 用户偏好、长期事实、历史记录     |

短期记忆偏向会话状态，长期记忆偏向用户或业务数据。

## Short-term Memory

LangChain agent 通过 checkpointer 保存 thread 状态。调用时用 `thread_id` 区分不同会话。

```ts
import { createAgent } from 'langchain';
import { MemorySaver } from '@langchain/langgraph';

const agent = createAgent({
  model: 'openai:<model-name>',
  tools: [],
  checkpointer: new MemorySaver(),
});

await agent.invoke(
  {
    messages: [{ role: 'user', content: '我叫 Renouc。' }],
  },
  {
    configurable: { thread_id: 'thread_1' },
  },
);
```

生产环境不要用内存保存关键状态，应换成数据库 backed checkpointer。

## Long-term Memory

长期记忆通过 store 保存跨会话数据。常见做法是按用户或租户组织 namespace。

```ts
import { createAgent, tool, type ToolRuntime } from 'langchain';
import { InMemoryStore } from '@langchain/langgraph';
import * as z from 'zod';

const contextSchema = z.object({
  userId: z.string(),
});

const savePreference = tool(
  async (
    { style },
    runtime: ToolRuntime<unknown, z.infer<typeof contextSchema>>,
  ) => {
    await runtime.store.put(['preferences'], runtime.context.userId, { style });
    return 'Preference saved.';
  },
  {
    name: 'save_preference',
    description: 'Save user response style preference.',
    schema: z.object({
      style: z.string(),
    }),
  },
);

const agent = createAgent({
  model: 'openai:<model-name>',
  tools: [savePreference],
  contextSchema,
  store: new InMemoryStore(),
});
```

长期记忆应只保存稳定、可解释、可删除的信息。不要把完整聊天记录无差别写入长期记忆。

## 上下文控制

记忆最终还是要进入模型上下文，因此必须控制长度和质量。

常见策略：

- 只保留最近 N 轮消息
- 对早期消息做摘要
- 按当前问题检索相关记忆
- 对写入长期记忆的内容做 schema 校验

## 关键结论

- Memory 是应用状态，不是模型能力。
- short-term memory 用于恢复当前 thread。
- long-term memory 用于跨会话保存稳定信息。
- 进入模型上下文的记忆越多，越需要筛选、压缩和校验。

参考：

- [Short-term memory](https://docs.langchain.com/oss/javascript/langchain/short-term-memory)
- [Long-term memory](https://docs.langchain.com/oss/javascript/langchain/long-term-memory)
