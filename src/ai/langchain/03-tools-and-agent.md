# Tools 与 Agent

Tool 和 Agent 是 LangChain 中最容易被误解的两个概念。核心区别是：tool 是可执行能力，agent 是围绕目标选择和调用工具的运行形态。

## Tool 是什么

Tool 是暴露给模型的外部能力。它通常包含三部分：

- 工具名称
- 工具说明
- 输入参数 schema

模型不会真正执行工具。模型只会根据上下文判断“应该调用哪个工具、传入什么参数”。真正执行工具的是应用程序。

最小示例：

```ts
import { tool } from 'langchain';
import * as z from 'zod';

const getTextLength = tool(({ text }) => text.length, {
  name: 'get_text_length',
  description: 'Return the length of the input text.',
  schema: z.object({
    text: z.string().describe('Input text to measure.'),
  }),
});
```

这个函数成为 tool 后，模型可以在需要时请求调用它。执行结果会作为 tool message 回填给模型，模型再基于结果继续生成最终回答。

如果工具需要访问外部系统，通常写成异步函数：

```ts
const searchDocs = tool(
  async ({ query }) => {
    const results = await searchKnowledgeBase(query);
    return results.map((item) => item.title).join('\n');
  },
  {
    name: 'search_docs',
    description: 'Search internal documents by query.',
    schema: z.object({
      query: z.string().describe('Search keywords.'),
    }),
  },
);
```

这里真正访问数据库、文件或 HTTP API 的是应用代码，不是模型。

## 好工具的标准

工具设计比工具数量更重要。

一个好的 tool 应该满足：

- 名称清晰，能表达动作
- 描述准确，说明什么时候使用
- 参数少而明确
- 输入输出稳定，便于模型理解
- 错误可预期，失败时返回可解释信息
- 副作用可控，涉及写操作时有权限和确认机制

反例：

- `doTask(input: string)` 这种过宽工具
- 描述含糊的工具
- 一个工具同时负责查询、修改、发送通知
- 返回大量无结构文本
- 静默失败或抛出模型无法理解的异常

## Tool Calling

Tool calling 是模型输出的一种形式。

普通回答是：

```text
答案是 42。
```

工具调用意图更像：

```text
调用 get_text_length，参数是 {"text": "LangChain"}
```

应用程序接收到这个意图后：

1. 校验工具名和参数
2. 执行对应工具
3. 把工具结果写回上下文
4. 再次调用模型生成后续结果

所以 tool calling 的本质是：模型负责决策，应用负责执行。

在 LangChain agent 里，这个循环由 `createAgent` 处理。应用仍然要负责工具实现、参数校验和权限控制。

## Agent 是什么

Agent 不是单个函数，也不只是一个类。Agent 是一种运行模式：

```text
用户目标
→ 模型判断下一步
→ 调用工具
→ 观察工具结果
→ 继续判断
→ 得到最终结果
```

只要系统具备“观察、决策、行动、反馈”的循环，就进入了 agent 形态。

LangChain v1 中可以用 `createAgent` 创建一个简单 agent：

```ts
import { createAgent } from 'langchain';

const agent = createAgent({
  model: 'openai:<model-name>',
  tools: [getTextLength],
  systemPrompt: '你是一个严谨的助手，需要时可以调用工具。',
});

const result = await agent.invoke({
  messages: [{ role: 'user', content: 'LangChain 有几个字符？' }],
});
```

这里的重点不是代码量，而是运行机制：

- `model` 负责推理和选择动作
- `tools` 提供可执行能力
- `systemPrompt` 约束模型行为
- `messages` 提供当前任务上下文
- `agent.invoke` 启动一次 agent 执行

### Agent 的 Model

`createAgent` 的 `model` 可以接收两类值。

第一类是模型标识字符串：

```ts
const agent = createAgent({
  model: 'openai:<model-name>',
  tools: [getTextLength],
});
```

在 agent 中，模型字符串建议使用 `provider:model` 格式，例如 `openai:<model-name>`、`anthropic:<model-name>`。这和普通 `initChatModel('<model-name>')` 不完全一样：agent 需要更明确地知道用哪个 provider 初始化模型。

第二类是已经创建好的 chat model 实例：

```ts
import { ChatOpenAI } from '@langchain/openai';
import { createAgent } from 'langchain';

const model = new ChatOpenAI({
  model: '<openai-model-name>',
  temperature: 0,
  maxRetries: 2,
});

const agent = createAgent({
  model,
  tools: [getTextLength],
});
```

也可以把 `initChatModel` 创建出的模型传给 agent：

```ts
import { initChatModel } from 'langchain';

const model = await initChatModel('<openai-model-name>', {
  temperature: 0,
});

const agent = createAgent({
  model,
  tools: [getTextLength],
});
```

判断方式：

| 写法             | 适合场景                                 |
| ---------------- | ---------------------------------------- |
| 模型字符串       | 简单 agent，配置少，能明确 provider      |
| `ChatOpenAI` 等  | 需要控制 API key、baseURL、timeout 等参数 |
| `initChatModel`  | 需要动态选择 provider 或复用统一初始化逻辑 |

agent 使用的模型通常需要支持 tool calling。否则模型即使能普通对话，也可能无法稳定驱动工具调用。

如果工具需要读取运行时上下文，例如当前用户 ID，可以通过 `contextSchema` 和调用配置传入：

```ts
const getCurrentUser = tool((_, config) => config.context.userId, {
  name: 'get_current_user',
  description: 'Get the current user id from runtime context.',
  schema: z.object({}),
});

const contextSchema = z.object({
  userId: z.string(),
});

const agent = createAgent({
  model: 'openai:<model-name>',
  tools: [getCurrentUser],
  contextSchema,
});

const result = await agent.invoke(
  {
    messages: [{ role: 'user', content: '我是谁？' }],
  },
  {
    context: { userId: 'user_123' },
  },
);
```

上下文适合传用户、租户、权限、请求配置等运行时信息。不要让模型自己猜这些信息。

## Agent 适合什么场景

适合 agent 的任务通常有几个特征：

- 目标明确，但步骤不完全固定
- 需要根据中间结果决定下一步
- 需要调用一个或多个外部工具
- 可能需要多轮观察和修正

例如：

- 根据用户问题决定查知识库还是查订单
- 读取文件后决定是否继续检索
- 分析报错后选择查询日志、查文档或生成修复建议

## 什么时候不该用 Agent

如果流程已经完全确定，不需要模型自主选择步骤，普通 workflow 通常更清晰。

例如：

```text
读取输入 → 校验格式 → 调用模型总结 → 保存结果
```

这种流程用普通函数编排即可。强行使用 agent 会增加不可控性和调试成本。

固定 workflow 示例：

```ts
async function summarizeAndSave(input: string) {
  const response = await model.invoke([
    { role: 'system', content: '把输入总结成三条要点。' },
    { role: 'user', content: input },
  ]);

  await saveSummary(String(response.content));
}
```

这里每一步都确定，不需要模型决定“下一步做什么”，所以没有必要使用 agent。

判断标准：

- 步骤固定，用 workflow
- 步骤需要模型动态决策，用 agent
- 状态和分支复杂，用 LangGraph

## 风险边界

Agent 带来灵活性，也带来风险：

- 调错工具
- 参数不符合业务规则
- 重复调用工具
- 在错误上下文中继续推理
- 对有副作用的工具执行危险操作

因此生产环境中的 agent 需要：

- 工具参数校验
- 权限控制
- 超时和重试限制
- 调用次数上限
- 对写操作加确认或审批
- tracing 和评估

有副作用的工具应把危险动作显式暴露出来：

```ts
const cancelOrder = tool(
  async ({ orderId, confirmed }) => {
    if (!confirmed) {
      return 'Need user confirmation before cancelling the order.';
    }

    await orderService.cancel(orderId);
    return `Order ${orderId} cancelled.`;
  },
  {
    name: 'cancel_order',
    description: 'Cancel an order after explicit user confirmation.',
    schema: z.object({
      orderId: z.string(),
      confirmed: z.boolean(),
    }),
  },
);
```

模型可以请求调用工具，但是否允许执行，必须由应用侧规则决定。

## 关键结论

- Tool 是模型可请求调用的外部能力。
- Tool calling 是模型决策，应用执行。
- Agent 是基于模型、工具和反馈循环的运行形态。
- 简单固定流程不需要 agent。
- 复杂有状态流程应考虑 LangGraph，而不是把所有逻辑塞进一个 agent。

参考：

- [Tools](https://docs.langchain.com/oss/javascript/langchain/tools)
- [Agents](https://docs.langchain.com/oss/javascript/langchain/agents)
- [Runtime](https://docs.langchain.com/oss/javascript/langchain/runtime)
