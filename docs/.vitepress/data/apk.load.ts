import { customFetch } from './fetch';

export interface VersionInfo {
  name: string;
  date: string;
  href: string;
  filename: string;
  fileSizeDesc: string;
}
export interface ApkData {
  stable: VersionInfo;
  beta: VersionInfo;
}

const getFileSizeDesc = (size: number): string => {
  if (size < 1024) {
    return size + 'B';
  }
  if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + 'KB';
  }
  if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + 'MB';
  }
  return (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
};

const getVersionInfo = async (url: string): Promise<VersionInfo> => {
  const r = await customFetch(url).then((r) => r.json());
  return {
    name: r.versionName,
    href: new URL(r.downloadUrl, url).href,
    date: r.date,
    filename: 'v' + r.versionName + '.apk',
    fileSizeDesc: getFileSizeDesc(r.fileSize),
  };
};

export const stableRelease = await getVersionInfo(
  'https://registry.npmmirror.com/@gkd-kit/app/latest/files/index.json',
);

export const betaRelease = await getVersionInfo(
  'https://registry.npmmirror.com/@gkd-kit/app-beta/latest/files/index.json',
);
