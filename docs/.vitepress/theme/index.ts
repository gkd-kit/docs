import 'uno.css';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import components from '../components';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component);
    });
  },
} satisfies Theme;
