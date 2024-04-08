# 订阅规则 {#title}

GKD 的本地规则和远程规则都是订阅, 它们的格式完全一致, 不同之处在于本地订阅用户可以自行更改, 远程规则需要自动更新

订阅使用 [JSON5](https://json5.org/) 语法, 如下便是一个最简单的没有规则的订阅文件的内容

```json5
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

TODO
