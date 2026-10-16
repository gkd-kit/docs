import type { RawSubscription } from '@gkd-kit/api';
import JSON5 from 'json5';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  getSubscriptionDiff,
  getSubscriptionSummary,
  renderChangelog,
  renderReadme,
} from './diff.ts';
import type { SubscriptionDiff, SubscriptionSummary } from './diff.ts';
import { isJsonEqual } from './equal.ts';
import { lazyConfig, resolveConfig } from './config.ts';
import type { GkdConfig } from './config.ts';

export type BuildOptions = GkdConfig & {
  renderReadme?: (summary: SubscriptionSummary) => string | Promise<string>;
  renderChangelog?: (diff: SubscriptionDiff) => string | Promise<string>;
};

/**
 * @param config - default: `'dist'` or `{outDir: 'dist'}`
 */
export async function updateDist(
  subscription: RawSubscription,
  config?: BuildOptions | string,
): Promise<boolean> {
  const defaultConfig =
    config === undefined ? await lazyConfig() : resolveConfig(config);

  if (!(await fs.stat(defaultConfig.outDir).catch(() => null))) {
    await fs.mkdir(defaultConfig.outDir, { recursive: true });
    console.log('Created', path.basename(defaultConfig.outDir));
  }
  const oldSubscription = await fs
    .readFile(defaultConfig.file, 'utf-8')
    .then((text) => JSON5.parse<RawSubscription>(text))
    .catch((error: unknown) => {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT')
        return null;
      throw error;
    });

  let nextSubscription = subscription;
  if (oldSubscription) {
    if (
      isJsonEqual(oldSubscription, {
        ...subscription,
        version: oldSubscription.version,
      })
    ) {
      console.log('No changes');
      return false;
    }
    nextSubscription = {
      ...subscription,
      version: oldSubscription.version + 1,
    };
  }

  const options = typeof config === 'object' ? config : {};
  const diff = getSubscriptionDiff(oldSubscription, nextSubscription);
  const summary = getSubscriptionSummary(nextSubscription);
  // Resolve both templates before writing any generated files.
  const changelog = await (options.renderChangelog ?? renderChangelog)(diff);
  const readme = await (options.renderReadme ?? renderReadme)(summary);
  if (typeof changelog !== 'string' || typeof readme !== 'string')
    throw new TypeError('Document renderers must return strings');
  await fs.writeFile(defaultConfig.changelog, changelog);
  console.log('Updated', path.basename(defaultConfig.changelog));

  await fs.writeFile(defaultConfig.readme, readme);
  console.log('Updated', path.basename(defaultConfig.readme));

  await fs.writeFile(defaultConfig.file, JSON5.stringify(nextSubscription));
  console.log('Updated', path.basename(defaultConfig.file));

  await fs.writeFile(
    defaultConfig.versionFile,
    JSON5.stringify({
      id: nextSubscription.id,
      version: nextSubscription.version,
    }),
  );
  console.log('Updated', path.basename(defaultConfig.versionFile));

  return true;
}
