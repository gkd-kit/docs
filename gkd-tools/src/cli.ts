#!/usr/bin/env node
import type { RawSubscription } from '@gkd-kit/api';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

const help = `Usage: gkd-tools <command> [file] [options]

Commands:
  check [file]           Validate a subscription (default: src/subscription.ts)
  build [file]           Validate and generate subscription artifacts
  version [file]         Print the subscription version only
  update-version [file]  Copy the subscription version into package.json
  check-api             Check the installed API version against the registry
  sync                  Request an npmmirror sync for the current package

Options:
  --out-dir <directory>  Override the build output directory
  --check-api            Also check the remote API version for check/build
  -h, --help             Show this help

Subscription files can be .ts/.mts/.js/.mjs modules with a default export,
or .json/.json5 files. Version commands use package.json.gkd by default.
`;

const loadSubscription = async (file: string): Promise<RawSubscription> => {
  const absolutePath = path.resolve(file);
  let value: unknown;
  if (/\.json5?$/.test(file)) {
    const { default: JSON5 } = await import('json5');
    value = JSON5.parse(await readFile(absolutePath, 'utf8'));
  } else {
    value = (await import(pathToFileURL(absolutePath).href)).default;
  }
  if (
    typeof value !== 'object' ||
    value === null ||
    !('id' in value) ||
    !Number.isSafeInteger(value.id) ||
    !('name' in value) ||
    typeof value.name !== 'string' ||
    !('version' in value) ||
    !Number.isSafeInteger(value.version)
  ) {
    throw new Error(
      `Invalid subscription in ${file}: expected id, name and version`,
    );
  }
  return value as RawSubscription;
};

const main = async () => {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      'out-dir': { type: 'string' },
      'check-api': { type: 'boolean' },
    },
  });
  if (values.help || positionals.length === 0) {
    process.stdout.write(help);
    return;
  }
  const [command, file] = positionals;
  if (
    ![
      'check',
      'build',
      'version',
      'update-version',
      'check-api',
      'sync',
    ].includes(command)
  ) {
    throw new Error(`Unknown command: ${command}. Run gkd-tools --help.`);
  }
  if (
    positionals.length > 2 ||
    (file && ['check-api', 'sync'].includes(command))
  ) {
    throw new Error(`Unexpected argument for ${command}`);
  }
  if (values['out-dir'] !== undefined && command !== 'build') {
    throw new Error('--out-dir is only supported by build');
  }
  if (values['check-api'] && !['check', 'build'].includes(command)) {
    throw new Error('--check-api is only supported by check/build');
  }

  switch (command) {
    case 'check':
    case 'build': {
      const subscription = await loadSubscription(
        file ?? 'src/subscription.ts',
      );
      const { checkSubscription } = await import('./check.ts');
      checkSubscription(subscription);
      if (values['check-api']) {
        const { checkApiVersion } = await import('./api.ts');
        await checkApiVersion();
      }
      if (command === 'build') {
        const { updateDist } = await import('./build.ts');
        const { lazyPkg } = await import('./config.ts');
        await updateDist(
          subscription,
          values['out-dir'] === undefined
            ? undefined
            : {
                ...(await lazyPkg()).gkd,
                outDir: values['out-dir'],
              },
        );
      }
      break;
    }
    case 'version': {
      const { stdoutGkdVersion } = await import('./script.ts');
      await stdoutGkdVersion(file);
      break;
    }
    case 'update-version': {
      const { updatePkgVersion } = await import('./script.ts');
      await updatePkgVersion(file);
      break;
    }
    case 'check-api': {
      const { checkApiVersion } = await import('./api.ts');
      await checkApiVersion();
      break;
    }
    case 'sync': {
      const { syncNpmmirror } = await import('./script.ts');
      await syncNpmmirror();
      break;
    }
  }
};

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
