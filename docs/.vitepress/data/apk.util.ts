import { customFetch } from './fetch';

export interface VersionInfo {
  name: string;
  date: string;
  href: string;
  filename: string;
  fileSizeDesc: string;
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
  const r = await customFetch(url);
  const d = await r.json();
  return {
    name: d.versionName,
    href: new URL(d.downloadUrl, r.url).href,
    date: d.date,
    filename: 'v' + d.versionName + '.apk',
    fileSizeDesc: getFileSizeDesc(d.fileSize),
  };
};

export const getApkVersionInfo = async (
  stable: boolean,
): Promise<VersionInfo> => {
  const url = stable
    ? 'https://registry.npmmirror.com/@gkd-kit/app/latest/files/index.json'
    : 'https://registry.npmmirror.com/@gkd-kit/app-beta/latest/files/index.json';
  return getVersionInfo(url);
};

