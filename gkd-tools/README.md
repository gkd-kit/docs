# @gkd-kit/tools

GKD 自建订阅工具

- 校验重复项, 快照链接, 选择器, 分类
- 自动构建并生成 CHANGELOG

详细使用见 [subscription-template](https://github.com/gkd-kit/subscription-template)

## 命令行

安装 `@gkd-kit/tools` 后可直接调用 `gkd-tools`，无需编写包装脚本或使用 `node -e`。需要 Node.js 22.18 或更高版本；TypeScript 订阅文件使用 Node 原生类型擦除运行，需使用带扩展名的相对导入和可擦除的 TS 语法。

```sh
pnpm exec gkd-tools check
pnpm exec gkd-tools build
pnpm exec gkd-tools version
pnpm exec gkd-tools update-version
pnpm exec gkd-tools check-api
pnpm exec gkd-tools sync
```

- `check`、`build` 默认读取 `src/subscription.ts` 的默认导出，也可传入其他 TS/JS 模块或 JSON/JSON5 文件。
- `build` 先校验，再生成订阅和变更记录；输出设置读取 `package.json.gkd`，可用 `--out-dir` 覆盖输出目录。
- `version` 只向标准输出写入订阅版本，适合 shell 和 CI；`update-version` 将该版本写入当前 `package.json` 版本号的第三段。两者都可指定版本文件，默认读取配置中的版本文件。
- `check`、`build` 不隐式查询远程 API 版本；需要时添加 `--check-api`，或单独执行 `check-api`。用户自己的订阅模块仍可能执行网络请求。
- `sync` 请求 npmmirror 同步当前包，HTTP 失败会以非零状态退出。

例如，原来在 workflow 中通过动态 import 读取版本，可以改为：

```sh
version=$(pnpm exec gkd-tools version)
echo "version=${version}" >> "$GITHUB_OUTPUT"
```

模板的 `package.json` 可直接写：

```json
{
  "scripts": {
    "check": "gkd-tools check",
    "build": "gkd-tools build"
  }
}
```

代码中需要读取版本值时，可以使用返回数字的 `getGkdVersion()`，无需捕获 `stdoutGkdVersion()` 的输出。selector 适配使用 0.6 系列的 `Selector.compile` 和 `getTypeErrors`，保留其语法、类型和正则错误诊断。

## 自定义 README 和 CHANGELOG

结构化数据与默认渲染分开提供，数据中的名称和字段值未经 HTML 转义，不含 `+N` 或箭头等展示格式：

```ts
import {
  getSubscriptionSummary,
  getSubscriptionDiff,
  renderReadme,
  renderChangelog,
} from '@gkd-kit/tools';

const summary = getSubscriptionSummary(subscription);
const diff = getSubscriptionDiff(oldSubscription, subscription);

// 可直接读取结构化数据编写模板，也可调用内置渲染器。
const readme = renderReadme(summary);
const changelog = renderChangelog(diff);
```

- `summary` 包含原订阅 `subscription`、数量 `totals`、类别及其规则组归属 `categories`、`globalGroups` 和 `apps`。未分类分组的 `category` 为 `null`。
- `diff.kind` 为 `initial`、`unchanged`、`version-only` 或 `changed`；即使完全无变化也返回结构化对象。
- `diff.summary` 包含各类数量的 `added / changed / removed / before / after`。
- `diff.categories` 提供类别自身的 `kind / before / after / metadata`，以及规则组归属差异 `groups` 和数量 `stats`。`key: null` 表示未分类；规则组引用带 `appId`，避免不同应用的同名 key 混淆。此处增加、减少也包含移入、移出。
- `diff.apps` 提供各应用的 `before / after / metadata / groups / stats / groupsReordered`；新增、移除应用也展开规则组差异。
- `diff.metadata` 和应用、类别的 `metadata` 使用 `{ field, before, after }`，缺失字段的值为 `undefined`。`collectionChanges` 表示集合重排或空值表示变化。
- `groups` 和 `globalGroups` 的差异格式为 `{ added, changed, removed }`，其中 `changed` 为 `{ oldItem, newItem }[]`。

数据包含输入对象的引用，请将其视为只读；外部模板自行处理目标格式所需的转义。`getReadme(subscription)` 和 `getChangelog(before, after)` 是直接调用默认渲染的便捷函数；`renderChangelog` 在 `unchanged` 时返回 `undefined`。旧的 `getSummary` 接口已移除。

构建时可直接传入模板回调：

```ts
import { updateDist } from '@gkd-kit/tools';
import subscription from './src/subscription.ts';

await updateDist(subscription, {
  outDir: 'dist',
  renderReadme: (summary) => `# 订阅概览\n\n应用数量：${summary.totals.apps}\n`,
  renderChangelog: async (diff) =>
    `# 变更记录\n\n新增规则组：${diff.summary.appGroups.added}\n`,
});
```

回调接收自动递增版本后的数据，可返回字符串或 `Promise<string>`，空字符串也会原样写入。两个模板都成功生成后才写入文件；无订阅内容变化时仍跳过构建，不调用模板。只更换模板时，可单独调用渲染接口并写入文件；重新渲染历史差异需自行保留旧订阅。函数回调通过程序 API 传入，不放入 `package.json.gkd`，CLI 使用默认模板。

## 本仓库开发

在仓库根目录安装依赖并构建工具：

```sh
pnpm install
pnpm build:packages
pnpm --filter @gkd-kit/template check
pnpm --filter @gkd-kit/template build
```
