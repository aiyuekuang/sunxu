# FormPage 保存按钮尺寸修复验收

## 变更

`FormPage` 页头继续使用 `ActionButton` 的 `primary` / `sm` 变体。可见按钮保留 `ControlSize.control` 的 36dp 高度；透明外层容器按平台保留最小触控高度（iOS 44pt、Android 48dp），为 `ActionButton` 的 `hitSlop` 留出父级边界。加载、禁用、提交回调、无障碍名称和错误计数 API 未改变。

## 渲染证据

目标为本地公开的 Sunxu Catalog 示例：`http://localhost:8082/` → 点击一次“新增客户” → `FormPage` 表单示例。Playwright 在 Expo Web 中完成 DOM 测量、无标注截图及一次保存点击；保存后示例进入“客户详情”。

| 视口 | 保存按钮 | 透明触控容器 | 表单框架 |
|---|---:|---:|---|
| 375×812 | 72×36px | 72×44px（Web/iOS token） | `Spacing.md` 左右与顶部留白均为 12px |
| 320×720 | 72×36px | 72×44px（Web/iOS token） | 表单卡片左右各 12px，未被按钮挤压 |
| 812×375 | 72×36px | 72×44px（Web/iOS token） | 横屏内容列居中，表单在固定底栏上方滚动 |

Android 下外层容器由源码使用 48dp token；本次没有读取原生可访问节点 bounds，故原生触控区域为 `UNVERIFIED`。320×720 Web 文档报告宽度 331px；超界节点位于视口上方（y=-144 至 -72），可见表单和保存按钮没有溢出，节点归属未确认。加载、禁用、错误计数与按压状态未在示例中单独渲染。

截图、DOM 几何和逐项 spacing/frame ledger 在本目录中。Spacing validator：

```bash
python3 /Users/suconnect/.codex/skills/ui-ux-pro-max/scripts/validate_spacing_audit.py /Users/suconnect/Desktop/code/sunxu/docs/verification/form-page-save-2026-11-19/spacing-ledger.json
```

## 类型检查

- 针对 `FormPage.tsx` 及其导入依赖的定向 TypeScript 检查通过。

## 消费端状态

MES App 仍固定依赖 `sunxu@0.1.10`；本次预览使用 Catalog 的本地源链接。App 只有在 Sunxu 发布新精确版本并更新依赖后才会拿到此修复；Android `QualityFormScreen` 的原生页面尚未验收。
