<script setup lang="ts">
import { onMounted } from 'vue';
import DownloadText from './DownloadText.vue';
import {
  betaReleaseRef,
  stableReleaseRef,
  refreshRelease,
} from '../data/apk.ref';

onMounted(refreshRelease);
</script>
<template>
  <table>
    <thead>
      <tr>
        <th>版本</th>
        <th>下载</th>
        <th>大小</th>
        <th>日期</th>
        <th>备注</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>正式版</td>
        <td>
          <DownloadText
            :href="stableReleaseRef.href"
            :name="stableReleaseRef.filename"
          />
        </td>
        <td>{{ stableReleaseRef.fileSizeDesc }}</td>
        <td>{{ stableReleaseRef.date }}</td>
        <td>稳定版</td>
      </tr>
      <tr v-if="betaReleaseRef.filename !== stableReleaseRef.filename">
        <td>测试版</td>
        <td>
          <DownloadText
            :href="betaReleaseRef.href"
            :name="betaReleaseRef.filename"
          />
        </td>
        <td>{{ betaReleaseRef.fileSizeDesc }}</td>
        <td>{{ betaReleaseRef.date }}</td>
        <td>更新快不稳定</td>
      </tr>
    </tbody>
  </table>
</template>
