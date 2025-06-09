import { DefaultTheme } from "vitepress";

const sidebar: DefaultTheme.Sidebar = {
  "/frontend/javascript/": [
    { text: "类型和值", link: "/frontend/javascript/type_value" },
    { text: "this 的绑定", link: "/frontend/javascript/this" },
  ],
  "/fragment/": [
    {
      items: [
        { text: "GraphQL 的基本使用", link: "/fragment/graphql" },
        { text: "npm 相关", link: "/fragment/npm" },
        { text: "Monorepo", link: "/fragment/monorepo" },
        { text: "Koa", link: "/fragment/koa" },
        { text: "环境变量", link: "/fragment/env" },
        { text: "国际化", link: "/fragment/i18n" },
        { text: "Node.js 删除 API", link: "/fragment/fs_rm" },
        { text: "SOLID 原则", link: "/fragment/solid" },
        { text: "前端监控", link: "/fragment/monitor" },
        { text: "Git 常用操作", link: "/fragment/git" },
        { text: "中文输入法下的回车搜索", link: "/fragment/input_entry" },
      ],
    },
  ],
  "/devops/": [
    {
      text: "Docker",
      items: [{ text: "Docker 的基本使用", link: "/devops/docker" }],
    },
  ],
  "/frontend/engineering/": [
    {
      text: "Rollup 笔记",
      items: [
        {
          text: "Rollup 配置文件",
          link: "/frontend/engineering/rollup/config",
        },
      ],
    },
  ],
  "/frontend/typescript/": [
    {
      text: "类型基础",
      items: [
        {
          text: "原始类型和对象类型",
          link: "/frontend/typescript/base/original_object",
        },
        {
          text: "字面量与枚举",
          link: "/frontend/typescript/base/literal_enum",
        },
        {
          text: "函数与class",
          link: "/frontend/typescript/base/function_class",
        },
        {
          text: "内置类型与类型断言",
          link: "/frontend/typescript/base/built_in_types",
        },
      ],
    },
    {
      text: "类型工具",
      items: [
        {
          text: "创建与组合",
          link: "/frontend/typescript/tool/type_create",
        },
        {
          text: "类型保护",
          link: "/frontend/typescript/tool/type_safety",
        },
        {
          text: "泛型",
          link: "/frontend/typescript/tool/generic",
        },
        {
          text: "结构化类型系统",
          link: "/frontend/typescript/tool/structured_type_system",
        },
        {
          text: "类型层级",
          link: "/frontend/typescript/tool/type_hierarchy",
        },
        {
          text: "条件类型与infer",
          link: "/frontend/typescript/tool/conditional_type_infer",
        },
      ],
    },
    {
      text: "类型小知识",
      items: [
        {
          text: "对象字面量额外属性检查",
          link: "/frontend/typescript/tips/extra_property_check",
        },
      ],
    },
  ],
  "/frontend/react/": [
    { text: "React 的基本使用", link: "/frontend/react/base" },
    { text: "JSX 转换", link: "/frontend/react/jsx" },
    { text: "useState 原理", link: "/frontend/react/useState" },
    { text: "Fiber 结构", link: "/frontend/react/fiber" },
  ],
  "/frontend/next/": [
    { text: "Next.js 渲染模式", link: "/frontend/next/render" },
    { text: "Next.js 中间件", link: "/frontend/next/middleware" },
    { text: "pages模式路由相关", link: "/frontend/next/pages-router" },
  ],
};

export default sidebar;
