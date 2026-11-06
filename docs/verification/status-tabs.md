# StatusTabs 布局与状态验收

## 组件契约

- **组件**：`StatusTabs`，复合交互控件；让用户在同一组筛选/导航项中选择一个状态。
- **边界**：宿主拥有选项数据、当前筛选值、查询和权限；组件只呈现标签、计数、选中/禁用状态并调用 `onChange`。
- **可见归属**：由页面工具栏或所属信息区放置；父级拥有与相邻模块的间距。
- **单一来源**：`src/core/components/StatusTabs.tsx`。
- **组成**：外层容器；`rounded`/`pill` 的轨道；Tab 按钮；文字和可选计数徽标；`underline` 的选中指示条。
- **API**：`tabs`、`activeKey`、`onChange`、`variant`、`sizing`、`scrollable`、溢出选项、`density`、`countBadge`、`style`。本次不改 API。
- **宽度**：`stretch` 在页面级容器内填满可用宽度并等分；`hug` 按内容收缩；`scrollable` 保留内容宽度及横向滚动。修复只给非滚动 `rounded`/`pill` 的 `stretch` 轨道增加伸展约束。
- **状态**：

| 状态 | 表现与行为 | 无障碍反馈 |
|---|---|---|
| 默认/未选中 | 使用次级文字色；点击调用 `onChange` | `role=tab`、完整标签和计数 |
| 选中 | 使用主色和 `textOnPrimary`；字重提升 | `selected=true` |
| 按下 | 保持几何不变，以透明度反馈 | 原生触控控件语义 |
| 禁用 | 降低视觉强调、不可触发回调；选中禁用项使用次级表面 | `disabled=true`，选中态仍单独表达 |
| 加载/错误/空/成功 | 不适用；组件不获取或持有数据 | 由宿主数据区呈现 |

- **主题与尺寸**：颜色来自 `useTheme()`；使用 `Radius.sm`、`Spacing` token。Tab 可见高度为 34dp，`HIT_SLOP` 四边各 8dp，原生有效热区目标为 50dp；DOM 只测可见矩形，原生实际命中范围仍待原生验收。
- **适用宽度**：标签应保持单行；320dp、375dp 手机及横屏宽度下优先完整展示当前四项。项目需要更多选项时由调用方使用 `scrollable`。
- **替代方案**：不在 CRM 页面单独加宽度样式；那会让相同缺陷继续存在于其他 `rounded`/`pill` 调用点，也不能让共享组件兑现默认 `stretch` 契约。

## 本次实现

非滚动 `rounded`/`pill` 的轨道在 `sizing="stretch"` 时设置 `flex: 1` 与 `minWidth: 0`，使等分 Tab 获得真实可用宽度；`hug` 与滚动分支不套此约束。非 `underline` 变体现在消费已有的 `TabItem.disabled`：禁用点击、减弱样式并暴露禁用状态。

## 渲染与交互证据

- **运行环境**：Sunxu `examples/catalog` 的 Expo Web，真实页面 `/` → “组件页面示例” → `StatusTabs · Pill 筛选`。它直接使用本地 Sunxu 源码。
- **375×812**：筛选区宽 319px；4 个 Tab 各 71.8×34px；视口 `clientWidth=scrollWidth=375`。
- **320×720**：筛选区宽 264px；4 个 Tab 各 58×34px；无页面横向溢出。
- **812×375 横屏**：筛选区宽 756px；4 个 Tab 各 181×34px；无页面横向溢出。
- **状态交互**：点击“通话”后唯一选中项切换为“通话”；禁用示例中的“跟进”暴露 disabled，尝试点击后仍保持“全部”选中。
- **主题**：浅色与深色均完成渲染；组件继续读取语义色 token。CRM 主色与白色 `textOnPrimary` 的源码对比度分别约 5.27:1（浅色 `#007D35`）及 5.35:1（深色 `#1F7A45`）。Catalog 自带的蓝色主题并非 CRM 品牌色，截图用于验证结构和几何。
- **运行错误**：Playwright 页面错误 0 条。
- **平台边界**：Expo Web 已有 E2 几何和 E3 点击/状态证据；iPhone 17 / iOS 26.1 原生渲染和筛选切换已在 CRM 页面核验。Android、系统字体最大缩放及原生实际命中框尺寸仍为 `UNVERIFIED`。

截图：

- [375×812 浅色](./status-tabs/375-light.png)
- [375×812 深色](./status-tabs/375-dark.png)
- [320×720 浅色](./status-tabs/320-light.png)
- [812×375 横屏浅色](./status-tabs/812-landscape-light.png)

## CRM iOS 模拟器补充验收

- **页面/设备**：CRM「客户详情」→「客户时间轴」；iPhone 17，iOS 26.1，模拟器截图原始尺寸 1206×2622 px。
- **预览来源**：从 Sunxu 提交 `21bda27` 打包的本地 tarball 临时替换 CRM `node_modules/sunxu`，由现有 Expo 开发服务刷新；CRM `package.json` 与 `package-lock.json` 未修改，npm 未发布。该预览用于验证源组件在宿主页面的实际渲染，不代表 CRM 已升级正式依赖。
- **视觉结果**：绿色选中项和“全部 / 通话 / 跟进 / 其他”四个标签完整可见，轨道横向填满工具区；验收图只保留组件区域，不含客户资料。
- **交互结果**：点击“通话”后该项成为唯一选中项，时间轴由 5 条变为 2 条；再点“全部”恢复默认选中及 5 条记录。
- **截图**：[CRM iPhone 17 原生组件区域](./status-tabs/crm-iphone17-light.png)。
- **限制**：上述预览记录当时的本机 `node_modules` 与正式依赖状态；后续注册表版本升级见下方记录。

## 2026-11-06 underline 修复的 CRM 精确依赖升级

- **公开版本**：`sunxu@0.1.4`，MIT。`0.1.3` 的 Expo peer `~55.0.32` 与 CRM `expo@55.0.26` 不兼容；源仓 `34f3a0f` 将 peer 放宽到同一 55.0 patch 系列的 `~55.0.0` 后发布 `0.1.4`。npm registry 回读版本、许可证、peer 范围与 tarball integrity。
- **CRM 安装**：`package.json` 与 `package-lock.json` 精确锁定 `0.1.4`；`npm ci --ignore-scripts` 成功，`npm ls sunxu --depth=0` 回读 `sunxu@0.1.4`，实际安装源码含 underline Tab 主轴居中修复。
- **代码构建**：`npx tsc --noEmit` 通过；首次 iOS JS bundle 导出遇到旧 Metro cache/Expo CLI 异常，清空缓存后 `npx expo export --platform ios --output-dir /tmp/dongjian-crm-export --clear` 成功，输出 iOS bundle。该命令不替代原生 iOS 编译或上机验收。
- **视觉边界**：客户/商机 underline 由独立 Catalog 的竖屏和切换交互证据覆盖；812×375 横屏示例控件落在首屏外，继续标记 `UNVERIFIED`。CRM 实际认证路由在本次未打开，原生 iOS/Android 该页面也未复核。
- **安装提示**：干净 npm 安装报告 44 项依赖审计告警（2 low、20 moderate、20 high、2 critical）；本次没有升级或修复无关传递依赖。

代码验证：Sunxu `npm run typecheck` 与 Catalog `npx tsc --noEmit --project examples/catalog/tsconfig.json` 通过；`git diff --check` 通过。未新增或运行单元测试。
