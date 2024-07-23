import 'uno.css';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import components from '../components';
import './custom.css';

// Redirect /selector/* to /guide/*
if (!import.meta.env.SSR && location.pathname.startsWith('/selector/')) {
  if (location.pathname.at(-1) === '/') {
    location.pathname = '/guide/selector';
  } else {
    location.pathname = location.pathname.replace('/selector/', '/guide/');
  }
}

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component);
    });
  },
} satisfies Theme;
