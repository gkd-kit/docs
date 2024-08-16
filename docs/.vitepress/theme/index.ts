import 'uno.css';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import components from '../components';
import './custom.css';

// Redirect /selector/* to /guide/*
if (!import.meta.env.SSR) {
  if (location.pathname.startsWith('/selector/')) {
    if (location.pathname.at(-1) === '/') {
      location.pathname = '/guide/selector';
    } else {
      location.pathname = location.pathname.replace('/selector/', '/guide/');
    }
  } else if (location.pathname === '/subscription/') {
    location.pathname = '/guide/subscription';
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
