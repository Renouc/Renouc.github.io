import { DefaultTheme } from 'vitepress';

const nav: DefaultTheme.NavItem[] = [
  {
    text: '前端知识',
    items: [
      {
        text: 'React',
        link: '/frontend/react',
      },
      {
        text: 'JavaScript',
        link: '/frontend/javascript',
      },
      {
        text: 'Next.js',
        link: '/frontend/next',
      },
      {
        text: 'TypeScript',
        link: '/frontend/typescript',
      },
      {
        text: '工程化',
        link: '/frontend/engineering',
      },
    ],
  },
  {
    text: 'DevOps',
    link: '/devops',
  },
  { text: '知识碎片', link: '/fragment' },
];
export default nav;
