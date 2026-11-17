# Sunxu Taro 平台组件

`sunxu-taro` 是 Sunxu 仓库维护的独立 Taro 4 / React 18+ 平台包。唯一运行时源码位于 `src/core/taro/`；`packages/taro/` 只保存发布清单与打包入口，不保存第二份实现。RN/Expo 入口与依赖保持独立。

## 职责与边界

原生按钮、输入、选择器、页签、分段选择、附件呈现、底部导航及其状态和内部几何归平台包。宿主拥有业务数据、权限、请求、导航、附件传输、品牌字形与字体偏好。图标通过 `SunxuTaroProvider` 的 `renderIcon` 注入，不分发业务素材。

受控组件的值由宿主持有；选择与关闭事件保持分离。`OptionSheet` 单击选项即时提交，搜索仅在选项集内过滤；`Tabs`、`SegmentedControl` 只发出选中值。`AttachmentField` 的打开、移除、重试与增加均只调用宿主回调。取消、失败、禁用、空选项与加载不能隐式提交业务数据。

## 组件契约与空间所有权

| 组件族 | 输入与事件 | 状态 | 空间与可访问性 |
| --- | --- | --- | --- |
| Button / Badge | 原生属性、显式尺寸/外观、点击；徽标文案/语义色 | pressed、disabled、loading（原生）与状态色 | 控件拥有内部几何和触点；父容器拥有间距；图标操作须有 `ariaLabel` |
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
