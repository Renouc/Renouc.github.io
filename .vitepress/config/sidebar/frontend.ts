const frontendSidebar = {
  '/frontend/': [
    {
      text: 'JavaScript',
      items: [
        { text: '类型和值', link: '/frontend/javascript/type_value' },
        { text: 'this 的绑定', link: '/frontend/javascript/this' },
      ],
    },
    {
      text: 'TypeScript 类型基础',
      items: [
        {
          text: '原始类型和对象类型',
          link: '/frontend/typescript/base/original_object',
        },
        {
          text: '字面量与枚举',
          link: '/frontend/typescript/base/literal_enum',
        },
        {
          text: '函数与 class',
          link: '/frontend/typescript/base/function_class',
        },
        {
          text: '内置类型与类型断言',
          link: '/frontend/typescript/base/built_in_types',
        },
      ],
    },
    {
      text: 'TypeScript 类型工具',
      items: [
        {
          text: '创建与组合',
          link: '/frontend/typescript/tool/type_create',
        },
        {
          text: '类型保护',
          link: '/frontend/typescript/tool/type_safety',
        },
        {
          text: '泛型',
          link: '/frontend/typescript/tool/generic',
        },
        {
          text: '结构化类型系统',
          link: '/frontend/typescript/tool/structured_type_system',
        },
        {
          text: '类型层级',
          link: '/frontend/typescript/tool/type_hierarchy',
        },
        {
          text: '条件类型与 infer',
          link: '/frontend/typescript/tool/conditional_type_infer',
        },
      ],
    },
    {
      text: 'TypeScript 类型小知识',
      items: [
        {
          text: '对象字面量额外属性检查',
          link: '/frontend/typescript/tips/extra_property_check',
        },
      ],
    },
    {
      text: 'React',
      items: [
        { text: 'React 渲染机制', link: '/frontend/react/rendering' },
        { text: '高阶组件', link: '/frontend/react/hoc' },
        { text: 'JSX 转换', link: '/frontend/react/jsx' },
        { text: 'useState 原理', link: '/frontend/react/useState' },
        { text: 'Zustand', link: '/frontend/react/zustand' },
      ],
    },
    {
      text: 'Next.js',
      items: [
        { text: '路由与渲染', link: '/frontend/next/routing-and-rendering' },
        { text: '中间件', link: '/frontend/next/middleware' },
      ],
    },
    {
      text: 'Rollup 笔记',
      items: [
        { text: 'Rollup 核心机制', link: '/frontend/engineering/rollup/' },
      ],
    },
    {
      text: 'Webpack 笔记',
      items: [
        { text: 'Webpack 配置文件', link: '/frontend/engineering/webpack/config' },
      ],
    },
    {
      text: 'Babel 笔记',
      items: [
        { text: 'Babel 的基本使用', link: '/frontend/engineering/babel/basic' },
      ],
    },
    {
      text: '前端实践',
      items: [
        { text: '国际化', link: '/frontend/practice/i18n' },
        { text: '中文输入法下的回车搜索', link: '/frontend/practice/input-entry' },
        {
          text: '从中间爆开的下划线动画',
          link: '/frontend/practice/underline-animation',
        },
        { text: '前端监控', link: '/frontend/practice/monitor' },
      ],
    },
  ],
};

export default frontendSidebar;
