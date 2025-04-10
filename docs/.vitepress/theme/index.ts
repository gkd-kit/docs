import 'uno.css';
import { type Router, useRouter, type Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import {
  defineComponent,
  Fragment,
  h,
  nextTick,
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

const isInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  const offset = window.innerHeight * 0.15;
  return rect.top - offset >= 0 && rect.bottom + offset <= window.innerHeight;
};

const checkAllImagesLoaded = () => {
  const images = document.images;
  for (let i = 0; i < images.length; i++) {
    if (!images[i].complete) {
      return false;
    }
  }
  return true;
};

const handleCompatRedirect = async (router: Router) => {
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
      return;
    } else if (r === '5') {
      router.go('/guide/subscription');
    } else if (r === '6') {
      router.go('/guide/faq#power');
    } else if (r === '7') {
      router.go('/guide/faq#exact-activity');
    } else if (r === '8') {
      router.go('/guide/faq#forced-tap');
    } else if (r === '9') {
      router.go('/guide/faq#work-profile');
    }
  } else if (u === '/guide/faq#fail_setting_secure_settings') {
    location.hash = 'adb_failed';
  }
  await nextTick();
  if (location.hash) {
    const hashEl = await (async () => {
      const href = location.href;
      let i = 0;
      while (i < 20) {
        if (href !== location.href) return;
        const el = document.querySelector<HTMLElement>(location.hash);
        if (el) {
          return el;
        }
        i++;
        await new Promise((r) => setTimeout(r, 250));
      }
    })();
    if (hashEl) {
      if (!isInViewport(hashEl)) {
        // 图片加载完成会导致排版变化，此处手动判断后滚动到视口中
        // 也许后续可实现在构建时提前获取 size 后设置 aspect-ratio
        let i = 0;
        while (i < 25 && !checkAllImagesLoaded()) {
          await new Promise((r) => setTimeout(r, 100));
          i++;
        }
        hashEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const hintCls = 'animate-hash-hint';
      hashEl.classList.add(hintCls);
      await new Promise((r) => setTimeout(r, 500 * 2 * 5));
      hashEl.classList.remove(hintCls);
    }
  }
};

const Redirect = defineComponent(() => {
  const router = useRouter();
  onMounted(() => {
    handleCompatRedirect(router);
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
