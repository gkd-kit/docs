<script setup lang="ts">
import { computed, shallowRef, onMounted } from 'vue';

const apkUrl = shallowRef('');
const apkName = computed(() =>
  (apkUrl.value.split('/').at(-1) || '').replace('.wasm', '.apk'),
);

const loading = shallowRef(false);
const downloadApk = async () => {
  if (!apkUrl.value || loading.value) return;
  loading.value = true;
  const blob = await fetch(apkUrl.value)
    .then((r) => r.blob())
    .finally(() => {
      loading.value = false;
    });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = apkName.value;
  a.href = url;
  a.click();
};

onMounted(async () => {
  apkUrl.value = localStorage.getItem('apkUrl') || '';
  const versionUrl = 'https://registry.npmmirror.com/@gkd-kit/app/latest/files';
  const r = await fetch(versionUrl).then((r) => r.json());
  apkUrl.value = new URL(r.downloadUrl, r.url).href;
  localStorage.setItem('apkUrl', apkUrl.value);
});
</script>
<template>
  <div inline-flex items-center gap-10px>
    <a
      :class="{
        'cursor-progress': loading,
        'opacity-50': loading,
        'cursor-pointer': !loading,
      }"
      @click="downloadApk"
    >
      {{ apkName }}
    </a>
    <svg v-if="loading" animate-spin size-16px viewBox="0 0 16 16" fill="none">
      <circle
        cx="8"
        cy="8"
        r="7"
        stroke="currentColor"
        stroke-opacity="0.25"
        stroke-width="2"
        vector-effect="non-scaling-stroke"
      ></circle>
      <path
        d="M15 8a7.002 7.002 0 00-7-7"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        vector-effect="non-scaling-stroke"
      ></path>
    </svg>
  </div>
</template>
