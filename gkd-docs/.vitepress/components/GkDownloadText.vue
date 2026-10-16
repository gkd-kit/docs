<script setup lang="ts">
import { shallowRef } from 'vue';

const props = withDefaults(
  defineProps<{
    href: string;
    name: string;
    type?: string;
  }>(),
  {
    type: 'application/vnd.android.package-archive',
  },
);

const loading = shallowRef(false);
const download = async () => {
  if (loading.value) return;
  loading.value = true;
  import('file-saver');
  const filename = `gkd-${props.name}`;
  try {
    const file = await fetch(props.href)
      .then((r) => r.arrayBuffer())
      .then((b) => {
        return new File([b], filename, {
          type: props.type,
        });
      });
    const { saveAs } = await import('file-saver');
    saveAs(file, filename);
  } finally {
    loading.value = false;
  }
};
</script>
<template>
  <a
    relative
    :class="{
      'cursor-progress': loading,
      'cursor-pointer': !loading,
    }"
    @click="download"
    :data-href="href"
  >
    <span
      :class="{
        'opacity-50': loading,
      }"
    >
      {{ name }}
    </span>
    <div
      v-if="loading"
      pointer-events-none
      absolute
      left="1/1"
      top-0
      bottom-0
      flex
      items-center
      pl-4px
    >
      <svg animate-spin size-16px viewBox="0 0 16 16" fill="none">
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
  </a>
</template>
