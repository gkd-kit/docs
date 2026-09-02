<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue';
import type { GkImagePreviewController } from './useImagePreview';

const props = defineProps<{
  controller: GkImagePreviewController;
}>();

const {
  items,
  zoom,
  rotation,
  overlay,
  currentIndex,
  currentItem,
  close,
  move,
  setZoom,
  rotateClockwise,
  handleKeydown,
  handleWheel,
} = props.controller;

const mounted = shallowRef(false);
onMounted(() => {
  mounted.value = true;
});
const imageStyle = computed(() => ({
  transform: `scale(${zoom.value}) rotate(${rotation.value}deg)`,
}));
const zoomLabel = computed(() => `${Math.round(zoom.value * 100)}%`);
</script>

<template>
  <Teleport v-if="mounted" to="body">
    <div
      v-if="currentItem"
      ref="overlay"
      class="image-preview-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
      tabindex="-1"
      @keydown="handleKeydown"
    >
      <button
        type="button"
        class="image-preview-overlay__close"
        title="关闭"
        aria-label="关闭图片预览"
        @click="close"
      >
        ×
      </button>

      <div
        class="image-preview-overlay__stage"
        @click="close"
        @wheel.prevent="handleWheel"
      >
        <button
          v-if="items.length > 1"
          type="button"
          class="image-preview-overlay__nav image-preview-overlay__nav--prev"
          title="上一张"
          aria-label="上一张图片"
          @click.stop="move(-1)"
        >
          <svg
            class="image-preview-overlay__nav-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M15 18 9 12l6-6" />
          </svg>
        </button>

        <img
          class="image-preview-overlay__image"
          :src="currentItem.getSrc()"
          :alt="currentItem.getAlt()"
          :style="imageStyle"
          draggable="false"
          @click.stop
        />

        <button
          v-if="items.length > 1"
          type="button"
          class="image-preview-overlay__nav image-preview-overlay__nav--next"
          title="下一张"
          aria-label="下一张图片"
          @click.stop="move(1)"
        >
          <svg
            class="image-preview-overlay__nav-icon image-preview-overlay__nav-icon--next"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M15 18 9 12l6-6" />
          </svg>
        </button>
      </div>

      <div class="image-preview-overlay__toolbar">
        <span v-if="items.length > 1" class="image-preview-overlay__counter">
          {{ currentIndex + 1 }} / {{ items.length }}
        </span>
        <button
          type="button"
          class="image-preview-overlay__tool"
          title="缩小"
          aria-label="缩小"
          @click="setZoom(zoom - 0.25)"
        >
          −
        </button>
        <button
          type="button"
          class="image-preview-overlay__tool"
          title="恢复 100% 缩放"
          aria-label="恢复 100% 缩放"
          @click="setZoom(1)"
        >
          {{ zoomLabel }}
        </button>
        <button
          type="button"
          class="image-preview-overlay__tool"
          title="放大"
          aria-label="放大"
          @click="setZoom(zoom + 0.25)"
        >
          +
        </button>
        <button
          type="button"
          class="image-preview-overlay__tool"
          title="向右旋转"
          aria-label="向右旋转"
          @click="rotateClockwise"
        >
          ↷
        </button>
      </div>
    </div>
  </Teleport>
</template>
