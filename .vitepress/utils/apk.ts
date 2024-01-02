import QRCode from 'qrcode';
import { computed, shallowRef, watchEffect } from 'vue';

export const apkUrl = shallowRef('');
export const apkName = computed(() => apkUrl.value.split('/').at(-1) || '');
export const apkImgUrl = shallowRef('');
watchEffect(async () => {
  if (!apkUrl.value) {
    apkImgUrl.value = '';
    return;
  }
  apkImgUrl.value = await QRCode.toDataURL(apkUrl.value, {
    width: 256,
    margin: 2,
  });
});

if (globalThis.window) {
  // only run in browser
  apkUrl.value = localStorage.getItem('apkUrl') || '';
  const versionUrl = 'https://registry.npmmirror.com/@gkd-kit/app/latest/files';
  fetch(versionUrl).then(async (r) => {
    apkUrl.value = new URL((await r.json()).downloadUrl, r.url).href;
    localStorage.setItem('apkUrl', apkUrl.value);
  });
}
