import { shallowRef } from 'vue';
import { stableRelease, betaRelease } from './apk.load';
import { getApkVersionInfo } from './apk.util';

export const stableReleaseRef = shallowRef(stableRelease);
export const betaReleaseRef = shallowRef(betaRelease);
let isRefreshed = false;
export const refreshRelease = async () => {
  if (isRefreshed) return;
  isRefreshed = true;
  await Promise.all([
    getApkVersionInfo(true).then((v) => {
      stableReleaseRef.value = v;
    }),
    getApkVersionInfo(false).then((v) => {
      betaReleaseRef.value = v;
    }),
  ]);
};
