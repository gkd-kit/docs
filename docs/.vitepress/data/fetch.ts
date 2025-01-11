const retryCount = 10;

export const cutsomFetch = async (
  input: string | URL | globalThis.Request,
  init?: RequestInit,
) => {
  let i = retryCount;
  while (true) {
    try {
      // sometimes nodejs time out error
      return await fetch(input, init);
    } catch (e) {
      i--;
      if (i <= 0) {
        throw e;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
  }
};
