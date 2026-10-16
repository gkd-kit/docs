import type {
  RawApp,
  RawAppGroup,
  RawCategory,
  RawGlobalGroup,
  RawSubscription,
} from '@gkd-kit/api';
import { isJsonEqual } from './equal.ts';

export type DiffType<T> = {
  changed: {
    newItem: T;
    oldItem: T;
  }[];
  added: T[];
  removed: T[];
};

export const isEmptyDiff = (diff: DiffType<unknown>): boolean => {
  return (
    diff.added.length === 0 &&
    diff.changed.length === 0 &&
    diff.removed.length === 0
  );
};

const buildEmptyDiff = <T>(): DiffType<T> => {
  return {
    added: [],
    changed: [],
    removed: [],
  };
};

const getListDiff = <T>(
  oldList: T[] = [],
  newList: T[] = [],
  getKey: (t: T) => unknown,
): DiffType<T> => {
  const diff = buildEmptyDiff<T>();
  for (const newItem of newList) {
    const key = getKey(newItem);
    const oldItem = oldList.find((v) => getKey(v) === key);
    if (!oldItem) {
      diff.added.push(newItem);
    } else if (!isJsonEqual(newItem, oldItem)) {
      diff.changed.push({
        newItem,
        oldItem,
      });
    }
  }
  for (const oldItem of oldList) {
    const key = getKey(oldItem);
    if (newList.every((v) => getKey(v) !== key)) {
      diff.removed.push(oldItem);
    }
  }
  return diff;
};

export type FieldChange = { field: string; before: unknown; after: unknown };
export type ChangeStats = {
  added: number;
  changed: number;
  removed: number;
  before: number;
  after: number;
};
export type ChangeKind = 'added' | 'changed' | 'removed' | 'unchanged';
export type AppGroupRef = { appId: string; group: RawAppGroup };
export type CategorySummary = {
  category: RawCategory | null;
  groups: AppGroupRef[];
  total: number;
};
export type SubscriptionSummary = {
  subscription: RawSubscription;
  totals: {
    categories: number;
    globalGroups: number;
    apps: number;
    appGroups: number;
  };
  categories: CategorySummary[];
  globalGroups: RawGlobalGroup[];
  apps: RawApp[];
};
export type CategoryDiff = {
  key: number | null;
  kind: ChangeKind;
  before: RawCategory | null;
  after: RawCategory | null;
  metadata: FieldChange[];
  groups: DiffType<AppGroupRef>;
  stats: ChangeStats;
};
export type AppDiff = {
  id: string;
  kind: Exclude<ChangeKind, 'unchanged'>;
  before: RawApp | null;
  after: RawApp | null;
  metadata: FieldChange[];
  groups: DiffType<RawAppGroup>;
  stats: ChangeStats;
  groupsReordered: boolean;
};
export type SubscriptionDiff = {
  kind: 'initial' | 'unchanged' | 'version-only' | 'changed';
  before: RawSubscription | null;
  after: RawSubscription;
  versions: { before: number | null; after: number };
  summary: {
    categories: ChangeStats;
    globalGroups: ChangeStats;
    apps: ChangeStats;
    appGroups: ChangeStats;
  };
  metadata: FieldChange[];
  categories: CategoryDiff[];
  globalGroups: DiffType<RawGlobalGroup>;
  apps: AppDiff[];
  collectionChanges: ('apps' | 'categories' | 'globalGroups')[];
};
const fields = (
  before: object,
  after: object,
  exclude: string[] = [],
): FieldChange[] => {
  const a = before as Record<string, unknown>;
  const b = after as Record<string, unknown>;
  return [...new Set([...Object.keys(a), ...Object.keys(b)])]
    .filter((key) => !exclude.includes(key) && !isJsonEqual(a[key], b[key]))
    .map((field) => ({ field, before: a[field], after: b[field] }));
};
const stats = (
  diff: DiffType<unknown>,
  before: number,
  after: number,
): ChangeStats => ({
  added: diff.added.length,
  changed: diff.changed.length,
  removed: diff.removed.length,
  before,
  after,
});
const kindOf = (before: object | null, after: object | null): ChangeKind =>
  !before
    ? 'added'
    : !after
      ? 'removed'
      : isJsonEqual(before, after)
        ? 'unchanged'
        : 'changed';

/** Returns unescaped source data and category membership, including uncategorized groups. */
export const getSubscriptionSummary = (
  subscription: RawSubscription,
): SubscriptionSummary => {
  const apps = subscription.apps ?? [];
  const globalGroups = subscription.globalGroups ?? [];
  const categories: CategorySummary[] = (subscription.categories ?? []).map(
    (category) => ({ category, groups: [], total: 0 }),
  );
  const uncategorized: CategorySummary = {
    category: null,
    groups: [],
    total: 0,
  };
  for (const app of apps)
    for (const group of app.groups) {
      const bucket =
        categories.find((entry) =>
          group.name.startsWith(entry.category!.name),
        ) ?? uncategorized;
      bucket.groups.push({ appId: app.id, group });
      bucket.total++;
    }
  if (uncategorized.total) categories.push(uncategorized);
  return {
    subscription,
    apps,
    globalGroups,
    categories,
    totals: {
      categories: subscription.categories?.length ?? 0,
      globalGroups: globalGroups.length,
      apps: apps.length,
      appGroups: apps.reduce((sum, app) => sum + app.groups.length, 0),
    },
  };
};

/** Always returns a result; kind distinguishes initial, unchanged and version-only inputs. */
export const getSubscriptionDiff = (
  before: RawSubscription | null | undefined,
  after: RawSubscription,
): SubscriptionDiff => {
  before ??= null;
  const oldSummary = before ? getSubscriptionSummary(before) : null;
  const newSummary = getSubscriptionSummary(after);
  const categoryDiff = getListDiff(
    before?.categories,
    after.categories,
    (item) => item.key,
  );
  const globalGroups = getListDiff(
    before?.globalGroups,
    after.globalGroups,
    (item) => item.key,
  );
  const appDiff = getListDiff(before?.apps, after.apps, (item) => item.id);
  const apps: AppDiff[] = [
    ...appDiff.added.map((app) => ({ before: null, after: app })),
    ...appDiff.changed.map(({ oldItem, newItem }) => ({
      before: oldItem,
      after: newItem,
    })),
    ...appDiff.removed.map((app) => ({ before: app, after: null })),
  ].map(({ before, after }) => {
    const groups = getListDiff(
      before?.groups,
      after?.groups,
      (group) => group.key,
    );
    return {
      id: (after ?? before)!.id,
      kind: kindOf(before, after) as AppDiff['kind'],
      before,
      after,
      metadata: fields(before ?? {}, after ?? {}, ['groups']),
      groups,
      stats: stats(
        groups,
        before?.groups.length ?? 0,
        after?.groups.length ?? 0,
      ),
      groupsReordered:
        !!before &&
        !!after &&
        groups.added.length === 0 &&
        groups.removed.length === 0 &&
        !isJsonEqual(
          before.groups.map((g) => g.key),
          after.groups.map((g) => g.key),
        ),
    };
  });
  const groupDiff = buildEmptyDiff<RawAppGroup>();
  for (const app of apps)
    for (const key of ['added', 'changed', 'removed'] as const) {
      if (key === 'changed') groupDiff.changed.push(...app.groups.changed);
      else groupDiff[key].push(...app.groups[key]);
    }
  const keys = new Set<number | null>([
    ...(before?.categories ?? []).map((c) => c.key),
    ...(after.categories ?? []).map((c) => c.key),
    null,
  ]);
  const categories: CategoryDiff[] = [];
  for (const key of keys) {
    const oldBucket = oldSummary?.categories.find(
      (entry) => (entry.category?.key ?? null) === key,
    );
    const newBucket = newSummary.categories.find(
      (entry) => (entry.category?.key ?? null) === key,
    );
    const oldCategory = oldBucket?.category ?? null;
    const newCategory = newBucket?.category ?? null;
    const groups = getListDiff(oldBucket?.groups, newBucket?.groups, (entry) =>
      JSON.stringify([entry.appId, entry.group.key]),
    );
    const kind = key === null ? 'unchanged' : kindOf(oldCategory, newCategory);
    if (kind === 'unchanged' && isEmptyDiff(groups)) continue;
    categories.push({
      key,
      kind,
      before: oldCategory,
      after: newCategory,
      metadata: fields(oldCategory ?? {}, newCategory ?? {}),
      groups,
      stats: stats(groups, oldBucket?.total ?? 0, newBucket?.total ?? 0),
    });
  }
  const collectionDiffs = {
    apps: appDiff,
    categories: categoryDiff,
    globalGroups,
  };
  return {
    kind: !before
      ? 'initial'
      : isJsonEqual(before, after)
        ? 'unchanged'
        : isJsonEqual(before, { ...after, version: before.version })
          ? 'version-only'
          : 'changed',
    before,
    after,
    versions: { before: before?.version ?? null, after: after.version },
    summary: {
      categories: stats(
        categoryDiff,
        oldSummary?.totals.categories ?? 0,
        newSummary.totals.categories,
      ),
      globalGroups: stats(
        globalGroups,
        oldSummary?.totals.globalGroups ?? 0,
        newSummary.totals.globalGroups,
      ),
      apps: stats(
        appDiff,
        oldSummary?.totals.apps ?? 0,
        newSummary.totals.apps,
      ),
      appGroups: stats(
        groupDiff,
        oldSummary?.totals.appGroups ?? 0,
        newSummary.totals.appGroups,
      ),
    },
    metadata: fields(before ?? {}, after, [
      'version',
      'apps',
      'categories',
      'globalGroups',
    ]),
    categories,
    globalGroups,
    apps,
    collectionChanges: before
      ? (['apps', 'categories', 'globalGroups'] as const).filter(
          (key) =>
            isEmptyDiff(collectionDiffs[key]) &&
            !isJsonEqual(before[key], after[key]),
        )
      : [],
  };
};
