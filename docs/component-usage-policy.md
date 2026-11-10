# 组件使用约束

本规范定义宿主 App 何时必须复用 Sunxu 组件，以及如何标记业务专用组件。Sunxu 只约束跨业务通用的页面骨架、控件外观和交互状态；API、权限、路由、领域数据与业务流程仍由宿主负责。

## 规则级别

- **MUST**：场景与组件语义匹配时必须使用指定组件，不得自行重画或用原生控件复制同一交互。
- **ALLOWED**：共享组件不支持当前平台能力，或目标交互与共享组件语义不同时，可以使用平台控件或自有实现；业务组件仍需明确标记。
- **EXCEPTION**：偏离 MUST 的调用点必须在代码注释中说明原因和替代方案，并由代码评审确认。不能用无说明的 lint disable 绕过规则。

只有职责、状态与回调语义一致的情形才设为 MUST。业务需要的专用组合可以留在宿主，不应为了满足组件覆盖率而塞入 `src/core/**`。

## 通用场景映射

| 场景 | MUST 使用 | 不得另行实现 |
|---|---|---|
| 用户可见文字 | `AppText` | 绕过共享字体缩放和文字 token，直接使用 React Native `Text` |
| 列表页面 | `ListScreenContainer`；需要搜索、筛选、状态切换或记录卡片时，在负责该职责的组件上声明 `@sunxu-use search`、`filters`、`status-tabs` 或 `list-card`，并分别使用 `SearchBar`、`FilterBar`、`StatusTabs`、`ListCard`；搜索筛选工具放在 `toolbar` | 独立页头中的列表操作行、同义搜索/筛选/状态控件 |
| 标准表单页 | `FormScreenContainer` 或 `FormPage`；字段使用 `FormField` 或对应的专用字段组件，并在字段容器上声明 `@sunxu-use form-field`；相关字段用 `FormSection` 分组 | 自绘通用字段、重复实现键盘感知滚动和页面骨架 |
| 详情页 | `DetailScreenContainer`；记录结果可复用 `DetailCard`、`ListCard` 等匹配语义的组件 | 重做通用页头、安全区和固定操作区 |
| 临时选择或编辑弹层 | `BottomSheet` 或 `FullScreenModal`；流程操作放在固定 `footer` | 将保存、确定、应用等按钮放进可滚动 children 或标题区域 |
| 常驻、可多段吸附的工具面板 | `PersistentBottomSheet` | 用临时模态弹层模拟常驻工具面板 |
| 标准操作 | 有文案操作时声明 `@sunxu-use text-action` 并用 `ActionButton`；纯图标操作声明 `@sunxu-use icon-action` 并用 `IconActionButton` | 自绘同义按钮，遗漏共享的禁用、忙碌或无障碍状态 |
| 加载、空结果、错误 | `LoadingView` / `Skeleton`、`EmptyState`、`ErrorView` | 每页单独拼装同义状态视图 |

若一页同时属于多个场景，分别采用相应组件组合；不因页面属于特定业务就改变通用容器和控件职责。

## 业务专用组件标记

Sunxu 的 `src/core/**` 只收录可跨业务复用的实现。业务专用页面、卡片或字段应留在宿主业务目录，并在导出的组件 JSDoc 中明确分类。所有纳入检查范围的组件都必须声明 `shared` 或 `business-specific`，避免共享组件与业务专用组件边界含糊。

共享组件示例：

```tsx
/**
 * @sunxu-component shared
 */
export function ContactSummary() {
  // ...
}
```

业务专用组件必须同时注明领域和组件库不适用的原因：

```tsx
/**
 * @sunxu-component business-specific
 * @sunxu-domain crm
 * @sunxu-reason 组合客户拜访状态与 CRM 专属操作，不属于跨业务记录卡片语义。
 */
export function VisitPlanCard() {
  // ...
}
```

`@sunxu-domain` 使用明确的业务/领域标识；`@sunxu-reason` 说明业务数据或交互为何不能由通用组件组合表达。组件仍应复用适用的 Sunxu 基础控件和 token。

业务页面还需声明页面类型，并在组件返回树的最外层使用对应容器。拥有搜索、筛选、状态切换、记录卡片、表单字段或标准操作职责的组件，还须用 `@sunxu-use` 声明其功能；ESLint 会检查声明对应的共享组件是否实际出现在该组件的 JSX 中：

```tsx
/**
 * @sunxu-page form
 * @sunxu-component business-specific
 * @sunxu-domain crm
 * @sunxu-reason 客户资料字段和保存动作属于 CRM；页面结构仍使用通用表单容器。
 * @sunxu-use form-field
 */
export function ContactEditScreen() {
  return <FormScreenContainer title="编辑客户">...</FormScreenContainer>;
}
```

页面标记与必用容器如下：

| `@sunxu-page` | 最外层必用组件 |
|---|---|
| `list` | `ListScreenContainer` |
| `form` | `FormScreenContainer` 或 `FormPage` |
| `detail` | `DetailScreenContainer` |
| `map` | `MapScreenContainer` |
| `custom` | `ScreenContainer`，并用 `@sunxu-reason` 解释为何标准页面容器不适用 |

一个业务页面可使用业务专用标题、内容和操作，但页面骨架仍按其列表、表单、详情或地图职责选择标准容器。只有确实无法匹配时才标记 `custom`。

## ESLint 接入

独立工具包位于 [`tooling/eslint-plugin-sunxu`](../tooling/eslint-plugin-sunxu/README.md)，不会进入 Sunxu 运行时包。宿主工程按自己的目录配置覆盖范围：

```js
import sunxu from 'eslint-plugin-sunxu';

export default [
  {
    ...sunxu.configs['components/recommended'],
    files: ['src/components/**/*.{ts,tsx}'],
  },
  {
    ...sunxu.configs['screens/recommended'],
    files: ['src/screens/**/*.{ts,tsx}'],
  },
];
```

`component-classification` 检查导出的 React 组件是否有分类注释；业务专用组件必须包含领域和理由。`page-container` 要求受管页面标注 `@sunxu-page`，并检查实际返回的根容器。`required-components` 根据 `@sunxu-use` 检查该组件实际使用的共享控件。`no-native-text` 禁止受管屏幕直接渲染从 `react-native` 导入的 `Text`，改用 `AppText`。新宿主须将这些规则作为 lint 错误接入本地开发和 CI；不能只在 Sunxu 仓库检查，因为依赖组件库不会自动约束消费端。

**例外写在组件或页面的 JSDoc 注释中**，并说明场景、原因和替代方案。单行 JSX 需要抑制 `no-native-text` 时，使用带说明的 ESLint 行注释，例如 `{/* eslint-disable-next-line sunxu/no-native-text -- Native control requires this exact Text node; AppText cannot represent it. */}`，并由评审确认。若已有页面违反规则，应先补上正确组件或有依据的例外，再开启 CI 门禁；不为历史问题永久关闭规则。
