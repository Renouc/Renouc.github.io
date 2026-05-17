# Middleware 与 Context Engineering

Context engineering 的核心是：在每次模型调用前，把正确的信息、工具和约束放到正确的位置。Middleware 是 LangChain 控制 agent 执行过程的主要入口。

## Middleware 介入什么

Middleware 可以介入 agent 生命周期中的关键点：

- 模型调用前后
- 工具调用前后
- prompt、messages、tools、response format 的选择
- 日志、重试、fallback、guardrails、人工确认

它适合放横切逻辑，不适合承载核心业务流程。

## 动态 System Prompt

不同用户、权限或环境可能需要不同提示词。运行时信息应从 context 进入，而不是让模型猜。

```ts
import { createAgent, dynamicSystemPromptMiddleware } from 'langchain';
import * as z from 'zod';

const contextSchema = z.object({
  userRole: z.enum(['admin', 'viewer']),
});

const agent = createAgent({
  model: 'openai:<model-name>',
  tools: [],
  contextSchema,
  middleware: [
    dynamicSystemPromptMiddleware((_, runtime) => {
      if (runtime.context.userRole === 'admin') {
        return '你是内部助手。用户是管理员，但危险操作仍需确认。';
      }

      return '你是内部助手。用户只有只读权限，不要执行写操作。';
    }),
  ],
});
```

## 三类 Context

| 类型               | 含义                         | 例子                         |
| ------------------ | ---------------------------- | ---------------------------- |
| Model context      | 当前模型调用能看到的内容     | system prompt、messages、tools |
| Tool context       | 工具执行时能读取或写入的数据 | 用户 ID、权限、数据库连接     |
| Life-cycle context | 模型和工具调用之间的控制逻辑 | 摘要、日志、重试、guardrails  |

不要把所有信息都塞进 model context。模型只需要看到完成当前任务所需的信息。

## 适合放 Middleware 的逻辑

- 根据用户权限调整可用工具
- 长对话前裁剪或摘要 messages
- 为请求打 metadata，便于 tracing
- 对输出做格式检查
- 对敏感工具调用插入人工确认

不适合放 middleware 的逻辑：

- 复杂业务流程编排
- 明确的多步骤状态机
- 需要持久化和恢复的长任务

这些更适合直接用普通代码或 LangGraph 表达。

## 关键结论

- Context engineering 关注模型每一步到底看到了什么。
- Middleware 是控制 agent 上下文和生命周期的入口。
- 运行时身份、权限、配置应由应用传入，不应由模型推断。
- Middleware 适合横切控制，不应替代业务流程设计。

参考：

- [Middleware](https://docs.langchain.com/oss/javascript/langchain/middleware/overview)
- [Context engineering](https://docs.langchain.com/oss/javascript/langchain/context-engineering)
