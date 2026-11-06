# PageHeader 右侧操作收纳验收

**状态：PASS WITH UNVERIFIED。** iPhone 17 Pro / iOS 26.1 的 Expo Go 原生渲染中，单项图标、多项省略号菜单、菜单文案、主题切换和重置动作已检查。外部点击关闭未能通过自动化坐标输入复核；窄屏、横屏、Android、动态字体及系统读屏仍为 `UNVERIFIED`。

## 组件契约

- `headerActions` 由宿主提供，每项包含稳定 `id`、可见 `label`、图标和动作回调；不承载权限判定、路由或业务动作。
- 0 项不占右侧操作；1 项使用对应图标直接显示并以操作标签作为无障碍名称；2 项及以上显示省略号，打开靠右锚定的文字菜单。
- 点菜单项先关闭菜单，再调用宿主回调；禁用态、危险色、主题 token 和较长菜单滚动由共享页头处理。
- iOS 触控目标至少 44pt，Android 至少 48dp。菜单右对齐，最大宽度 256dp。

## 运行与可见状态

目标为本地 `examples/catalog`，运行于 iOS 26.1 Simulator 的 Expo Go；逻辑视口 402×874pt，截图为 1206×2622px（3×）。

| 页面 / 状态 | 结果 | 证据 |
|---|---|---|
| Catalog → 列表 → 客户档案；单项 `新增客户` | 右上角只显示加号；无障碍名称为“新增客户”；点击后进入新建客户表单 | [iPhone 17 Pro 单项图标](./iphone-17-pro-single-icon.png) |
| Catalog → 组件 → 组件示例；多项菜单收起 | 右上角显示省略号按钮，名称“更多操作” | [iPhone 17 Pro 多项菜单](./iphone-17-pro-overflow-menu.png) |
| 多项菜单展开 | 省略号下方显示“切换深色主题”“重置示例”，顺序与 props 一致；点主题项可切换深浅主题并关闭菜单；点重置项可关闭菜单并显示重置反馈 | [iPhone 17 Pro 多项菜单](./iphone-17-pro-overflow-menu.png) |

## 几何与溢出记录

- `PageHeader` 左右列在 iOS 均为 44pt；页头水平内边距为 8pt，标题可用列为 x=52–350pt，左右列为 x=8–52pt 和 x=350–394pt，标题列保持屏幕中心对齐。页头垂直 padding 为 4pt + 8pt，连同 44pt 内容高度形成约 56pt 页头。
- 菜单截图中的可见面板约为 x=138–394pt、y=114–202pt（256×88pt）；右边距 8pt，两行各至少 44pt。面板留在 402×874pt 视口内，未观察到横向裁切。
- 这是原生 React Native 屏幕，没有 DOM。页头列尺寸来自共享组件样式与安全区布局，菜单外框由 3×原生截图边界换算；未注入 `onLayout` 或原生层级检查器，因此这些值是可复核的样式/截图几何，不等同于 DOM 矩形测量。没有拿这些数据替代窄屏或横屏检查。
- 自动化坐标点击在 Simulator UI 连接中返回 `noWindowsAvailable`，因此菜单外点击关闭为 `UNVERIFIED`；代码仍提供外层 Pressable、系统返回 `onRequestClose` 和辅助功能 Escape 关闭处理。

完整坐标、来源样式和截图 SHA-256 见 [layout-evidence.json](./layout-evidence.json)。截图为 iPhone 17 Pro 单一竖屏浅色状态；没有 320×720、横屏或 Android 实际渲染截图。辅助功能树可见“更多操作”、两个菜单标签及单项“新增客户”。

类型检查：仓库 `npm run typecheck` 与 Catalog `npx tsc --noEmit -p examples/catalog/tsconfig.json` 均通过。未新增或运行测试。
