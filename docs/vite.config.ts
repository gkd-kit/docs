import { defineConfig } from 'vite';
import unocss from 'unocss/vite';

const ASSETS_VERSION = await fetch(
  'https://registry.npmmirror.com/@gkd-kit/assets/latest/files/package.json',
).then((r) => r.json().then((j) => j.version as string));

export default defineConfig({
  define: { ASSETS_VERSION: JSON.stringify(ASSETS_VERSION) },
  plugins: [unocss()],
});
