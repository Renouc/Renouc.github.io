import { DefaultTheme } from 'vitepress';
import aiSidebar from './ai';
import backendSidebar from './backend';
import devopsSidebar from './devops';
import engineeringSidebar from './engineering';
import frontendSidebar from './frontend';
import principlesSidebar from './principles';

// Sidebar modules only list real article groups.
// Category index pages are reached from the top nav and must not be duplicated here.
const sidebar: DefaultTheme.Sidebar = {
  ...frontendSidebar,
  ...backendSidebar,
  ...aiSidebar,
  ...engineeringSidebar,
  ...devopsSidebar,
  ...principlesSidebar,
};

export default sidebar;
