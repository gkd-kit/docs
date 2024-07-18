import 'uno.css';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import './custom.css';
import ImageTable from '../components/ImageTable.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ImageTable', ImageTable);
  },
} satisfies Theme;
