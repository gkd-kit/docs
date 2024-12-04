# 常见问题 {#title}

一些可能影响使用体验的问题和对应解决方案, 某些方案可能并不适用您的机型系统

如您有更好的方案或想对现有方案进行补充, 请点击底部 `为此页提供修改建议`

## 耗电说明 {#power}

首先 GKD 默认情况下并不耗电，有的人以为关闭更新检测，关闭日志就能减少耗电，并不正确

真正的耗电在于 启用的规则 和 当前应用界面无障碍节点数量及无障碍事件刷新频率

如果想追求低耗电，那应该开启少量的规则，由于之前的默认规则数量有 1300+，很多人喜欢无脑开启规则

开启这么多规则，并且在这些规则匹配的界面使用手机，不耗电是不可能的

此外，某些软件如抖音的无障碍节点数量比较多，并且产生无障碍事件频率也比较高

长时间下使用此类软件的规则会比较耗电，请自行考虑后再启用

## 未识别应用 {#unknown-app}

某些用户可能选择将应用安装到其他用户空间隔离

这导致 GKD 无法从当前应用列表识别到应用已安装

对于未安装的应用, 有以下影响

- 全局规则 的内部配置禁用失效
- 应用规则 不会启用

对于 `全局规则` 可使用手动编辑禁用, 添加 appId 到禁用列表后将生效

若要开启 `应用规则`, 在对应订阅-应用规则-显示未安装应用-打开右侧开关即可

::: details 不生效原因
这是因为某些订阅有将近 2k 个应用, 而一般用户最多使用到 200 个

如果将 未安装的应用 的应用规则也全部开启, 这将额外占用 1800 个应用的无效规则配置内存
:::

## 后台运行 {#persistent}

如何尽量保持后台运行不被系统回收

- 任务切换界面给 GKD 应用卡片加锁即可

一般情况下, 使用此项即可正常后台运行, 如果不行请使用下面的步骤

- 打开 GKD 首页, 开启 `常驻通知`
- 打开 GKD 设置, 开启 `后台隐藏`
- 允许后台活动, 关闭省电策略, 或者设置 GKD 的省电策略为无限制
- 允许 GKD 自启动

## 受限制的设置 {#restriction}

无障碍列表界面提示

> 受限制的设置(出于安全考虑，此设置目前不可用)

某些系统对于不在应用商店等可信任来源安装的应用不能直接开启无障碍权限

解除步骤: GKD 应用信息-右上角-允许受限制的设置

<ImageTable :images="[['0014.png', '0015.png', '0016.png','0017.png',]]" />

如果按步骤开启后 无障碍列表 仍然提示不可用, 可尝试 **重启设备**

如果应用信息右上角没有 `允许受限制的设置` 选项, 请参考下一节方案

## 无法开启无障碍 {#unable_open_a11y}

某些系统如 ColorOS 有更严格的无障碍限制

如果你是其他来源安装或 GKD 内部更新后也会无法开启无障碍, 表现以下行为

- 提示 受限制的设置, 但是没有找到 允许受限制的设置 的选项
- 不提示 受限制的设置, 无障碍开启按钮可点击, 但点击后没有响应, 无法开启

可以通过以下方式解决, 可在 [开始使用](/guide/) 获取 APK 文件

- 使用系统信任的方式进行安装, 例如在系统文件管理中查看 APK 文件后点击安装

- 如果使用系统安装器, 但是在冻结了应用安装器 `com.oplus.appdetail` 状态下安装的 APK, 需解冻后重新安装

- 使用 [App Ops](https://appops.rikka.app/) 在权限管理中手动授予 ACCESS_RESTRICTED_SETTINGS 权限
  <GImg src="0037.png" />

## 关闭无障碍警告弹窗 {#close_warn_dialog}

> [!TIP] 建议
> 授予 `写入安全设置权限` 后可自行开启无障碍, 而无需设置此项

这个方案不一定适用所有机型

大多数设备开启无障碍时都会出现 10s 的无障碍警告弹窗

若是只需要开启一次则无所谓但是如果开启次数比较多每次都有这个警告等待就很烦人了

<ImageTable :images="[['0004.png', '0005.png']]" />

你可能已经看到这个界面还有一个开关, 也就是下方的 `快捷方式` 开关

打开一次下面这个快捷方式开关后, 上面的的开启按钮就不会出现警告弹窗了, 但是你会发现屏幕侧边出现了一个应用小图标, 多数情况下我们并不需要这个图标

到无障碍界面-"无障碍"按钮-使用按钮或手势-点击切换为手势即可隐藏

以 Xiaomi HyperOS 为例子, 下面是完整的关闭弹窗流程截图

<ImageTable :images="[['0009.png', '0010.png', '0011.png', '0012.png']]" />

## adb 授权失败 {#adb_failed}

在使用 adb 手动授予 `写入安全设置权限` 时可能会提示权限不够，具体报错如下:

```text
adb shell pm grant li.songe.gkd android.permission.WRITE_SECURE_SETTINGS

Exception occurred while executing 'grant':
java.lang.SecurityException: grantRuntimePermission: Neither user 2000 nor current process has android.permission.GRANT_RUNTIME_PERMISSIONS.
  at android.app.ContextImpl.enforce(ContextImpl.java:2384)
  at android.app.ContextImpl.enforceCallingOrSelfPermission(ContextImpl.java:2412)
  at com.android.server.pm.permission.PermissionManagerServiceImpl.grantRuntimePermissionInternal(PermissionManagerServiceImpl.java:1383)
  at com.android.server.pm.permission.PermissionManagerServiceImpl.grantRuntimePermission(PermissionManagerServiceImpl.java:1365)
  at com.android.server.pm.permission.PermissionManagerService.grantRuntimePermission(PermissionManagerService.java:573)
  at android.permission.PermissionManager.grantRuntimePermission(PermissionManager.java:610)
  at com.android.server.pm.PackageManagerShellCommand.runGrantRevokePermission(PackageManagerShellCommand.java:2717)
  at com.android.server.pm.PackageManagerShellCommand.onCommand(PackageManagerShellCommand.java:301)
  at com.android.modules.utils.BasicShellCommandHandler.exec(BasicShellCommandHandler.java:97)
  at android.os.ShellCommand.exec(ShellCommand.java:38)
  at com.android.server.pm.PackageManagerService$IPackageManagerImpl.onShellCommand(PackageManagerService.java:6840)
  at android.os.Binder.shellCommand(Binder.java:1092)
  at android.os.Binder.onTransact(Binder.java:912)
  at android.content.pm.IPackageManager$Stub.onTransact(IPackageManager.java:4352)
  at com.android.server.pm.PackageManagerService$IPackageManagerImpl.onTransact(PackageManagerService.java:6824)
  at android.os.Binder.execTransactInternal(Binder.java:1392)
  at android.os.Binder.execTransact(Binder.java:1299)
```

下面参考 [shizuku 文档](https://shizuku.rikka.app/guide/setup/#faq) 的解决方案

- HyperOS/MIUI（小米、POCO）\
  在 `开发者选项` 中开启 `USB 调试（安全设置）`。注意不是 `USB 调试`

- ColorOS（OPPO & OnePlus）\
  在 `开发者选项` 中关闭 `权限监控` 或打开 `禁止权限监控`

- Flyme（魅族）\
  在 `开发者选项` 中关闭 `Flyme 支付保护`

关闭限制后重新运行命令即可, 授权成功后可重新打开这些限制
