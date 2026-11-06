# 组件盘点与精选规范

## 组件库目标

Sunxu 面向多个 React Native / Expo App，提供跨业务可组合的 UI 控件和页面容器。新项目应能用同一套主题 token、页头、工具栏、表单滚动和详情布局起步；业务数据获取、路由、权限决策和领域文案留在宿主项目。

## MES 基线筛选结果

来源为 `../mes-app` 基线分支 `main-买断版本` 的固定提交 `e92d02d7cf2269cf8c564a60ff6a00255e903c8e`。盘点覆盖原 `src/components/**` 的 88 项和 `src/screens/**/components/**` 的 305 项，共 393 条记录。来源工作区当时有未提交修改，因此仅将固定提交的源码摘要用于审计。

本次按用户最新方向从组件库移除不具备通用价值或绑定 MES/宿主 App 的代码：

- 保留 49 个可独立复用的共享 UI 控件和工具；从数据驱动树列表中移除内置请求、取消和导航逻辑。
- 排除 32 个 MES 共享业务模块、6 个 MES App 宿主集成和 305 个页面私有组件。
- Sunxu 新增 `ScreenContainer`、`ListScreenContainer`、`FormScreenContainer`、`DetailScreenContainer` 四种组合容器；它们以插槽收纳宿主内容，不承载业务请求或权限规则。
- 清单中的每个来源文件都标记 `RETAINED` 或 `EXCLUDED`，保留来源路径、固定提交和 SHA-256。排除项仍留在审计账本，不进入包的代码和导出。

完整逐文件记录见 [`MES 组件迁移清单`](./migrations/mes-components.md) 和 [JSON 账本](./migrations/mes-components.json)。

## 页面容器与空间职责

| 容器 | 首屏职责与空间预算 | 内容策略 |
|---|---|---|
| `ScreenContainer` | 顶部安全区 + 可选页头 + 主内容 + 固定底部操作区 | 通过 `scrollMode` 选择普通、键盘感知滚动或非滚动；子内容由宿主组合 |
| `ListScreenContainer` | 页头约 56dp；搜索/筛选工具栏约 44–96dp；余下空间全部给结果 | 工具栏紧贴它控制的列表；列表自行管理虚拟化与刷新 |
| `FormScreenContainer` / `FormPage` | 页头约 56dp；字段滚动；可选固定底部动作 | 键盘感知滚动；导航和提交由 props 提供 |
| `DetailScreenContainer` | 页头约 56dp；详情信息滚动；可选固定底部动作 | 适合长详情；固定操作由 footer 插槽提供 |

按 375×812dp 手机视口估算，列表页的安全区和页头优先稳定，工具栏保持紧凑，把可见首屏高度留给结果；表单/详情把滚动行为限制在内容区，操作区不覆盖滚动内容。容器的 `safeAreaEdges` 默认由上方和两侧接管；底部由 `BottomActionBar` 接管时不要再给外层容器打开 bottom edge。

## 新增容器的组件契约

- **职责**：约束常见页面区域顺序、安全区、滚动区和固定操作区，减少每个 App 重做布局的成本。
- **非目标**：不实现 API 调用、分页状态、导航栈、业务筛选状态、权限规则或特定业务字段。
- **输入**：`header`、`toolbar`、`children`、`footer` 插槽；标题容器另接收 `title`、`onBack` 和 `headerRight`；表单接收键盘滚动模式。
- **状态**：加载/错误/空状态由宿主放入内容插槽；表单提交状态由 `FormPage` 的 `loading`、`initLoading`、`errorCount` 表达。
- **视觉/主题**：背景、文字、边线、间距使用 `SunxuProvider` 下的语义主题与 token；`style`/内容样式仅作为整合入口。
- **可访问性**：页头返回由宿主提供回调；表单提交按钮暴露按钮角色、名称和忙碌/禁用状态；插槽内交互由控件自身提供标签和焦点顺序。
- **验证**：类型检查通过；完整示例 App 的设备截图和几何/溢出记录未完成时，视觉验收为 `UNVERIFIED`。

## 依赖和可移植性

- 运行时公开入口只有 `sunxu` 和 `sunxu/core`，不提供 MES 或宿主集成子路径。
- 组件只依赖 props、回调、通用主题 context 和明确声明的 UI peer dependencies；不导入来源 App 的 `@/`、API client、Zustand、登录态或私有配置。
- 权限控件只消费宿主传入的结果/判断回调，不自行解释权限码。
- 新增 peer dependency 必须由当前公开运行代码的 import 支撑；不复制来源 App 的完整依赖清单。

## 验证、授权与发布

- 类型检查不能代替 UI 验收；UI 变更应在可运行示例或真实宿主页面、实际视口及相关状态中检查，并记录截图和几何/溢出数据。
- `sunxu@0.1.0` 已发布到公开 npm，当前 `license` 为 `UNLICENSED`，不授予一般使用或再分发许可。后续公开版本需先确认来源代码及第三方资产的再分发权，并由用户选定许可证。包文件白名单仅包含运行时代码、README 和许可证文件。
- 按项目约定在 `main` 开发、提交并推送通过验证的当前任务变更；公开 npm 发布仍受上一条许可证与再分发权要求约束。

## CRM 来源组件盘点与合入结果

来源为 `../dongjian-crm` 的 `main` 分支，提交 `1732835a54ae62710089b0a5f096da76545bad2a`。完整盘点 `src/components/**` 共 98 项：35 项复用现有 Sunxu 通用实现，10 项合并 CRM 优化，2 项新增为通用组件，4 项 CRM 差异经评估后保留 Sunxu 既有能力，47 项因业务领域、宿主集成或数据/导航耦合而排除在通用运行时之外。CRM 业务、地图和宿主生命周期模块留在 CRM App。

本次新增 `DateNavigator`、`DetailActionBar`；优化日期字段的标签/触控尺寸、详情卡片外层样式、实体选择器分类侧栏、全屏弹窗填充与沉浸模式、照片多选/封面、底部弹层输入法适配、搜索栏和状态标签。`FormLabel`、`QuickNumInput`、`ScanCameraModal` 保留 Sunxu 已有帮助/连续扫码能力；CRM 对筛选控件的触控尺寸和隐藏高级筛选行为已在 Sunxu 实现，无需重复改动。`examples/catalog` 增加组件示例页，便于后续项目直接查看和组合这些公开组件。

CRM 与 MES 固定提交 `e92d02d7cf2269cf8c564a60ff6a00255e903c8e` 比较：84 项同路径，其中 64 项内容一致、20 项不同；CRM 独有 14 项，MES 独有 4 项。CRM 页面私有目录另有 6 个文件：5 个被 `ProfileScreen` 引用、共 6 条 import 声明（`PieceworkPeriodPicker` 有类型与值两条导入），另有 1 个未被 screens 引用；没有跨页面复用，均留在 CRM App。

逐项来源提交、当前工作树 SHA-256、来源依赖、目标、适配与排除理由见 [CRM 迁移清单](./migrations/crm-components.md) 和 [JSON 账本](./migrations/crm-components.json)。当前 CRM 工作树有 2 个未提交组件文件，按逐文件快照记录；CRM 仓库没有根 `LICENSE`，当前账本不代表对外再分发授权。

本次组件 UI 的真实页面截图和几何/溢出证据未完成，视觉状态为 `UNVERIFIED`。一次 Expo Web `/`、375×812 CSS px 预检在 15 秒内没有呈现预期首屏，浏览器按一次性停止规则关闭；没有重试或保存截图/DOM。包和示例类型检查通过，Metro Web bundle 成功，但不代表视觉验收通过。详情及失败原因见 [CRM 迁移清单](./migrations/crm-components.md) 与 JSON 账本。

## 2026-11-05 宿主主题类型与源码可移植性修复

接入 `dongjian-crm` 宿主时发现两项可移植性问题并修复：

- `ThemeColors` 原为 `typeof Colors.light | typeof Colors.dark` 字面量类型，宿主品牌色（如 CRM 深绿 `#007D35`）无法通过 `SunxuProvider.theme` 传入。已放宽为结构化映射类型：颜色值统一为 `string`，仅 `statusBar` 保留 `'auto' | 'inverted' | 'light-content' | 'dark-content'` 字面量联合以供 Expo `StatusBar` 消费。
- 42 个源文件共 78 处相对 import 携带 `.ts/.tsx` 扩展名，要求每个消费方 tsconfig 开启 `allowImportingTsExtensions`。已全部去除扩展名，消费方无需额外 tsconfig 配置，Metro/Bundler 均可解析。

两项变更不改变任何组件运行时行为与视觉表现，Sunxu 自身 `tsc --noEmit` 通过。CRM 宿主以打包产物与全量类型检查做接入验证。

## 2026-11-06 CRM 接入审计修正与 0.1.2

CRM 宿主对 49 个再导出组件与来源基线逐文件比对后，修正与修复如下：

- 盘点更正：`DateNavigator`、`DetailActionBar` 在 CRM 基线中已存在，实为原样迁移而非新增；`ScanCameraModal` 的"帮助"能力实际位于 `FormLabel`/`QuickNumInput`，ScanCameraModal 仅保留连续扫码。
- 触控热区修复：`FilterBar.advChip`（36px 无 hitSlop，高级筛选面板选项）补 `hitSlop={top:4,bottom:4}` 达到 44 有效热区；`MultiEntityPickerField.fieldWrapper` 42px 恢复 `MIN_TOUCH_TARGET`。其余紧凑视觉样式（StatusTabs 34/32、FilterActionButton 36、FormLabel 28 等）均已有 hitSlop 补偿、有效热区 ≥44，属既定设计模式，不再改动。
- 行为语义说明：`FilterBar` 快捷行的 `advancedExtra` 改为无条件参与行可见性判断（来源基线把它与 `!hideAdvancedButton` 绑定，导致 CRM 通话页"按客户筛选"等传入内容从未渲染）。此为有意的语义修正，宿主如不传 `advancedExtra` 不受影响。
- 潜伏 API 差异备忘：`OfflineIndicator` 改为必填 props（不再自接 store）；`FormPage.onBack` 不再默认 `navigation.goBack()`；`EntityPickerModal` 分类侧栏改为 `categoryLayout="sidebar"` 显式开启（默认快捷筛选），默认搜索占位改为"搜索..."。上述项当前 CRM 均无调用方或无实际影响，记录以备后续消费方排查。

## 2026-11-06 通用地图与图表组件套件

按跨 App 复用需求新增通用视觉能力：

- `MapScreenContainer` 提供全屏地图画布、头部/角落控件/底部信息插槽与安全区避让；现有 `PageHeader` 和列表、表单、详情容器继续作为通用页面基础。
- `sunxu/maps` 提供 `useCurrentLocation`、`MapLocationButton`、`MapControlButton`、`MapControlStack`、`MapZoomControls`、`MapMarker` 和 `MapCurrentLocationMarker`。定位在用户明确点击后申请前台权限并获取一次坐标；不给组件启动后台定位。
- `ChartPanel` 和 `ChartLegend` 提供图表区域、主题化图例以及加载、空、错误/重试状态。`sunxu/charts` 增加主题适配的柱、线、饼、雷达图，使用 React Native 原生 `react-native-gifted-charts` 渲染。
- 地图厂商 View/Marker、相机/缩放 API、密钥、坐标系转换、路线/地理编码与业务数据仍由宿主 App 注入；Sunxu 的位置坐标契约为 `{ latitude, longitude }`。Apache ECharts 的 Web Canvas/SVG 运行时没有并入原生组件包。
- `expo-location`、`react-native-gifted-charts`、`react-native-svg` 和 `expo-linear-gradient` 按地图/图表入口作为可选 peer dependencies，避免未使用相应子路径的 App 被迫加载它们。Gifted Charts 运行时要求安装 Expo Linear Gradient 或 React Native Linear Gradient；catalog 固定使用 Expo 实现。
- `examples/catalog` 的“地图图表”页示范页面容器、地图叠层、标记、前台定位调用与柱/线/饼/雷达图。预览地图底图是明确标注的宿主插槽示意，不声称完成厂商地图渲染验收。

验证记录见[地图与图表组件渲染验收](./verification/maps-charts.md)，包含竖屏/横屏截图、定位模拟、DOM 几何/溢出及组件间距 ledger。原生 SDK Marker/相机行为仍需各宿主地图供应商适配后单独验收。npm 版本和 CRM 依赖更新继续受授权规则约束。

## 2026-11-06 SwipeableRow 无障碍修正

`SwipeableRow` 继续由宿主传入行操作和回调；通用组件提供左滑露出右侧操作、点击关闭操作区后执行回调。修正如下：

- 行没有 `onPress` 时直接渲染 `children`，不再额外套一层无回调的 `TouchableOpacity`，避免无障碍树把子控件合并为无操作的单一行。
- 行有 `onPress` 时才提供按钮角色。
- 左滑操作按钮暴露按钮角色和对应标签，并至少保持 44dp 高度。

运行时手势展开仍需在原生宿主设备上检查；类型检查通过前不发布新包。当前公开包授权门禁见[授权与发布](#验证授权与发布)。

## 2026-11-06 StatusTabs 轨道宽度与禁用态修正

`StatusTabs` 的非滚动 `rounded`/`pill` 模式中，轨道未参与父级横向伸展，导致默认 `stretch` 的标签挤在内容宽度内；部分窄宽布局会把标签压窄或裁掉。现在仅在 `sizing="stretch"` 时让轨道占满父级剩余宽度，`sizing="hug"` 和 `scrollable` 仍按内容宽度排布。同步让 `disabled` 在非 `underline` 变体中真正不可点、显示禁用态并暴露无障碍状态。

API、筛选状态所有权、主题 token、标签顺序、计数徽标和触控补偿保持不变。Catalog 增加与 CRM 时间轴相同的四项 Pill 示例及禁用态示例，供后续复核。

验收记录见[StatusTabs 布局与状态验收](./verification/status-tabs.md)，包含 Expo Web 375×812、320×720、812×375 浅/深色渲染、几何/溢出、选择切换和禁用态证据。原生 iOS/Android 触控范围仍为 `UNVERIFIED`。Sunxu npm 当前为 `UNLICENSED`；按授权门禁，新的公开 npm 版本和 CRM 精确依赖升级须等用户选定许可证后进行。

## 2026-11-06 StatusTabs underline 标签居中修复

CRM“客户 / 商机”导航的两个等宽 Tab 文字贴近格子左缘，而选中指示线按格子居中。根因是 underline Tab 使用横向 flex 布局但缺少主轴居中；在共享 `underlineTab` 增加 `justifyContent: 'center'`，不改 API、等分宽度、选中指示线、状态所有权或回调。Catalog 增加相同的两项导航示例。

渲染与 DOM 几何记录见[StatusTabs underline 对齐验收](./verification/status-tabs-alignment-2026-11-06/README.md)。375×812、320×720 竖屏及切换交互通过；812×375 的示例截图未显示落在首屏以下的控件，因此该格标记 `UNVERIFIED`。CRM 认证路由与原生 iOS/Android 也未验证。Sunxu 源码已在 `21bda27` 推送；当前 `sunxu@0.1.2` 发布包尚未包含修复，受 `UNLICENSED` 发布门禁约束，本次未发 npm 包或更新 CRM 依赖。
