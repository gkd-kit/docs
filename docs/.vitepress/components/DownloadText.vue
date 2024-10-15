<script setup lang="ts">
import { computed, shallowRef } from 'vue';

const props = withDefaults(
  defineProps<{
    href: string;
    name?: string;
    type?: string;
  }>(),
  {
    type: 'application/vnd.android.package-archive',
  },
);

const filename = computed(() => {
  if (props.name) return props.name;
  return props.href.split('/').at(-1)!;
});

const loading = shallowRef(false);
const download = async () => {
  if (loading.value) return;
  loading.value = true;
  import('file-saver');
  try {
    const file = await fetch(props.href)
      .then((r) => r.arrayBuffer())
      .then((b) => {
        return new File([b], filename.value, {
          type: props.type,
        });
      });
    const { saveAs } = await import('file-saver');
    saveAs(file, filename.value);
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
      {{ filename }}
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
