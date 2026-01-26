<script setup lang="ts">
const getShow = () => {
  return import.meta.env.DEV || Reflect.get(globalThis, 'gkd');
};
</script>
<template>
  <ClientOnly>
    <slot v-if="getShow()"></slot>
  </ClientOnly>
</template>
