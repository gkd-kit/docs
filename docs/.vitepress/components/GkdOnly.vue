<script setup lang="ts">
defineProps<{
  not?: boolean;
}>();

const getShow = () => {
  return import.meta.env.DEV || Reflect.get(globalThis, 'gkd');
};
</script>
<template>
  <ClientOnly>
    <slot v-if="not ? !getShow() : getShow()"></slot>
  </ClientOnly>
</template>
