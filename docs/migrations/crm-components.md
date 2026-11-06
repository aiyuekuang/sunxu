# CRM 来源组件逐文件迁移清单

来源：`../dongjian-crm`，分支 `main`，提交 `1732835a54ae62710089b0a5f096da76545bad2a`。

盘点范围：`src/components/**`，共 98 项。CRM 来源工作区当前有 2 个未提交组件文件，源仓保持只读；账本逐项保存当前文件 SHA-256、提交基线 SHA-256、依赖路径和处理结果。当前组件库公开运行时限定为 `src/core/**`，因此 CRM 业务流程、地图 SDK 和宿主集成保留在 CRM App。

与 MES 基线 `e92d02d7cf2269cf8c564a60ff6a00255e903c8e` 比较：同路径 84 项（其中一致 64、内容不同 20），CRM 新增 14 项，MES 独有 4 项。

来源当前组件工作区差异 SHA-256：`1abc8269cf68fdfa3b346cacfa9bb4b61215414b34c172dd0506a24e552558fe`。未提交源文件：`src/components/crm/CallRecordingPlayer.tsx`, `src/components/crm/CustomerTimelineSection.tsx`。

## 处理统计

| 状态 | 数量 |
|---|---:|
| `ADDED` | 2 |
| `MERGED` | 10 |
| `ALREADY_PRESENT` | 35 |
| `REVIEWED_PRESERVED` | 4 |
| `EXCLUDED` | 47 |

CRM 新增的两个通用组件已加入 `sunxu/core`：`DateNavigator` 与 `DetailActionBar`。已有通用控件吸收了日期标签、详情卡片布局、选择器分类侧栏、全屏弹窗填充与沉浸模式、照片多选/封面、搜索栏和状态标签增强，以及底部弹层输入法适配。CRM 业务特有差异不进入通用 API。
20 个与 MES 同路径但内容不同的文件中，10 项通用改进已合并，3 项触控/筛选行为已在 Sunxu 存在，4 项保留 Sunxu 既有功能，另有 `AppUpdateChecker`、`MaterialPickerField`、`OnboardingGuide` 3 项因宿主服务、品牌流程或数据耦合留在 CRM。 CRM 最新提交新增的横屏路线地图沉浸展示仍留在 `FieldRouteDetailModal`：路线 API、AMap、WebView 和设备方向锁属于 CRM 宿主；其中通用的 `FullScreenModal` 沉浸填充能力已合入 Sunxu。

UI 视觉状态：`UNVERIFIED`（本次浏览器预检 `BLOCKED`）。`examples/catalog` 已增加组件示例页，覆盖 `DateNavigator`、`SearchBar`、分段 `StatusTabs`、`PickerField`、实体分类侧栏、`PhotoPicker` 布局和 `FullScreenModal` 的 fill/immersive 模式；详情页使用 `DetailActionBar` 展示动作溢出。一次性检查目标为 Expo Web `/`、375×812 CSS px；Playwright 在 15 秒内未看到预期的“客户档案”首屏，按预检规则停止浏览器，没有重开或重试，也没有保存截图或 DOM 几何。包与示例类型检查通过，Metro Web bundle 成功，但这些不能替代视觉验收。照片多选、权限和封面排序仍需 iOS/Android 相册环境验证，保持 `UNVERIFIED`。此前 390×844 的列表/详情局部几何记录和本次预检结果见 JSON 账本。

许可证状态：迁移时 CRM 仓库未发现根目录 `LICENSE`。用户于 2026-11-06 选择对保留在 Sunxu 包中的源码采用 MIT；该授权不覆盖未迁入的 CRM 文件，未来新增第三方源码或资产仍需单独核实许可。

## 逐文件结果

| 来源路径 | 名称 | 层级 | 状态 | Sunxu 目标 | 与 MES 内容 | 选择/适配摘要 |
|---|---|---|---|---|---|---|
| `src/components/AppReleaseHistorySheet.tsx` | `AppReleaseHistorySheet` | `host-integration` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/AppUpdateChecker.tsx` | `AppUpdateChecker` | `host-integration` | **EXCLUDED** | — | `DIFFERS_FROM_MES` | CRM adds host-specific update presentation and platform behavior, but it still requires the CRM update service/store and app package installer; keep it in the host app. |
| `src/components/HotUpdateChecker.tsx` | `HotUpdateChecker` | `host-integration` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/AmountPolicySnapshotInfo.tsx` | `AmountPolicySnapshotInfo` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/AnnouncementBanner.tsx` | `AnnouncementBanner` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/AppText.tsx` | `AppText` | `core` | **ALREADY_PRESENT** | `src/core/components/AppText.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/AppToast.tsx` | `AppToast` | `core` | **ALREADY_PRESENT** | `src/core/components/AppToast.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/ApprovalActionBar.tsx` | `ApprovalActionBar` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/ApprovalBanner.tsx` | `ApprovalBanner` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/ApprovalHistory.tsx` | `ApprovalHistory` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/ApprovalTimeline.tsx` | `ApprovalTimeline` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/AttachmentFilesField.tsx` | `AttachmentFilesField` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/Badge.tsx` | `Badge` | `core` | **ALREADY_PRESENT** | `src/core/components/Badge.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/BarcodeView.tsx` | `BarcodeView` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/BottomActionBar.tsx` | `BottomActionBar` | `core` | **ALREADY_PRESENT** | `src/core/components/BottomActionBar.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/BottomSheet.tsx` | `BottomSheet` | `core` | **ALREADY_PRESENT** | `src/core/components/BottomSheet.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/BottomSheetContext.ts` | `BottomSheetContext` | `core` | **ALREADY_PRESENT** | `src/core/components/BottomSheetContext.ts` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/BusinessBatchResultSheet.tsx` | `BusinessBatchResultSheet` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/ChipSelectField.tsx` | `ChipSelectField` | `core` | **REVIEWED_PRESERVED** | `src/core/components/ChipSelectField.tsx` | `DIFFERS_FROM_MES` | CRM change only adjusts example hex colors. Kept semantic token guidance and did not copy hard-coded example values. |
| `src/components/common/CommercialLineFields.tsx` | `CommercialLineFields` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/ConfigListScreen.tsx` | `ConfigListScreen` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/ConfirmAlert.ts` | `ConfirmAlert` | `core` | **ALREADY_PRESENT** | `src/core/components/ConfirmAlert.ts` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/DateNavigator.tsx` | `DateNavigator` | `core` | **ADDED** | `src/core/components/DateNavigator.tsx` | `CRM_ONLY` | Ported into src/core; source aliases were replaced with Sunxu theme, tokens, and generic props. |
| `src/components/common/DatePickerField.tsx` | `DatePickerField` | `core` | **MERGED** | `src/core/components/DatePickerField.tsx` | `DIFFERS_FROM_MES` | Merged CRM hideLabel prop and 44dp input target; callers can avoid duplicate labels while retaining a field label for accessibility. |
| `src/components/common/DateRangeQuickSelect.tsx` | `DateRangeQuickSelect` | `core` | **ALREADY_PRESENT** | `src/core/components/DateRangeQuickSelect.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/DetailActionBar.tsx` | `DetailActionBar` | `core` | **ADDED** | `src/core/components/DetailActionBar.tsx` | `CRM_ONLY` | Ported into src/core; source aliases were replaced with Sunxu theme, tokens, and generic props. |
| `src/components/common/DetailCard.tsx` | `DetailCard` | `core` | **MERGED** | `src/core/components/DetailCard.tsx` | `DIFFERS_FROM_MES` | Merged containerStyle. Removed CRM-specific automatic creation/update audit rows so the generic detail card does not infer business fields. |
| `src/components/common/DocumentActionBar.tsx` | `DocumentActionBar` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/DrillDownTreePicker.tsx` | `DrillDownTreePicker` | `core` | **ALREADY_PRESENT** | `src/core/components/DrillDownTreePicker.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/EmptyState.tsx` | `EmptyState` | `core` | **ALREADY_PRESENT** | `src/core/components/EmptyState.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/EntityFilterChip.tsx` | `EntityFilterChip` | `core` | **MERGED** | `src/core/components/EntityFilterChip.tsx` | `DIFFERS_FROM_MES` | Merged categoryLayout and searchPlaceholder props; preserved existing leading/detail renderers and quick filters. |
| `src/components/common/EntityPickerField.tsx` | `EntityPickerField` | `core` | **MERGED** | `src/core/components/EntityPickerField.tsx` | `DIFFERS_FROM_MES` | Merged categoryLayout and searchPlaceholder pass-through while preserving the wider Sunxu field API. |
| `src/components/common/EntityPickerModal.tsx` | `EntityPickerModal` | `core` | **MERGED** | `src/core/components/EntityPickerModal.tsx` | `DIFFERS_FROM_MES` | Merged optional left category sidebar and configurable search text; kept fetch, quick-filter, result-detail, and cancellation behavior app-agnostic. |
| `src/components/common/ErrorBoundary.tsx` | `ErrorBoundary` | `core` | **ALREADY_PRESENT** | `src/core/components/ErrorBoundary.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/ErrorView.tsx` | `ErrorView` | `core` | **ALREADY_PRESENT** | `src/core/components/ErrorView.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/ExistingBatchPickerField.tsx` | `ExistingBatchPickerField` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/FAB.tsx` | `FAB` | `core` | **ALREADY_PRESENT** | `src/core/components/FAB.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/FilterActionButton.tsx` | `FilterActionButton` | `core` | **ALREADY_PRESENT** | `src/core/components/FilterActionButton.tsx` | `DIFFERS_FROM_MES` | CRM raises the target to 44dp; Sunxu already uses a 44dp minimum target. |
| `src/components/common/FilterBar.tsx` | `FilterBar` | `core` | **ALREADY_PRESENT** | `src/core/components/FilterBar.tsx` | `DIFFERS_FROM_MES` | CRM adds hideAdvancedButton row handling and 44dp filter actions; both behaviors already exist in Sunxu. |
| `src/components/common/FilterQuickControl.tsx` | `FilterQuickControl` | `core` | **ALREADY_PRESENT** | `src/core/components/FilterQuickControl.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/FormField.tsx` | `FormField` | `core` | **ALREADY_PRESENT** | `src/core/components/FormField.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/FormLabel.tsx` | `FormLabel` | `core` | **REVIEWED_PRESERVED** | `src/core/components/FormLabel.tsx` | `DIFFERS_FROM_MES` | Kept the more capable Sunxu implementation, including contextual help, accessible help names, and icon-only help. |
| `src/components/common/FormPage.tsx` | `FormPage` | `core` | **ALREADY_PRESENT** | `src/core/components/FormPage.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/FullScreenModal.tsx` | `FullScreenModal` | `core` | **MERGED** | `src/core/components/FullScreenModal.tsx` | `DIFFERS_FROM_MES` | Merged fill/scroll body modes, immersive content, and headerRight slot; all data and actions remain caller supplied. |
| `src/components/common/GeneratePurchaseReceiptBatchNoButton.tsx` | `GeneratePurchaseReceiptBatchNoButton` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/ImagePreviewModal.tsx` | `ImagePreviewModal` | `core` | **ALREADY_PRESENT** | `src/core/components/ImagePreviewModal.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/ListCard.tsx` | `ListCard` | `core` | **ALREADY_PRESENT** | `src/core/components/ListCard.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/ListSortSheet.tsx` | `ListSortSheet` | `core` | **ALREADY_PRESENT** | `src/core/components/ListSortSheet.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/LoadingView.tsx` | `LoadingView` | `core` | **ALREADY_PRESENT** | `src/core/components/LoadingView.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/MaterialPickerField.tsx` | `MaterialPickerField` | `business-domain` | **EXCLUDED** | — | `DIFFERS_FROM_MES` | CRM version is coupled to its material API/service and narrows the existing selection/rendering contract; keep the richer data-agnostic behavior in the host app until the fetch contract is supplied by props. |
| `src/components/common/MessageAlert.ts` | `MessageAlert` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/ModalRequestCloseContext.ts` | `ModalRequestCloseContext` | `core` | **ALREADY_PRESENT** | `src/core/components/ModalRequestCloseContext.ts` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/MultiEntityPickerField.tsx` | `MultiEntityPickerField` | `core` | **ALREADY_PRESENT** | `src/core/components/MultiEntityPickerField.tsx` | `DIFFERS_FROM_MES` | CRM raises the row to 44dp; Sunxu already meets the shared touch-target contract. |
| `src/components/common/MultiSelectBar.tsx` | `MultiSelectBar` | `core` | **ALREADY_PRESENT** | `src/core/components/MultiSelectBar.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/OfflineIndicator.tsx` | `OfflineIndicator` | `core` | **ALREADY_PRESENT** | `src/core/components/OfflineIndicator.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/OnboardingGuide.tsx` | `OnboardingGuide` | `host-integration` | **EXCLUDED** | — | `DIFFERS_FROM_MES` | CRM onboarding is brand- and app-release-specific; keep it in the host app. |
| `src/components/common/PageHeader.tsx` | `PageHeader` | `core` | **ALREADY_PRESENT** | `src/core/components/PageHeader.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/PermissionGuard.tsx` | `PermissionGuard` | `core` | **ALREADY_PRESENT** | `src/core/components/PermissionGuard.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/PhotoPicker.tsx` | `PhotoPicker` | `core` | **MERGED** | `src/core/components/PhotoPicker.tsx` | `DIFFERS_FROM_MES` | Merged multiple album selection, cover ordering, and accessible labels; retains host callbacks for photo upload/evidence identifiers. |
| `src/components/common/PickerField.tsx` | `PickerField` | `core` | **MERGED** | `src/core/components/PickerField.tsx` | `DIFFERS_FROM_MES` | Merged keyboard-aware bottom-sheet search input to preserve IME composition, scaled text, and clear-search affordance. |
| `src/components/common/PolicyDisclosure.tsx` | `PolicyDisclosure` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/ProductionBomPickerField.tsx` | `ProductionBomPickerField` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/ProgressBar.tsx` | `ProgressBar` | `core` | **ALREADY_PRESENT** | `src/core/components/ProgressBar.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/QuickNumInput.tsx` | `QuickNumInput` | `core` | **REVIEWED_PRESERVED** | `src/core/components/QuickNumInput.tsx` | `DIFFERS_FROM_MES` | Kept the Sunxu help prop and FormLabel integration; CRM removes contextual field help. |
| `src/components/common/ScanCameraModal.tsx` | `ScanCameraModal` | `core` | **REVIEWED_PRESERVED** | `src/core/components/ScanCameraModal.tsx` | `DIFFERS_FROM_MES` | Kept continuous scanning support; CRM removes that existing capability. |
| `src/components/common/ScanInput.tsx` | `ScanInput` | `core` | **ALREADY_PRESENT** | `src/core/components/ScanInput.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/SearchBar.tsx` | `SearchBar` | `core` | **MERGED** | `src/core/components/SearchBar.tsx` | `DIFFERS_FROM_MES` | Merged surface/subtle variants, right accessory, submit callback, accessibility label, and themed focus state; retained autocorrect/autocapitalize options. |
| `src/components/common/SelectableChip.tsx` | `SelectableChip` | `core` | **ALREADY_PRESENT** | `src/core/components/SelectableChip.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/SendActionSheet.tsx` | `SendActionSheet` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/Skeleton.tsx` | `Skeleton` | `core` | **ALREADY_PRESENT** | `src/core/components/Skeleton.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/StatusTabs.tsx` | `StatusTabs` | `core` | **MERGED** | `src/core/components/StatusTabs.tsx` | `DIFFERS_FROM_MES` | Merged segment/pill variants and count badges while retaining existing sizing, overflow, and underline behavior. |
| `src/components/common/SwipeableRow.tsx` | `SwipeableRow` | `core` | **ALREADY_PRESENT** | `src/core/components/SwipeableRow.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/TreeListScreen.tsx` | `TreeListScreen` | `shared-helper-excluded` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/TreePickerField.tsx` | `TreePickerField` | `core` | **ALREADY_PRESENT** | `src/core/components/TreePickerField.tsx` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/common/WarehousePickerField.tsx` | `WarehousePickerField` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/common/entity-picker-pagination.ts` | `entity-picker-pagination` | `core` | **ALREADY_PRESENT** | `src/core/utils/entity-picker-pagination.ts` | `IDENTICAL_TO_MES` | Reused the existing Sunxu core implementation and export. |
| `src/components/crm/AddCallNumberToCustomerSheet.tsx` | `AddCallNumberToCustomerSheet` | `crm-domain` | **EXCLUDED** | — | `CRM_ONLY` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/crm/CallFollowUpContext.tsx` | `CallFollowUpContext` | `crm-domain` | **EXCLUDED** | — | `CRM_ONLY` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/crm/CallRecordingPlayer.tsx` | `CallRecordingPlayer` | `crm-domain` | **EXCLUDED** | — | `CRM_ONLY` | CRM working-tree changes were audited by file hash; their customer/call/field-route behavior remains CRM-domain code and was not moved into generic core. |
| `src/components/crm/CustomerOpportunityTabs.tsx` | `CustomerOpportunityTabs` | `crm-domain` | **EXCLUDED** | — | `CRM_ONLY` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/crm/CustomerTimelineSection.tsx` | `CustomerTimelineSection` | `crm-domain` | **EXCLUDED** | — | `CRM_ONLY` | CRM working-tree changes were audited by file hash; their customer/call/field-route behavior remains CRM-domain code and was not moved into generic core. |
| `src/components/crm/FieldRouteDetailModal.tsx` | `FieldRouteDetailModal` | `crm-domain` | **EXCLUDED** | — | `CRM_ONLY` | CRM working-tree changes were audited by file hash; their customer/call/field-route behavior remains CRM-domain code and was not moved into generic core. |
| `src/components/crm/FieldRouteRecordsList.tsx` | `FieldRouteRecordsList` | `crm-domain` | **EXCLUDED** | — | `CRM_ONLY` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/crm/FollowUpFormModal.tsx` | `FollowUpFormModal` | `crm-domain` | **EXCLUDED** | — | `CRM_ONLY` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/crm/PostCallWrapupHost.tsx` | `PostCallWrapupHost` | `crm-domain` | **EXCLUDED** | — | `CRM_ONLY` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/crm/VisitRouteControllerHost.tsx` | `VisitRouteControllerHost` | `crm-domain` | **EXCLUDED** | — | `CRM_ONLY` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/crm/fieldRouteTrajectoryHtml.ts` | `fieldRouteTrajectoryHtml` | `crm-domain` | **EXCLUDED** | — | `CRM_ONLY` | CRM working-tree changes were audited by file hash; their customer/call/field-route behavior remains CRM-domain code and was not moved into generic core. |
| `src/components/custom-fields/CustomFieldEditableValueSection.tsx` | `CustomFieldEditableValueSection` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/custom-fields/CustomFieldFormSection.tsx` | `CustomFieldFormSection` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/custom-fields/CustomFieldValueSection.tsx` | `CustomFieldValueSection` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/custom-fields/InlineCustomFieldValueRows.tsx` | `InlineCustomFieldValueRows` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/custom-fields/formatCustomFieldValue.ts` | `formatCustomFieldValue` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/custom-fields/useCustomFieldSchema.ts` | `useCustomFieldSchema` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/custom-fields/useCustomFieldValueMap.ts` | `useCustomFieldValueMap` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/map/AmapPickerModal.tsx` | `AmapPickerModal` | `crm-map-domain` | **EXCLUDED** | — | `CRM_ONLY` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/purchase/MaterialSupplierPriceTierSummary.tsx` | `MaterialSupplierPriceTierSummary` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/returns/ReturnDeductionLinesSection.tsx` | `ReturnDeductionLinesSection` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |
| `src/components/sale-delivery/SaleDeliveryPackageUnitField.tsx` | `SaleDeliveryPackageUnitField` | `business-domain` | **EXCLUDED** | — | `IDENTICAL_TO_MES` | Not copied into package runtime; source path/hash and dependency list retained for migration audit. |

## 页面私有组件扫描

| 来源路径 | 调用页面 | 结论 |
|---|---|---|
| `src/screens/settings/profile/components/CancelAccountModal.tsx` | 无引用 | 未使用；留在 CRM 源仓 |
| `src/screens/settings/profile/components/PieceworkPeriodPicker.tsx` | `src/screens/settings/profile/ProfileScreen.tsx (类型与值导入)` | 页面私有；留在 CRM App |
| `src/screens/settings/profile/components/ProfileActionsMenu.tsx` | `src/screens/settings/profile/ProfileScreen.tsx` | 页面私有；留在 CRM App |
| `src/screens/settings/profile/components/ProfileInfoSection.tsx` | `src/screens/settings/profile/ProfileScreen.tsx` | 页面私有；留在 CRM App |
| `src/screens/settings/profile/components/SimCallSetupSection.tsx` | `src/screens/settings/profile/ProfileScreen.tsx` | 页面私有；留在 CRM App |
| `src/screens/settings/profile/components/UserPermissionsModal.tsx` | `src/screens/settings/profile/ProfileScreen.tsx` | 页面私有；留在 CRM App |

逐文件来源依赖、提交基线 SHA-256 与当前工作树 SHA-256 见 [JSON 账本](./crm-components.json)。
