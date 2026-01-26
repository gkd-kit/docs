<script setup lang="ts">
const getShow = () => {
  return (
    globalThis.document && 'ontouchstart' in globalThis.document.documentElement
  );
};
</script>
<template>
  <ClientOnly>
    <slot v-if="getShow()"></slot>
  </ClientOnly>
</template>
