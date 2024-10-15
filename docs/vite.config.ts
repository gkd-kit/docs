import unocss from 'unocss/vite';
import { defineConfig } from 'vite';
import { mirror } from './.vitepress/plugins';

export default defineConfig({
  plugins: [unocss(), mirror()],
  server: {
    host: '127.0.0.1',
    port: 8633,
  },
});
