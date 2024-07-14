import { defineConfig } from 'vite';
import unocss from 'unocss/vite';
import { mirror } from './.vitepress/plugins';

const ASSETS_VERSION = await fetch(
  'https://registry.npmmirror.com/@gkd-kit/assets/latest/files/package.json',
).then((r) => r.json().then((j) => j.version as string));

export default defineConfig({
  define: { ASSETS_VERSION: JSON.stringify(ASSETS_VERSION) },
  plugins: [unocss(), mirror()],
  server: {
    host: '127.0.0.1',
    port: 8633,
  },
});
