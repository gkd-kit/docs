import JSON5 from 'json5';
import fs from 'node:fs/promises';
import process from 'node:process';
import { lazyConfig, lazyPkg } from './config.ts';

export const syncNpmmirror = async () => {
  const pkg = await lazyPkg();
  const response = await fetch(
    `https://registry-direct.npmmirror.com/${pkg.name}/sync`,
    {
      method: 'PUT',
    },
  );
  if (!response.ok)
    throw new Error(`npmmirror sync failed: HTTP ${response.status}`);
};

export const getGkdVersion = async (versionFile?: string): Promise<number> => {
  versionFile ??= (await lazyConfig()).versionFile;
  const data: unknown = JSON5.parse(await fs.readFile(versionFile, 'utf-8'));
  if (
    typeof data !== 'object' ||
    data === null ||
    !('version' in data) ||
    typeof data.version !== 'number' ||
    !Number.isSafeInteger(data.version) ||
    data.version < 0
  ) {
    throw new Error(`Invalid subscription version in ${versionFile}`);
  }
  return data.version;
};

export const stdoutGkdVersion = async (versionFile?: string) => {
  process.stdout.write(String(await getGkdVersion(versionFile)));
};

export const updatePkgVersion = async (versionFile?: string) => {
  const pkg = await lazyPkg();
  const version = await getGkdVersion(versionFile);
  const pkgFp = process.cwd() + '/package.json';
  pkg.version = [...pkg.version.split('.').splice(0, 2), version].join('.');
  await fs.writeFile(pkgFp, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
};
