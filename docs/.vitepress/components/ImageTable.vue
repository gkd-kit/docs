<script setup lang="ts">
import { defineClientComponent } from 'vitepress';
import { convertSrc, NImage } from '../utils/img';

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
      <tr v-for="(imgs, i) in images" :key="i">
        <td v-for="src in imgs" :key="src">
          <NImage :src="convertSrc(src)" />
        </td>
      </tr>
    </tbody>
  </table>
</template>
