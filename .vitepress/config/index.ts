import nav from "./nav";
import sidebar from "./sidebar";
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
    outline: "deep",
    nav,
    sidebar,
    socialLinks: [{ icon: "github", link: "https://github.com/Renouc" }],
    search: {
      provider: 'local'
    }
  },
});
