# LangChain 的定位与边界

LangChain 是一个用于构建 LLM 应用的开发框架。它的核心价值不是“让模型变聪明”，而是把模型调用、消息、工具、结构化输出、上下文管理和运行流程组织成更稳定的应用结构。

## 解决的问题

直接调用模型 SDK 时，应用通常要自己处理：

- 不同模型供应商的调用差异
- 消息格式、工具定义、结构化输出
- 流式输出、重试、超时、错误处理
- 多步骤任务中的上下文与中间状态
- 调试、追踪、评估和线上观察

LangChain 试图把这些重复问题抽象出来，让开发者把重点放在业务流程、工具边界和结果质量上。

## 不解决的问题

LangChain 不是模型能力本身，也不是业务正确性的保证。

它不能替代：

- 对模型能力边界的理解
- 清晰的 prompt 和上下文设计
- 可靠的工具实现
- 业务权限、数据安全和异常处理
- 评估集、回归测试和线上监控

如果底层任务定义模糊、工具返回不稳定、上下文被污染，换成 LangChain 也不会自动变好。

## 与直接调用 SDK 的区别

直接调用模型 SDK 更适合：

- 单次问答
- 简单文本生成
- 固定输入到固定输出的轻量任务
- 对依赖和抽象层要求极低的场景

LangChain 更适合：

- 需要兼容多个模型供应商
- 需要工具调用或结构化输出
- 需要把模型调用嵌入较长的业务流程
- 需要 agent、RAG、记忆、追踪或评估
- 需要把 LLM 能力沉淀成可维护的应用模块

判断标准很简单：如果直接 SDK 调用已经清晰、稳定、可测试，就没有必要为了“用了框架”而引入 LangChain。

LangChain 的最小调用形态通常是这样：

```ts
import { initChatModel } from 'langchain';

const model = await initChatModel('<model-name>', {
  temperature: 0,
});

const response = await model.invoke([
  { role: 'system', content: '你是一个严谨的技术助手。' },
  { role: 'user', content: '用一句话解释 LangChain 的作用。' },
]);

console.log(response.content);
```

这个示例只体现一件事：LangChain 先把模型调用统一起来。只有当任务继续引入工具、结构化输出、agent、RAG、追踪时，框架的收益才会变得明显。

## LangChain、LangGraph、LangSmith

这三个名字容易混在一起，但职责不同：

| 名称       | 主要职责                                             |
| ---------- | ---------------------------------------------------- |
| LangChain  | 构建 LLM 应用的高层接口，包含模型、消息、工具、agent |
| LangGraph  | 构建有状态、多步骤、可恢复的 agent 或 workflow       |
| LangSmith  | 对 LLM 应用进行 tracing、调试、评估和监控            |

可以这样理解：

- LangChain 负责常用 LLM 应用抽象
- LangGraph 负责复杂流程和状态编排
- LangSmith 负责观察、评估和质量闭环

现在的 LangChain agent 能力底层依赖 LangGraph。简单 agent 可以从 LangChain 开始；一旦流程需要明确状态、分支、人工介入、持久化或恢复执行，就应考虑直接使用 LangGraph。

简单 agent 的 API 形态如下：

```ts
import { createAgent } from 'langchain';

const agent = createAgent({
  model: '<model-name>',
  tools: [],
  systemPrompt: '你是一个严谨的任务助手。',
});

const result = await agent.invoke({
  messages: [{ role: 'user', content: '总结一下 LangChain 的定位。' }],
});
```

如果这里的 `tools` 为空，并且流程也不需要模型动态决策，通常说明普通模型调用或固定 workflow 就足够。

LangSmith 不直接改变业务逻辑，它负责让调用过程可观察。接入后应重点查看每次调用的 messages、tool calls、输出、耗时、错误和成本，而不是只看最终回答。

## 适合使用的场景

适合引入 LangChain 的常见场景：

- 知识库问答，需要检索、重排、引用来源
- 智能客服，需要调用订单、工单、用户系统
- 数据分析助手，需要调用 SQL、图表、文件工具
- 自动化 agent，需要多轮推理和工具反馈
- 多模型应用，需要统一供应商差异

这些场景的共同点是：模型不是孤立生成文本，而是参与一个有上下文、有工具、有状态的应用流程。

## 不适合使用的场景

不建议优先使用 LangChain 的场景：

- 只是包装一次模型调用
- 业务流程完全固定，普通代码更清楚
- 团队还没有理解 tool calling、上下文和评估
- 对依赖体积、启动速度、抽象透明度非常敏感
- 项目只需要模型 SDK 已经支持的少量能力

LangChain 应该解决真实复杂度，而不是制造新的复杂度。

## 关键结论

- LangChain 是应用框架，不是模型能力。
- 简单任务优先直接使用模型 SDK。
- 复杂任务要先识别状态、工具、上下文和评估问题，再决定是否引入 LangChain。
- 复杂 agent 或长期运行流程通常要关注 LangGraph。
- 没有 LangSmith 这类追踪和评估能力，LLM 应用很难稳定迭代。

参考：

- [LangChain Overview](https://docs.langchain.com/oss/javascript/langchain/overview)
- [LangGraph Overview](https://docs.langchain.com/oss/javascript/langgraph/overview)
- [LangSmith Observability](https://docs.langchain.com/oss/javascript/langchain/observability)
