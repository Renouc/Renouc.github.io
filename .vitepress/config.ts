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
      ],
      "/devops/": [
        {
          text: "Docker",
          items: [{ text: "Docker 的基本使用", link: "/devops/docker" }],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/Renouc" },
    ],
  },
});
