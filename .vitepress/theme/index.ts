// https://vitepress.dev/guide/custom-theme
import { h } from 'vue';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import Layout from './Layout.vue';

import './renouc.css';
import './vars.css';
// import './overrides.css'
// import 'uno.css'
// import 'virtual:group-icons.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(Layout);
  },
  enhanceApp({ app, router, siteData }) {
    if (typeof window === 'undefined') return;

    document.documentElement.classList.add('renouc');

    document.addEventListener('mousemove', (e) => {
      const card = (e.target as Element)?.closest?.('.VPHome .VPFeature') as HTMLElement | null;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
    }, { passive: true });
  },
} satisfies Theme;

if (typeof window !== 'undefined') {
  // detect browser, add to class for conditional styling
  const browser = navigator.userAgent.toLowerCase();
  if (browser.includes('chrome'))
    document.documentElement.classList.add('browser-chrome');
  else if (browser.includes('firefox'))
    document.documentElement.classList.add('browser-firefox');
  else if (browser.includes('safari'))
    document.documentElement.classList.add('browser-safari');
}
