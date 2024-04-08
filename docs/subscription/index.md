# 订阅规则 {#title}

GKD 的本地规则和远程规则都是订阅, 它们的格式完全一致, 不同之处在于本地订阅用户可以自行更改, 远程规则需要自动更新

订阅使用 [JSON5](https://json5.org/) 语法, JSON5 是 JSON 的兼容扩展, 它无需键引号, 支持注释

如下便是一个最简单的空规则的订阅文件的内容

```json5
// gkd.json5
{
  id: 233,
  name: 'Subscription',
  version: 0,
  author: 'author',
  updateUrl: 'https://gist.github.com/lisonge/3f5693182ad4ef5e307be760dba22bcb/raw/gkd.json5',
  checkUpdateUrl: 'https://gist.github.com/lisonge/3f5693182ad4ef5e307be760dba22bcb/raw/gkd.json5',
  supportUri: 'https://gkd.li/',
  categories: [],
  globalGroups: [],
  apps: [],
}
```

同时你也可以通过下面的链接来添加它

```txt
https://gist.github.com/lisonge/3f5693182ad4ef5e307be760dba22bcb/raw/gkd.json5
```

上面配置的各项字段的说明注释可在 [API](/api/interfaces/RawSubscription) 查看

## 本地自定义输入 {#local-input}

下面介绍在 GKD 的规则输入框分别能输入什么类型规则

### 应用规则 {#app-rule}

位置: 首页-订阅-本地订阅-应用规则

![image](https://github.com/gkd-kit/gkd/assets/38517192/76d0bc58-de43-416d-9454-f980e8075660){width=50%}

此处可添加 [应用规则](/api/interfaces/RawApp), 如下是一个简单的规则示例, 它由 [快照-13070251](https://i.gkd.li/i/13070251?gkd=VGV4dFZpZXdbaWQ9ImNvbS56aGlodS5hbmRyb2lkOmlkL2J0bl9za2lwIl0) 而来

```json5
{
  id: 'com.zhihu.android',
  name: '知乎',
  groups: [
    {
      key: 0,
      name: '开屏广告',
      rules: { matches: 'TextView[id="com.zhihu.android:id/btn_skip"]' },
      snapshotUrls: ['https://i.gkd.li/i/13070251'],
    },
  ],
}
```

TODO
