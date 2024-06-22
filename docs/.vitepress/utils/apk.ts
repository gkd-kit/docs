import { computed, shallowRef } from 'vue';

export const apkUrl = shallowRef('');
export const apkName = computed(() => apkUrl.value.split('/').at(-1) || '');

if (!import.meta.env.SSR) {
  // only run in browser
  apkUrl.value = localStorage.getItem('apkUrl') || '';
  const versionUrl = 'https://registry.npmmirror.com/@gkd-kit/app/latest/files';
  fetch(versionUrl).then(async (r) => {
    apkUrl.value = new URL((await r.json()).downloadUrl, r.url).href;
    localStorage.setItem('apkUrl', apkUrl.value);
  });
}
