/**
 * 订阅配置类型
 */
export interface RawSubscription {
  /**
   *
   * 当前订阅文件的标识, 如果新旧订阅文件id不一致则更新失败
   *
   * 负数 id 被 GKD 内部使用, 用户无法添加负数 id 的订阅
   *
   */
  id: Integer;

  /**
   * 订阅的名称
   */
  name: string;

  /**
   * 订阅的版本号, 用于检测更新
   *
   * 只有当新订阅的 version 大于本地旧订阅的 version 才执行更新替换本地
   */
  version: Integer;

  /**
   * 作者名称
   */
  author?: string;

  /**
   * GKD 会定时或者用户手动刷新请求这个链接, 如果返回的订阅的 version 大于应用订阅当前的 version , 则更新
   *
   * 如果这个字段不存在, 则使用添加订阅时填写的链接
   */
  updateUrl?: string;

  /**
   * 一个自定义 uri 链接, 用户点击[用户反馈]时, 打开此链接
   *
   * 可以是一个网页链接, 也可以是一个应用内部的 uri 链接
   */
  supportUri?: string;

  /**
   * 一个只需要 id 和 version 的 json5 文件链接, 检测更新时, 优先检测此链接, 如果 id 相等并且 version 增加, 则再去请求 updateUrl
   *
   * 目的是防止订阅文件过大而消耗过多的流量, 如下是一个简单的示例
   * ```json5
   * {
   *   id: 114514,
   *   version: 1919810
   * }
   * ```
   *
   * 支持相对地址, 如果 {@link updateUrl} 或者用户添加订阅时填写的链接是 `https://gkd.li/gkd.json5` 并且 {@link checkUpdateUrl} 是 `./gkd.version.json5`
   *
   * 那么最终请求的链接是 `https://gkd.li/gkd.version.json5`
   *
   */
  checkUpdateUrl?: string;

  /**
   * 此订阅的应用列表
   */
  apps?: RawApp[];

  /**
   * 此订阅的全局规则组列表
   */
  globalGroups?: RawGlobalGroup[];

  /**
   * 此订阅的应用规则分类列表
   */
  categories?: RawCategory[];
}

/**
 * 应用规则应用配置
 */
export interface RawApp {
  /**
   * 应用包名
   */
  id: string;

  /**
   * 如果设备没有安装这个应用, 则使用这个名称显示
   */
  name?: string;

  /**
   * 此应用的规则组列表
   */
  groups: RawAppGroup[];
}

/**
 * 全局规则组
 */
export interface RawGlobalGroup extends RawGroupProps, RawGlobalRuleProps {
  /**
   * 全局规则组的规则列表
   */
  rules: RawGlobalRule[];
}

/**
 * 应用规则分类
 */
export interface RawCategory {
  /**
   * 当前分类在列表中的唯一标识
   *
   * 也是客户端禁用/启用此分类组的依据
   */
  key: Integer;

  /**
   * 分类名称
   *
   * 同时也是分类的依据, 捕获以 name 开头的所有应用规则组, 不捕获全局规则组
   *
   * 示例: `开屏广告` 将捕获 `开屏广告-1` `开屏广告-2` `开屏广告-233` 这类应用规则组
   */
  name: string;

  /**
   * null => 跟随捕获的规则组的 enable 的默认值
   *
   * true => 全部启用捕获的规则组
   *
   * false => 全部禁用捕获的规则组
   *
   * @default null
   */
  enable?: boolean;
}

/**
 * 应用规则
 */
export interface RawAppRule extends RawRuleProps, RawAppRuleProps {}

/**
 * 应用规则组
 */
export interface RawAppGroup extends RawGroupProps, RawAppRuleProps {
  /**
   * 应用规则组的规则列表, 支持多种类型, 下面介绍它的两种简单类型的表示意义
   *
   * ---
   *
   * 示例-1: 简单的字符串直接表示规则的 matches
   * ```json5
   * {
   *   rules: 'A > B'
   * }
   * ```
   * 等价于
   * ```json5
   * {
   *   rules: {
   *     matches: 'A > B',
   *   }
   * }
   * ```
   *
   * ---
   *
   * 示例-2: 也可以是字符串数组表示多个规则的 matches
   * ```json5
   * {
   *   rules: ['A > B', 'A > B']
   * }
   * ```
   * 等价于
   * ```json5
   * {
   *   rules: [
   *     {
   *       matches: 'A > B',
   *     },
   *     {
   *       matches: 'A > B',
   *     },
   *   ],
   * }
   * ```
   */
  rules: IArray<RawAppRule | string>;
}

/**
 * 全局规则
 */
export interface RawGlobalRule extends RawRuleProps, RawGlobalRuleProps {}

/**
 * 全局规则应用配置
 */
export interface RawGlobalApp extends RawAppRuleProps {
  /**
   * 目标应用的包名
   */
  id: string;

  /**
   * 在此应用启用/禁用此规则
   *
   * @default true
   */
  enable?: boolean;
}

/**
 * 全局规则(组)和应用规则(组)的基础通用属性
 */
export interface RawCommonProps {
  /**
   * 单位: 毫秒
   *
   * 当前规则的冷却时间, 或者执行 action 最小间隔
   *
   * @default 1000
   */
  actionCd?: Integer;

  /**
   * 单位: 毫秒
   *
   * 延迟执行: 查询到节点->等待一段时间->再次查询到节点则执行对应 action
   *
   */
  actionDelay?: Integer;

  /**
   * 注意: 将在未来版本弃用此属性, 请使用 {@link fastQuery} 代替
   * 
   * 如果开启, 此规则下的所有 `末尾属性选择器`的`第一个属性选择表达式`符合下面的结构之一的选择器 将使用快速查找
   *
   * - [id='abc']
   * - [vid='abc']
   * - [text='abc']
   * - [text^='abc']
   * - [text*='abc']
   * - [text$='abc']
   *
   * 比如 `A > B + C[id='x'][childCount=2]` 符合, 但 `A > B + C[childCount=2][id='x']` 不符合
   *
   * 它的底层原理是 跳过手动遍历所有节点 直接调用 [findAccessibilityNodeInfosByViewId](https://developer.android.google.cn/reference/android/view/accessibility/AccessibilityNodeInfo#findAccessibilityNodeInfosByViewId(java.lang.String)) / [findAccessibilityNodeInfosByText](https://developer.android.google.cn/reference/android/view/accessibility/AccessibilityNodeInfo#findAccessibilityNodeInfosByText(java.lang.String)) 得到可匹配节点
   *
   * 大多数情况下都能查询到, 在少数某些复杂结构下, 即使目标节点存在, 快速查询也不一定查询到
   *
   * 比如 [Image &lt; \@View + View &gt;2 [text*='广告']](https://github.com/gkd-kit/subscription/blob/1ae87452d287b558f58f9c4e4448a3190e212ca1/src/apps/com.zidongdianji.ts#L26) 虽然符合快速查询的条件但是使用 `findAccessibilityNodeInfosByText("广告")` 并不能查询到节点
   *
   * 它是优点是快速, 因为遍历所有节点是一个耗时行为, 虽然多数情况下这种耗时较低
   *
   * 但是在某些软件比如 哔哩哔哩 的开屏广告在这种耗时下延迟可达 1-2s, 这也是导致 [gkd-kit/gkd#60](https://github.com/gkd-kit/gkd/issues/60) 的原因
   *
   * 如果你想对某个局部选择器关闭快速查找,只需要调整你的选择器的属性选择表达式的顺序使得它不符合快速查找的条件即可
   *
   * @default false
   */
  quickFind?: boolean;

  /**
   * 如果开启, 此规则下的所有满足 **特定格式的选择器** 将使用快速查找优化查询速度
   * 
   * 详细文档请查看 [查询优化](https://gkd.li/selector/optimize)
   * 
   * @default false
   */
  fastQuery?: boolean;


  /**
   * 此规则下的所有选择器是否直接从根节点开始匹配
   * 
   * GKD 的原理是监听系统屏幕节点变化 这时候会接收到一个事件节点, 默认从这个节点开始匹配到其子孙节点
   * 
   * 常见情况是: 如果匹配的速度跟不上节点事件数量的产生速度, 下一次匹配的开始节点将变成根节点
   * 
   * 但是如果节点事件产生速度较慢, 比如屏幕上只有一个节点(文本)在变化, 那么开始匹配的节点一直将是这个节点
   * 
   * 此时如果你的选择器的末端属性选择器选择的不是这个节点, 那么匹配将会失败, 即使你能在网页审查工具查询到这个节点
   * 
   * 为了解决这个问题, 你可以设置 matchRoot=true, 这样每次匹配都会从根节点开始匹配
   * 
   * 以 [快照-16105497](https://i.gkd.li/i/16105497) 为例, 事件节点总是 _id=8 的节点, 此时如果你的选择器是 `[text*="15秒"] - [text*="跳过"]`
   * 
   * 在 matchRoot=false 的情况下, 你的匹配范围如下蓝框
   * 
   * ![image](https://github.com/gkd-kit/gkd/assets/38517192/ec60677f-f0d7-4b0d-8ac2-56306852e4a0)
   * 
   * 而在 matchRoot=true 的情况下, 你的匹配范围如下蓝框
   * 
   * ![image](https://github.com/gkd-kit/gkd/assets/38517192/33eb9029-c3c3-4a2e-ab60-a1f099371fef)
   * 
   * @default false
   */
  matchRoot?:boolean

  /**
   * 单位: 毫秒
   *
   * 匹配延迟
   *
   * 规则准备匹配/或被唤醒时, 等待一段时间, 使此规则参与查询屏幕节点
   *
   */
  matchDelay?: Integer;

  /**
   * 单位: 毫秒
   *
   * 规则匹配时间, 此规则参与查询屏幕节点时, 等待一段时间, 休眠此规则
   *
   * 例如某些应用的 开屏广告 的 activityId 容易误触/太广泛, 而开屏广告几乎只在应用切出来时出现, 设置一个有限匹配时间能避免后续的误触
   *
   */
  matchTime?: Integer;

  /**
   * 最大执行次数
   *
   * 规则的 action 被执行的最大次数, 达到最大次数时, 休眠此规则
   *
   * 功能类似 matchTime, 适用于只需要执行一次的: 开屏广告/更新弹窗/青少年弹窗 一类规则
   *
   * 当规则准备匹配/或被唤醒时, 将重新计算次数
   *
   */
  actionMaximum?: Integer;

  /**
   * 当规则因为 matchTime/actionMaximum 而休眠时, 如何唤醒此规则
   *
   * @default 'activity'
   *
   * @example
   * 'activity'
   * // 当 activity 刷新时, 唤醒规则
   * // 刷新 activity 并不代表 activityId 变化
   * // 如 哔哩哔哩视频播放页 底部点击推荐视频 进入另一个 视频播放页, 进入了新 activity 但是 activityId 并没有变化
   *
   * @example
   * 'app'
   * // 重新进入 app 时, 唤醒规则
   */
  resetMatch?: 'activity' | 'app';

  /**
   * 与这个 key 的 rule 共享 cd
   *
   * 比如开屏广告可能需要多个 rule 去匹配, 当一个 rule 触发时, 其它 rule 的触发是无意义的
   *
   * 如果你对这个 key 的 rule 设置 actionCd=3000, 那么当这个 rule 和 本 rule 触发任意一个时, 在 3000 毫秒 内两个 rule 都将进入 cd
   */
  actionCdKey?: Integer;

  /**
   * 与这个 key 的 rule 共享次数
   *
   * 比如开屏广告可能需要多个 rule 去匹配, 当一个 rule 触发时, 其它 rule 的触发是无意义的
   *
   * 如果你对这个 key 的 rule 设置 actionMaximum=1, 那么当这个 rule 和 本 rule 触发任意一个时, 两个 rule 都将进入休眠
   */
  actionMaximumKey?: Integer;

  /**
   * 规则参与匹配的顺序, 数字越小越先匹配
   *
   * 如果两个规则 order 相同, 按照 groups 中的数组顺序匹配, app 类型规则顺序优先于 global 类型规则
   *
   * 属于不同订阅的规则按照订阅列表中顺序匹配, 长按订阅卡片可以拖动排序
   *
   * @default 0
   *
   */
  order?: Integer;

  /**
   * 单位: 毫秒
   *
   * 在开始匹配后的一段时间内, 不管界面没有通知变化, 主动使此规则参与屏幕查询
   *
   * GKD 借助 [onAccessibilityEvent](https://developer.android.com/reference/android/accessibilityservice/AccessibilityService#onAccessibilityEvent(android.view.accessibility.AccessibilityEvent)) 感知界面变化
   *
   * 但是某些基于 flutter/webview 开发的应用/页面在变化时并不会通知系统去触发 onAccessibilityEvent, 但是屏幕上的节点信息确实产生变化
   *
   * 唯一的办法是在开始匹配的一定时间内主动查询屏幕节点
   *
   */
  forcedTime?: Integer;

  /**
   * 当前 规则/规则组 的快照链接, 增强订阅可维护性
   */
  snapshotUrls?: IArray<string>;

  /**
   * 当前 规则/规则组 的规则在手机上的运行示例, 支持 jpg/png/webp/gif
   *
   * 如果规则是多个规则组合起来的, 可以更好看懂规则到底在干啥, 比如 点击关闭按钮-选择关闭原因-确认关闭 这种广告用 gif 看着更清楚在干啥
   */
  exampleUrls?: IArray<string>;
}

/**
 * 全局规则和应用规则的基础通用属性
 */
export interface RawRuleProps extends RawCommonProps {
  /**
   * 当前规则在列表中的唯一标识
   *
   * key 没有顺序大小之分, 可以是任意数字
   *
   * 设置后不可更改, 否则造成点击记录错乱
   */
  key?: Integer;

  /**
   * 规则名称
   */
  name?: string;

  /**
   * 要求当前列表里某个 key 刚刚执行
   *
   * 比如: 点击关闭按钮-选择关闭原因-确认关闭, key 分别是 1,2,3, preKeys 分别是 [],[1],[2]
   *
   * 那么 选择关闭原因 必须要求 点击关闭按钮 刚刚执行过才能执行, 确认关闭 也要求 选择关闭原因 刚刚执行过才执行
   *
   * 否则后面的规则不会触发, 也就是要求规则按顺序执行, 这是为了防止规则匹配范围太过广泛而误触
   *
   */
  preKeys?: IArray<Integer>;

  /**
   *
   * 规则匹配后的操作行为
   *
   * 在 {@link position} 存在的情况下, action 的默认值为 `clickCenter`
   *
   * @example
   * `click`
   * // 为默认值, 如果目标节点是 clickable 的, 则使用 `clickNode`, 反之使用 `clickCenter`
   * // 并且当 `clickNode` 事件没有被应用接收时, 则使用 `clickCenter`
   *
   * @example
   * `clickNode`
   * // 向系统发起一个点击无障碍节点事件. 即使节点在屏幕外部/或者被其它节点遮挡,也依然能够正确触发点击目标节点
   * // 但是如果目标节点不是 clickable 的, 目标应用通常不响应这个点击事件, 也就是点击无效果
   * // 在极少数情况下, 即使节点是 clickable 的,应用显示接收但是不响应节点点击事件, 此时需要手动设置 `clickCenter`
   *
   * @example
   * `clickCenter`
   * // 计算出此控件的中心的坐标并且如果这个坐标在屏幕内部，那么就向系统发起一个点击屏幕坐标事件
   * // 如果这个坐标不在屏幕内部, 当作未匹配
   * // 另外如果目标节点的位置被其它节点遮挡覆盖, 则会点击触发最上层的节点(可能不是目标节点)
   *
   * @example
   * `back`
   * // 向系统发起一个返回事件, 相当于按下返回键
   *
   * @example
   * `longClick`
   * // 如果目标节点是 longClickable 的, 则使用 `longClickNode`, 反之使用 `longClickCenter`
   * // 并且当 `longClickNode` 事件没有被应用接收时, 则使用 `longClickCenter`
   *
   * @example
   * `longClickNode`
   * // 向系统发起一个长按无障碍节点事件，与 clickNode 类似
   *
   * @example
   * `longClickCenter`
   * // 与 clickCenter 类似, 长按时间为 400 毫秒
   */
  action?:
    | 'click'
    | 'clickNode'
    | 'clickCenter'
    | 'back'
    | 'longClick'
    | 'longClickNode'
    | 'longClickCenter';

  /**
   * 在使用 clickCenter/longClickCenter 时的自定义点击位置
   *
   * 默认坐标为节点中心
   *
   * 如果计算出的坐标不在屏幕内部, 当作未匹配
   *
   * 在 position 存在的情况下, {@link action} 的默认值为 `clickCenter`
   *
   */
  position?: Position;

  /**
   * 一个或者多个合法的 GKD 选择器, 如果所有选择器都能匹配上节点, 那么点击最后一个选择器的目标节点
   *
   * 点击优先级大于 {@link anyMatches}
   */
  matches?: IArray<string>;

  /**
   * 一个或者多个合法的 GKD 选择器, 如果存在一个选择器能匹配上节点, 那么点击这个节点
   *
   * 如果 anyMatches 的所有选择器都无法匹配, 则停止匹配此规则
   *
   * 与 {@link matches} 一起使用时, 仍然点击 {@link matches} 的最后一项
   *
   */
  anyMatches?: IArray<string>;

  /**
   * 一个或者多个合法的 GKD 选择器, 如果存在一个选择器匹配上节点, 则停止匹配此规则
   */
  excludeMatches?: IArray<string>;
}

/**
 * 全局规则组和应用规则组的基础通用属性
 */
export interface RawGroupProps extends RawCommonProps {
  /**
   * 当前规则组在列表中的唯一标识
   *
   * 也是客户端禁用/启用此规则组的依据
   *
   * 设置后不可更改, 否则造成客户端启用/禁用错乱
   *
   * key 没有顺序大小之分, 可以是任意数字
   */
  key: Integer;

  /**
   * 规则组名称
   */
  name: string;

  /**
   * 规则组描述
   */
  desc?: string;

  /**
   * 控制规则默认情况下是启用还是禁用
   *
   * @default true
   */
  enable?: boolean;

  /**
   * 其它 group 的 key, 允许将目标组的所有 rule 添加到当前组的作用域
   *
   * 假设 group1{key=1} 有一个 rule1{key=11}, group2{key=2} 有 rule2{key=22}, rule3{key=23}
   *
   * 如果 group1 的 scopeKeys=[2] 并且 group2 没有被禁用, 那么 rule1 的 preKeys/actionCdKey/actionMaximumKey 可以是 11/22/23
   *
   * 如果存在相同 key 的 rule, 优先使用本组的 rule, 其次按 scopeKeys 的顺序查找其它组的 rule
   *
   */
  scopeKeys?: IArray<Integer>;
}

/**
 * 应用规则(组)的基础通用属性
 */
export interface RawAppRuleProps {
  /**
   * 如果 界面Id startWith activityIds 的任意一项, 则匹配
   *
   * 如果要匹配所有界面: `undefined` (不填写) 或者 `[]` (避免使用上级属性)
   * 
   * 如果 activityId 以 `.` 开头, 则等价于 appId + activityId
   * 
   * 示例: `com.tencent.mm` (微信) 的某界面 `.MainActivity` 等价于 `com.tencent.mm.MainActivity`
   */
  activityIds?: IArray<string>;

  /**
   * 如果 设备界面Id startWith excludeActivityIds 的任意一项, 则排除匹配
   *
   * 优先级高于 activityIds
   * 
   * 当 activityId 以 `.` 开头时, 与 activityIds 识别规则一致
   */
  excludeActivityIds?: IArray<string>;

  /**
   * 如果应用版本名称包含在此列表中, 则匹配
   *
   */
  versionNames?: IArray<string>;

  /**
   * 如果应用版本名称包含在此列表中, 则排除匹配, 优先级高于 versionNames
   *
   */
  excludeVersionNames?: IArray<string>;

  /**
   * 如果应用版本代码包含在此列表中, 则匹配
   *
   */
  versionCodes?: IArray<Integer>;

  /**
   * 如果应用版本代码包含在此列表中, 则排除匹配, 优先级高于 versionCodes
   *
   */
  excludeVersionCodes?: IArray<Integer>;
}

/**
 * 全局规则的基础通用属性
 */
export interface RawGlobalRuleProps {
  /**
   * true => 匹配任意应用
   *
   * false => 仅匹配 apps 里面的应用
   *
   * @default true
   */
  matchAnyApp?: boolean;

  /**
   * 是否匹配桌面, 仅全局规则可用
   *
   * 如果你切换了桌面, 你需要打开 GKD 的界面触发识别新桌面
   *
   * @default false
   */
  matchLauncher?: boolean;

  /**
   * 是否匹配系统应用, 仅全局规则可用
   *
   * @default false
   */
  matchSystemApp?: boolean;

  /**
   * 应用配置列表, 配置应用内界面如何匹配或不匹配
   */
  apps?: RawGlobalApp[];
}

/**
 * 位置类型, 用以描述自定义点击位置
 *
 * 使用 left/top/right/bottom 四条边实现定位, 此对象只能有两个属性, 也就是两条相邻边
 *
 * 合法的定位组合为: left-top, left-bottom, right-top, right-bottom
 *
 * 示例1-点击目标节点的中心
 * ```json5
 * {
 *  left: 'width/2',
 *  top: 'height/2',
 * }
 * ```
 *
 * 示例2-点击目标节点的左上顶点
 * ```json5
 * {
 *  left: 0,
 *  top: 0,
 * }
 * ```
 *
 * 示例2-点击目标节点的右上区域
 * - [快照-1](https://i.gkd.li/i/14112390)
 * - [快照-2](https://i.gkd.li/i/14319672)
 * - [图片-1](https://a.gkd.li/0019.gif)
 * ```json5
 * {
 *  right: 'width*0.1352',
 *  top: 'width*0.0852',
 * }
 * ```
 */
export type Position = {
  /**
   * 距离目标节点左边的距离
   *
   * 方向: 边 -> 节点中心, 负数表示反方向(也可点击节点外部区域)
   *
   * 支持两种值类型, 字符串和数字, 数字等价于相同内容的字符串, 如 2.5 等价于 '2.5'
   *
   * 字符串类型支持来自快照属性面板上的 left/top/right/bottom/width/height 的数学计算表达式
   *
   * @example
   * 2.5 // ✅
   * '2.5' // ✅
   * '2.5 + 1 - 2 * 3 / 4 ^ 5 % 6' // ✅
   * '(right + left) / 2' // ✅
   */
  left?: string | number;

  /**
   * 距离目标节点上边的距离
   */
  top?: string | number;

  /**
   * 距离目标节点右边的距离
   */
  right?: string | number;

  /**
   * 距离目标节点下边的距离
   */
  bottom?: string | number;
};

/**
 * 一个或者多个值类型
 * @example
 * const n1: IArray<number> = 1; // ✅
 * const n2: IArray<number> = [1]; // ✅
 * const s1: IArray<string> = 'hello'; // ✅
 * const a2: IArray<string> = ['hello']; // ✅
 */
export type IArray<T> = T | T[];

/**
 * 此类型表示一个整数
 *
 * @example
 * 114514 // ✅
 * 2.5 // ❌
 */
export type Integer = number & {};
