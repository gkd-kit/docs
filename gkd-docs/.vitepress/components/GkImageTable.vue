<script setup lang="ts">
import { convertSrc } from '../utils/img';
import GkImage from './GkImage.vue';
import GkImagePreviewGroup from './GkImagePreviewGroup.vue';

withDefaults(
  defineProps<{
    images: string[][];
  }>(),
  {},
);
</script>
<template>
  <table>
    <tbody>
      <GkImagePreviewGroup>
        <tr v-for="(imgs, i) in images" :key="i">
          <td v-for="src in imgs" :key="src">
            <GkImage :src="convertSrc(src)" />
          </td>
        </tr>
      </GkImagePreviewGroup>
    </tbody>
  </table>
</template>
