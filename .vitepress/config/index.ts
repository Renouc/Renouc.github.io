import nav from './nav';
import sidebar from './sidebar';
import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Youmi',
  description: '前端、后端、工程化与 AI 学习笔记',
  cleanUrls: true,
  srcDir: 'src',
  head: [['link', { rel: 'icon', href: '/logo.svg' }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    outline: 'deep',
    nav,
    sidebar,
    socialLinks: [{ icon: 'github', link: 'https://github.com/Renouc' }],
    search: {
      provider: 'local',
    },
  },
});
