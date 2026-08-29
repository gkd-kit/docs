import { createInjectionState } from '@vueuse/core';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  shallowReactive,
  shallowRef,
  watch,
  type ComputedRef,
  type Ref,
  type ShallowRef,
} from 'vue';

export interface GkImagePreviewItem {
  id: symbol;
  getSrc: () => string;
  getAlt: () => string;
}

export interface GkImagePreviewController {
  items: GkImagePreviewItem[];
  zoom: Ref<number>;
  rotation: Ref<number>;
  overlay: ShallowRef<HTMLElement | undefined>;
  currentIndex: ComputedRef<number>;
  currentItem: ComputedRef<GkImagePreviewItem | undefined>;
  close: () => void;
  open: (id: symbol) => void;
  move: (offset: number) => void;
  setZoom: (value: number) => void;
  rotateClockwise: () => void;
  register: (item: GkImagePreviewItem) => () => void;
  handleKeydown: (event: KeyboardEvent) => void;
  handleWheel: (event: WheelEvent) => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const useImagePreview = (): GkImagePreviewController => {
  const items = shallowReactive<GkImagePreviewItem[]>([]);
  const activeId = shallowRef<symbol>();
  const zoom = ref(1);
  const rotation = ref(0);
  const overlay = shallowRef<HTMLElement>();
  let previousOverflow = '';

  const currentIndex = computed(() =>
    items.findIndex((item) => item.id === activeId.value),
  );
  const currentItem = computed(() => items[currentIndex.value]);

  const resetTransform = () => {
    zoom.value = 1;
    rotation.value = 0;
  };
  const close = () => {
    activeId.value = undefined;
  };
  const open = (id: symbol) => {
    activeId.value = id;
    resetTransform();
    nextTick(() => overlay.value?.focus());
  };
  const move = (offset: number) => {
    if (items.length < 2) return;
    const index = (currentIndex.value + offset + items.length) % items.length;
    activeId.value = items[index].id;
    resetTransform();
  };
  const setZoom = (value: number) => {
    zoom.value = clamp(value, 0.25, 5);
  };
  const rotateClockwise = () => {
    rotation.value = (rotation.value + 90) % 360;
  };
  const register = (item: GkImagePreviewItem) => {
    items.push(item);
    return () => {
      const index = items.indexOf(item);
      if (index >= 0) items.splice(index, 1);
      if (activeId.value === item.id) close();
    };
  };
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') close();
    else if (event.key === 'ArrowLeft') move(-1);
    else if (event.key === 'ArrowRight') move(1);
    else if (event.key === '+' || event.key === '=') {
      setZoom(zoom.value + 0.25);
    } else if (event.key === '-') {
      setZoom(zoom.value - 0.25);
    } else if (event.key === '0') {
      resetTransform();
    } else {
      return;
    }
    event.preventDefault();
  };
  const handleWheel = (event: WheelEvent) => {
    setZoom(zoom.value + (event.deltaY < 0 ? 0.25 : -0.25));
  };

  watch(activeId, (id, previousId) => {
    if (import.meta.env.SSR) return;
    if (id && !previousId) {
      previousOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
    } else if (!id && previousId) {
      document.documentElement.style.overflow = previousOverflow;
    }
  });
  onBeforeUnmount(() => {
    if (!import.meta.env.SSR && activeId.value) {
      document.documentElement.style.overflow = previousOverflow;
    }
  });

  return {
    items,
    zoom,
    rotation,
    overlay,
    currentIndex,
    currentItem,
    close,
    open,
    move,
    setZoom,
    rotateClockwise,
    register,
    handleKeydown,
    handleWheel,
  };
};

export const [useProvideImagePreview, useInjectedImagePreview] =
  createInjectionState(useImagePreview);
