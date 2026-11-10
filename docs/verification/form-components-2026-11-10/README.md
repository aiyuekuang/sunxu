# 统一表单组件验收

## 范围与结论

本次以 Sunxu Catalog 的表单页验证共享组件。Catalog 路由公开可访问，无需身份验证；Tel App 的 `EditProfileScreen` 是受保护的登录后页面，没有用户确认的测试会话，因此没有打开该路由。

**Catalog 结果：PASS。整体结果：PASS WITH UNVERIFIED。** Sunxu 表单的间距、表面色、聚焦、错误、只读、多行、窄屏、横屏和深色态已完成渲染检查。Tel App 真实个人资料页的渲染验收仍为 `BLOCKED`。

## 布局与组件契约

- `FormPage` 内容列使用 `Spacing.md` 页面内边距、`Spacing.sm` 分组间距，以及共享 `ContentWidth.form`（720px）并居中；手机宽度保持 12px 页面边距。
- `FormSection` 使用主题 surface、边线、12px 内边距和 8px 子项间距，不加阴影。
- `FormField` 默认可编辑输入使用主题 surface 和边线；聚焦、错误、只读各由主题色与语义状态呈现；标签与控件之间 4px、同分组字段之间 8px。
- 320px 与 375px 视口没有水平溢出；812px 横屏内容列限制为 720px。字段控件高 48px，多行控件外框高 82px。

## 渲染矩阵

| 路由 | 视口 / 状态 | 结果 | 截图 |
|---|---|---|---|
| Sunxu Catalog → 表单页面示例 | 320×720 浅色默认 | PASS | [320x720-default.png](./320x720-default.png) |
| Sunxu Catalog → 表单页面示例 | 375×812 浅色默认 / 错误 / 只读 / 聚焦 | PASS | [375x812-default.png](./375x812-default.png)、[375x812-focus.png](./375x812-focus.png)、[375x812-error.png](./375x812-error.png)、[375x812-readonly.png](./375x812-readonly.png) |
| Sunxu Catalog → 表单页面示例 | 812×375 横屏 | PASS | [812x375-default.png](./812x375-default.png) |
| Sunxu Catalog → 表单页面示例 | 375×812 深色 | PASS | [375x812-dark-default.png](./375x812-dark-default.png) |
| Tel App → EditProfileScreen | 登录后真实路由 | BLOCKED：没有用户确认的认证测试会话，未打开受保护页面 | — |

Expo Web 开发预览左下角保留开发菜单按钮；该按钮是预览环境工具，不属于表单组件。Catalog 的 Web 静态导出未能运行，因为 Sunxu 开发依赖尚未安装 `react-dom` 与 `react-native-web`；本次用本地 Expo Web 开发服务完成实际渲染检查。

## 几何与状态证据

- Playwright 命令：`cd /Users/suconnect/.codex/skills/playwright-skill && node run.js /tmp/playwright-form-components.js`
- 几何记录：[geometry.json](./geometry.json)
- 可机读间距与 surface-frame 台账：[spacing-ledger.json](./spacing-ledger.json)
- 校验命令：`python3 /Users/suconnect/.codex/skills/ui-ux-pro-max/scripts/validate_spacing_audit.py docs/verification/form-components-2026-11-10/spacing-ledger.json`
- 校验结果：退出码 `0`，`PASS`，6 条 spacing seams。
- 聚焦实测：字段外框描边为主题主色 `rgb(0, 125, 53)`，输入框自身浏览器 outline 宽度为 0，避免叠加蓝色边框。
- 错误实测：联系人字段描边为 `rgb(255, 49, 65)`，错误文案可见。
- 只读实测：客户编号输入为 `readOnly=true`、`disabled=false`，外框读取 `surfaceSecondary`。

Sunxu `npm run typecheck` 通过。Tel App `yarn tsc --noEmit` 仍被未改动的 `src/components/CustomerDetailSheet.tsx` 中 14 个未声明 setter 报错阻塞；本次修改的 `EditProfileScreen.tsx` 没有出现在错误列表。完整真机、读屏、动态字体和真实 Tel 资料页面验收尚未完成。
