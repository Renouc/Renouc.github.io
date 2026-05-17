# Retrieval 与 RAG

Retrieval 解决的是模型无法直接看到外部知识的问题。RAG 的核心不是“让模型记住资料”，而是在每次请求时先取回相关内容，再把这些内容作为上下文交给模型。

## 基本流程

最小 RAG 流程：

```text
用户问题 → 检索相关文档 → 组装上下文 → 调用模型 → 返回答案
```

常见组件：

| 组件            | 作用                         |
| --------------- | ---------------------------- |
| Document loader | 把外部资料转成文档对象       |
| Text splitter   | 把长文档切成可检索片段       |
| Embedding model | 把文本转成向量               |
| Vector store    | 存储向量并做相似度检索       |
| Retriever       | 根据 query 返回相关文档      |

这些组件可以替换。业务代码应依赖 retriever，而不是绑定某个具体向量库。

## 从文档到 Retriever

LangChain 提供 loader 和 splitter。loader 负责把外部资料加载成 `Document[]`，splitter 负责把长文档切成适合检索的小片段。

一个最小流程是：加载文档，切分文档，写入 vector store，再创建 retriever。

```ts
import { TextLoader } from '@langchain/classic/document_loaders/fs/text';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

const loader = new TextLoader('./docs/langchain.txt');
const rawDocs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 150,
});

const documents = await splitter.splitDocuments(rawDocs);

const vectorStore = new MemoryVectorStore(
  new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
  }),
);

await vectorStore.addDocuments(documents);

const retriever = vectorStore.asRetriever({
  k: 4,
});
```

这里的 `retriever` 就是后面 2-Step RAG 示例里使用的检索器。`k: 4` 表示每次最多取回 4 个相关片段。

如果项目已经有搜索服务、数据库或内部知识库，也可以把查询逻辑包装成同样的检索接口。后面的 RAG 代码只关心一件事：`retriever.invoke(question)` 能返回和问题相关的文档。

## 2-Step RAG

2-Step RAG 是最可控的形态：每次都先检索，再生成。

```ts
const docs = await retriever.invoke(question);

const context = docs
  .map((doc, index) => `[${index + 1}] ${doc.pageContent}`)
  .join('\n\n');

const response = await model.invoke([
  {
    role: 'system',
    content: '只根据给定上下文回答；如果上下文不足，直接说明不知道。',
  },
  {
    role: 'user',
    content: `上下文：\n${context}\n\n问题：${question}`,
  },
]);
```

这种方式适合 FAQ、文档问答、内部知识库等路径清晰的场景。它的优点是延迟和成本更可控，缺点是模型不能决定是否需要继续检索。

## Agentic RAG

Agentic RAG 是把检索能力暴露成 tool，让 agent 自己判断什么时候检索。

```ts
import { createAgent, tool } from 'langchain';
import * as z from 'zod';

const searchDocs = tool(
  async ({ query }) => {
    const docs = await retriever.invoke(query);

    return docs
      .map((doc, index) => `[${index + 1}] ${doc.pageContent}`)
      .join('\n\n');
  },
  {
    name: 'search_docs',
    description: 'Search internal documents for information relevant to the query.',
    schema: z.object({
      query: z.string(),
    }),
  },
);

const agent = createAgent({
  model: 'openai:<model-name>',
  tools: [searchDocs],
  systemPrompt: '回答前如果缺少依据，先调用 search_docs 检索资料。',
});
```

这种方式适合问题不稳定、资料来源较多、需要多轮查询的场景。代价是执行路径更不确定，必须设置工具权限、调用次数和 tracing。

## 选择方式

| 场景                         | 更适合             |
| ---------------------------- | ------------------ |
| 每次回答都必须基于知识库     | 2-Step RAG         |
| 是否检索取决于用户问题       | Agentic RAG        |
| 需要检索后校验、改写、再检索 | Hybrid RAG / Graph |

不要把所有数据都塞进 prompt。RAG 的价值在于只把当前问题需要的证据放进上下文。

## 关键结论

- Retrieval 是运行时取知识，不是模型记忆。
- 简单知识库问答优先用 2-Step RAG。
- 多来源、多步骤、不确定路径再考虑 Agentic RAG。
- 检索结果要控制数量、质量和来源，避免把噪音塞进上下文。

参考：

- [LangChain Retrieval](https://docs.langchain.com/oss/javascript/langchain/retrieval)
- [Document loaders](https://docs.langchain.com/oss/javascript/integrations/document_loaders)
- [Text splitters](https://docs.langchain.com/oss/javascript/integrations/splitters)
- [Vector stores](https://docs.langchain.com/oss/javascript/integrations/vectorstores)
