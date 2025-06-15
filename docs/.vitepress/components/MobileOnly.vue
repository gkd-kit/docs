<script setup lang="ts">
defineProps<{
  not?: boolean;
}>();

const getShow = () => {
  return (
    globalThis.document && 'ontouchstart' in globalThis.document.documentElement
  );
};
</script>
<template>
  <ClientOnly>
    <slot v-if="not ? !getShow() : getShow()"></slot>
  </ClientOnly>
</template>
