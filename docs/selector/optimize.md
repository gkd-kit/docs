# 查询优化 {#title}

一些关于查询优化的说明

## 查找根节点 {#query-root}

选择器通过满足下列格式的属性选择器标识根节点

- `[parent=null]`
- `A[id='xxx'][parent=null][text='xxx']`

即只需存在一个 `[parent=null]` 就满足条件, 以下是对此的优化

### 主动查询 {enforce}

一般的选择器如 `LinearLayout > TextView`, 选择器需要从 根节点/事件节点 使用深度先序顺序遍历子孙节点并判断是否满足条件

如果屏幕上有 n 个节点, 判断逻辑需要运行 n 次

但是如果选择器是类似 `TextView <3 LinearLayout <2 [parent=null]`, 由于在右侧标明了从根节点查找

因此上面的 `深度先序顺序遍历子孙节点` 将省略, 只进行一次判断, 不需要判断 n 次

但是如果你在子查询里使用 `<<(n)`, 例如 `TextView <<(n) [parent=null]`

根据上面说明的优化, 虽然也只有一次判断, 但是由于 `<<(n)` 导致内部的子判断也是 n 次, 实际上没有优化判断次数

实际上, 在初始匹配节点是 根节点 的情况下, `TextView` 和 `@TextView <<(n) [parent=null]` 完全等价

### 祖先节点 {ancestor}

在示例 `A <3 [parent=null] >n TextView` 中, 选择器找到 `TextView` 后, 根据 `>n` 表示任意祖先节点

在默认情况下, 如果 `TextView` 的层级很深, 那必然需要多次调用 获取父节点 才能最终匹配

但是如果左侧的选择器是 `[parent=null] >n`, 这表示找到根节点, 选择器此时不会去执行多次调用 获取父节点

在 GKD 内部, 根节点可以直接通过 API 获取, 因此 `[parent=null] >n` 只需要调用一次方法

## 快速查询 {#fast-query}

> [!TIP] 提示
> 此优化需要设置 [fastQuery](/api/interfaces/RawCommonProps#fastquery) 来启用

一般情况下, 选择器 `[vid="name"]` 需要从 根节点/事件节点 使用深度先序顺序遍历子孙节点并判断是否满足条件

但是 Android 提供了如下两个快速获取节点的 Api

- [findAccessibilityNodeInfosByViewId](https://developer.android.google.cn/reference/android/view/accessibility/AccessibilityNodeInfo#findAccessibilityNodeInfosByViewId(java.lang.String))
- [findAccessibilityNodeInfosByText](https://developer.android.google.cn/reference/android/view/accessibility/AccessibilityNodeInfo#findAccessibilityNodeInfosByText(java.lang.String))

这使得可以通过 `id`/`vid`/`text` 直接获取子孙节点

对此我们需要规定符合特定条件的选择器来调用这些 Api 从而跳过手动遍历子孙节点

所有 `末尾属性选择器`的`第一个属性选择表达式`符合下面的结构之一

- `[id='abc']`
- `[vid='abc']`
- `[text='abc']`
- `[text^='abc']`
- `[text*='abc']`
- `[text$='abc']`

或者使用 `||` 将它们连接形成的逻辑表达式也符合条件, 即如下格式

- `[id='abc' || id='abc2']`
- `[id='abc' || vid='abc' || text='abc' || text^='abc' || text*='abc' || text$='abc']`

这些规定的格式都是为了提取 `id`/`vid`/`text` 来调用上面的两个 Android Api

下面给出实际示例: ✅ 表示符合格式, ❎ 表示不符合格式

- `A > B + C[id='x'][childCount=2]` ✅
- `A > B + C[childCount=2][id='x']` ❎
- `A > B + C[id='x' || text='manbaout' || text*='ikun'][childCount=2]` ✅
- `A > B + C[childCount=2][id='x' || text='manbaout' || text*='ikun']` ❎

这样一个选择器只能在右侧使用快速查询, 为了在中间的子选择器也能使用

额外规定如果属性选择器如果符合上面格式并且右侧是 `<<(n)`, 也能在局部使用快速查找

示例 `A > B + C[id='x'][childCount=2] <<(n) D` 中的 `C[id='x'][childCount=2] <<(n)` 可以使用局部快速查找

> [!TIP] 提示
> 实际上从根节点开始匹配的选择器如 `A > B` 都可等价为 `A > @B <<(n) [parent=null]`

下面给出满足局部查询优化的示例: ✅ 表示符合格式, ❎ 表示不符合格式

- `A > B + C[id='x'][childCount=2] <<(n) D` ✅
- `A > B + C[childCount=2][id='x'] <<(n) D` ❎

上面介绍的是只有一个局部选择器的情况, 下面给出多个局部快速查找的的示例

如 `A > C[id='x'] <<(n) D[id='y'] <<(n) E`, 其中的 `C[id='x'] <<(n)` 和 `D[id='y'] <<(n)` 都可以使用局部快速查找

---

以 [`[vid="image"] <<(n) [vid="recyclerView"] <<(n) [vid="content_layout"]`](https://i.gkd.li/i/16201605?gkd=W3ZpZD0iaW1hZ2UiXSA8PG4gW3ZpZD0icmVjeWNsZXJWaWV3Il0gPDxuIFt2aWQ9ImNvbnRlbnRfbGF5b3V0Il0) 为例

上面的选择器存在 3 个快速查找优化

- `[vid="content_layout"]` 从 根节点 优化查询找到 `content_layout`
- `[vid="recyclerView"]` 从 `content_layout` 优化查询找到 `recyclerView`
- `[vid="image"]` 从 `recyclerView` 优化查询找到 `image`

也就是只需要调用 `findAccessibilityNodeInfosByViewId` 3 次即可得到目标节点

如果是从根节点开始查询, 根据快照内的 选择器路径视图

- `[vid="content_layout"]` 从 根节点 需要 7 次找到 `content_layout`
- `[vid="recyclerView"]` 从 `content_layout` 需要 48 次找到 `recyclerView`
- `[vid="image"]` 从 `recyclerView` 需要 44 次找到 `image`
