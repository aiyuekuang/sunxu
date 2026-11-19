# Sunxu Taro 平台组件

`sunxu-taro` 是 Sunxu 仓库维护的独立 Taro 4 / React 18+ 平台包。唯一运行时源码位于 `src/core/taro/`；`packages/taro/` 只保存发布清单与打包入口，不保存第二份实现。RN/Expo 入口与依赖保持独立。

## 职责与边界

原生按钮、输入、选择器、页签、分段选择、附件呈现、底部导航及其状态和内部几何归平台包。宿主拥有业务数据、权限、请求、导航、附件传输、品牌字形与字体偏好。图标通过 `SunxuTaroProvider` 的 `renderIcon` 注入，不分发业务素材。

受控组件的值由宿主持有；选择与关闭事件保持分离。`OptionSheet` 单击选项即时提交，搜索仅在选项集内过滤；`Tabs`、`SegmentedControl` 只发出选中值。`AttachmentField` 的打开、移除、重试与增加均只调用宿主回调。取消、失败、禁用、空选项与加载不能隐式提交业务数据。

## 组件契约与空间所有权

| 组件族 | 输入与事件 | 状态 | 空间与可访问性 |
| --- | --- | --- | --- |
| Button / Badge | 原生属性、显式尺寸/外观、点击；徽标文案/语义色 | pressed、disabled、loading（原生）与状态色 | 控件拥有内部几何和触点；父容器拥有间距；图标操作须有 `ariaLabel` |
| Sheet | open / title / onClose / children、header / footer / closeIcon 插槽 | 关闭、打开、取消；内容状态归宿主 | 自然高度或明确的滚动模式；固定标题/关闭和可选底栏；安全区只处理一次 |
| Input / Textarea / SearchInput | 原生输入事件、值、焦点、键盘确认；搜索清空回调 | 空值、聚焦、禁用、长值 | 保留平台输入能力；搜索自身拥有图标和清空位置，不拥有请求 |
| Select / OptionSheet / DateTimePicker / RegionPicker | 候选/值、选中/关闭、原生日期或地区事件 | 打开、选中、空/无匹配、取消、禁用 | 标题和关闭固定，候选区滚动；即时选择不增加重复确认步骤 |
| Tabs / SegmentedControl | options / value / onChange | 当前项、长标签、横向滚动 | 一组共享轨道与选中状态；宿主只摆放，不复制内部按钮 |
| FilterBar / FilterButton / FilterActionButton / FilterTriggerContent | 文案、活动值、数量、打开事件 | 生效、禁用、数量 | 快捷条件归单行容器；图标资源由宿主注入 |
| BottomTabBar / PageContentContainer / IconTile / Hint | children / 插槽、当前项/切换、提示开合 | 当前/禁用/徽标、展开 | 底部导航拥有安全区；内容容器拥有共享横向收边；提示不挤占常驻说明行 |
| AttachmentField | items / busy / readOnly 与打开、删除、重试、添加回调 | 读取、空、上传、失败、只读 | 文件行拥有信息/动作关系；上传及鉴权归宿主 |

## 运行验证矩阵

默认、窄屏、长文案/大字号、空值/空候选、disabled/loading、打开/关闭、选中/清空、触控目标与末项安全区。真实宿主路由、截图、节点几何和交互证据未齐前一律 `UNVERIFIED`，类型检查和打包不作 UI 验收。

首屏预算：导航/搜索/快捷条件/页签各只保留自身任务，结果区使用剩余高度；共享组件不添加业务标题或结果说明。表面契约为页面背景 → 宿主留边 → 内容表面；内容容器只提供可组合收边，页面决定 `separate` 或有明确分隔线的 `joined` 关系。

## 打包与消费

在 `packages/taro` 安装其独立开发依赖后运行 `npm run pack -- --out <directory>`。脚本从唯一源码编译到临时目录，再执行 `npm pack`；不发布 npm。宿主以精确版本 tgz 与 lockfile 消费，无相邻源码路径或 link 依赖。

示例位于 `examples/taro-catalog`。CSS 基础规则、后置外观规则与主题默认值分别导出，宿主主题可覆盖默认 token；不得把业务页面选择器放入组件包。

## Sheet 可组合容器（0.1.1）

`Sheet` 只拥有遮罩、固定底部表面、标题/关闭、内容边界、可选固定 footer 与底部安全区。宿主从真实来源确定内容结构和几何；库的默认外观不作为被复刻产品的视觉基线。图标网格、筛选页签、loading/error/empty、字段、请求、权限、选择值及导航都由宿主通过插槽与回调提供。

必填属性为 `open: boolean`、`title: string`、`onClose: () => void`、`children: ReactNode`。可选 `header` 替换可见标题内容，仍保留容器的关闭按钮；`title` 继续提供弹层可访问名称。`footer` 固定在内容视口外，不随正文滚动；即时选择无需 footer。`closeIcon` 只替换装饰 glyph，不复制按钮和回调；未提供时使用 provider 的 `close` 图标。

`closePlacement="start" | "end"` 与 `titleAlign="start" | "center"` 决定关闭侧和标题对齐，默认均为 end/start。`closeLabel` 默认 `关闭${title}`；`closeOnBackdrop` 默认 true。`className` / `style` 应用于覆盖整个视口的宿主，公共 token 在此设置；`contentClassName` / `contentStyle` 只应用于正文容器。

| bodyMode | 正文所有权与必要约束 |
| --- | --- |
| natural（默认） | 普通 View，依内容自然增高，不创建 ScrollView，默认没有 max-height。适用于来源明确使用自然高度的短图标网格。 |
| scroll | 容器创建唯一 ScrollView；调用方通过 `--sheet-body-height` 或 `contentStyle.height` 明确高度。不能嵌套另一个同轴 ScrollView。 |
| fill | 普通 flex 正文边界，调用方传入自己的 ScrollView/复杂布局并管理其滚动；通过 `--sheet-height` 设置有界面板高度。 |

公共几何 token 均可在 Sheet 的 `className` 上覆盖：

| token | 默认值 / 用途 |
| --- | --- |
| `--sheet-z-index` / `--sheet-backdrop-color` | `40` / `rgba(18, 33, 28, .42)` |
| `--sheet-height` / `--sheet-max-height` | `auto` / `none`；自然内容没有隐含 70vh 等高度 |
| `--sheet-radius` / `--sheet-background` | `--r-select-sheet` / `--c-surface` |
| `--sheet-padding-inline` | `--space-page-inline`；标题、正文与 footer 共用横向边界 |
| `--sheet-padding-block-start` / `--sheet-padding-block-end` | 各 `20rpx`；底部另加一次 `env(safe-area-inset-bottom)`，宿主 children/footer 不重复加安全区 |
| `--sheet-header-min-height` / `--sheet-header-spacing` | `--h-button-icon` / `12rpx`；标题行高度独立于关闭按钮尺寸，spacing 是标题与正文间隔 |
| `--sheet-title-font-size` / `--sheet-title-line-height` / `--sheet-title-font-weight` / `--sheet-title-color` | `--fs-title` / `inherit` / `600` / `--c-text` |
| `--sheet-close-size` / `--sheet-close-icon-size` / `--sheet-close-color` | `--h-button-icon` / `--sz-icon-control` / `--c-text-4`；glyph 大小与触控范围分开 |
| `--sheet-close-offset-inline` | `0`；相对所选侧的按钮位置，关闭按钮在标题行内垂直居中 |
| `--sheet-close-hit-inset` | 未设置时沿用 Button 的原有透明热区；已配置完整触控尺寸时可设 `0rpx`，避免再次扩张 |
| `--sheet-body-height` / `--sheet-footer-spacing` | `auto` / `0`；scroll 模式必须显式设置有界高度 |

`OptionSheet` 内部组合 `Sheet`，保留其原有 82vh 上限、搜索、八行可视高度与原 API。`onChoose(index)` 不隐式调用 `onClose`；关闭和选择保持独立。`Button.expandHitArea` 可显式覆盖尺寸推导出的透明热区，默认行为不变；紧密图标网格使用 `false` 时，由调用方保证自身目标大小或足够间隔。

微信端使用 Taro View/Button/ScrollView，根容器通过 `catchMove` 阻止背景触摸穿透，关闭由具名原生 Button 触发。此实现不调用 HTML `dialog.showModal()`，不宣称拥有浏览器 top layer、自动焦点约束/恢复或平台返回键拦截；这些平台交互和读屏效果须在微信目标运行时验证，不能由 `ariaRole="dialog"` 推定。

Catalog 的三个入口分别展示任意图标网格自然高度、容器滚动列表、标题 Tabs 插槽和 child-owned ScrollView 配合固定 footer。类型、pack 与示例编译记录见[验证记录](./verification/taro-sheet-2026-11-17/README.md)；真实微信渲染及 Digi CRM 原版对齐验收为 `UNVERIFIED`。
