# 页头与顶部安全区衔接验收

## 结论

**Catalog Web：PASS。整体：PASS WITH UNVERIFIED。** `ScreenContainer` 的页头区域与主题表面保持一致；Light/Dark 和 320/375px 视口通过 DOM 几何、无横向溢出及截图检查。Expo Web 的顶部安全区 inset 为 0px，Android/iOS 原生状态栏区域没有在本次运行中出现，因此原生状态栏背景的像素级验收为 `UNVERIFIED`。

## 业务目标与组件职责

- **使用者**：在多个宿主 App 组合列表、详情和表单页的开发者。
- **目标**：标准页面容器自行把页头与状态栏下方的顶部安全区绘制为同一主题表面；业务页无需另写状态栏高度或填色补丁。
- **保护条件**：正文继续使用页面背景，顶部 inset 只由一个容器拥有，父级已处理顶部安全区时不重复留白；亮暗主题自动适配。
- **组件结构**：页面根背景 → 顶部安全区与页头表面 → `PageHeader` → 页面内容区（滚动或键盘感知）→ 固定 footer。`headerBackgroundColor` 可同步自定义页头和顶部安全区；无页头时顶部安全区使用页面背景。

## 路由与视口矩阵

目标路由为本地公开的 `Sunxu Catalog` 默认客户列表，业务内容由示例数据提供，无认证和外部 API。深色主题通过 Catalog 的“组件”页头操作切换，再返回同一列表路由。

| 路由 / 状态 | 视口 | 结果 | 截图 |
|---|---:|---|---|
| 默认客户列表，浅色 | 375×812 | PASS；无横向溢出 | [截图](./375x812-light.png) |
| 默认客户列表，浅色 | 320×720 | PASS；无横向溢出，快捷状态项自然换行 | [截图](./320x720-light.png) |
| 默认客户列表，深色 | 375×812 | PASS；页头、安全区容器背景同为 `#1C1C1E` | [截图](./375x812-dark.png) |
| Android/iOS 原生系统状态栏 | 设备视口 / 原生安全区 | UNVERIFIED；Expo Web inset 为 0px | — |

## 几何与空间效率

Playwright 在字体加载后等待两帧再采集矩形和计算样式。375px 下页头高度为 57px、搜索/筛选工具栏高 99px、首卡位于 y=168px；320px 下页头仍为 57px，工具栏因状态选项换行增至 116.5px，首卡位于 y=185.5px。深色 375px 与浅色结构尺寸一致。

- 页头 `PageHeader` 与其安全区父层在三个 Web 状态中背景一致：浅色 `rgb(255, 255, 255)`，深色 `rgb(28, 28, 30)`。测得顶部 inset 为 0px，因此这里只能确认 Web 盒模型与主题色一致，不能替代原生状态栏截图。
- 页头到搜索/筛选工具栏的间距为 0px；页头保留 1px 主题分隔线，符合列表页连续堆叠关系。
- 工具栏到首张结果卡片保留 12px 页面背景；相邻结果卡片间距为 10px，来源于 Catalog 示例列表内容样式。
- `documentElement.scrollWidth - clientWidth` 在 320px、375px 视口均为 0；无页面级水平溢出。
- Catalog 仅有三条示例结果，列表下部留白来自示例数据量，结果区仍从工具栏后立即开始并占满剩余空间；页头没有额外的大标题横幅或摘要行。

## 间距与 surface-frame 台账

- DOM 矩形、计算样式和视口滚动数据：[geometry.json](./geometry.json)
- 机器可读 seam 台账：[spacing-ledger.json](./spacing-ledger.json)
- surface-frame gate：`NOT APPLICABLE`。页面根是全屏画布，不存在浮在独立工作区背景上的主面板；页头按页面结构与顶部边缘连接。
- 验证命令：`cd /Users/suconnect/.codex/skills/playwright-skill && node run.js /tmp/playwright-page-header-evidence.js`
- seam 校验命令：`python3 /Users/suconnect/.codex/skills/ui-ux-pro-max/scripts/validate_spacing_audit.py docs/verification/page-header-safearea-2026-11-10/spacing-ledger.json`
- 校验结果：退出码 `3`，`PASS WITH UNVERIFIED`，12 条 seams；其中 3 条原生顶部安全区与页头 seam 为 `UNVERIFIED`，其余 9 条已渲染的页头/工具栏/结果卡片关系为 `PASS`。
- `npm run typecheck` 通过；本次未添加或运行测试。

## 来源与变更

修改前，`ScreenContainer` 的根 `SafeAreaView` 用页面 `background` 绘制顶部 inset，而标题容器中的 `PageHeader` 使用主题 `surface`，导致截图中状态栏下方与页头断色。现在 `ScreenContainer` 把 `top` edge 从页面根安全区中拆出，交给页头区域绘制；标题容器的自定义背景也同步传给 `PageHeader`。父级导航可通过 `safeAreaEdges` 继续持有顶部 inset。
