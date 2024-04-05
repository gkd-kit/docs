<script setup lang="ts">
import { shallowRef, computed } from 'vue';
import { useDebounce } from '@vueuse/core';
const value = shallowRef('');
const reg = /^[_a-zA-Z][a-zA-Z0-9_]*(\.[_a-zA-Z][a-zA-Z0-9_]*)*$/;
const lazyValue = useDebounce(value, 300);
const test = computed(() => reg.test(lazyValue.value));
</script>
<template>
  <div>
    <input
      placeholder="请输入属性名测试是否合法"
      type="text"
      v-model="value"
      class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    />
    <div
     mt-4px
      :class="{
        'color-red': !test,
        'opacity-0': !lazyValue || !value,
      }"
    >
      {{ test ? `合法属性名✅` : `非法属性名❌` }}
    </div>
  </div>
</template>
