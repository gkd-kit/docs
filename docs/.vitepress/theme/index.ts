import 'uno.css';
import { type Router, type Theme, useRouter } from 'vitepress';
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

const delay = (n = 0) => new Promise((r) => setTimeout(r, n));

let lastHashEl: HTMLElement | undefined = undefined;
let newPageFlag = true;
if (!import.meta.env.SSR) {
  setTimeout(() => {
    newPageFlag = false;
  }, 1000);
}
const animateHashEl = async (hashEl?: HTMLElement) => {
  if (location.hash) {
    hashEl ??= document.querySelector<HTMLElement>(location.hash) || undefined;
  }
  if (!hashEl) return;
  const hintCls = 'animate-hash-hint';
  if (lastHashEl) {
    lastHashEl.classList.remove(hintCls);
  }
  if (hashEl.classList.contains(hintCls)) {
    hashEl.classList.remove(hintCls);
    await delay(25);
  }
  hashEl.classList.add(hintCls);
  lastHashEl = hashEl;
  const ms = 500 * 2 * (newPageFlag ? 5 : 2);
  newPageFlag = false;
  await delay(ms);
  hashEl.classList.remove(hintCls);
  if (lastHashEl === hashEl) {
    lastHashEl = undefined;
  }
};

const handleCompatRedirect = async (router: Router) => {
  // 兼容旧链接/短链重定向
  const u = location.href.substring(location.origin.length);
  const replace = async (url: string) => {
    history.replaceState(null, '', url);
    await router.go(url);
  };
  if (location.pathname.startsWith('/selector/')) {
    if (location.pathname.at(-1) === '/') {
      replace('/guide/selector');
    } else {
      replace(location.pathname.replace('/selector/', '/guide/'));
    }
  } else if (
    location.pathname === '/subscription/' ||
    location.pathname === '/subscription'
  ) {
    await replace('/guide/subscription');
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
    } else if (r === '10') {
      router.go('/guide/sponsor');
    }
  } else if (u === '/guide/faq#fail_setting_secure_settings') {
    location.hash = 'adb_failed';
  }
  await nextTick();
  if (location.hash) {
    const hashEl = await (async () => {
      const href = location.href;
      let i = 0;
      while (i < 25) {
        if (href !== location.href) return;
        const el = document.querySelector<HTMLElement>(location.hash);
        if (el) {
          return el;
        }
        i++;
        await delay(100);
      }
    })();
    if (hashEl) {
      if (!isInViewport(hashEl)) {
        // 图片加载完成会导致排版变化, 即使提前使用相同比例的占位图也无法避免排版变化
        let i = 0;
        while (i < 25 && !checkAllImagesLoaded()) {
          await new Promise((r) => setTimeout(r, 100));
          i++;
        }
        const anchor = document.querySelector(
          `a.header-anchor[href="${location.hash}"]`,
        ) as HTMLAnchorElement;
        if (anchor) {
          anchor.click();
        } else {
          hashEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      animateHashEl(hashEl);
    }
  }
};

if (!import.meta.env.SSR) {
  window.addEventListener('hashchange', async () => {
    animateHashEl();
  });
}

const Redirect = defineComponent(() => {
  const router = useRouter();
  onMounted(() => {
    handleCompatRedirect(router);
    router.onAfterPageLoad = () => {
      nextTick().then(async () => {
        await delay(100);
        animateHashEl();
      });
    };
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
