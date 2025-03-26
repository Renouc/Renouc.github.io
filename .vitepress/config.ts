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
          items: [{ text: "this 的绑定", link: "/frontend/javascript/this" }],
        },
        {
          text: "React",
          items: [{ text: "React 的基本使用", link: "/frontend/react/base" }],
        },
        {
          text: "Next.js",
          items: [
            { text: "Next.js 渲染模式", link: "/frontend/next/render" },
            { text: "Next.js 中间件", link: "/frontend/next/middleware" },
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
