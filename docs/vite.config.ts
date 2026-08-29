import unocss from 'unocss/vite';
import { defineConfig } from 'vite';
import { mirror } from './.vitepress/plugins/index.ts';
import data from 'unplugin-data/vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    data({
      include: (v) => v.endsWith('.load.ts'),
    }),
    unocss({ inspector: false }),
    mirror(),
    legacy({
      renderLegacyChunks: false,
      modernPolyfills: true,
      modernTargets: ['Chrome >= 70'],
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 8633,
  },
  build: {
    rolldownOptions: {
      output: {
        comments: { legal: false },
      },
    },
  },
});
