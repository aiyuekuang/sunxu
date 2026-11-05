# 榫序 Sunxu

**Sunxu 是面向 React Native / Expo 项目的共享组件包。**它整理跨业务基础 UI、MES 领域组件和宿主 App 集成，让多个 App 可以复用同一份组件代码和契约。

## 当前迁移状态

MES 基线 `main-买断版本` 的固定提交 `e92d02d7cf2269cf8c564a60ff6a00255e903c8e` 已完整纳入：88 个 `src/components/**` 共享组件和 305 个 `src/screens/**/components/**` 页面私有组件，共 393 条逐文件迁移记录。来源工作区存在未提交改动，本次仅使用固定提交树。

共享组件按职责从 `sunxu/core`、`sunxu/mes` 和 `sunxu/integrations/mes-app` 导入。页面私有组件保留在 `src/mes/screens/**`，不会从公开入口导出。完整来源、目标、摘要、宿主依赖和适配记录见 [`docs/migrations/mes-components.md`](./docs/migrations/mes-components.md) 与 [`docs/migrations/mes-components.json`](./docs/migrations/mes-components.json)。

TypeScript 项目检查已通过。真实页面渲染、截图和几何/溢出检查尚未执行，视觉验收状态为 **UNVERIFIED**。

## 导入示例

```tsx
import { AppText, EmptyState, SunxuProvider } from 'sunxu';
import { ApprovalActionBar, configureMesHostServices } from 'sunxu/mes';
import { AppUpdateChecker } from 'sunxu/integrations/mes-app';
```

MES 组件由宿主注入 API client、服务实现、授权判断、Store、实时事件和文件下载能力。对应配置入口从 `sunxu/mes` 导入；集成组件单独从 `sunxu/integrations/mes-app` 引入。

## 包与授权

`package.json` 当前设置 `private: true`、`license: UNLICENSED`，尚未发布。MES 来源仓库未发现明确许可证；在权利人确认再分发权并选定许可证前，不公开发布迁入代码。第三方运行时依赖以 peer dependency 声明，开发检查依赖单独列出。

## 开发入口

- 项目目标和迁移边界：[`AGENTS.md`](./AGENTS.md)
- MES 迁移记录：[`docs/component-migration.md`](./docs/component-migration.md)
- 逐文件 MES 清单：[`docs/migrations/mes-components.md`](./docs/migrations/mes-components.md)
