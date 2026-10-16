<script setup lang="ts">
import { shallowRef, computed } from 'vue';
import { useDebounce } from '@vueuse/core';

const value = shallowRef('');
const reg = /^[_a-zA-Z][a-zA-Z0-9_]*$/;
const lazyValue = useDebounce(value, 300);
const test = computed(() => {
  return (
    lazyValue.value !== 'null' &&
    lazyValue.value !== 'true' &&
    lazyValue.value !== 'false' &&
    reg.test(lazyValue.value)
  );
});
</script>
<template>
  <div>
    <input
      placeholder="请输入标识符测试是否合法"
      type="text"
      v-model="value"
      class="flex h-9 w-full rounded-md border border-[var(--vp-c-divider)] bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--vp-c-text-3)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--vp-c-brand-1)] disabled:cursor-not-allowed disabled:opacity-50"
    />
    <div
      class="mt-[4px]"
      :class="{
        'text-red-500': !test,
        'opacity-0': !lazyValue || !value,
      }"
    >
      {{ test ? `合法标识符✅` : `非法标识符❌` }}
    </div>
  </div>
</template>
