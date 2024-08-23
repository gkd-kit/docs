<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue';

const props = withDefaults(
  defineProps<{
    beta?: boolean;
  }>(),
  {},
);

const apkUrl = shallowRef('');
const apkName = computed(() =>
  (apkUrl.value.split('/').at(-1) || '').replace('.wasm', '.apk'),
);

const loading = shallowRef(false);
const downloadApk = async () => {
  if (!apkUrl.value || loading.value) return;
  loading.value = true;
  try {
    const file = await fetch(apkUrl.value)
      .then((r) => r.arrayBuffer())
      .then(
        (b) =>
          new File([b], apkName.value, {
            type: 'application/vnd.android.package-archive',
          }),
      );
    const { saveAs } = await import('file-saver');
    saveAs(file, apkName.value);
  } finally {
    loading.value = false;
  }
};

// preload file-saver in browser
if (globalThis.document) {
  import('file-saver');
}

const pkg = computed(() => (props.beta ? 'app-beta' : 'app'));
const key = computed(() => `apkUrl-${pkg.value}`);

onMounted(async () => {
  apkUrl.value = localStorage.getItem(key.value) || '';
  const versionUrl = `https://registry.npmmirror.com/@gkd-kit/${pkg.value}/latest/files`;
  const r = await fetch(versionUrl);
  const data = await r.json();
  apkUrl.value = new URL(data.downloadUrl, r.url).href;
  localStorage.setItem(key.value, apkUrl.value);
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
