import type {
  IArray,
  RawApp,
  RawAppGroup,
  RawAppRule,
  RawGlobalGroup,
  RawSubscription,
} from '@gkd-kit/api';
import { parseSelector } from './selector.ts';

const getDuplicate = <T>(
  list: T[] | undefined,
  getKey: (v: T) => unknown,
): number[] | void => {
  if (!list) return;
  if (list.length <= 1) return;
  const indexes: number[] = [];
  for (let i = 0; i < list.length; i++) {
    const v = list[i];
    const key = getKey(v);
    if (key === undefined) return; // ignore undefined key
    while (indexes.length) {
      indexes.pop();
    }
    indexes.push(i);
    list.forEach((v2, i2) => {
      if (i !== i2 && getKey(v2) === key) {
        indexes.push(i2);
      }
    });
    if (indexes.length > 1) {
      return indexes;
    }
  }
};

const resolveRules = (rules: IArray<string | RawAppRule>): RawAppRule[] => {
  return (Array.isArray(rules) ? rules : [rules]).map((v) =>
    typeof v === 'string' ? { matches: v } : v,
  );
};

// hide it else console will log too many properties
const hideProperties = (target: Error) => {
  Object.keys(target).forEach((key) => {
    if (key === 'cause') return;
    Object.defineProperty(target, key, { enumerable: false });
  });
};

export class DuplicateCategoryError extends Error {
  subscription: RawSubscription;
  indexes: number[];
  field: 'key' | 'name';

  constructor(
    subscription: RawSubscription,
    indexes: number[],
    field: 'key' | 'name',
  ) {
    const list = subscription.categories || [];
    const item = list[indexes[0]];
    super(
      `Duplicate category ${field}=${item[field]} indexes=${indexes} in subscription[id=${subscription.id},name=${subscription.name}]`,
    );
    this.subscription = subscription;
    this.indexes = indexes;
    this.field = field;
    hideProperties(this);
  }
}
export class DuplicateGlobalGroupError extends Error {
  subscription: RawSubscription;
  indexes: number[];
  field: 'key' | 'name';

  constructor(
    subscription: RawSubscription,
    indexes: number[],
    field: 'key' | 'name',
  ) {
    const list = subscription.globalGroups || [];
    const item = list[indexes[0]];
    super(
      `Duplicate global group ${field}=${item[field]} indexes=${indexes} in subscription[id=${subscription.id},name=${subscription.name}]`,
    );
    this.subscription = subscription;
    this.indexes = indexes;
    this.field = field;
    hideProperties(this);
  }
}
export class DuplicateGlobalRuleError extends Error {
  subscription: RawSubscription;
  indexes: number[];
  group: RawGlobalGroup;
  field: 'key' | 'name';

  constructor(
    subscription: RawSubscription,
    indexes: number[],
    group: RawGlobalGroup,
    field: 'key' | 'name',
  ) {
    const list = group.rules || [];
    const item = list[indexes[0]];
    super(
      `Duplicate global rule ${field}=${item[field]} indexes=${indexes} in subscription[id=${subscription.id},name=${subscription.name}] global group[key=${group.key},name=${group.name}]`,
    );
    this.subscription = subscription;
    this.indexes = indexes;
    this.group = group;
    this.field = field;
    hideProperties(this);
  }
}
export class DuplicateGlobalAppError extends Error {
  subscription: RawSubscription;
  indexes: number[];
  group: RawGlobalGroup;

  constructor(
    subscription: RawSubscription,
    indexes: number[],
    group: RawGlobalGroup,
  ) {
    const list = group.apps || [];
    const item = list[indexes[0]];
    super(
      `Duplicate global app id=${item.id} indexes=${indexes} in subscription[id=${subscription.id},name=${subscription.name}] global group[key=${group.key},name=${group.name}]`,
    );
    this.subscription = subscription;
    this.indexes = indexes;
    this.group = group;
    hideProperties(this);
  }
}
export class DuplicateAppError extends Error {
  subscription: RawSubscription;
  indexes: number[];

  constructor(subscription: RawSubscription, indexes: number[]) {
    const list = subscription.apps || [];
    const item = list[indexes[0]];
    super(
      `Duplicate app id=${item.id} indexes=${indexes} in subscription[id=${subscription.id},name=${subscription.name}]`,
    );
    this.subscription = subscription;
    this.indexes = indexes;
    hideProperties(this);
  }
}

export class DuplicateAppGroupError extends Error {
  subscription: RawSubscription;
  indexes: number[];
  app: RawApp;
  field: 'key' | 'name';

  constructor(
    subscription: RawSubscription,
    indexes: number[],
    app: RawApp,
    field: 'key' | 'name',
  ) {
    const list = app.groups || [];
    const item = list[indexes[0]];
    super(
      `Duplicate app group ${field}=${item[field]} indexes=${indexes} in subscription[id=${subscription.id},name=${subscription.name}] app [id=${app.id},name=${app.name}]`,
    );
    this.subscription = subscription;
    this.indexes = indexes;
    this.app = app;
    this.field = field;
    hideProperties(this);
  }
}
export class DuplicateAppRuleError extends Error {
  subscription: RawSubscription;
  indexes: number[];
  app: RawApp;
  group: RawAppGroup;
  field: 'key' | 'name';

  constructor(
    subscription: RawSubscription,
    indexes: number[],
    app: RawApp,
    group: RawAppGroup,
    field: 'key' | 'name',
  ) {
    const list = resolveRules(group.rules) || [];
    const item = list[indexes[0]];
    super(
      `Duplicate app rule ${field}=${item[field]} indexes=${indexes} in subscription[id=${subscription.id},name=${subscription.name}] app [id=${app.id},name=${app.name}] group[key=${group.key},name=${group.name}] `,
    );
    this.subscription = subscription;
    this.indexes = indexes;
    this.app = app;
    this.group = group;
    this.field = field;
    hideProperties(this);
  }
}

const errorIfDuplicate = <T>(
  list: T[] | undefined,
  getKey: (v: T) => unknown,
  error: (indexes: number[]) => never,
) => {
  if (!list) return;
  if (list.length <= 1) return;
  const indexes = getDuplicate(list, getKey);
  if (!indexes) return;
  error(indexes);
};
const checkDuplicate = (subscription: RawSubscription) => {
  errorIfDuplicate(
    subscription.categories,
    (v) => v.key,
    (indexes) => {
      throw new DuplicateCategoryError(subscription, indexes, 'key');
    },
  );
  errorIfDuplicate(
    subscription.categories,
    (v) => v.name,
    (indexes) => {
      throw new DuplicateCategoryError(subscription, indexes, 'name');
    },
  );
  errorIfDuplicate(
    subscription.globalGroups,
    (v) => v.key,
    (indexes) => {
      throw new DuplicateGlobalGroupError(subscription, indexes, 'key');
    },
  );
  errorIfDuplicate(
    subscription.globalGroups,
    (v) => v.name,
    (indexes) => {
      throw new DuplicateGlobalGroupError(subscription, indexes, 'name');
    },
  );
  for (const group of subscription.globalGroups || []) {
    errorIfDuplicate(
      group.rules,
      (v) => v.key,
      (indexes) => {
        throw new DuplicateGlobalRuleError(subscription, indexes, group, 'key');
      },
    );
    errorIfDuplicate(
      group.rules,
      (v) => v.name,
      (indexes) => {
        throw new DuplicateGlobalRuleError(
          subscription,
          indexes,
          group,
          'name',
        );
      },
    );
    errorIfDuplicate(
      group.apps,
      (v) => v.id,
      (indexes) => {
        throw new DuplicateGlobalAppError(subscription, indexes, group);
      },
    );
  }
  errorIfDuplicate(
    subscription.apps,
    (v) => v.id,
    (indexes) => {
      throw new DuplicateAppError(subscription, indexes);
    },
  );
  for (const app of subscription.apps || []) {
    errorIfDuplicate(
      app.groups,
      (v) => v.key,
      (indexes) => {
        throw new DuplicateAppGroupError(subscription, indexes, app, 'key');
      },
    );
    errorIfDuplicate(
      app.groups,
      (v) => v.name,
      (indexes) => {
        throw new DuplicateAppGroupError(subscription, indexes, app, 'name');
      },
    );

    for (const group of app.groups || []) {
      const rules = resolveRules(group.rules);
      errorIfDuplicate(
        rules,
        (v) => v.key,
        (indexes) => {
          throw new DuplicateAppRuleError(
            subscription,
            indexes,
            app,
            group,
            'key',
          );
        },
      );
      errorIfDuplicate(
        rules,
        (v) => v.name,
        (indexes) => {
          throw new DuplicateAppRuleError(
            subscription,
            indexes,
            app,
            group,
            'name',
          );
        },
      );
    }
  }
};

function* traverseIArray<T>(
  list: IArray<T> | undefined,
): Generator<T, void, unknown> {
  if (list === undefined) return;
  if (Array.isArray(list)) {
    for (const item of list) {
      yield item;
    }
  } else {
    yield list;
  }
}
const importReg = /^https:\/\/i\.gkd\.li\/(i|(import))\/[0-9]+$/;
const isValidSnapshotUrl = (url: string): boolean => {
  return importReg.test(url);
};

const checkSnapshotUrl = (subscription: RawSubscription) => {
  subscription.globalGroups?.forEach((group) => {
    for (const snapshotUrl of traverseIArray(group.snapshotUrls)) {
      if (!isValidSnapshotUrl(snapshotUrl)) {
        throw new Error(
          `Invalid snapshotUrl: ${snapshotUrl} in subscription[id=${subscription.id},name=${subscription.name}] global group[key=${group.key},name=${group.name}]`,
        );
      }
    }
    group.rules?.forEach((rule) => {
      for (const snapshotUrl of traverseIArray(rule.snapshotUrls)) {
        if (!isValidSnapshotUrl(snapshotUrl)) {
          throw new Error(
            `Invalid snapshotUrl: ${snapshotUrl} in subscription[id=${subscription.id},name=${subscription.name}] global group[key=${group.key},name=${group.name}] rule[key=${rule.key},name=${rule.name}]`,
          );
        }
      }
    });
  });
  subscription.apps?.forEach((app) => {
    app.groups?.forEach((group) => {
      for (const snapshotUrl of traverseIArray(group.snapshotUrls)) {
        if (!isValidSnapshotUrl(snapshotUrl)) {
          throw new Error(
            `Invalid snapshotUrl: ${snapshotUrl} in subscription[id=${subscription.id},name=${subscription.name}] app[id=${app.id},name=${app.name}] group[key=${group.key},name=${group.name}]`,
          );
        }
      }
      resolveRules(group.rules).forEach((rule) => {
        for (const snapshotUrl of traverseIArray(rule.snapshotUrls)) {
          if (!isValidSnapshotUrl(snapshotUrl)) {
            throw new Error(
              `Invalid snapshotUrl: ${snapshotUrl} in subscription[id=${subscription.id},name=${subscription.name}] app[id=${app.id},name=${app.name}] group[key=${group.key},name=${group.name}] rule[key=${rule.key},name=${rule.name}]`,
            );
          }
        }
      });
    });
  });
};

const checkSelector = (subscription: RawSubscription) => {
  subscription.globalGroups?.forEach((group) => {
    group.rules?.forEach((rule) => {
      for (const source of traverseIArray(rule.matches)) {
        try {
          parseSelector(source);
        } catch (e) {
          throw new Error(
            `Invalid matches selector: ${source} in subscription[id=${subscription.id},name=${subscription.name}] global group[key=${group.key},name=${group.name}] rule[key=${rule.key},name=${rule.name}]`,
            {
              cause: e,
            },
          );
        }
      }
      for (const source of traverseIArray(rule.excludeMatches)) {
        try {
          parseSelector(source);
        } catch (e) {
          throw new Error(
            `Invalid excludeMatches selector: ${source} in subscription[id=${subscription.id},name=${subscription.name}] global group[key=${group.key},name=${group.name}] rule[key=${rule.key},name=${rule.name}]`,
            {
              cause: e,
            },
          );
        }
      }
    });
  });
  subscription.apps?.forEach((app) => {
    app.groups?.forEach((group) => {
      resolveRules(group.rules).forEach((rule) => {
        for (const source of traverseIArray(rule.matches)) {
          try {
            parseSelector(source);
          } catch (e) {
            throw new Error(
              `Invalid matches selector: ${source} in subscription[id=${subscription.id},name=${subscription.name}] app[id=${app.id},name=${app.name}] group[key=${group.key},name=${group.name}] rule[key=${rule.key},name=${rule.name}]`,
              {
                cause: e,
              },
            );
          }
        }
        for (const source of traverseIArray(rule.excludeMatches)) {
          try {
            parseSelector(source);
          } catch (e) {
            throw new Error(
              `Invalid excludeMatches selector: ${source} in subscription[id=${subscription.id},name=${subscription.name}] app[id=${app.id},name=${app.name}] group[key=${group.key},name=${group.name}] rule[key=${rule.key},name=${rule.name}]`,
              {
                cause: e,
              },
            );
          }
        }
      });
    });
  });
};

const checkCategory = (subscription: RawSubscription) => {
  const categories = subscription.categories;
  if (!categories || categories.length == 0) return;
  subscription.apps?.forEach((app) => {
    app.groups?.forEach((group) => {
      if (
        !categories.some((category) => {
          return (
            group.name.startsWith(category.name) &&
            (!group.name[category.name.length] ||
              group.name[category.name.length] === '-')
          );
        })
      ) {
        throw new Error(
          `Invalid group: ${group.name}, key=${group.key} not match any category in subscription[id=${subscription.id},name=${subscription.name}] app[id=${app.id},name=${app.name}]`,
        );
      }
    });
  });
};

export const checkSubscription = (subscription: RawSubscription) => {
  checkDuplicate(subscription);
  checkSnapshotUrl(subscription);
  checkSelector(subscription);
  checkCategory(subscription);
};
