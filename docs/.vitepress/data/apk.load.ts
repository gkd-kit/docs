import { getApkVersionInfo } from './apk.util';

export const stableRelease = await getApkVersionInfo(true);
export const betaRelease = await getApkVersionInfo(false);
