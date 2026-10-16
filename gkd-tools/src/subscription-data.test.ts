import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { RawSubscription } from '@gkd-kit/api';
import {
  getSubscriptionDiff,
  getSubscriptionSummary,
  renderReadme,
  renderChangelog,
  getReadme,
  getChangelog,
} from './diff.ts';
import { updateDist } from './build.ts';

const fixture = (): RawSubscription => ({
  id: 1,
  name: '<Raw>',
  version: 0,
  categories: [
    { key: 1, name: 'A' },
    { key: 2, name: 'B' },
  ],
  apps: [
    { id: 'app', name: 'App', groups: [{ key: 1, name: 'A-rule', rules: [] }] },
  ],
});

test('structured data preserves raw values and explicit lifecycle states', () => {
  const sub = fixture();
  const saved = structuredClone(sub);
  const summary = getSubscriptionSummary(sub);
  assert.equal(summary.subscription.name, '<Raw>');
  assert.deepEqual(summary.totals, {
    categories: 2,
    globalGroups: 0,
    apps: 1,
    appGroups: 1,
  });
  assert.equal(summary.categories[0].groups[0].appId, 'app');
  assert.equal(summary.categories[1].total, 0);
  assert.equal(getSubscriptionDiff(null, sub).kind, 'initial');
  assert.equal(
    getSubscriptionDiff(sub, structuredClone(sub)).kind,
    'unchanged',
  );
  assert.equal(
    getSubscriptionDiff(sub, { ...sub, version: 1 }).kind,
    'version-only',
  );
  const after = { ...sub, name: 'New', updateUrl: 'https://example.com' };
  const diff = getSubscriptionDiff(sub, after);
  assert.deepEqual(diff.metadata, [
    { field: 'name', before: '<Raw>', after: 'New' },
    { field: 'updateUrl', before: undefined, after: 'https://example.com' },
  ]);
  assert.equal(renderReadme(summary), getReadme(sub));
  assert.equal(renderChangelog(diff), getChangelog(sub, after));
  assert.deepEqual(sub, saved);
});

test('category membership distinguishes app IDs and both ends of migration', () => {
  const before = fixture();
  before.apps!.push({
    id: 'other',
    groups: [{ key: 1, name: 'A-other', rules: [] }],
  });
  const after = structuredClone(before);
  after.apps![0].groups[0].name = 'B-rule';
  const diff = getSubscriptionDiff(before, after);
  assert.deepEqual(
    diff.categories.map((category) => [category.key, category.stats]),
    [
      [1, { added: 0, changed: 0, removed: 1, before: 2, after: 1 }],
      [2, { added: 1, changed: 0, removed: 0, before: 0, after: 1 }],
    ],
  );
  assert.equal(diff.categories[0].groups.removed[0].appId, 'app');
  assert.equal(diff.apps[0].groups.changed[0].oldItem.name, 'A-rule');
  after.categories = [];
  const deleted = getSubscriptionDiff(before, after);
  assert.equal(
    deleted.categories.find((category) => category.key === 1)!.kind,
    'removed',
  );
  assert.equal(
    deleted.categories.find((category) => category.key === null)!.stats.after,
    2,
  );
});

test('app lifecycle, metadata and reorder changes are structured', () => {
  const before = fixture();
  const initial = getSubscriptionDiff(null, before);
  assert.equal(initial.apps[0].kind, 'added');
  assert.equal(initial.apps[0].groups.added.length, 1);
  assert.equal(initial.apps[0].groupsReordered, false);
  const removed = getSubscriptionDiff(before, { ...before, apps: [] });
  assert.equal(removed.apps[0].groups.removed.length, 1);
  before.apps![0].groups.push({ key: 2, name: 'A-second', rules: [] });
  const after = structuredClone(before);
  after.apps![0].name = 'Renamed';
  after.apps![0].groups.reverse();
  after.categories!.reverse();
  const diff = getSubscriptionDiff(before, after);
  assert.equal(diff.apps[0].groupsReordered, true);
  assert.deepEqual(diff.apps[0].metadata, [
    { field: 'name', before: 'App', after: 'Renamed' },
  ]);
  assert.deepEqual(diff.collectionChanges, ['categories']);
});

test('build supports asynchronous custom templates and protects files from renderer failures', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'gkd-render-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const outDir = path.relative(process.cwd(), dir);
  const sub = fixture();
  assert.equal(
    await updateDist(sub, {
      outDir,
      renderReadme: async (summary) => `custom ${summary.subscription.name}`,
      renderChangelog: (diff) =>
        `custom ${diff.kind} ${diff.summary.apps.added}`,
    }),
    true,
  );
  assert.equal(
    await readFile(path.join(dir, 'README.md'), 'utf8'),
    'custom <Raw>',
  );
  assert.equal(
    await readFile(path.join(dir, 'CHANGELOG.md'), 'utf8'),
    'custom initial 1',
  );
  const before = await readFile(path.join(dir, 'gkd.json5'), 'utf8');
  const changed = { ...sub, name: 'Changed' };
  await assert.rejects(
    updateDist(changed, {
      outDir,
      renderReadme: async () => {
        throw new Error('template failed');
      },
    }),
    /template failed/,
  );
  assert.equal(await readFile(path.join(dir, 'gkd.json5'), 'utf8'), before);
  assert.equal(
    await readFile(path.join(dir, 'CHANGELOG.md'), 'utf8'),
    'custom initial 1',
  );
  await updateDist(changed, {
    outDir,
    renderChangelog: (diff) => {
      assert.deepEqual(diff.versions, { before: 0, after: 1 });
      return '';
    },
    renderReadme: () => '',
  });
  assert.equal(changed.version, 0);
  assert.equal(await readFile(path.join(dir, 'README.md'), 'utf8'), '');
  assert.equal(
    await updateDist(changed, {
      outDir,
      renderReadme: () => {
        throw new Error('should not render unchanged content');
      },
    }),
    false,
  );
});
