const aiSidebar = {
  '/ai/': [
    {
      text: 'AI',
      items: [
        {
          text: 'LangChain',
          items: [
            { text: '定位与边界', link: '/ai/langchain/01-langchain-positioning' },
            { text: '模型、消息与提示词', link: '/ai/langchain/02-model-message-prompt' },
            { text: 'Tools 与 Agent', link: '/ai/langchain/03-tools-and-agent' },
            { text: 'Streaming', link: '/ai/langchain/04-streaming' },
            { text: 'Retrieval 与 RAG', link: '/ai/langchain/05-retrieval-rag' },
            { text: 'Memory 与 State', link: '/ai/langchain/06-memory-and-state' },
            {
              text: 'Middleware 与 Context',
              link: '/ai/langchain/07-middleware-context-engineering',
            },
            { text: 'Guardrails 与 HITL', link: '/ai/langchain/08-guardrails-and-hitl' },
            {
              text: 'Observability 与 Evaluation',
              link: '/ai/langchain/09-observability-and-evaluation',
            },
          ],
        },
        { text: 'Ollama', link: '/ai/local-models/ollama' },
      ],
    },
  ],
};

export default aiSidebar;
