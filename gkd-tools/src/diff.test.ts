import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import type { RawSubscription } from '@gkd-kit/api';
import { getChangelog, getReadme } from './diff.ts';

const fixture = (): RawSubscription => ({
  id: 1,
  name: 'Test',
  version: 1,
  categories: [
    { key: 1, name: 'A' },
    { key: 2, name: 'B' },
  ],
  apps: [
    { id: 'app', name: 'App', groups: [{ key: 1, name: 'A-rule', rules: [] }] },
  ],
});
const table = (text: string, heading?: string) => {
  const section = heading
    ? text.split(`## ${heading}\n`)[1]?.split('\n## ')[0]
    : text;
  assert.ok(section, `Missing section: ${heading}`);
  return new JSDOM(section).window.document.querySelector('table')!;
};
const cells = (element: Element, selector = 'tbody tr') =>
  [...element.querySelectorAll(selector)].map((row) =>
    [...row.children].map((cell) => cell.textContent),
  );

test('category names come first and each category has its own change cell', () => {
  const log = getChangelog(null, fixture())!;
  const category = table(log, '规则类别');
  assert.deepEqual(cells(category), [
    ['A', '+1', '0 → 1'],
    ['B', '', '0'],
  ]);
  assert.equal(category.querySelectorAll('[rowspan]').length, 0);
  assert.deepEqual(cells(category, 'thead tr'), [['类别', '变更', '总数']]);
  assert.ok(!log.includes('规则组归属变化：'));
});

test('category migration and deletion preserve per-category counts', () => {
  const before = fixture();
  const after = structuredClone(before);
  after.apps![0].groups[0].name = 'B-rule';
  assert.deepEqual(cells(table(getChangelog(before, after)!, '规则类别')), [
    ['A', '-1', '1 → 0'],
    ['B', '+1', '0 → 1'],
  ]);
  after.categories = [];
  assert.deepEqual(cells(table(getChangelog(before, after)!, '规则类别')), [
    ['A', '-1', '1 → 0'],
    ['B', '', '0'],
    ['未分类', '+1', '0 → 1'],
  ]);
});

test('category rename keeps identities for identical keys in different apps', () => {
  const before = fixture();
  before.apps!.push({
    id: 'other',
    groups: [{ key: 1, name: 'A-other', rules: [] }],
  });
  const after = structuredClone(before);
  after.categories![0].name = 'C';
  after.apps![0].groups[0].name = 'C-rule';
  after.apps![1].groups[0].name = 'C-other';
  assert.deepEqual(cells(table(getChangelog(before, after)!, '规则类别')), [
    ['A → C', '~2', '2'],
  ]);
});

test('application rule changes exclude empty added and removed apps', () => {
  const before = fixture();
  before.apps!.push({ id: 'removed', name: 'Old', groups: [] });
  const after = structuredClone(before);
  after.apps!.pop();
  after.apps![0].groups[0].name = 'A-renamed';
  after.apps!.push({ id: 'new', name: 'New', groups: [] });
  const log = getChangelog(before, after)!;
  assert.deepEqual(cells(table(log, '应用')), [
    ['App', '~1', 'A-rule → A-renamed'],
  ]);
  assert.deepEqual(cells(table(log, '应用信息')), [
    ['New', '新增应用'],
    ['Old', '移除应用'],
  ]);
});

test('HTML cells escape user content without Markdown backslashes', () => {
  const before = fixture();
  const after = structuredClone(before);
  after.name = 'New';
  after.apps![0].name = '<script>|*name*';
  after.apps![0].groups[0].name = 'A_<img src=x onerror=alert(1)>';
  const log = getChangelog(before, after)!;
  const apps = table(log, '应用');
  assert.deepEqual(cells(apps, 'thead tr'), [['应用', '变更', '规则组']]);
  assert.equal(apps.querySelectorAll('script,img').length, 0);
  assert.equal(cells(apps)[0][0], '<script>|*name*');
  assert.ok(
    table(log, '应用信息').textContent!.includes(
      '应用名称：App → <script>|*name*',
    ),
  );
  assert.ok(log.includes('- 更新名称'));
  assert.ok(!log.includes('\\*'));
});

test('zero columns are hidden independently for each table', () => {
  const before = fixture();
  const after = structuredClone(before);
  after.apps![0].groups[0].name = 'B-rule';
  const log = getChangelog(before, after)!;
  assert.deepEqual(cells(table(log), 'thead tr'), [['类型', '变更', '总数']]);
  assert.deepEqual(cells(table(log, '规则类别'), 'thead tr'), [
    ['类别', '变更', '总数'],
  ]);
});

test('first generation, unchanged, version-only and ordering changes', () => {
  const before = fixture();
  assert.ok(getChangelog(null, before)!.includes('首次生成'));
  assert.equal(getChangelog(before, structuredClone(before)), undefined);
  const after = structuredClone(before);
  after.version++;
  assert.ok(getChangelog(before, after)!.includes('仅版本号变化'));
  after.categories!.reverse();
  assert.ok(getChangelog(before, after)!.includes('调整规则类别列表'));
});

test('global changes and sections keep the requested order', () => {
  const sub = fixture();
  sub.globalGroups = [
    { key: 1, name: 'Global', rules: [] },
    { key: 2, name: 'Other', rules: [] },
  ];
  const log = getChangelog(null, sub)!;
  assert.deepEqual(cells(table(log, '全局规则组')), [
    ['+2', 'Global'],
    ['Other'],
  ]);
  assert.equal(
    table(log, '全局规则组').querySelector('td')!.getAttribute('rowspan'),
    '2',
  );
  for (const text of [log, getReadme(sub)]) {
    assert.ok(text.indexOf('## 全局规则组') < text.indexOf('## 规则类别'));
    assert.ok(text.indexOf('## 规则类别') < text.indexOf('## 应用'));
  }
});

test('README shows all counts, uncategorized and duplicate or missing names', () => {
  const sub = fixture();
  sub.apps!.push(
    {
      id: 'other',
      name: 'App',
      groups: [{ key: 1, name: 'Unknown|*rule*', rules: [] }],
    },
    { id: 'unnamed', groups: [] },
  );
  const text = getReadme(sub);
  assert.deepEqual(cells(table(text, '应用规则组')), [
    ['App · app', 'A-rule'],
    ['App · other', 'Unknown|*rule*'],
    ['unnamed', '暂无规则组'],
  ]);
  assert.deepEqual(cells(table(text, '规则类别')).at(-1), ['未分类', '1']);
  assert.deepEqual(cells(table(text)).at(-1), ['应用规则组', '2']);
  assert.ok(!getReadme({ id: 1, name: 'Empty', version: 0 }).includes('## '));
});

test('metadata-only app changes and all rule operations stay visible', () => {
  const before = fixture();
  before.apps![0].groups.push({ key: 2, name: 'Old', rules: [] });
  const after = structuredClone(before);
  after.apps![0].groups = [
    { key: 1, name: 'Renamed', rules: [] },
    { key: 3, name: 'New', rules: [] },
  ];
  const changed = table(getChangelog(before, after)!, '应用');
  assert.deepEqual(cells(changed), [
    ['App', '+1', 'New'],
    ['~1', 'A-rule → Renamed'],
    ['-1', 'Old'],
  ]);
  assert.equal(changed.querySelector('td')!.getAttribute('rowspan'), '3');
  const metadata = structuredClone(before);
  metadata.apps![0].name = 'Renamed App';
  assert.ok(
    cells(table(getChangelog(before, metadata)!, '应用信息'))[0][1]!.includes(
      '应用名称：App → Renamed App',
    ),
  );
});

test('application names span independent rule rows in both documents', () => {
  const sub = fixture();
  sub.apps![0].groups.push({ key: 2, name: 'Second', rules: [] });
  sub.apps!.push({
    id: 'other',
    name: 'Other',
    groups: [{ key: 1, name: 'Third', rules: [] }],
  });
  const apps = table(getChangelog(null, sub)!, '应用');
  assert.deepEqual(cells(apps), [
    ['App', '+2', 'A-rule'],
    ['Second'],
    ['Other', '+1', 'Third'],
  ]);
  const firstCells = apps.querySelectorAll('tbody tr:first-child td');
  assert.equal(firstCells[0].getAttribute('rowspan'), '2');
  assert.equal(firstCells[1].getAttribute('rowspan'), '2');
  const readme = table(getReadme(sub), '应用规则组');
  assert.deepEqual(cells(readme), [
    ['App', 'A-rule'],
    ['Second'],
    ['Other', 'Third'],
  ]);
  assert.equal(readme.querySelector('td')!.getAttribute('rowspan'), '2');
  const after = structuredClone(sub);
  after.apps![0].groups[0].name = 'Updated';
  after.apps![0].groups[1].name = 'Updated Second';
  const changed = table(getChangelog(sub, after)!, '应用');
  assert.equal(changed.querySelectorAll('tbody tr').length, 2);
  assert.equal(
    changed
      .querySelectorAll('tbody tr:first-child td')[1]
      .getAttribute('rowspan'),
    '2',
  );
});

test('added and removed apps report every rule group as added or deleted', () => {
  const sub = fixture();
  sub.apps![0].groups.push({ key: 2, name: 'Second', rules: [] });
  const empty: RawSubscription = { id: 1, name: 'Test', version: 0, apps: [] };
  for (const [before, after, status] of [
    [empty, sub, '+2'],
    [sub, empty, '-2'],
  ] as const) {
    const apps = table(getChangelog(before, after)!, '应用');
    assert.deepEqual(cells(apps), [['App', status, 'A-rule'], ['Second']]);
    assert.equal(
      apps
        .querySelectorAll('tbody tr:first-child td')[1]
        .getAttribute('rowspan'),
      '2',
    );
  }
});

test('summary combines nonzero changes in one cell', () => {
  const before = fixture();
  before.apps![0].groups.push({ key: 2, name: 'A-old', rules: [] });
  const after = structuredClone(before);
  after.apps![0].groups = [
    { key: 1, name: 'A-renamed', rules: [] },
    { key: 3, name: 'A-new', rules: [] },
  ];
  const log = getChangelog(before, after)!;
  assert.deepEqual(cells(table(log)).at(-1), [
    '应用规则组',
    '+1 / ~1 / -1',
    '2',
  ]);
  assert.deepEqual(cells(table(log, '规则类别')), [['A', '+1 / ~1 / -1', '2']]);
});
