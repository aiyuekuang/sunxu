# 组件使用约束

本规范定义宿主 App 何时必须复用 Sunxu 组件，以及如何标记业务专用组件。Sunxu 只约束跨业务通用的页面骨架、控件外观和交互状态；API、权限、路由、领域数据与业务流程仍由宿主负责。

## 规则级别

- **MUST**：场景与组件语义匹配时必须使用指定组件，不得自行重画或用原生控件复制同一交互。
- **ALLOWED**：共享组件不支持当前平台能力，或目标交互与共享组件语义不同时，可以使用平台控件或自有实现；业务组件仍需明确标记。
- **EXCEPTION**：偏离 MUST 的调用点必须在代码注释中说明原因和替代方案，并由代码评审确认。不能用无说明的 lint disable 绕过规则。

只有职责、状态与回调语义一致的情形才设为 MUST。业务需要的专用组合可以留在宿主，不应为了满足组件覆盖率而塞入 `src/core/**`。

## 组件复用与逐层组合

- 实现前检查 Sunxu 现有组件和适用的平台组件的职责、状态、回调及无障碍契约；能力匹配时遵循其公开 API 和平台约定直接复用，不重做同义结构或交互。
- 单个现有组件不足以满足场景时，优先组合职责清晰的基础组件，逐层形成更高阶的复合组件；只有稳定且可跨业务复用的能力才加入 `src/core/**`，领域专用组合留在宿主。
- 复合组件通过边界明确的 props、回调、children/插槽、context contract 或语义变体支持真实场景差异，并沿用子组件契约；不得按场景复制近似组件，或暴露无关内部细节来换取表面灵活。

## 通用场景映射

| 场景 | MUST 使用 | 不得另行实现 |
|---|---|---|
| 用户可见文字 | `AppText` | 绕过共享字体缩放和文字 token，直接使用 React Native `Text` |
| 列表页面 | 一个结果集使用一个 `ListScreenContainer` 作为结构根；搜索、状态/筛选工具放进紧邻结果的 `toolbar`，按职责组合 `SearchBar`、`FilterBar`、`StatusTabs`，记录内容复用 `ListCard`；对应业务组件声明 `@sunxu-use` | 为“只有 Tab”“Tab + 树”“Tab + 树 + 视图”等排列分别造页面/组件；把同一条件重复放进 Tab、筛选器和已保存视图 |
| 标准表单页 | `FormScreenContainer` 或 `FormPage`；字段使用 `FormField` 或对应的专用字段组件，并在字段容器上声明 `@sunxu-use form-field`；相关字段用 `FormSection` 分组 | 自绘通用字段、重复实现键盘感知滚动和页面骨架 |
| 详情页 | `DetailScreenContainer`；记录结果可复用 `DetailCard`、`ListCard` 等匹配语义的组件 | 重做通用页头、安全区和固定操作区 |
| 短时提示或轻量确认 | `CenteredModal` 使用 Sunxu 唯一 `ModalHeader`：左侧标题、右侧关闭“×”；流程操作放在固定 `footer` | 业务自绘居中遮罩/弹窗，或把流程按钮放进可滚动 children 或标题区域 |
| 临时选择或编辑弹层 | `BottomSheet` 或 `FullScreenModal` 使用 Sunxu 唯一 `ModalHeader`：左侧标题、右侧关闭“×”；流程操作放在固定 `footer` | 业务自行绘制返回/关闭页头，或将保存、确定、应用等按钮放进可滚动 children 或标题区域 |
| 常驻、可多段吸附的工具面板 | `PersistentBottomSheet` | 用临时模态弹层模拟常驻工具面板 |
| 标准操作 | 有文案操作时声明 `@sunxu-use text-action` 并用 `ActionButton`；纯图标操作声明 `@sunxu-use icon-action` 并用 `IconActionButton` | 自绘同义按钮，遗漏共享的禁用、忙碌或无障碍状态 |
| 加载、空结果、错误 | `LoadingView` / `Skeleton`、`EmptyState`、`ErrorView` | 每页单独拼装同义状态视图 |

若一页同时属于多个场景，分别采用相应组件组合；不因页面属于特定业务就改变通用容器和控件职责。

### 列表复合结构归一化（跨端业务语义）

Sunxu 原生端与 Sunxu Web 对同一列表共享业务维度和状态归属，按各自平台控件呈现。一个结果集始终只有一个列表结构根；是否有分类 Tab、独立目录/队列、视图、关键词或快捷/高级筛选，只决定组合哪些职责，不决定另造一种列表容器。原生端由 `ListScreenContainer` 提供页头、紧邻结果区的 `toolbar` 和结果区；数据、权限、导航、筛选值、请求、分页与动作仍由宿主持有。

| 业务维度 | 原生端组合规则 | 边界 |
|---|---|---|
| 页面/工作流导航 | 由宿主导航承载，不伪装成列表筛选 | 切换路由、权限归口或独立任务时，按页面导航处理 |
| 同页结果范围或状态 | 当前结果集内的状态切换用 `StatusTabs`；分类/范围切换使用语义匹配的宿主控件，放在 `toolbar` | 不把状态专用控件硬套成路由导航，也不让同一维度同时出现在 Tab 与筛选条件 |
| 独立目录、队列或层级 Facet | 简单选项优先用 `FilterBar` 的统一 `filters` 配置；确需树层级时用宿主已有的原生选择交互，并将受控选中值作为列表筛选条件 | Sunxu 当前没有通用的桌面式左侧树工作区；`TreePickerField` / `DrillDownTreePicker` 是选择器，不是列表侧栏或列表查询容器 |
| 保存视图或结果呈现模式 | 仅组合当前宿主已经提供的业务能力；配置/快照与当前范围关联，用户选择和持久化由宿主管理 | Sunxu 当前没有通用 `SavedViewBar` 或列表模式切换器；`FilterBar.storageKey` 只持久化筛选值，不等于保存视图。不得为复用 Web 布局而新增 App 设置或业务流程 |
| 关键词 | 一个列表只保留一个受控 `SearchBar`，放在 `toolbar`；关键词作为临时查询条件 | 不重复绘制同义搜索框，也不将关键词暗中并入已保存视图 |
| 结果区 | 同一列表保持一个结果区；宿主按现有列表实现渲染卡片/行并负责滚动、刷新、分页和加载状态 | 改变结果呈现形式不应复制一套页头、搜索和筛选组合 |

同一字段只定义一次，并由宿主按配置映射到一个职责入口；Sunxu 组件只负责对应控件的呈现和交互，不推断业务范围、权限、数据结构或请求。窄屏可以把层级 Facet 放入合适的选择面板，而 Web 使用左侧树或抽屉；呈现不同不改变业务含义，也不要求两端补齐并不存在的控件 API。

### BottomSheet 内容宽度

`BottomSheet` 的 body、固定 footer 包装区和标题各自使用 `Spacing.base`（16dp）水平留白，三者边界对齐；body 内容默认拉伸并占满扣除两侧留白后的可用宽度。宿主不要在 `children` 根节点、滚动列表的 `contentContainerStyle` 或自定义 footer 根节点重复添加外层水平 `padding` / `margin`，也不要无业务需要地设置 `maxWidth` 或固定宽度。保留搜索框、卡片等控件自身的内部 padding；确需窄列或局部缩进时，明确目的并让同一区域元素使用一致的边界。

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
