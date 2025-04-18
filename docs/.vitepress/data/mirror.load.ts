import { customFetch } from './fetch';

const getPkgLatestVersion = async (name: string): Promise<string> => {
  const url = `https://registry.npmmirror.com/${name}/latest`;
  return customFetch(url).then((r) =>
    r.json().then((j) => j.version as string),
  );
};

const version = await getPkgLatestVersion('@gkd-kit/assets');
const data = `https://registry.npmmirror.com/@gkd-kit/assets/${version}/files/assets/`;

export default data;
