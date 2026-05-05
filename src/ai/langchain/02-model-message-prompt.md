# 模型、消息与提示词

LangChain 里最基础的一层，是对模型调用的封装。理解这一层，要先区分三个概念：model、message、prompt。

## Model

Model 是实际被调用的大语言模型。LangChain 的 chat model 接口把不同供应商封装成相似的调用形态：输入 messages，返回 `AIMessage`。

核心心智模型：

```text
messages → chat model → AIMessage
```

模型创建通常有两类方式：`initChatModel` 统一入口，或者具体 provider integration。

### 创建方式一：`initChatModel`

`initChatModel` 是 LangChain 的统一初始化入口，适合先建立跨 provider 的 chat model 抽象，或者需要从配置动态切换模型的场景。

```ts
import { initChatModel } from 'langchain';

const model = await initChatModel('<openai-model-name>', {
  temperature: 0,
  timeout: 30,
  maxTokens: 256,
  maxRetries: 2,
});
```

`initChatModel` 会根据模型名推断 provider。OpenAI、Anthropic 这类常见模型通常可以直接写模型名：

```ts
const openaiModel = await initChatModel('<openai-model-name>');
const anthropicModel = await initChatModel('<anthropic-model-name>');
```

当模型名不足以明确 provider，或者 provider 需要特殊路由时，再使用 `provider:model` 写法：

```ts
const azureModel = await initChatModel('azure_openai:<deployment-name>');
const googleModel = await initChatModel('google-genai:<model-name>');
const bedrockModel = await initChatModel('bedrock:<model-name>');
```

它仍然需要对应 provider 的 integration 包和凭证。常见环境变量包括：

| Provider  | 常见环境变量                                                   |
| --------- | -------------------------------------------------------------- |
| OpenAI    | `OPENAI_API_KEY`                                               |
| Anthropic | `ANTHROPIC_API_KEY`                                            |
| Google    | `GOOGLE_API_KEY`                                               |
| Azure     | `AZURE_OPENAI_API_KEY`、`AZURE_OPENAI_ENDPOINT`、`OPENAI_API_VERSION` |

如果不想使用环境变量，可以在初始化时显式传入 `apiKey`：

```ts
const model = await initChatModel('<openai-model-name>', {
  apiKey: process.env.MY_OPENAI_API_KEY,
  temperature: 0,
});
```

如果既没有配置对应环境变量，也没有显式传 `apiKey`，实际调用模型时会因为认证失败而报错。

不要把真实 key 硬编码进源码。生产环境优先通过环境变量、密钥管理服务或运行时配置注入。

如果使用 OpenAI-compatible 接口，可以显式指定 `modelProvider`、`baseUrl` 和 `apiKey`：

```ts
const model = await initChatModel('<provider-model-name>', {
  modelProvider: 'openai',
  baseUrl: 'https://your-provider.com/v1',
  apiKey: process.env.PROVIDER_API_KEY,
});
```

### 创建方式二：Provider Integration

Provider integration 是 LangChain 对具体模型供应商的封装包。实际工程中经常直接使用这些包，因为依赖明确、类型清楚、provider 特有参数也更直接。

常见例子：

| Provider  | 包名                       | 常用类名                 |
| --------- | -------------------------- | ------------------------ |
| OpenAI    | `@langchain/openai`        | `ChatOpenAI`             |
| Anthropic | `@langchain/anthropic`     | `ChatAnthropic`          |
| Google    | `@langchain/google-genai`  | `ChatGoogleGenerativeAI` |

也就是说，`initChatModel` 更像统一入口；provider integration 更像具体工程实现。

### 主要示例：`@langchain/openai`

如果项目主要使用 OpenAI，最常见的是直接使用 `@langchain/openai`。

```bash
npm install @langchain/openai
```

通常通过环境变量提供密钥：

```bash
OPENAI_API_KEY=your-api-key
```

```ts
import { ChatOpenAI } from '@langchain/openai';

const model = new ChatOpenAI({
  model: '<openai-model-name>',
  temperature: 0,
  timeout: 30,
  maxTokens: 256,
  maxRetries: 2,
});
```

`ChatOpenAI` 创建出来的对象同样实现 LangChain chat model 接口，因此后续可以继续接 tools、structured output、streaming 和 agent。

如果不使用 `OPENAI_API_KEY`，也可以显式传入 `apiKey`：

```ts
const model = new ChatOpenAI({
  model: '<openai-model-name>',
  apiKey: process.env.MY_OPENAI_API_KEY,
});
```

如果使用 OpenAI 兼容接口，可以配置 `baseURL`：

```ts
const model = new ChatOpenAI({
  model: '<provider-model-name>',
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: 'https://your-provider.com/v1',
  },
});
```

注意：OpenAI 兼容接口只表示 HTTP API 形态兼容，不代表所有 provider 特有能力都会被 `ChatOpenAI` 完整保留。需要非标准能力时，优先找对应 provider 的专用 integration。

### 调用模型

无论通过哪种方式创建，只要得到的是 LangChain chat model，都可以用相同方式调用：

```ts
const response = await model.invoke([
  { role: 'system', content: '你是一个严谨的技术助手。' },
  { role: 'user', content: '解释 message 和 prompt 的区别。' },
]);

console.log(response.content);
```

`invoke` 的关键点是：应用传入 messages，模型返回一个 `AIMessage`。`response.content` 是文本内容，真实项目中还要关注元数据、错误和 token 成本。

### 如何选择

选择模型创建方式可以按这个原则判断：

| 创建方式                    | 适合场景                         |
| --------------------------- | -------------------------------- |
| `initChatModel()`           | 需要统一抽象、动态配置或切换模型 |
| `new ChatOpenAI()`          | 项目明确使用 OpenAI，工程中常见  |
| `new ChatAnthropic()` 等    | 项目明确使用某个具体 provider    |

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

这里仅说明最小模型流式调用。agent 进度、token chunk、自定义事件等模式见 [Streaming](/ai/langchain/04-streaming)。

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

- [Models](https://docs.langchain.com/oss/javascript/langchain/models)
- [ChatOpenAI](https://docs.langchain.com/oss/javascript/integrations/chat/openai)
- [Messages](https://docs.langchain.com/oss/javascript/langchain/messages)
- [Structured Output](https://docs.langchain.com/oss/javascript/langchain/structured-output)
- [Streaming](https://docs.langchain.com/oss/javascript/langchain/streaming)
