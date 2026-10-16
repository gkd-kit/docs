import { assetsBaseUrl } from '../data/mirror.load';

export const convertSrc = (name: string): string => {
  if (name.startsWith('https:')) {
    return name;
  }
  return assetsBaseUrl + name;
};
