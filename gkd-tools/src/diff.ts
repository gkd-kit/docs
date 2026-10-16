import type { RawApp, RawSubscription } from '@gkd-kit/api';
import {
  getSubscriptionDiff,
  getSubscriptionSummary,
  isEmptyDiff,
} from './subscription-data.ts';
import type {
  DiffType,
  SubscriptionDiff,
  SubscriptionSummary,
  ChangeStats,
} from './subscription-data.ts';
export {
  getSubscriptionDiff,
  getSubscriptionSummary,
} from './subscription-data.ts';
export type {
  DiffType,
  SubscriptionDiff,
  SubscriptionSummary,
  ChangeStats,
  FieldChange,
  ChangeKind,
  AppDiff,
  CategoryDiff,
  AppGroupRef,
  CategorySummary,
} from './subscription-data.ts';

const escapeText = (value: unknown): string =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r?\n/g, ' ')
    .replace(/([\\`*_[\]{}()#+.!|~-])/g, '\\$1');

const escapeHtml = (value: unknown): string =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\r?\n/g, ' ');

// Cells contain escaped text or markup assembled by this module only.
const htmlTable = (
  headers: string[],
  rows: string[][],
  mergeColumns = 0,
): string => {
  const body = rows.map((row, index) => {
    const cells = row.map((cell, column) => {
      if (column < mergeColumns) {
        const same = (other: string[]) =>
          row.slice(0, column + 1).every((value, i) => other[i] === value);
        if (index > 0 && same(rows[index - 1])) return '';
        let span = 1;
        while (index + span < rows.length && same(rows[index + span])) span++;
        return `<td${span > 1 ? ` rowspan="${span}"` : ''}>${cell}</td>`;
      }
      return `<td>${cell}</td>`;
    });
    return `  <tr>${cells.join('')}</tr>`;
  });
  return [
    '<table>',
    '<thead>',
    `  <tr>${headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join('')}</tr>`,
    '</thead>',
    '<tbody>',
    ...body,
    '</tbody>',
    '</table>',
  ].join('\n');
};

const describeMetadata = (fields: string[], fallback: string): string[] => {
  const labels: Record<string, string> = {
    name: '名称',
    author: '作者',
    updateUrl: '订阅地址',
    checkUpdateUrl: '更新检查地址',
    supportUri: '支持链接',
    enable: '启用状态',
    versionName: '适用版本名称',
    versionCode: '适用版本号',
  };
  return [...new Set(fields.map((key) => labels[key] ?? fallback))].map(
    (label) => `- 更新${label}`,
  );
};

const changeCount = (label: string, count: number): string => {
  const symbols: Record<string, string> = { 新增: '+', 修改: '~', 删除: '-' };
  return symbols[label] ? `${symbols[label]}${count}` : label;
};

const describeDiff = <T extends { name: string }>(
  diff: DiffType<T>,
  column: '规则组' | '类别' = '规则组',
): string[] => {
  const groups: [string, string[]][] = [
    ['新增', diff.added.map((item) => escapeHtml(item.name))],
    [
      '修改',
      diff.changed.map(({ oldItem, newItem }) =>
        oldItem.name === newItem.name
          ? escapeHtml(newItem.name)
          : `${escapeHtml(oldItem.name)} → ${escapeHtml(newItem.name)}`,
      ),
    ],
    ['删除', diff.removed.map((item) => escapeHtml(item.name))],
  ];
  const rows = groups.flatMap(([label, items]) =>
    items.map((item) => [changeCount(label, items.length), item]),
  );
  return rows.length ? [htmlTable(['变更', column], rows, 1)] : [];
};

type StatsRow = [string, number, number, number, string];

const formatTotal = (before: number, after: number): string =>
  before === after ? String(after) : `${before} → ${after}`;

const statsTable = (name: string, rows: StatsRow[]): string =>
  htmlTable(
    [name, '变更', '总数'],
    rows.map(([label, added, changed, removed, total]) => [
      escapeHtml(label),
      [
        added ? `+${added}` : '',
        changed ? `~${changed}` : '',
        removed ? `-${removed}` : '',
      ]
        .filter(Boolean)
        .join(' / '),
      escapeHtml(total),
    ]),
  );

const appNameFormatter = (apps: RawApp[]) => {
  const names = new Map<string, Set<string>>();
  for (const app of apps) {
    if (!app.name) continue;
    const ids = names.get(app.name) ?? new Set<string>();
    ids.add(app.id);
    names.set(app.name, ids);
  }
  return (app: RawApp) =>
    `${escapeHtml(app.name || app.id)}${app.name && names.get(app.name)!.size > 1 ? ` · ${escapeHtml(app.id)}` : ''}`;
};

const appTable = (apps: RawApp[], name: (app: RawApp) => string) =>
  htmlTable(
    ['应用', '规则组'],
    apps.flatMap((app) =>
      (app.groups.length
        ? app.groups.map((group) => escapeHtml(group.name))
        : ['暂无规则组']
      ).map((group) => [name(app), group]),
    ),
    1,
  );

export const getChangelog = (
  before: RawSubscription | null | undefined,
  after: RawSubscription,
): string | undefined => renderChangelog(getSubscriptionDiff(before, after));

export const renderChangelog = (diff: SubscriptionDiff): string | undefined => {
  if (diff.kind === 'unchanged') return;
  const sections = [
    '# 变更记录',
    diff.kind === 'initial'
      ? `版本：v${diff.versions.after}（首次生成）`
      : `版本：v${diff.versions.before} → v${diff.versions.after}`,
  ];
  const row = (name: string, stats: ChangeStats): StatsRow => [
    name,
    stats.added,
    stats.changed,
    stats.removed,
    formatTotal(stats.before, stats.after),
  ];
  const summary = (
    [
      ['全局规则组', diff.summary.globalGroups],
      ['规则类别', diff.summary.categories],
      ['应用', diff.summary.apps],
      ['应用规则组', diff.summary.appGroups],
    ] as const
  )
    .filter(([, stats]) => stats.added || stats.changed || stats.removed)
    .map(([name, stats]) => row(name, stats));
  if (summary.length) sections.push(statsTable('类型', summary));
  if (diff.kind !== 'initial' && diff.metadata.length)
    sections.push(
      '## 订阅信息',
      describeMetadata(
        diff.metadata.map((entry) => entry.field),
        '订阅信息',
      ).join('\n'),
    );
  const globalDetails = describeDiff(diff.globalGroups);
  if (globalDetails.length)
    sections.push('## 全局规则组', globalDetails.join('\n\n'));

  const categoryRows = diff.categories.map((entry) =>
    row(
      entry.key === null
        ? '未分类'
        : entry.before && entry.after && entry.before.name !== entry.after.name
          ? `${entry.before.name} → ${entry.after.name}`
          : (entry.after ?? entry.before)!.name,
      entry.stats,
    ),
  );
  if (categoryRows.length)
    sections.push('## 规则类别', statsTable('类别', categoryRows));
  const appName = appNameFormatter([
    ...(diff.before?.apps ?? []),
    ...(diff.after.apps ?? []),
  ]);
  const appRows: string[][] = [];
  const appInfoRows: string[][] = [];
  for (const entry of diff.apps.filter((entry) => entry.kind === 'added')) {
    const app = entry.after!;
    const groups = app.groups.length
      ? app.groups.map((group) => escapeHtml(group.name))
      : [];
    for (const group of groups)
      appRows.push([appName(app), changeCount('新增', groups.length), group]);
    if (!groups.length) appInfoRows.push([appName(app), '新增应用']);
  }
  for (const entry of diff.apps.filter((entry) => entry.kind === 'changed')) {
    const app = entry.after!;
    const oldItem = entry.before!;
    const groupDiff = entry.groups;
    const details: string[] = [];
    const addDetail = (label: string, values: string[]) => {
      appRows.push(
        ...values.map((value) => [
          appName(app),
          changeCount(label, values.length),
          value,
        ]),
      );
    };
    addDetail(
      '新增',
      groupDiff.added.map((group) => escapeHtml(group.name)),
    );
    addDetail(
      '修改',
      groupDiff.changed.map(({ oldItem, newItem }) =>
        oldItem.name === newItem.name
          ? escapeHtml(newItem.name)
          : `${escapeHtml(oldItem.name)} → ${escapeHtml(newItem.name)}`,
      ),
    );
    addDetail(
      '删除',
      groupDiff.removed.map((group) => escapeHtml(group.name)),
    );
    const fields = entry.metadata.map((change) => change.field);
    if (fields.includes('name'))
      details.push(
        `应用名称：${escapeHtml(oldItem.name ?? oldItem.id)} → ${escapeHtml(app.name ?? app.id)}`,
      );
    details.push(
      ...describeMetadata(
        fields.filter((key) => key !== 'name'),
        '应用信息',
      ).map((line) => escapeHtml(line.slice(2))),
    );
    if (isEmptyDiff(groupDiff) && entry.groupsReordered)
      details.push('调整规则组顺序');
    for (const detail of details) appInfoRows.push([appName(app), detail]);
  }
  for (const entry of diff.apps.filter((entry) => entry.kind === 'removed')) {
    const app = entry.before!;
    for (const group of app.groups)
      appRows.push([
        appName(app),
        changeCount('删除', app.groups.length),
        escapeHtml(group.name),
      ]);
    if (!app.groups.length) appInfoRows.push([appName(app), '移除应用']);
  }
  if (appRows.length)
    sections.push('## 应用', htmlTable(['应用', '变更', '规则组'], appRows, 2));
  if (appInfoRows.length)
    sections.push('## 应用信息', htmlTable(['应用', '变更'], appInfoRows, 1));
  for (const key of diff.collectionChanges) {
    const labels = {
      apps: '应用列表',
      categories: '规则类别列表',
      globalGroups: '全局规则组列表',
    };
    sections.push(`- 调整${labels[key]}`);
  }
  if (diff.kind === 'version-only') sections.push('仅版本号变化，无内容变更。');
  return sections.join('\n\n') + '\n';
};

export const getReadme = (subscription: RawSubscription): string =>
  renderReadme(getSubscriptionSummary(subscription));

export const renderReadme = (summary: SubscriptionSummary): string => {
  const { subscription, apps, globalGroups, categories, totals } = summary;
  const sections = [
    `# ${escapeText(subscription.name)}`,
    `版本：v${subscription.version}`,
    htmlTable(
      ['类型', '总数'],
      [
        ['全局规则组', String(globalGroups.length)],
        ['规则类别', String(totals.categories)],
        ['应用', String(apps.length)],
        ['应用规则组', String(totals.appGroups)],
      ],
    ),
  ];
  if (globalGroups.length)
    sections.push(
      '## 全局规则组',
      htmlTable(
        ['规则组'],
        globalGroups.map((group) => [escapeHtml(group.name)]),
      ),
    );
  if (categories.length)
    sections.push(
      '## 规则类别',
      htmlTable(
        ['类别', '总数'],
        categories.map((entry) => [
          escapeHtml(entry.category?.name ?? '未分类'),
          String(entry.total),
        ]),
      ),
    );
  if (apps.length)
    sections.push('## 应用规则组', appTable(apps, appNameFormatter(apps)));
  return sections.join('\n\n') + '\n';
};
