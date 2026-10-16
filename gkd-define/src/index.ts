import type {
  RawGlobalGroup,
  RawCategory,
  RawApp,
  RawSubscription,
} from '@gkd-kit/api';

export const defineGkdSubscription = (p: RawSubscription) => p;
export const defineGkdGlobalGroups = (p: RawGlobalGroup[]) => p;
export const defineGkdCategories = (p: RawCategory[]) => p;
export const defineGkdApp = (p: RawApp) => p;
