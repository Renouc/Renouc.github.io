# Observability 与 Evaluation

LLM 应用不能只看最终回答。真正需要观察的是：模型看到了什么、调用了什么工具、为什么失败、成本和延迟是多少。

## Observability

Tracing 应记录一次执行中的关键节点：

- 输入 messages
- system prompt
- 模型调用参数
- tool calls 和 tool outputs
- structured response
- 错误、耗时、token 和成本

LangChain agent 可以通过 LangSmith tracing 观察执行过程。最小开启方式是配置环境变量：

```bash
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=<your-api-key>
LANGSMITH_PROJECT=<project-name>
```

上线后不要只看成功率，还要看错误类型、工具调用次数、平均耗时、长尾延迟和高成本请求。

## Evaluation

Evaluation 用来回答一个问题：这次修改有没有让结果变好，或者至少没有变差。

最小评估集应包含：

- 正常问题
- 边界问题
- 模糊问题
- 不应回答的问题
- 需要调用工具的问题
- 工具失败或无结果的问题

评估方式可以分层：

| 类型         | 适合判断                       |
| ------------ | ------------------------------ |
| 代码规则     | JSON 格式、字段范围、引用数量   |
| 人工评审     | 业务正确性、表达质量           |
| LLM-as-judge | 语义相似、完整性、是否依据上下文 |

不要一开始就追求复杂评估平台。先沉淀一组能复现真实问题的样例，再把它变成回归测试。

## 线上闭环

一个可持续的质量闭环：

```text
线上 trace → 标记失败样例 → 加入 dataset → 本地或 CI 评估 → 修复 → 对比结果
```

每次 prompt、tool、RAG 或模型版本调整后，都应跑同一批样例。否则很容易修好一个问题，又引入新的退化。

## 关键结论

- Observability 用来解释单次执行发生了什么。
- Evaluation 用来判断版本之间质量是否变化。
- trace 中的问题样例应沉淀为评估集。
- 没有评估闭环，LLM 应用很难稳定迭代。

参考：

- [LangSmith Observability](https://docs.langchain.com/oss/javascript/langchain/observability)
- [LangSmith Evaluation](https://docs.langchain.com/langsmith/evaluation)
