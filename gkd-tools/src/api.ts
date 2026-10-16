export const checkApiVersion = async () => {
  const { default: pkg } = await import('@gkd-kit/api/package.json', {
    with: { type: 'json' },
  });
  const latestApiVersion = await fetch(
    'https://registry.npmmirror.com/@gkd-kit/api/latest/files/package.json',
  )
    .then((r) => {
      if (!r.ok) throw new Error(`API version check failed: HTTP ${r.status}`);
      return r.json();
    })
    .then((data: unknown) => {
      if (
        typeof data !== 'object' ||
        data === null ||
        !('version' in data) ||
        typeof data.version !== 'string'
      ) {
        throw new Error('Invalid API package metadata: missing version');
      }
      return data.version;
    });
  if (latestApiVersion !== pkg.version) {
    console.warn(
      `Warning: The @gkd-kit/api version in your project (${pkg.version}) does not match the latest version (${latestApiVersion}). Please update to ensure compatibility.\n`,
    );
  }
};
