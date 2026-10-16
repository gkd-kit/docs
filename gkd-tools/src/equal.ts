const isPrimitive = (v: unknown) => v === null || typeof v !== 'object';
export const isJsonEqual = (a: unknown, b: unknown) => {
  if (a === b) return true;

  if (Number.isNaN(a) && Number.isNaN(b)) return true;
  if (isPrimitive(a) || isPrimitive(b)) return a === b;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isJsonEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (Array.isArray(a) && !Array.isArray(b)) {
    return false;
  }
  if (Array.isArray(b) && !Array.isArray(a)) {
    return false;
  }

  const a1 = a as Record<string, unknown>;
  const b1 = b as Record<string, unknown>;
  const keys = new Set([...Object.keys(a1), ...Object.keys(b1)]);
  for (const key of keys) {
    // expect: {key: undefined} == {}
    if (!isJsonEqual(a1[key], b1[key])) return false;
  }
  return true;
};
