import { cutsomFetch } from './fetch';

const getPkgLatestVersion = async (name: string): Promise<string> => {
  const url = `https://registry.npmjs.org/${name}/latest`;
  return cutsomFetch(url).then((r) =>
    r.json().then((j) => j.version as string),
  );
};

const version = await getPkgLatestVersion('@gkd-kit/assets');
const data = `https://registry.npmmirror.com/@gkd-kit/assets/${version}/files/assets/`;

export default data;
