const backendSidebar = {
  '/backend/': [
    {
      text: 'Node.js',
      items: [
        { text: '环境变量', link: '/backend/node/env' },
        { text: '文件系统常用操作', link: '/backend/node/filesystem' },
        { text: '标准输入输出流', link: '/backend/node/stdio' },
        { text: 'SSE 流式回复', link: '/backend/node/sse-stream' },
      ],
    },
    {
      text: '服务端框架与接口',
      items: [
        { text: 'Koa', link: '/backend/koa/' },
      ],
    },
  ],
};

export default backendSidebar;
