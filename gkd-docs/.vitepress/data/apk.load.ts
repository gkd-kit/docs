import { getApkVersionInfo } from './apk.util.ts';

export const stableRelease = await getApkVersionInfo(true);
export const betaRelease = await getApkVersionInfo(false);
