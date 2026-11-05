# 榫序 Sunxu

**Sunxu 是面向 React Native / Expo 项目的共享组件系统。**

它把多个 App 已经验证过的视觉基础、交互组件和可复用业务组件沉淀为一个可安装、可维护的公共依赖，让后续 RN 项目复用同一套组件实现和契约。

英文项目描述：**Sunxu — a shared component system for React Native apps.**

## 项目定位

Sunxu 不是一个独立 App，也不是某一个 MES 或 CRM 的页面仓库。它是多个 RN App 共用的组件源码与发布包。

首批整理来源：

- MES App 基线仓库：`../mes-app`
- 东建 CRM App：`../dongjian-crm`

MES 基线中可复用的组件要求完整盘点并纳入 Sunxu。MES 专属组件保留 MES 语义，按明确的子路径或模块分组导出；不能为了让组件看起来“通用”而删除业务能力，也不能把 MES 业务组件混进基础 UI 命名空间。CRM 组件也按同一原则归类。

## 组件边界

- **基础 UI**：文本、按钮、输入、标签、卡片、弹层、空态、加载态、筛选和布局等跨业务组件。
- **交互组件**：日期选择、图片预览、扫码入口、底部操作栏等可复用交互。
- **业务组件**：审批、物料、仓库、BOM 等有明确领域语义的组件。完整保留并放入领域模块，由使用方提供数据、权限判断和动作回调。
- **App 集成组件**：更新检查、应用发布记录等依赖特定 App 生命周期或服务的模块。先完整盘点，作为显式集成模块处理，不从基础 UI 入口隐式加载副作用。

Sunxu 只负责呈现和组件自身的交互契约。它不拥有宿主 App 的 API 客户端、登录会话、权限策略、业务状态机、导航树或业务数据；领域组件通过明确的 props、回调或宿主适配器接入这些能力。

## 预期使用方式

包名确定为无 scope 的 `sunxu`。组件 API 尚未实现，下面仅展示目标导入形式，不代表当前已有可安装版本：

```tsx
import { AppText, EmptyState } from 'sunxu';
import { ApprovalActionBar } from 'sunxu/mes';

export function ExampleScreen() {
  return <EmptyState title="暂无记录" />;
}
```

目标是让新 App 先安装 Sunxu，再从基础入口或明确的领域子路径导入组件；不再从 MES/CRM App 源码目录复制同一组件。最终导出名、Peer Dependencies、Expo 支持范围和版本兼容表，应在完成组件清单与依赖盘点后确定。

## 当前状态

仓库目前只有项目说明，尚未迁入组件、创建 npm 包或发布版本。请勿把示例导入当作已实现 API。

## 开源与发布

发布前必须确认 MES 与 CRM 源代码的开源授权和组件再分发权，选定并添加适用的 `LICENSE`，并检查第三方依赖、字体、图标、图片和其他资源的许可证。当前来源仓库根目录未发现 `LICENSE` 文件，因此在权利和许可证得到明确处理前，不发布从来源仓库迁入的代码。

无 scope 的 npm 包是公开包，由个人 npm 账号创建和管理。只有在包代码、许可证、包内容清单和发布身份都准备完成后，才发布 `sunxu`。

## 开发入口

- 面向使用者的定位与当前状态：本文件
- 面向 Codex / agent 的实现边界与工作流程：[`AGENTS.md`](./AGENTS.md)
- 组件来源、归类和迁移记录要求：[`docs/component-migration.md`](./docs/component-migration.md)
