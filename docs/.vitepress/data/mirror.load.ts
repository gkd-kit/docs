import { cutsomFetch } from './fetch';

const version = await cutsomFetch(
  'https://registry.npmmirror.com/@gkd-kit/assets/latest/files/package.json',
).then((r) => r.json().then((j) => j.version as string));
const data = `https://registry.npmmirror.com/@gkd-kit/assets/${version}/files/assets/`;

export default data;
