import { data as mirrorHost } from '../data/mirror.data';
const imgHost = 'https://a.gkd.li/';

export const convertSrc = (name: string): string => {
  if (name && name.startsWith('https:')) {
    if (name.startsWith(imgHost)) {
      return mirrorHost + name.slice(imgHost.length);
    }
    return name;
  }
  return mirrorHost + name;
};
