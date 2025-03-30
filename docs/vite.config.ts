import unocss from 'unocss/vite';
import { defineConfig } from 'vite';
import { mirror } from './.vitepress/plugins';
import data from 'unplugin-data/vite';

export default defineConfig({
  plugins: [
    data({
      include: (v) => v.endsWith('.load.ts'),
    }),
    unocss({ inspector: false }),
    mirror(),
  ],
  server: {
    host: '127.0.0.1',
    port: 8633,
  },
});
