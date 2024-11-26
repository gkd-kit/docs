import 'uno.css';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import components from '../components';
import BodyScrollbar from '../components/BodyScrollbar.vue';
import './custom.css';
import {
  Fragment,
  h,
  Teleport,
  defineComponent,
  shallowRef,
  onMounted,
} from 'vue';

// 兼容旧链接/短链重定向
if (!import.meta.env.SSR) {
  const u = location.href.substring(location.origin.length);
  if (location.pathname.startsWith('/selector/')) {
    if (location.pathname.at(-1) === '/') {
      location.pathname = '/guide/selector';
    } else {
      location.pathname = location.pathname.replace('/selector/', '/guide/');
    }
  } else if (location.pathname === '/subscription/') {
    location.pathname = '/guide/subscription';
  } else if (location.pathname === '/') {
    const r = new URLSearchParams(location.search).get('r');
    if (r === '1') {
      location.href = '/guide/snapshot#how-to-upload';
    } else if (r === '2') {
      location.href = '/guide/faq#restriction';
    } else if (r === '3') {
      location.href = '/guide/faq#adb_failed';
    } else if (r === '4') {
      location.href = 'https://shizuku.rikka.app';
    }
  } else if (u === '/guide/faq#fail_setting_secure_settings') {
    location.hash = 'adb_failed';
  }
}

const ScrollbarWrapper = defineComponent(() => {
  const show = shallowRef(false);
  onMounted(() => {
    const isMobile = 'ontouchstart' in document.documentElement;
    show.value = !isMobile;
    if (isMobile) {
      document.body.classList.add('mobile');
      document.documentElement.classList.add('mobile');
    }
  });
  return () => {
    return show.value
      ? h(Teleport, { to: document.body }, h(BodyScrollbar))
      : undefined;
  };
});

export default {
  extends: DefaultTheme,
  Layout() {
    return h(Fragment, null, [h(DefaultTheme.Layout), h(ScrollbarWrapper)]);
  },
  enhanceApp({ app }) {
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component);
    });
  },
} satisfies Theme;
