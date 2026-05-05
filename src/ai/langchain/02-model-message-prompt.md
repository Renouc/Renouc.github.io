# 模型、消息与提示词

LangChain 里最基础的一层，是对模型调用的封装。理解这一层，要先区分三个概念：model、message、prompt。

## Model

Model 是实际被调用的大语言模型。LangChain 用统一接口封装不同供应商，应用代码不必直接绑定某一家 SDK 的所有细节。

模型调用时常见配置包括：

| 配置          | 作用                                 |
| ------------- | ------------------------------------ |
| `model`       | 具体模型名称                         |
| `temperature` | 控制输出随机性，越低越稳定           |
| `timeout`     | 单次调用超时时间                     |
| `maxTokens`   | 限制最大输出长度                     |
| `maxRetries`  | 失败后的最大重试次数                 |
| `stream()`    | 以流式方式调用模型                   |

这些配置不会改变任务本质，只影响模型生成结果的稳定性、速度、成本和失败表现。

最小调用示例：

```ts
import { initChatModel } from 'langchain';

const model = await initChatModel('<model-name>', {
  temperature: 0,
  timeout: 30,
  maxTokens: 256,
  maxRetries: 2,
});

const response = await model.invoke([
  { role: 'system', content: '你是一个严谨的技术助手。' },
  { role: 'user', content: '用一句话解释什么是 tool calling。' },
]);

console.log(response.content);
```

这个示例里的关键点是：应用传入 messages，模型返回一个 `AIMessage`。`response.content` 是文本内容，真实项目中还要关注元数据、错误和 token 成本。

## Message

Chat model 的输入不是单纯字符串，而是一组 messages。每条 message 都有角色和内容。

常见角色：

| 角色        | 含义                                   |
| ----------- | -------------------------------------- |
| `system`    | 定义模型的行为边界、身份、规则         |
| `user`      | 用户输入                               |
| `assistant` | 模型上一轮回复                         |
| `tool`      | 工具执行结果，供模型继续推理           |

最小结构可以理解为：

```ts
const messages = [
  { role: 'system', content: '你是一个严谨的技术助手。' },
  { role: 'user', content: '解释什么是 tool calling。' },
] as const;
```

message 是上下文的基本单位。多轮对话、工具调用结果、系统约束，最终都会进入模型上下文。

除了普通对象格式，也可以使用 LangChain 的消息类：

```ts
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

const messages = [
  new SystemMessage('你是一个严谨的技术助手。'),
  new HumanMessage('解释 message 和 prompt 的区别。'),
];

const response = await model.invoke(messages);
```

对象格式更接近模型 API，消息类更适合在代码里表达明确的消息类型。两者的核心都是把上下文拆成有角色的消息。

## Prompt

Prompt 不是一个神秘概念，本质是组织输入上下文的方式。

在 chat model 中，prompt 通常会被拆成多条 message：

- 系统规则放在 `system`
- 用户问题放在 `user`
- 历史回复放在 `assistant`
- 外部工具结果放在 `tool`

因此，写 prompt 不是只写一句“请你回答得更好”，而是决定：

- 哪些信息进入上下文
- 信息按什么顺序进入
- 哪些规则必须长期稳定
- 哪些数据只在当前请求有效
- 哪些内容来自用户，哪些内容来自系统

当 prompt 需要复用时，可以使用模板：

```ts
import { ChatPromptTemplate } from '@langchain/core/prompts';

const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是一个{role}。回答必须简洁、准确。'],
  ['user', '请用{language}解释：{topic}'],
]);

const messages = await prompt.formatMessages({
  role: 'TypeScript 技术助手',
  language: '中文',
  topic: 'LangChain 中的 structured output',
});

const response = await model.invoke(messages);
```

模板的价值不是“让 prompt 更高级”，而是把可变输入和稳定规则分开，降低复制粘贴导致的不一致。

## Context Window

Context window 是模型一次调用能看到的最大上下文范围。它不是长期记忆，只是当前请求中传给模型的内容。

上下文过长会带来三个问题：

- 成本上升
- 延迟上升
- 关键信息被噪音淹没

所以 LLM 应用不能无节制地把所有历史和数据都塞进 prompt。需要根据任务选择、压缩、检索或丢弃上下文。

一个最小的上下文控制示意：

```ts
const recentMessages = history.slice(-8);

const response = await model.invoke([
  { role: 'system', content: '你是一个严谨的技术助手。' },
  ...recentMessages,
  { role: 'user', content: question },
]);
```

这不是完整记忆方案，只是说明：进入模型的上下文应由应用显式选择，而不是无限追加。

## Structured Output

Structured output 是要求模型按固定结构返回结果，例如 JSON、对象或符合 schema 的字段。

它适合用于：

- 分类
- 信息抽取
- 表单填充
- 路由决策
- 后续程序要继续处理的结果

示例结构：

```ts
import * as z from 'zod';

const IntentSchema = z.object({
  name: z.string(),
  confidence: z.number().min(0).max(1),
});

type Intent = z.infer<typeof IntentSchema>;
```

在 agent 中可以把 schema 作为 `responseFormat`：

```ts
import { createAgent } from 'langchain';
import * as z from 'zod';

const IntentSchema = z.object({
  name: z.enum(['search', 'summarize', 'unknown']),
  confidence: z.number().min(0).max(1),
});

const agent = createAgent({
  model: '<model-name>',
  tools: [],
  responseFormat: IntentSchema,
});

const result = await agent.invoke({
  messages: [{ role: 'user', content: '帮我查一下 LangChain 的工具调用。' }],
});

console.log(result.structuredResponse);
```

核心价值是把“自然语言回复”变成“程序可消费的数据”。但它仍然需要校验，不能假设模型永远返回正确值。

## Streaming

Streaming 是把模型输出按片段返回，常用于聊天界面。

它解决的是用户体验问题，不改变模型推理能力。使用 streaming 时要注意：

- 最终结果可能需要在流结束后再校验
- 工具调用和结构化输出的流式处理会更复杂
- UI 层要能处理部分内容、错误和中断

最小流式消费示例：

```ts
const stream = await model.stream([
  { role: 'user', content: '用三句话解释 LangChain。' },
]);

for await (const chunk of stream) {
  process.stdout.write(String(chunk.content ?? ''));
}
```

流式输出适合改善交互体验，但最终结果是否可用，仍然要在流结束后按业务规则判断。

## LangChain 在这一层封装了什么

LangChain 在模型调用层主要提供：

- 统一的模型接口
- 统一的 message 表达
- prompt 模板和消息组合能力
- structured output 的声明方式
- streaming 事件处理
- 与 tool、agent、tracing 的衔接

这层的目标不是隐藏 LLM 的不确定性，而是让输入、输出和运行过程更容易组织和观察。

## 常见误区

- 把 prompt 当成一段字符串，而不是上下文结构。
- 把 system message 当成绝对安全边界。
- 认为上下文越多越好。
- 认为 structured output 可以替代业务校验。
- 只调高 temperature 来追求“更聪明”的结果。

## 关键结论

- Model 是被调用的模型，message 是输入上下文的基本单位，prompt 是组织上下文的方法。
- LangChain 的价值在于统一和组织这些抽象，而不是消除模型的不确定性。
- 高质量 LLM 应用的核心是控制上下文、约束输出、处理失败。

参考：

- [Messages](https://docs.langchain.com/oss/javascript/langchain/messages)
- [Structured Output](https://docs.langchain.com/oss/javascript/langchain/structured-output)
- [Streaming](https://docs.langchain.com/oss/javascript/langchain/streaming)
