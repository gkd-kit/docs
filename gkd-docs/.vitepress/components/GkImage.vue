<script setup lang="ts">
import { computed } from 'vue';
import { imageSizeList } from '../data/mirror.load';
import { convertSrc } from '../utils/img';
import GkImagePreview from './GkImagePreview.vue';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  src: string;
}>();

const rawSrc = computed(() => convertSrc(props.src));
const imageSize = computed(() =>
  imageSizeList.find((item) => rawSrc.value.endsWith(item.name)),
);
</script>

<template>
  <GkImagePreview
    v-bind="$attrs"
    :src="rawSrc"
    :width="imageSize?.width"
    :height="imageSize?.height"
  />
</template>
