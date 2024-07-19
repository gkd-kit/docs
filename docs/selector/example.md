# 选择示例 {#title}

一些选择器及其相关作用说明

## 选择根节点 {#e-1}

- `[parent=null]`
- `[depth=0]`

## 选择子节点 {#e-2}

选择一个 ImageView 节点, 并要求其父节点是 LinearLayout

[`LinearLayout > ImageView`](https://i.gkd.li/i/16076188?gkd=TGluZWFyTGF5b3V0ID4gSW1hZ2VWaWV3)

## 末尾子节点 {#e-3}

选择一个 ImageView 节点, 并要求是其父节点是最后一个子节点

[`ImageView[index=parent.childCount.minus(1)]`](https://i.gkd.li/i/16076188?gkd=SW1hZ2VWaWV3W2luZGV4PXBhcmVudC5jaGlsZENvdW50Lm1pbnVzKDEpXQ)
