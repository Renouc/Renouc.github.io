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
          ],
        },
        { text: 'Ollama', link: '/ai/local-models/ollama' },
      ],
    },
  ],
};

export default aiSidebar;
