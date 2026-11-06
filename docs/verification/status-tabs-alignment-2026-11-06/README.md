# StatusTabs underline 对齐修复验收

**状态：PASS WITH UNVERIFIED。** 375×812 与 320×720 的可见渲染、几何和选择交互通过；812×375 的 DOM 几何通过，但 catalog 示例把该控件排在可视区以下，截图未显示控件。CRM 客户/商机 underline 路由没有在真机复核；已存在的 iPhone 17 pill 变体预览不覆盖此次 underline 对齐。

## 目标与范围

CRM 销售人员在手机上切换“客户 / 商机”记录列表，再搜索和查看记录。现象是两个等宽 Tab 的文字靠各自左侧，选中指示线却按整格居中，造成标签和所属区域错位。成功条件是文字与各自 Tab 格子、选中指示线共用水平中心，同时保持等分宽度、选中状态和现有交互不变。

本次只改 Sunxu 共享组件的 `underlineTab` 横向对齐；CRM 业务状态、搜索和页面布局不变。没有在 CRM 页面增加局部偏移样式。

## 组件规格

- **组件 / 层级 / 职责：** `StatusTabs`，复合组件；在同一导航或筛选组内切换一个选项。
- **可见归属：** CRM 的 `CustomerOpportunityTabs`，位于客户/商机内容区上方；父容器负责与相邻搜索和列表的间距。
- **单一来源：** [StatusTabs.tsx](../../../src/core/components/StatusTabs.tsx)，Sunxu 共享源码。
- **非目标：** 不持有业务数据、权限、查询或导航；不改变 CRM 的 `activeKey` 状态所有权。
- **结构：** underline 外层分隔线、Tab 触控控件、可选图标、标签文字、选中指示线。
- **API：** `tabs`、`activeKey`、`onChange`、`variant="underline"`、`sizing`、`scrollable`、`density`、`style`；此次 API 不变。CRM 使用受控的 `activeKey` / `onChange`。
- **布局：** 非滚动 `stretch` 模式下各 Tab 等分可用宽度；文字和图标组使用 `justifyContent: 'center'`。选中线仍由 Tab 自身定位，间距使用 `Spacing` token。
- **状态：** 未选中、选中、按下和禁用态沿用既有颜色、指示线、透明度与无障碍状态；加载/错误/空/成功不适用，因为组件不请求或持有数据。
- **主题与触控：** 颜色读取 `useTheme()`，文字尺寸读取 `FontSize`，点击热区使用 `HIT_SLOP`。浏览器 DOM 只能证明可见控件几何；原生实际命中范围仍未验证。
- **响应式：** 非滚动 stretch 等分；`hug` 自适应内容；`scrollable` 保持内容宽度并横向滚动。本次复核 CRM 两项短标签的等分模式。
- **无障碍：** Tab 角色、标签、`selected` / `disabled` 状态沿用现有 API。键盘焦点和原生读屏路径未在本次浏览器检查中验证。
- **替代方案：** 不在 CRM 包装组件上添加左侧 padding；该做法会使标签与指示线的中心关系分离，也会让其他调用点继续保留同类问题。

## 验收矩阵

目标运行时为本地公开的 Expo Web catalog：`/` → “组件页面示例” → “StatusTabs · Underline 导航”。该示例使用与 CRM 相同的“客户 / 商机”标签，并直接读取本地 Sunxu 源码。Playwright 首次访问成功，没有遇到登录页面。

| 视口 / 状态 | 几何与交互结果 | 状态 |
|---|---|---|
| 375×812 / 客户选中 | 两格各 151.5px；文字和选中线中心偏差均为 0px；页面与控件无横向溢出 | PASS |
| 375×812 / 商机选中 | 点击后 `aria-selected=true`；商机文字中心偏差 0px；恢复客户选中 | PASS |
| 320×720 / 客户选中 | 两格各 124px；文字和选中线中心偏差均为 0px；页面与控件无横向溢出 | PASS |
| 812×375 / 客户选中 | DOM 两格各 370px、文字中心偏差均为 0px；但示例页面将该控件排在可视区以下，截图无法检查实际绘制 | UNVERIFIED |
| CRM `CustomersTab → Customers` / iOS 原生 | 页面源码确认使用 `CustomerOpportunityTabs`，但未使用个人登录态打开路由 | BLOCKED：没有经确认的认证测试会话 |
| iOS / Android 原生 underline 控件与读屏 | 本次对齐验收仅运行 Expo Web catalog；iPhone 17 上另有 StatusTabs pill 变体预览，但不是 underline 变体 | UNVERIFIED |

移动端可见截图：

- [375×812，客户选中](./375x812-customers.png)
- [375×812，商机选中](./375x812-opportunities.png)
- [320×720，客户选中](./320x720-customers.png)
- [812×375，控件未进入可视区](./812x375-customers.png)

详细 DOM 矩形、页面/控件滚动宽度、截图哈希和 spacing ledger 见 [spacing-audit.json](./spacing-audit.json)。`surface_frame_gate` 为 `NOT APPLICABLE`：本次目标是单个内联导航控件，没有独立 workspace 背景与主面板边框关系。两格之间为同一导航条的有意相邻，间隙 0px。

执行并通过的代码检查：`npm run typecheck`（exit 0）。

执行的视觉证据校验命令：

```text
python3 /Users/suconnect/.codex/skills/ui-ux-pro-max/scripts/validate_spacing_audit.py docs/verification/status-tabs-alignment-2026-11-06/spacing-audit.json
```

结果：exit 3，`PASS WITH UNVERIFIED`，未解决 seam 为横屏 catalog 可视区外的一项。没有把该项报告为视觉通过。

## CRM 接入边界

Sunxu 源码改动已在 `21bda27`（`origin/main`）中。CRM 当前安装的 `sunxu@0.1.2` 尚未包含此提交；由于 Sunxu 当前包许可证为 `UNLICENSED`，项目发布规范要求先确认可再分发权和许可证，故本次没有发布 npm 包或改动 CRM 锁文件。既有的 [CRM iPhone 17 pill 预览](../status-tabs.md)核验的是四项 pill 筛选样式，不是客户/商机 underline 导航。CRM 实际路由要拿到该修复，仍需完成受许可约束的版本发布与精确依赖升级，再在确认的测试会话中复核。
