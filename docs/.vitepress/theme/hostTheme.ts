import { useData } from 'vitepress';
import { onMounted, onUnmounted } from 'vue';

interface Gkd {
  /** Synchronous environment JSON; unavailable in older hosts. */
  getEnvironment?: () => string;
  /** Current effective theme; unavailable in older hosts. */
  isDarkTheme?: () => boolean;
}

export function setupHostTheme() {
  const { isDark } = useData();

  function syncTheme() {
    try {
      const host = Reflect.get(globalThis, 'gkd') as Gkd | undefined;
      if (typeof host?.isDarkTheme !== 'function') return;
      const dark = host.isDarkTheme();
      if (typeof dark !== 'boolean') return;
      isDark.value = dark;
    } catch {
      // Older hosts may expose gkd without the theme API.
    }
  }

  onMounted(() => {
    window.addEventListener('gkd:themechange', syncTheme);
    syncTheme();
  });

  onUnmounted(() => {
    window.removeEventListener('gkd:themechange', syncTheme);
  });
}
