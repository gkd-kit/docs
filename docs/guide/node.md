# 属性方法 {#title}

此章节介绍各个类型可用的属性及其方法

## null

> [!NOTE] 提示
> `null` 无任何属性方法, 并且在无特殊说明时, 属性方法当调用者或者参数是 `null` 时, 均返回 `null`

当 `name` 是 `null` 时, `name.length` 为 `null`

当 `parent` 是 `null` 时, `parent.getChild(0)` 为 `null`

当 `index` 是 `null` 时, `parent.getChild(index)` 为 `null`

## boolean

| 方法名 | 参数      | 返回类型  | 描述                                                  |
| ------ | --------- | --------- | ----------------------------------------------------- |
| toInt  |           | `int`     | 转为 0 或 1                                           |
| or     | `boolean` | `boolean` | a \|\| b                                              |
| and    | `boolean` | `boolean` | a && b                                                |
| not    |           | `boolean` | !a                                                    |
| ifElse | `T`, `T`  | `T`       | if(a) T else T <br> T 是任意类型, 两个参数均支持为 null |

## int

| 方法名    | 参数  | 返回类型              | 描述                 |
| --------- | ----- | --------------------- | -------------------- |
| toString  |       | [`string`](#string)   | 转为10进制字符串     |
| toString  | `int` | `string`              | 转为对应进制的字符串 |
| plus      | `int` | `string`              | 加上                 |
| minus     | `int` | `string`              | 减去                 |
| times     | `int` | `string`              | 乘以                 |
| div       | `int` | `string`              | 除以                 |
| rem       | `int` | `string`              | 取余                 |
| more      | `int` | [`boolean`](#boolean) | a > b                |
| moreEqual | `int` | `boolean`             | a >= b               |
| less      | `int` | `boolean`             | a < b                |
| lessEqual | `int` | `boolean`             | a <= b               |

## string

| 标识符 | 属性类型      | 描述       |
| ------ | ------------- | ---------- |
| length | [`int`](#int) | 字符串长度 |

| 方法名    | 参数           | 返回类型 | 描述                                  |
| --------- | -------------- | -------- | ------------------------------------- |
| get       | [`int`](#int)  | `string` | 获取对应索引字符串                    |
| at        | `int`          | `string` | 同上,但是参数传负数时从最后一个字符取 |
| substring | `int`          | `string` | 截取指定索引到结尾字符串              |
| substring | `int`,`int`    | `string` | 截取指定间隔字符串                    |
| toInt     |                | `int`    | 转为10进制数字                        |
| toInt     | `int`          | `int`    | 转为指定进制的数字                    |
| indexOf   | `string`       | `int`    | 查找指定字符串的索引                  |
| indexOf   | `string`,`int` | `int`    | 从指定索引开始查找指定字符串的索引    |

## node

> [!IMPORTANT] 重要提示
> 此类型下以 \_ 开头的属性只能在网页快照调试工具上使用, 真机不可用

| 标识符        | 属性类型            | 描述       |
| ------------- | ------------------- | ---------- |
| \_id          | [`int`](#int)       |            |
| \_pid         | `int`               |            |
| id            | [`string`](#string) |            |
| vid           | `string`            |            |
| name          | `string`            |            |
| text          | `string`            |            |
| desc          | `string`            |            |
| clickable     | `boolean`           |            |
| focusable     | `boolean`           |            |
| checkable     | `boolean`           |            |
| checked       | `boolean`           |            |
| editable      | `boolean`           |            |
| longClickable | `boolean`           |            |
| visibleToUser | `boolean`           |            |
| left          | `int`               |            |
| top           | `int`               |            |
| right         | `int`               |            |
| bottom        | `int`               |            |
| width         | `int`               |            |
| height        | `int`               |            |
| childCount    | `int`               |            |
| index         | `int`               |            |
| depth         | `int`               |            |
| parent        | [`node`](#node)     | 获取父节点 |

| 方法名   | 参数  | 返回类型        | 描述                 |
| -------- | ----- | --------------- | -------------------- |
| getChild | `int` | [`node`](#node) | 获取指定索引的子节点 |

## context

context 具有 [node](#node) 的所有属性方法, 下面只介绍额外属性方法

| 标识符  | 属性类型              | 描述                                               |
| ------- | --------------------- | -------------------------------------------------- |
| prev    | [`context`](#context) | 右侧属性选择器的节点上下文 <br> 最右侧的 prev=null |
| current | [`node`](#node)       | 当前节点 <br> current.id=id                        |

示例

```text
FrameLayout[prev.name$='ImageView'] > ImageView[current.name=name]
```

中的 prev 就是 FrameLayout 右侧的 ImageView, current 就是 ImageView

| 方法名  | 参数 | 返回类型              | 描述                                                                                                     |
| ------- | ---- | --------------------- | -------------------------------------------------------------------------------------------------------- |
| getPrev | int  | [`context`](#context) | 快捷获取深层 prev <br> getPrev(0) -> prev <br> getPrev(1) -> prev.prev <br> getPrev(2) -> prev.prev.prev |

## global

global 具有 [context](#context) 的所有属性方法, 并且没有任何属性方法能获取 global 的引用, 下面只介绍额外属性方法

| 方法名   | 参数     | 返回类型              | 描述                                  |
| -------- | -------- | --------------------- | ------------------------------------- |
| equal    | `T`, `T` | [`boolean`](#boolean) | a==b <br> T 是任意类型, a,b 允许 null |
| notEqual | `T`, `T` | `boolean`             | a!=b                                  |

示例

```text
[name=''][prev.name=''][current.name=''][parent.name='']
```

- 第一个 `name` 来自 [global](#global), 实际上任何 `xxx`/`xxx()` 都来自 global
- 第二个 `prev.name` 来自 [context](#context)
- 后续的 `current.name`/`parent.name` 都来自 [node](#node)
