# 属性方法 {#title}

此章节介绍各个类型可用的属性及其方法

## null

> [!NOTE] 提示
> `null` 无任何属性方法, 并且属性方法当调用者是 `null` 时, 均返回 `null`

当 `name` 是 `null` 时, `name.length` 为 `null`

当 `parent` 是 `null` 时, `parent.getChild(0)` 为 `null`

## boolean

| 方法名 | 参数 | 返回类型 | 描述        |
| ------ | ---- | -------- | ----------- |
| toInt  |      | `int`    | 转为 0 或 1 |

## int

| 方法名   | 参数  | 返回类型            | 描述                 |
| -------- | ----- | ------------------- | -------------------- |
| toString |       | [`string`](#string) | 转为10进制字符串     |
| toString | `int` | `string`            | 转为对应进制的字符串 |
| plus     | `int` | `string`            | 加上                 |
| minus    | `int` | `string`            | 减去                 |
| times    | `int` | `string`            | 乘以                 |
| div      | `int` | `string`            | 除以                 |
| rem      | `int` | `string`            | 取余                 |

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

| 方法名   | 参数 | 返回类型        | 描述                 |
| -------- | ---- | --------------- | -------------------- |
| getChild | int  | [`node`](#node) | 获取指定索引的子节点 |

## context

属性方法暂与 [node](#node) 一致
