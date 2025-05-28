import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Renouc",
  description: "积累知识碎片",
  cleanUrls: true,
  srcDir: "src",
  head: [["link", { rel: "icon", href: "/logo.svg" }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/logo.png",
    outline: "deep",
    nav: [
      {
        text: "前端知识",
        items: [
          {
            text: "React",
            link: "/frontend/react",
          },
          {
            text: "JavaScript",
            link: "/frontend/javascript",
          },
          {
            text: "Next.js",
            link: "/frontend/next",
          },
          {
            text: "TypeScript",
            link: "/frontend/typescript",
          },
        ],
      },
      {
        text: "DevOps",
        link: "/devops",
      },
      { text: "知识碎片", link: "/fragment" },
    ],

    sidebar: {
      "/frontend/": [
        {
          text: "JavaScript",
          items: [
            { text: "类型和值", link: "/frontend/javascript/type_value" },
            { text: "this 的绑定", link: "/frontend/javascript/this" },
          ],
        },
        {
          text: "React",
          items: [
            { text: "React 的基本使用", link: "/frontend/react/base" },
            { text: "JSX 转换", link: "/frontend/react/jsx" },
            { text: "useState 原理", link: "/frontend/react/useState" },
          ],
        },
        {
          text: "Next.js",
          items: [
            { text: "Next.js 渲染模式", link: "/frontend/next/render" },
            { text: "Next.js 中间件", link: "/frontend/next/middleware" },
            { text: "pages模式路由相关", link: "/frontend/next/pages-router" },
          ],
        },
        {
          text: "TypeScript",
          items: [
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
        },
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
            { text: "Rollup", link: "/fragment/rollup" },
          ],
        },
      ],
      "/devops/": [
        {
          text: "Docker",
          items: [{ text: "Docker 的基本使用", link: "/devops/docker" }],
        },
      ],
    },

    socialLinks: [{ icon: "github", link: "https://github.com/Renouc" }],
  },
});
