<script setup lang="ts">
import DownloadText from './DownloadText.vue';
import { betaRelease, stableRelease } from '../data/apk.load';
</script>
<template>
  <table>
    <thead>
      <tr>
        <th>版本</th>
        <th>下载链接</th>
        <th>更新日期</th>
        <th>备注</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>正式版</td>
        <td>
          <DownloadText
            :href="stableRelease.href"
            :name="stableRelease.filename"
          />
        </td>
        <td>{{ stableRelease.date }}</td>
        <td>稳定版</td>
      </tr>
      <tr v-if="betaRelease.filename !== stableRelease.filename">
        <td>测试版</td>
        <td>
          <DownloadText :href="betaRelease.href" :name="betaRelease.filename" />
        </td>
        <td>{{ betaRelease.date }}</td>
        <td>更新快不稳定</td>
      </tr>
    </tbody>
  </table>
</template>
