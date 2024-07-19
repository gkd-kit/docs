const mirrorHost = () => {
  return `https://registry.npmmirror.com/@gkd-kit/assets/${ASSETS_VERSION}/files/assets/`;
};
const imgHost = 'https://a.gkd.li/';

export const convertSrc = (name: string): string => {
  if (name && name.startsWith('https:')) {
    if (name.startsWith(imgHost)) {
      return mirrorHost() + name.slice(imgHost.length);
    }
    return name;
  }
  return mirrorHost() + name;
};
