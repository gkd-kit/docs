import fs from 'node:fs/promises';
import type { Plugin } from 'vite';
import type selfPkgT from '../../package.json';

const selfPkg: typeof selfPkgT = JSON.parse(
  await fs.readFile(process.cwd() + '/package.json', 'utf-8'),
);

const mirrorBaseUrl = `https://registry.npmmirror.com/@gkd-kit/docs/${selfPkg.version}/files/.vitepress/dist`;

export const mirror = (): Plugin => {
  return {
    name: 'mirror',
    apply: 'build',
    enforce: 'post',
    config() {
      return {
        experimental: {
          renderBuiltUrl(filename) {
            // TODO renderBuiltUrl 在 vitepress 中不起作用
            return mirrorBaseUrl + '/' + filename;
          },
        },
      };
    },
  };
};
