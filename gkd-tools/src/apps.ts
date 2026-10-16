import type { RawApp } from '@gkd-kit/api';
import fs from 'node:fs/promises';
import url from 'node:url';

const allowedSuffix = ['.ts', '.js', '.mjs', '.mts'];

// sort apps by name
const collator = /* #__PURE__ */ (() => {
  return new Intl.Collator('zh-Hans-CN', { sensitivity: 'accent' });
})();
// eslint-disable-next-line no-control-regex
const asciiRegex = /^[\x00-\x7F]*$/;
const getSortName = (name: string) => {
  return !asciiRegex.test(name) ? '\uFFFF' + name : name;
};
export const batchImportApps = async (appDir: string): Promise<RawApp[]> => {
  const files = await fs.readdir(appDir);
  const apps = await Promise.all(
    files.map(async (file) => {
      const suffix = allowedSuffix.find((s) => file.endsWith(s));
      if (!suffix) {
        throw new Error(`Invalid app file: ${file}`);
      }
      const app = await import(
        url.pathToFileURL(`${appDir}/${file}`).href
      ).then((app) => app.default as RawApp);
      if (app.id != file.substring(0, file.length - suffix.length)) {
        throw new Error(`Invalid app id: ${app.id} in file ${file}`);
      }
      return app;
    }),
  );

  apps.sort((a, b) => {
    return collator.compare(
      getSortName(a.name || a.id),
      getSortName(b.name || b.id),
    );
  });
  return apps;
};
