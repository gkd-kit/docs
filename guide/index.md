# 开始使用

<script setup>
import { apkUrl, apkName, apkImgUrl } from '/.vitepress/utils/apk';
</script>

## 下载安装

<ClientOnly>
大陆用户可点击 <a rel="noopener noreferrer" :href="apkUrl">{{ apkName }}</a> 下载
</ClientOnly>

或者扫描下方二维码即可下载最新版本

<ClientOnly>
<img :src="apkImgUrl" data-zoomable alt="" />
</ClientOnly>

请注意上面的链接/二维码为动态生成, 如需分享请复制地址栏链接

海外用户可前往源仓库 [github-releases](https://github.com/gkd-kit/gkd/releases/latest) 下载

下载完毕后, 在您的 Android 手机上安装并打开

## 授权使用

打开后您会看到如下界面

TO-DO

点击无障碍权限右侧的 `授权` 按钮即可前往设置的无障碍界面授权

以 MIUI14 为例, 下面为完整的授权流程截图

TODO

如果您的手机的无障碍界面无法授权 GKD 或者显示受限制的应用

这是 Android13 的限制, 对于不在应用商店等可信任来源安装的应用不能直接开启无障碍权限

您需要解除这个限制, 解除限制的方法在 [疑难解答](/faq/)

限制解除后, 重新按照上面的授权流程即可开启无障碍权限
