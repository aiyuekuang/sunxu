# FullScreenModal 顶部间距核验

## 结论

`FullScreenModal` 的标题栏完整采用平台顶部安全区 inset，再额外使用 `Spacing.sm`（8dp / 8pt）的间距。Android、iOS 和两个窄屏 Web 视口的关闭按钮触控区域都与安全区边界相隔 8 个布局单位；Web 页面无横向溢出。

该弹窗铺满宿主可用视口，没有独立的内容工作区边框，因此表面边框门禁标为 `NOT APPLICABLE`。具体几何、截图哈希和逐项结果见 [spacing-audit.json](./spacing-audit.json)。

## 页面状态与证据

检查路由：Sunxu Expo Catalog → 组件页面 → `FullScreenModal · 固定操作区 / 键盘避让 / immersive` → 打开固定操作栏示例。状态为编辑客户信息弹窗已打开，页头和关闭按钮可见。

| 平台 / 视口 | 几何证据 | 截图 |
| --- | --- | --- |
| Android API 36.1，1080×2400 px，2.625 px/dp | 系统状态栏 frame 底部 y=128px（48.76dp）；关闭触控区顶部 y=149px（56.76dp）；间隔 21px（8dp） | [android-modal-open.png](./android-modal-open.png) |
| iPhone 17 / iOS 26.1，402×874 pt | 顶部安全区结束于 y=62pt；关闭触控区为 y=70–114pt；间隔 8pt | [ios-modal-open.png](./ios-modal-open.png) |
| Web，375×812 CSS px | 关闭触控区为 x=315–359、y=8–52；视口宽度等于文档滚动宽度 | [375x812-modal-open.png](./375x812-modal-open.png) |
| Web，320×720 CSS px | 关闭触控区为 x=260–304、y=8–52；视口宽度等于文档滚动宽度 | [320x720-modal-open.png](./320x720-modal-open.png) |

Android AVD 截图未绘制状态栏图标；系统窗口仍报告状态栏可见，frame 为 `[0,0][1080,128]`。间距以系统 frame 与 UIAutomator 触控区边界计算，并在截图上检查留白。

## 验证

- `npm run typecheck`：通过。
- `git diff --check`：通过（最终变更清理后再次执行）。
- 未新增或运行测试。
- 间距审计校验：`python3 /Users/suconnect/.codex/skills/ui-ux-pro-max/scripts/validate_spacing_audit.py docs/verification/full-screen-modal-top-spacing-2026-11-11/spacing-audit.json`。
