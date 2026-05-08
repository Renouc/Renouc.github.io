import { DefaultTheme } from 'vitepress';
import aiSidebar from './ai';
import backendSidebar from './backend';
import engineeringSidebar from './engineering';
import frontendSidebar from './frontend';
import principlesSidebar from './principles';
import pythonSidebar from './python';

// Sidebar modules only list real article groups.
// Category index pages are reached from the top nav and must not be duplicated here.
const sidebar: DefaultTheme.Sidebar = {
  ...frontendSidebar,
  ...pythonSidebar,
  ...backendSidebar,
  ...aiSidebar,
  ...engineeringSidebar,
  ...principlesSidebar,
};

export default sidebar;
