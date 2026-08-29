<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue';
import GkImagePreviewOverlay from './GkImagePreviewOverlay.vue';
import { useImagePreview, useInjectedImagePreview } from './useImagePreview';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    src: string;
    previewSrc?: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
    objectFit?: 'contain' | 'cover' | 'fill' | 'none';
    lazy?: boolean;
    previewDisabled?: boolean;
  }>(),
  {
    alt: '',
    previewSrc: undefined,
    width: undefined,
    height: undefined,
    objectFit: undefined,
    lazy: false,
    previewDisabled: false,
  },
);

const group = useInjectedImagePreview();
const controller = group ?? useImagePreview();
const id = Symbol();
const unregister = controller.register({
  id,
  getSrc: () => props.previewSrc || props.src,
  getAlt: () => props.alt,
});

onBeforeUnmount(unregister);

const ariaLabel = computed(() =>
  props.previewDisabled
    ? undefined
    : props.alt
      ? `预览图片：${props.alt}`
      : '预览图片',
);

const open = () => {
  if (!props.previewDisabled) controller.open(id);
};
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  open();
};
</script>

<template>
  <span
    v-bind="$attrs"
    class="image-preview"
    :class="{ 'image-preview--disabled': previewDisabled }"
    :role="previewDisabled ? undefined : 'button'"
    :aria-label="ariaLabel"
    :tabindex="previewDisabled ? undefined : 0"
    @click="open"
    @keydown="handleKeydown"
  >
    <img
      class="image-preview__image"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="lazy ? 'lazy' : undefined"
      :style="{ objectFit }"
    />
  </span>
  <GkImagePreviewOverlay v-if="!group" :controller="controller" />
</template>
