const load = async (): Promise<string> => {
  const version = await fetch(
    'https://registry.npmmirror.com/@gkd-kit/assets/latest/files/package.json',
  ).then((r) => r.json().then((j) => j.version as string));

  return `https://registry.npmmirror.com/@gkd-kit/assets/${version}/files/assets/`;
};

export default {
  load,
};
export declare const data: string;
