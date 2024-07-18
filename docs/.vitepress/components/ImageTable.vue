<script setup lang="ts">
import { convertSrc } from '../utils/img';
import { NImage, NImageGroup } from '../utils/naive';

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
      <NImageGroup>
        <tr v-for="(imgs, i) in images" :key="i">
          <td v-for="src in imgs" :key="src">
            <NImage :src="convertSrc(src)" />
          </td>
        </tr>
      </NImageGroup>
    </tbody>
  </table>
</template>
