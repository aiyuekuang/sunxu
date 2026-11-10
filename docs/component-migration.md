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

### PageHeader 右侧操作

- `headerActions` 是 `ListScreenContainer`、`DetailScreenContainer` 和 `FormScreenContainer` 的数量感知页头操作 API；单项只显示对应图标，多项显示右侧省略号并打开锚定页头的下拉菜单。空数组不显示图标或菜单；同时提供旧插槽时回退显示 `headerRight` 内容。
- 单项以图标显示（操作标签作为无障碍名称）；多项菜单显示文字，按传入顺序排列。操作由宿主传入，Sunxu 不决定权限、可见条件或业务规则。
- 菜单行保留禁用态和危险操作颜色；选择操作、点菜单外或系统返回会关闭菜单。菜单使用主题 surface、文字、边框和阴影 token，并限制高度以支持长操作列表滚动。
- `headerRight`/`PageHeader.right` 原有自定义 ReactNode 插槽继续透传；新调用方需要自动按数量折叠时使用 `headerActions`。建议二选一；非空 `headerActions` 控制右侧，空数组时回退到 `headerRight`。
- 图标按钮和菜单操作保持 iOS 44pt、Android 48dp 最小触控尺寸；数量感知操作使用对称的固定列宽，标题保持屏幕中轴对齐。旧 `headerRight` 插槽按宿主内容自然伸展。
- **组件契约**：复合组件；页头拥有左侧返回、居中标题、右侧动作及其下拉层，不拥有业务授权、路由或动作结果。`HeaderAction` 必须提供稳定 `id`、可见 `label`、`icon` 和 `onPress`，可选无障碍名称、禁用态与危险态。单项只显示图标，多项菜单只显示文字。交互状态为默认、按压、菜单展开/收起、禁用；菜单不维护选择值，加载/错误/成功由动作回调所属页面负责。无动作不渲染右侧操作；菜单滚动耗尽或被取消时回到页头状态。触屏使用 Pressable/Touchable 及最小触控尺寸，辅助技术可读到“更多操作”的展开态、菜单项名称与禁用态。菜单动作选择后先关闭弹层，再调用宿主回调。菜单无进入动画，以避免减少动态效果设置差异。
- **布局与响应式**：页头安全区由 `PageHeader`/父容器既有契约负责；菜单以省略号按钮的屏幕坐标锚定，靠右对齐，宽度不超过 256dp，超出屏幕高度时在菜单内滚动。父级负责页头与内容的外部间距，页头拥有按钮和菜单内部间距。最窄设备、横屏、动态字体、系统读屏和真实原生渲染仍需宿主验收。

该 API 的 iOS 模拟器渲染和交互记录见[页头操作收纳验收](./verification/page-header-actions-2026-11-06/README.md)。单项加号图标、多项省略号菜单及动作回调已在 iPhone 17 Pro 检查；窄屏、横屏、Android、读屏以及菜单外点击关闭尚标记为 `UNVERIFIED`。

## 新增容器的组件契约

- **职责**：约束常见页面区域顺序、安全区、滚动区和固定操作区，减少每个 App 重做布局的成本。
- **非目标**：不实现 API 调用、分页状态、导航栈、业务筛选状态、权限规则或特定业务字段。
- **输入**：`header`、`toolbar`、`children`、`footer` 插槽；标题容器另接收 `title`、`onBack` 和 `headerRight`；表单接收键盘滚动模式。
- **状态**：加载/错误/空状态由宿主放入内容插槽；表单提交状态由 `FormPage` 的 `loading`、`initLoading`、`errorCount` 表达。
- **视觉/主题**：背景、文字、边线、间距使用 `SunxuProvider` 下的语义主题与 token；`style`/内容样式仅作为整合入口。
- **可访问性**：页头返回由宿主提供回调；表单提交按钮暴露按钮角色、名称和忙碌/禁用状态；插槽内交互由控件自身提供标签和焦点顺序。
- **验证**：类型检查通过；完整示例 App 的设备截图和几何/溢出记录未完成时，视觉验收为 `UNVERIFIED`。

## 弹窗表单固定操作区

- 弹窗表单中的确定、应用、保存、取消等流程操作统一固定在弹窗底部，与表单滚动区分离；滚动内容必须留在固定 footer 上方，不得让操作按钮随滚动内容移出视口。
- `FullScreenModal` 使用 `confirmText` 或 `renderFooter` 提供固定底栏；`bodyMode="scroll"` 由组件管理内容滚动，`bodyMode="fill"` 时由宿主内容管理滚动，footer 仍由弹窗单独放置。
- `BottomSheet` 使用 `confirmText` 或 `renderFooter` 提供固定底栏；长表单使用默认滚动内容区，`dynamicHeight` 仅用于短内容选择或说明弹层。
- 新增或修改弹窗表单时，优先扩展上述组件，不得在滚动 children 中放确认类操作，也不得把确认操作放入标题栏。组件自己的系统/平台选择器同样遵守此位置约束。
- 即时选择并立即生效的列表项、相机/媒体查看等没有表单确认闭环的弹层，不额外增加固定操作区。

## 依赖和可移植性

- UI 运行时入口为 `sunxu` 和 `sunxu/core`；可选的 `sunxu/query` 仅封装通用 TanStack Query provider、Tab 查询键和失效工具，不承载 MES 或宿主业务。
- 组件只依赖 props、回调、通用主题 context 和明确声明的 UI peer dependencies；不导入来源 App 的 `@/`、API client、Zustand、登录态或私有配置。
- 权限控件只消费宿主传入的结果/判断回调，不自行解释权限码。
- 新增 peer dependency 必须由当前公开运行代码的 import 支撑；不复制来源 App 的完整依赖清单。

## 验证、授权与发布

- 类型检查不能代替 UI 验收；UI 变更应在可运行示例或真实宿主页面、实际视口及相关状态中检查，并记录截图和几何/溢出数据。
- 用户于 2026-11-06 选定 MIT，Sunxu 从 `0.1.3` 起使用根目录 `LICENSE` 和 package 元数据 `MIT` 公开发布；`0.1.0`–`0.1.2` 保留各自发布时的 `UNLICENSED` 元数据。包文件白名单包含运行时代码、README、许可证和 `docs/tab-query-caching.md`，peer dependencies 不捆绑。
- 按项目约定在 `main` 开发、提交并推送通过验证的当前任务变更；未来新增第三方代码或资产仍须单独核实再分发权与版权声明。

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

验收记录见[StatusTabs 布局与状态验收](./verification/status-tabs.md)，包含 Expo Web 375×812、320×720、812×375 浅/深色渲染、几何/溢出、选择切换和禁用态证据。原生 iOS/Android 触控范围仍为 `UNVERIFIED`。`0.1.0`–`0.1.2` 发布包标记 `UNLICENSED`；用户已选定新版本使用 MIT。

## 2026-11-06 StatusTabs underline 标签居中修复

CRM“客户 / 商机”导航的两个等宽 Tab 文字贴近格子左缘，而选中指示线按格子居中。根因是 underline Tab 使用横向 flex 布局但缺少主轴居中；在共享 `underlineTab` 增加 `justifyContent: 'center'`，不改 API、等分宽度、选中指示线、状态所有权或回调。Catalog 增加相同的两项导航示例。

渲染与 DOM 几何记录见[StatusTabs underline 对齐验收](./verification/status-tabs-alignment-2026-11-06/README.md)。375×812、320×720 竖屏及切换交互通过；812×375 的示例截图未显示落在首屏以下的控件，因此该格标记 `UNVERIFIED`。CRM 认证路由与原生 iOS/Android 也未验证。Sunxu 源码修复已在 `21bda27` 推送，MIT 元数据从 `0.1.3` 起生效；为兼容 CRM Expo `55.0.26`，`34f3a0f` 将 Expo peer 范围修正为 `~55.0.0`，并发布 `0.1.4`。CRM 已精确锁定 `sunxu@0.1.4`；干净安装、类型检查和 iOS JS bundle 导出通过，受保护的 CRM 认证路由仍为 `UNVERIFIED`。

## 2026-11-06 DateNavigator 周期导航

`DateNavigator` 新增可选 `period`（日/周/月/年）和 `maximumDate`。前后按钮以所选周期为单位移动，周一作为周起始；切换周期时锚定到该周期首日，最大日期约束同步限制日期选择与前进操作。未传这些属性的原调用继续按天移动且允许查看未来日期，周期选项和日期状态仍由宿主控制。

## 2026-11-09 弹窗表单固定底栏

- `FilterBar` 高级筛选改用共享 `BottomSheet`；筛选项在滚动区，重置/应用操作通过固定 footer 展示。
- iOS `DatePickerField` 的取消/确定操作移到选择器弹窗底部。`FullScreenModal` 和 `BottomSheet` 的 API 注释明确 footer 与内容滚动区分离；Catalog 示例改用固定完成按钮并增加长筛选项示例。
- `npm run typecheck` 通过。渲染验收为 `UNVERIFIED`：Expo Web 可打开 Catalog，但单次交互未能定位到可见的“应用高级筛选”按钮；未收集截图和 DOM 几何。iOS 原生日期选择器也未完成实际渲染核对。记录见[弹窗表单底栏验收](./verification/modal-form-footer-2026-11-09/README.md)。

## 2026-11-09 CRM 通用组合控件提取

### 组件盘点

| Component | Layer / user job | Visible owner | Source of truth | Composition and state owner |
|---|---|---|---|---|
| `DialPad` | Composite；输入电话号码、删除末位并把当前号码交给宿主 | 宿主的拨号弹层内容区 | `src/core/components/DialPad.tsx`，Sunxu `0.1.6` | 宿主控制 `value`、SIM 拨号、权限和结果；组件只绘制键盘并回调 |
| `AudioPlayer` | Composite；查看音频时长/进度并请求播放、暂停或 seek | 宿主的录音/音频内容区 | `src/core/components/AudioPlayer.tsx`，Sunxu `0.1.6` | 宿主管理音源、播放器实例、播放状态和错误；组件只展示状态并回调 |

### `DialPad` 契约

- **Anatomy/API**：号码显示、4×3 电话按键、删除末位按钮、提交按钮。受控 `value`、`onChangeText`、`onSubmit`；可选 `maxLength`（默认 20）、`placeholder`、全局 `disabled` 和 `isSubmitting`。按键追加标准 `1–9`, `*`, `0/+`, `#`；按键不会调用电话或权限 API。
- **States**：空值显示占位且提交禁用；有值可删除/提交；按压态只改变按键底色/操作透明度；`disabled` 禁止所有按键；`isSubmitting` 显示原生 spinner 并禁用删除/提交，号码按键保留现有 CRM 行为；拨号成功、失败及重试由宿主反馈。选中、焦点可见、加载列表、空结果和 hover 不适用：组件没有选择模型、异步请求、结果集合或桌面指针目标。
- **Tokens/layout/responsive**：主题背景、文本、次级文本、边线和主色来自 `useTheme`；键盘行间距 10dp、列间距 12dp、按键 64dp，动作按钮 64dp。父容器负责它与标题/表单的间距；行按可用宽度平分，不换行，320dp 及以上窄屏仍可容纳 3 列。
- **Accessibility**：每个键提供按钮角色、号码/星号/井号名称和添加提示；删除/提交提供描述性名称与禁用/忙碌状态；号码显示读出当前号码。触控面均不小于 64dp。读屏焦点顺序按视觉顺序从号码、按键、删除到提交；不使用颜色作为唯一禁用信号。
- **Recovery/composition**：宿主通过更新 `value` 清空/恢复输入；可以放入 `BottomSheet` 或其他内容容器，不负责标题、安全区、关闭、授权、SIM 卡选择或错误提示。最近邻替代是页面自行拼按键、输入显示和提交按钮；它使同一职责的几何、可访问名称和 disabled/loading 行为继续散落在宿主，因此统一到共享组件。

### `AudioPlayer` 契约

- **Anatomy/API**：播放/暂停按钮、标题与状态、可选进度拖动/点按区域、已播放和总时长。受控 `isPlaying`，必填 `onToggle`；可选标题、空闲状态文案、时长、当前时间、`isLoading`、`disabled`、`onSeek` 和阻止父级 Pressable 冒泡。默认标题“音频”，宿主可传“通话录音”等语义名称。
- **States**：默认暂停/播放态由宿主提供；按压有透明度反馈；加载时显示 spinner、禁用播放；禁用态禁止播放与 seek；仅在正在播放、已提供 `onSeek` 且时长大于零时允许拖动/点按及读屏步进；播放源错误和重试由宿主处理。选中、空列表、表单校验、hover 不适用：没有选择或数据集合，也不是表单字段或桌面组件。
- **Tokens/layout/responsive**：使用语义背景、主色、文字和边线；播放器最小高 58dp，左侧按钮视觉 40dp、触控扩展后 48dp，进度轨道触控高 48dp。长标题允许收缩，右侧状态和时间保持可读；父容器拥有播放器外部间距。
- **Accessibility**：播放/暂停按钮按标题生成名称并报告 disabled/busy；进度条暴露 adjustable 角色、时长/当前位置和前后 5 秒系统动作；装饰图标不进入读屏树。焦点次序与视觉顺序一致，支持触屏和读屏调整，不提供键盘快捷键。
- **Recovery/composition**：组件不读取音源、不管理播放实例；宿主可以在暂停/切换记录时重设时间或从错误中恢复。可放入列表卡片、详情卡片或弹层；不负责卡片/标题、安全区、媒体权限和播放错误。最近邻替代是 CRM 私有 `CallRecordingPlayer`；它已在通话、客户动态和驾驶舱重复出现，改为中性 `AudioPlayer` 保留回调边界并统一状态/可访问性实现。

`examples/catalog` 在地图图表示例页展示两组件，真实渲染与几何证据见[组合控件验收](./verification/composite-controls-2026-11-09/README.md)。该示例在 Expo Web 上验证布局和回调；原生 iOS/Android 设备、系统读屏与完整 Dynamic Type 档位仍需宿主验收。CRM 侧保留 SIM/API/错误处理，只把通用 UI 迁入 Sunxu。

## 2026-11-09 Android 全屏弹窗键盘避让

`FullScreenModal` 的 `avoidKeyboard` 在 Android 上根据弹窗根视图实际底边位移计算系统已完成的键盘避让量，并通过负 `keyboardVerticalOffset` 从键盘控制器的 padding 补偿中扣除这部分，避免系统窗口 resize/pan 与组件再次完整上移叠加。键盘关闭后重新采集基线；iOS 行为及固定 footer、表单滚动职责不变，未增加公开 API 或宿主业务依赖。

Catalog 增加含多个输入框和固定保存栏的键盘避让表单，可用于复核低位输入框聚焦时的可见区域。小米 2510DRK44C（MIUI V816）原生 APK 构建成功，但设备以 `INSTALL_FAILED_USER_RESTRICTED` 拒绝安装；未取得渲染截图和窗口几何数据，因此设备视觉验收为 `UNVERIFIED`。

## 2026-11-09 Sunxu 操作组件与 CRM 单条拜访接入

- 新增通用 `ActionButton`、`IconActionButton`、`ActionMenu`、`ChoiceSheet`、`SectionCard`、`MetricCard`、`Divider`、`ScalePressable` 和根级 `ToastHost`。它们只处理展示、交互状态和回调，不读取 CRM 数据或权限。
- `ChoiceSheet` 的选择项留在滚动区，“取消 / 确定”通过 `BottomSheet.renderFooter` 固定在底部；表单确认流程不能跟随选项滚出视口。
- CRM 每条拜访计划现在使用共享 `ListCard` 和 `ActionButton`；单条计划自己提供开始、结束和路线恢复操作。结束表单使用 `FullScreenModal` 固定底栏。Sunxu 不承担拜访 API、状态校验和定位业务。
- Catalog 新增操作菜单、单选弹层、按钮状态、轻按反馈、摘要卡片、分隔线和 Toast 示例，供可视核对。
- Sunxu 源码版本升至 `0.1.8`。npm registry 当前尚无该版本；CRM 使用精确 Git commit 作为依赖，本次不发布 npm 包。

`FilterBar` 的快捷筛选配置可设置 `includeAllOption: false`，省略“全部”并让当前选中项保持选中；默认仍显示“全部”，兼容现有调用。Catalog 与宿主菜单可据此复用相同筛选语义。

## 2026-11-09 Tel App 通用组件接入扩展

Tel App 接入检查中发现可共享而宿主先前自绘的加载、按压反馈、分隔线、Toast 容器和拨号键盘能力，现由 Sunxu 公共组件承接；Tel App 直接消费公开 API，不保留同义通用包装。

- `InlineLoading.size` 支持 React Native 加载指示器的字符串尺寸与具体数字尺寸，主题颜色仍由 Sunxu 提供；Catalog 展示 12、16 和 large 三种尺寸。
- `DialPad` 增加宿主键盘模式 `variant="keypad"` 与 `onKeyPress`，按键结果仍由宿主处理，不调用电话、权限或 SIM API。
- `StatusTabs` 的 `TabItem` 暴露 `testID`；`Badge` 与 `ProgressBar` 提供标准 `style` 接入点；`SelectableChip` 提供 `accessibilityLabel` 和 `suffix` 插槽。
- 新增可复用 `ScalePressable`、主题化 `Divider` 与根级 `ToastHost`，并在 `src/core/index.ts` 导出。
- 类型检查通过前，不发布新 Sunxu 包。Tel App 当前从相邻仓库以 `link:../../sunxu` 实时依赖共享源码，避免复制本地 Git 历史和示例依赖；发布和版本升级由各自项目流程单独处理。

Tel App 的真实设备/模拟器路由截图、长列表与弹层状态的几何/溢出证据未纳入 Sunxu catalog，本次宿主视觉验收仍标记为 `UNVERIFIED`，不能以类型检查替代。

## 2026-11-09 SectionCard 标题与 FilterBar 快捷筛选约定

- `SectionCard.title` 改为可选。它表达内容分组，不强制产生可见标题；只有标题能补充页面上下文、区分业务对象/任务/状态时才显示。当前 Tab、导航或邻近筛选已明确主题时省略标题，避免重复使用“概览”“信息”等泛化词。无标题且无副标题/右侧动作时不渲染 header，也不保留 header 与 body 之间的空隙。
- Catalog 同时展示有标题和无标题的 `SectionCard`，说明标题选择与容器外观分开。
- `FilterBar` 的快捷选项可设置 `includeAllOption: false`：隐藏“全部”，并避免再次点击当前选项时清空选择。默认 `true` 保持普通筛选可清除的原契约。
- 通话记录页已有“通话”主 Tab 和清晰的快捷/高级筛选、状态切换，移除没有额外业务辨识价值的“通话概览”容器标题，保留内容分组。
- `StatusTabs` 只负责选项、计数和选择状态，不添加可见解释行；业务差异写进标签/指标，必要的辅助解释用 `TabItem.accessibilityHint` 提供给读屏。Catalog 的 StatusTabs 示例只展示选项本身。

## 2026-11-09 默认主题色对齐东健 CRM

- `SunxuProvider` 未传宿主主题时，默认浅色主色改为 `#007D35`、主色浅底改为 `#E6F7EC`；深色主色改为 `#1F7A45`、主色浅底改为 `#10271A`。标签栏激活色与对应主题主色一致。
- Catalog 示例页的当前标签改为读取 `colors.primary`，避免继续硬编码旧蓝色。宿主显式传入的主题不变；`info`、`success` 等语义状态色也保留原值。
- CRM 当前主题定义来源：`../dongjian-crm/app/src/constants/colors.ts`。渲染与几何/溢出验收见[默认主题色验收](./verification/theme-default-brand-green-2026-11-09/README.md)。

## Sunxu 0.1.9 组件库核对

- `SectionCard.title` 可省略；没有标题、副标题或右侧操作时不产生空 header 或额外间距。
- `StatusTabs` 为 TabItem 增加仅供读屏使用的 `accessibilityHint`，不增加可见说明行。
- 默认主题色和 Catalog 组件示例对齐 CRM；快捷 FilterBar 示例覆盖隐藏“全部”并保留当前选择的配置。
- Catalog 在 375×812 Expo Web 视口下通过可见布局和快捷筛选切换检查。无标题分组和主色截图、DOM 几何及横向溢出记录见[验收记录](./verification/theme-default-brand-green-2026-11-09/README.md)。快捷筛选展开态截图只留在当前 CUA 检查记录，未归档到仓库；原生 Android/iOS 和深色主题复核仍为 `UNVERIFIED`。本次未发布 npm 包。

## 2026-11-10 Avatar 与 ProfileIdentity

- 新增通用 `Avatar`：优先展示宿主传入的头像 URL，图片缺失或加载失败时回退到姓名首字母；可选点按回调、最小触控区域、禁用态、上传忙碌态和无障碍名称。组件不调用照片选择、权限或上传 API。
- 新增组合组件 `ProfileIdentity`：将 `Avatar`、显示姓名和宿主提供的 `metadata` 插槽组成身份摘要。点击头像的行为由宿主回调提供；组件不拥有整行导航、资料字段、权限或保存逻辑。
- 两组件通过 `src/core/index.ts` 公共导出；Catalog 覆盖姓名回退、可更换头像、上传中和身份摘要示例。`metadata` 可承载 CRM 的组织/职位字段或 Tel App 的坐席/分机字段，字段含义和数据源仍归宿主。
- Expo Web Catalog 在 375×812、320×720 和 812×375 浅色视口，以及 375×812 深色主题完成渲染；点击回调、忙碌态禁用和 `aria-busy` 已验证。`npm run typecheck`、Web 导出及 spacing ledger 校验通过。截图与几何记录见[Avatar 与 ProfileIdentity 验收](./verification/profile-identity-2026-11-10/README.md)。
- 有效头像 URL 显示/失败回退、东健 CRM/Tel App 真实资料路由接入、原生 iOS/Android、系统读屏和动态字体仍为 `UNVERIFIED`。
- 既有 `PhotoPicker` 继续承担多图业务证据流程，不与头像选择合并。宿主应只在后端支持自助头像时提供 `onAvatarPress`。

## 2026-11-10 IconActionButton 紧凑布局尺寸

- `IconActionButton.size` 控制按钮布局框，不受平台最小触控尺寸反向撑高；默认布局尺寸仍为 44dp。
- 组件按 iOS 44pt / Android 48dp 计算扩展 `hitSlop`。`ControlSize.iconButton` 的 32dp 布局框每边扩展 8dp，形成 48dp 触控区域；父级需保留足够间距，避免扩展热区覆盖相邻操作。
- Catalog 同行展示 32dp 紧凑按钮与 44dp 默认按钮，几何证据记录于[紧凑尺寸验收](./verification/icon-action-button-compact-2026-11-10/README.md)。原生 iOS/Android 的实际命中范围仍为 `UNVERIFIED`。

## 2026-11-10 页头与顶部安全区衔接

- `ScreenContainer` 将顶部安全区交给页头区域绘制：有页头时默认使用主题 `surface`，没有页头时使用页面 `background`。页头、状态栏下方的安全区和主题切换保持同一底色，正文仍使用原页面背景。
- `ListScreenContainer`、`DetailScreenContainer` 和 `FormScreenContainer` 默认采用此行为。自定义页头可通过 `headerBackgroundColor` 同步页头容器及顶部安全区背景；该属性在标题容器中也同步设置标准 `PageHeader` 的背景。
- 父级导航已处理顶部安全区时，继续从 `safeAreaEdges` 移除 `top`；容器不会再留第二段顶部空白。底部安全区规则不变。
- Catalog 的列表、详情和示例页继续使用标准页面容器，作为默认主题表面与顶部安全区的可运行示例；375×812、320×720 浅色和 375×812 深色的截图、DOM 几何及 seam 台账见[页头与顶部安全区验收](./verification/page-header-safearea-2026-11-10/README.md)。原生状态栏区域因 Expo Web inset 为 0px，标记为 `UNVERIFIED`。
