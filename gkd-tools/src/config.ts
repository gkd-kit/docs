import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

/**
 * @default package.json.gkd
 */
export type GkdConfig = {
  /**
   * @default 'dist'
   */
  outDir?: string;

  /**
   * @default 'gkd.json5'
   */
  file?: string;

  /**
   * @default 'gkd.version.json5'
   */
  versionFile?: string;

  /**
   * @default 'CHANGELOG.md'
   */
  changelog?: string;

  /**
   * @default 'README.md'
   */
  readme?: string;
};

const lazyLoad = <T>(fn: () => Promise<T>) => {
  let temp: T | undefined = undefined;
  let inited = false;
  return async () => {
    if (inited) return temp as T;
    temp = await fn();
    inited = true;
    return temp as T;
  };
};
export const lazyPkg = /* #__PURE__ */ lazyLoad<{
  name: string;
  version: string;
  gkd?: GkdConfig;
}>(async () => {
  return JSON.parse(
    await fs.readFile(process.cwd() + '/package.json', 'utf-8'),
  );
});

export const lazyConfig = /* #__PURE__ */ lazyLoad<Required<GkdConfig>>(
  async () => {
    return resolveConfig((await lazyPkg()).gkd);
  },
);

export const resolveConfig = (
  config: GkdConfig | string = {},
): Required<GkdConfig> => {
  if (typeof config === 'string') {
    config = { outDir: config };
  }
  const outDir = path.join(process.cwd(), config.outDir ?? 'dist');
  return {
    outDir,
    file: path.join(outDir, config.file ?? 'gkd.json5'),
    versionFile: path.join(outDir, config.versionFile ?? 'gkd.version.json5'),
    changelog: path.join(outDir, config.changelog ?? 'CHANGELOG.md'),
    readme: path.join(outDir, config.readme ?? 'README.md'),
  };
};
