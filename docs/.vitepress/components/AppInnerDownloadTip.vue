<script setup lang="ts">
const show = Reflect.get(globalThis, 'gkd');
</script>
<template>
  <div v-if="show" class="tip custom-block github-alert">
    <p class="custom-block-title">下载提示</p>
    <p>检测到您在应用内无法下载 APK，请点击右上角-外部打开后下载</p>
  </div>
</template>
