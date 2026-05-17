# Guardrails 与 Human-in-the-loop

Guardrails 用来限制 agent 的输入、输出和行为边界。Human-in-the-loop 是其中一种重要手段：当 agent 要执行高风险动作时，暂停并等待人工决策。

## Guardrails 放在哪里

常见位置：

| 位置         | 目的                         |
| ------------ | ---------------------------- |
| 输入前       | 拦截敏感信息、注入攻击、非法请求 |
| 模型调用前   | 调整上下文、限制工具、清洗内容 |
| 工具调用前   | 校验权限、参数和副作用风险     |
| 输出后       | 校验格式、事实依据和合规要求   |

Guardrails 不能替代业务权限系统。它应作为应用规则的一层防护。

## 确定性规则优先

能用代码明确判断的问题，不要交给模型判断。

```ts
function assertCanCancelOrder(userRole: string, orderStatus: string) {
  if (userRole !== 'admin') {
    throw new Error('Only admin can cancel orders.');
  }

  if (orderStatus === 'paid') {
    throw new Error('Paid orders require manual review.');
  }
}
```

模型适合处理语义模糊的风险，例如识别提示注入、判断回复是否偏离资料来源。但模型判断更慢、更贵，也更不稳定。

## Human-in-the-loop

对写文件、执行 SQL、发邮件、取消订单这类有副作用的工具，应在执行前暂停确认。

```ts
import { createAgent, humanInTheLoopMiddleware } from 'langchain';
import { MemorySaver } from '@langchain/langgraph';

const agent = createAgent({
  model: 'openai:<model-name>',
  tools: [sendEmail, executeSql],
  checkpointer: new MemorySaver(),
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        send_email: true,
        execute_sql: true,
      },
    }),
  ],
});
```

HITL 的关键不是“多问一句”，而是让执行可以安全暂停、审阅、修改、拒绝和恢复。

## 需要重点保护的工具

- 写数据库
- 删除或覆盖文件
- 付款、退款、取消订单
- 发送外部消息
- 执行代码、SQL、Shell
- 访问敏感用户数据

这些工具应默认最小权限，并记录审计日志。

## 关键结论

- Guardrails 是应用规则，不是 prompt 技巧。
- 确定性规则优先用普通代码实现。
- 有副作用的工具调用需要权限、确认和审计。
- HITL 适合高风险动作，不适合给所有低风险查询增加阻塞。

参考：

- [Guardrails](https://docs.langchain.com/oss/javascript/langchain/guardrails)
- [Human-in-the-loop](https://docs.langchain.com/oss/javascript/langchain/human-in-the-loop)
