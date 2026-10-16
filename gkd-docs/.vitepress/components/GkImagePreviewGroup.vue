<script setup lang="ts">
import GkImagePreviewOverlay from './GkImagePreviewOverlay.vue';
import { useProvideImagePreview } from './useImagePreview.ts';

const controller = useProvideImagePreview();
</script>

<template>
  <slot></slot>
  <GkImagePreviewOverlay :controller="controller" />
</template>
