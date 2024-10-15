<script setup lang="ts">
import DownloadText from './DownloadText.vue';
import { data } from '../data/apk.data';
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
          <DownloadText :href="data.stable.href" :name="data.stable.filename" />
        </td>
        <td>{{ data.stable.date }}</td>
        <td>稳定版</td>
      </tr>
      <tr>
        <td>测试版</td>
        <td>
          <DownloadText :href="data.beta.href" :name="data.beta.filename" />
        </td>
        <td>{{ data.beta.date }}</td>
        <td>更新快不稳定</td>
      </tr>
    </tbody>
  </table>
</template>
