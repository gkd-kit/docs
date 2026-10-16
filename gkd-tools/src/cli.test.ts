import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test, type TestContext } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const cli =
  process.env.GKD_TOOLS_TEST_CLI ??
  fileURLToPath(new URL('./cli.ts', import.meta.url));

const fixture = async (t: TestContext) => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'gkd tools cli '));
  t.after(() => rm(cwd, { recursive: true, force: true }));
  await writeFile(
    path.join(cwd, 'package.json'),
    JSON.stringify({
      name: '@test/subscription',
      version: '1.2.3',
      type: 'module',
    }),
  );
  return cwd;
};

const run = (cwd: string, ...args: string[]) =>
  spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: 30_000,
  });

test('help and invalid arguments work without a subscription', async (t) => {
  const cwd = await fixture(t);
  assert.equal(run(cwd, '--help').status, 0);
  for (const args of [
    ['unknown'],
    ['version', '--out-dir', 'dist'],
    ['check', '--unknown'],
    ['sync', 'extra'],
  ]) {
    const result = run(cwd, ...args);
    assert.equal(result.status, 1, result.stderr);
  }
});

test('build loads native TS, honors output config and avoids unnecessary version bumps', async (t) => {
  const cwd = await fixture(t);
  await writeFile(
    path.join(cwd, 'package.json'),
    JSON.stringify({
      name: '@test/subscription',
      version: '1.2.3',
      type: 'module',
      gkd: { outDir: 'generated', versionFile: 'version.json5' },
    }),
  );
  await writeFile(
    path.join(cwd, 'subscription.ts'),
    `export default { id: 1, name: 'Test', version: 0, apps: [] };`,
  );
  const built = run(cwd, 'build', 'subscription.ts');
  assert.equal(built.status, 0, built.stderr);
  assert.equal(run(cwd, 'version').stdout, '0');
  assert.match(run(cwd, 'build', 'subscription.ts').stdout, /No changes/);
  const generated = await readFile(
    path.join(cwd, 'generated/gkd.json5'),
    'utf8',
  );
  assert.ok(generated.includes('Test'));
  const override = run(
    cwd,
    'build',
    'subscription.ts',
    '--out-dir',
    'nested/output',
  );
  assert.equal(override.status, 0, override.stderr);
  assert.equal(run(cwd, 'version', 'nested/output/version.json5').stdout, '0');
});

test('invalid selector fails check and build without writing output', async (t) => {
  const cwd = await fixture(t);
  const subscription = {
    id: 1,
    name: 'Test',
    version: 0,
    apps: [
      {
        id: 'app',
        groups: [
          { key: 1, name: 'Test', rules: [{ matches: '[unknownProperty=1]' }] },
        ],
      },
    ],
  };
  await writeFile(path.join(cwd, 'bad.json5'), JSON.stringify(subscription));
  for (const command of ['check', 'build']) {
    const result = run(cwd, command, 'bad.json5');
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /Invalid matches selector/);
    assert.match(result.stderr, /unknownProperty/);
  }
  await assert.rejects(readFile(path.join(cwd, 'dist/gkd.json5')), {
    code: 'ENOENT',
  });
});

test('build preserves a corrupt previous subscription and changelog', async (t) => {
  const cwd = await fixture(t);
  await writeFile(
    path.join(cwd, 'subscription.ts'),
    `export default { id: 1, name: 'Test', version: 0, apps: [] };`,
  );
  assert.equal(run(cwd, 'build', 'subscription.ts').status, 0);
  const logFile = path.join(cwd, 'dist/CHANGELOG.md');
  const previousLog = await readFile(logFile, 'utf8');
  const subscriptionFile = path.join(cwd, 'dist/gkd.json5');
  await writeFile(subscriptionFile, '{broken');
  assert.equal(run(cwd, 'build', 'subscription.ts').status, 1);
  assert.equal(await readFile(subscriptionFile, 'utf8'), '{broken');
  assert.equal(await readFile(logFile, 'utf8'), previousLog);
});

test('version is machine-readable and update-version validates before writing', async (t) => {
  const cwd = await fixture(t);
  const file = path.join(cwd, 'version.json5');
  await writeFile(file, '{version: 42}');
  const version = run(cwd, 'version', file);
  assert.equal(version.status, 0, version.stderr);
  assert.equal(version.stdout, '42');
  assert.equal(version.stderr, '');
  assert.equal(run(cwd, 'update-version', file).status, 0);
  assert.equal(
    JSON.parse(await readFile(path.join(cwd, 'package.json'), 'utf8')).version,
    '1.2.42',
  );
  await writeFile(file, '{version: -1}');
  assert.equal(run(cwd, 'update-version', file).status, 1);
  assert.equal(
    JSON.parse(await readFile(path.join(cwd, 'package.json'), 'utf8')).version,
    '1.2.42',
  );
});

test('sync reports HTTP failures without contacting a registry', async (t) => {
  const cwd = await fixture(t);
  const mock = path.join(cwd, 'mock-fetch.mjs');
  await writeFile(
    mock,
    `globalThis.fetch = async (url, options) => {
    if (url !== 'https://registry-direct.npmmirror.com/@test/subscription/sync' || options.method !== 'PUT') throw new Error('Unexpected request');
    return new Response('', { status: 503 });
  };`,
  );
  const result = spawnSync(
    process.execPath,
    ['--import', pathToFileURL(mock).href, cli, 'sync'],
    { cwd, encoding: 'utf8', timeout: 30_000 },
  );
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /HTTP 503/);
});

test('version does not initialize selector or WASM', async (t) => {
  const cwd = await fixture(t);
  const hook = path.join(cwd, 'block-selector.mjs');
  await writeFile(path.join(cwd, 'version.json5'), '{version: 7}');
  await writeFile(
    hook,
    `import { registerHooks } from 'node:module';
    registerHooks({ resolve(specifier, context, nextResolve) {
      if (specifier.includes('@gkd-kit/selector') || specifier.includes('regex-wasm')) throw new Error('Unexpected selector initialization');
      return nextResolve(specifier, context);
    }});`,
  );
  const result = spawnSync(
    process.execPath,
    ['--import', pathToFileURL(hook).href, cli, 'version', 'version.json5'],
    { cwd, encoding: 'utf8', timeout: 30_000 },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '7');
});
