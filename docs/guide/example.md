# 选择示例 {#title}

一些选择器及其相关作用说明

## 选择根节点 {#e-1}

- `[parent=null]`
- `[depth=0]`

## 选择子节点 {#e-2}

选择一个 `ImageView` 节点, 并要求其父节点是 `LinearLayout`

[`LinearLayout > ImageView`](https://i.gkd.li/i/16076188?gkd=TGluZWFyTGF5b3V0ID4gSW1hZ2VWaWV3)

选择一个 `ImageView` 节点, 并要求其父节点的父节点是 `ViewGroup[vid="avatar_layout"]`

[`ViewGroup[vid="avatar_layout"] >2 ImageView`](https://i.gkd.li/i/16076188?gkd=Vmlld0dyb3VwW3ZpZD0iYXZhdGFyX2xheW91dCJdID4yIEltYWdlVmlldw)

选择一个 `ImageView[vid="search_icon"]` 节点, 并要求祖先节点是 `FrameLayout[vid="content_layout"]`, `n`可以是任意正整数, 下同

[`FrameLayout[vid="content_layout"] >n ImageView[vid="search_icon"]`](https://i.gkd.li/i/16076188?gkd=RnJhbWVMYXlvdXRbdmlkPSJjb250ZW50X2xheW91dCJdIEltYWdlVmlld1t2aWQ9InNlYXJjaF9pY29uIl0)

## 末尾子节点 {#e-3}

选择一个 `ImageView` 节点, 并要求是其父节点是最后一个子节点

[`ImageView[index=parent.childCount.minus(1)]`](https://i.gkd.li/i/16076188?gkd=SW1hZ2VWaWV3W2luZGV4PXBhcmVudC5jaGlsZENvdW50Lm1pbnVzKDEpXQ)

## 选择兄弟节点 {#e-4}

选择一个 `LinearLayout[desc="搜索栏，按钮"]` 节点, 并要求其兄弟节点是 `ViewGroup[desc="个人主页，按钮"]`

- [`ViewGroup[desc="个人主页，按钮"] + LinearLayout[desc="搜索栏，按钮"]`](https://i.gkd.li/i/16076188?gkd=Vmlld0dyb3VwW2Rlc2M9IuS4quS6uuS4u-mhte-8jOaMiemSriJdICsgTGluZWFyTGF5b3V0W2Rlc2M9IuaQnOe0ouagj--8jOaMiemSriJd)
- [`@LinearLayout[desc="搜索栏，按钮"] - ViewGroup[desc="个人主页，按钮"]`](https://i.gkd.li/i/16076188?gkd=QExpbmVhckxheW91dFtkZXNjPSLmkJzntKLmoI_vvIzmjInpkq4iXSAtIFZpZXdHcm91cFtkZXNjPSLkuKrkurrkuLvpobXvvIzmjInpkq4iXQ)

选择一个 `[text$="顶级入耳"]` 节点, 并要求其兄弟节点是 `[vid="cover_layout"]`

- [`[vid="cover_layout"] +n [text$="顶级入耳"]`](https://i.gkd.li/i/16076188?gkd=W3ZpZD0iY292ZXJfbGF5b3V0Il0gK24gW3RleHQkPSLpobbnuqflhaXogLMiXQ)
- [`@[text$="顶级入耳"] -n [vid="cover_layout"]`](https://i.gkd.li/i/16076188?gkd=QFt0ZXh0JD0i6aG257qn5YWl6ICzIl0gLW4gW3ZpZD0iY292ZXJfbGF5b3V0Il0)

## 选择父节点 {#e-5}

选择一个 `ViewGroup[desc^="直播"]` 节点, 并要求其子节点是 `FrameLayout[vid="cover_layout"]` 或 `ViewGroup[vid="live_text_container"]` 或 `TextView[vid="title_v2"]`

- [`FrameLayout[vid="cover_layout"] < ViewGroup[desc^="直播"]`](https://i.gkd.li/i/16076188?gkd=RnJhbWVMYXlvdXRbdmlkPSJjb3Zlcl9sYXlvdXQiXSA8IFZpZXdHcm91cFtkZXNjXj0i55u05pKtIl0)
- [`ViewGroup[vid="live_text_container"] <3 ViewGroup[desc^="直播"]`](https://i.gkd.li/i/16076188?gkd=Vmlld0dyb3VwW3ZpZD0ibGl2ZV90ZXh0X2NvbnRhaW5lciJdIDwzIFZpZXdHcm91cFtkZXNjXj0i55u05pKtIl0)
- [`TextView[vid="title_v2"] <n ViewGroup[desc^="直播"]`](https://i.gkd.li/i/16076188?gkd=VGV4dFZpZXdbdmlkPSJ0aXRsZV92MiJdIDxuIFZpZXdHcm91cFtkZXNjXj0i55u05pKtIl0)

## 在指定节点的子节点内查找指定选择器 {#e-6}

一般在末尾节点支持 [快速查询](/guide/optimize#fast-query) 的情况下使用

在节点 `ViewGroup[vid="live_text_container"]` 的子节点内查找 `[text="直播"]`

[`@[text="直播"] <<n ViewGroup[vid="live_text_container"]`](https://i.gkd.li/i/16076188?gkd=QFt0ZXh0PSLnm7Tmkq0iXSA8PG4gVmlld0dyb3VwW3ZpZD0ibGl2ZV90ZXh0X2NvbnRhaW5lciJd)

在节点 `FrameLayout[vid="swipe_layout"]` 的子节点内查找 `LinearLayout > @[text="直播"]`

[`LinearLayout > @[text="直播"] <<n [vid="swipe_layout"]`](https://i.gkd.li/i/16076188?gkd=TGluZWFyTGF5b3V0ID4gQFt0ZXh0PSLnm7Tmkq0iXSA8PG4gW3ZpZD0ic3dpcGVfbGF5b3V0Il0)

## 组合使用 {#e-7}

[`ImageView < FrameLayout <n ViewGroup[desc^="直播"] - ViewGroup >4 FrameLayout[index=0] +2 FrameLayout > @TextView[index=parent.childCount.minus(1)] <<n FrameLayout[vid="content"]`](https://i.gkd.li/i/16076188?gkd=SW1hZ2VWaWV3IDwgRnJhbWVMYXlvdXQgPG4gVmlld0dyb3VwW2Rlc2NePSLnm7Tmkq0iXSAtIFZpZXdHcm91cCA-NCBGcmFtZUxheW91dFtpbmRleD0wXSArMiBGcmFtZUxheW91dCA-IEBUZXh0Vmlld1tpbmRleD1wYXJlbnQuY2hpbGRDb3VudC5taW51cygxKV0gPDxuIEZyYW1lTGF5b3V0W3ZpZD0iY29udGVudCJd)

## 一些方法用例 {#e-8}

### `getChild()`
选择一个 `ViewGroup[desc^="直播"]` 节点, 并要求其**第1位子节点**的`vid`等于 `cover_layout`

- [`ViewGroup[desc^="直播"][getChild(0).vid="cover_layout"]`](https://i.gkd.li/i/16076188?gkd=Vmlld0dyb3VwW2Rlc2NePSLnm7Tmkq0iXVtnZXRDaGlsZCgwKS52aWQ9ImNvdmVyX2xheW91dCJd)

选择一个 `ViewGroup[desc^="直播"]` 节点, 并要求其**第3位子节点内的第1位子节点**类型为 `TextView`

- [`ViewGroup[desc^="直播"][getChild(2).getChild(0).name$="TextView"]`](https://i.gkd.li/i/16076188?gkd=Vmlld0dyb3VwW2Rlc2NePSLnm7Tmkq0iXVtnZXRDaGlsZCgyKS5nZXRDaGlsZCgwKS5uYW1lJD0iVGV4dFZpZXciXQ)

选择一个 `ViewGroup[desc^="直播"]` 节点, 并要求其**末尾子节点**的`vid`等于 `more`

- [`ViewGroup[desc^="直播"][getChild(childCount.minus(1)).vid="more"]`](https://i.gkd.li/i/16076188?gkd=Vmlld0dyb3VwW2Rlc2NePSLnm7Tmkq0iXVtnZXRDaGlsZChjaGlsZENvdW50Lm1pbnVzKDEpKS52aWQ9Im1vcmUiXQ)

