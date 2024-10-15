export interface VersionInfo {
  name: string;
  date: string;
  href: string;
  filename: string;
}
export interface ApkData {
  stable: VersionInfo;
  beta: VersionInfo;
}

const getVersionInfo = async (url: string): Promise<VersionInfo> => {
  const r = await fetch(url).then((r) => r.json());
  return {
    name: r.versionName,
    href: new URL(r.downloadUrl, url).href,
    date: String(r.date || '').substring(0, 10),
    filename: 'gkd-v' + r.versionName + '.apk',
  };
};

const stableRelease = await getVersionInfo(
  'https://registry.npmmirror.com/@gkd-kit/app/latest/files/index.json',
);
const betaRelease = await getVersionInfo(
  'https://registry.npmmirror.com/@gkd-kit/app-beta/latest/files/index.json',
);

const load = async (): Promise<ApkData> => {
  return {
    stable: stableRelease,
    beta: betaRelease,
  };
};

export default {
  load,
};
export declare const data: ApkData;
