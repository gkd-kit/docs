import 'uno.css';
import { useRouter, type Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import {
  defineComponent,
  Fragment,
  h,
  onMounted,
  shallowRef,
  Teleport,
} from 'vue';
import components from '../components';
import BodyScrollbar from '../components/BodyScrollbar.vue';
import './custom.css';

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

const Redirect = defineComponent(() => {
  const router = useRouter();
  onMounted(() => {
    // 兼容旧链接/短链重定向
    const u = location.href.substring(location.origin.length);
    if (location.pathname.startsWith('/selector/')) {
      if (location.pathname.at(-1) === '/') {
        router.go('/guide/selector');
      } else {
        router.go(location.pathname.replace('/selector/', '/guide/'));
      }
    } else if (location.pathname === '/subscription/') {
      router.go('/guide/subscription');
    } else if (location.pathname === '/') {
      const r = new URLSearchParams(location.search).get('r');
      if (r === '1') {
        router.go('/guide/snapshot#how-to-upload');
      } else if (r === '2') {
        router.go('/guide/faq#restriction');
      } else if (r === '3') {
        router.go('/guide/faq#adb_failed');
      } else if (r === '4') {
        location.href = 'https://shizuku.rikka.app';
      }
    } else if (u === '/guide/faq#fail_setting_secure_settings') {
      location.hash = 'adb_failed';
    }
  });
  return () => {};
});

export default {
  extends: DefaultTheme,
  Layout() {
    return h(Fragment, null, [
      h(DefaultTheme.Layout),
      h(ScrollbarWrapper),
      h(Redirect),
    ]);
  },
  enhanceApp({ app }) {
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component);
    });
  },
} satisfies Theme;
