import type { Ionicons } from '@expo/vector-icons';
import type { OperationConfigSummaryDto } from '../host/api-types';
import {
  hasAllPermissions,
  hasAnyPermission,
  hasAnyVisibleFeature,
  hasOperationFeatureAccess,
  OPERATION_FEATURE,
  P,
  type OperationFeatureCode,
} from '../host/authorization';

const F = OPERATION_FEATURE;

// ─── 快捷入口配置（按业务域分组，钉钉工作台风格）────────────────────────────
// permission: host adapter contract keys; undefined means no permission gate is requested.
export type QuickAction = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  screen: string;
  params?: Record<string, unknown>;
  color: string;
  bg: string;
  permission?: string | string[];
  featureCodes?: OperationFeatureCode[];
};

export type ActionGroup = {
  title: string;
  items: QuickAction[];
};

function toPermissionList(permission?: string | string[]): string[] {
  if (!permission) return [];
  return Array.isArray(permission) ? permission : [permission];
}

function hasAnyPermissionForAction(permission?: string | string[]): boolean {
  const required = toPermissionList(permission);
  return required.length === 0 || hasAnyPermission(required);
}

function hasFeatureVisibility(
  operationConfig: OperationConfigSummaryDto | null | undefined,
  featureCodes?: OperationFeatureCode[],
): boolean {
  if (!featureCodes || featureCodes.length === 0) return true;
  return hasAnyVisibleFeature(operationConfig, ...featureCodes);
}

function canAccessQuickAction(
  item: QuickAction,
  operationConfig: OperationConfigSummaryDto | null | undefined,
): boolean {
  if (!hasAnyPermissionForAction(item.permission)) return false;
  if (item.featureCodes) {
    return hasFeatureVisibility(operationConfig, item.featureCodes);
  }
  return hasOperationFeatureAccess(operationConfig, toPermissionList(item.permission));
}

export const ACTION_GROUPS: ActionGroup[] = [
  {
    // 客户管理排首位（销售链路入口：客户→报价→销售单→出库→账目）
    title: '客户管理',
    items: [
      {
        key: 'customer',
        icon: 'person',
        label: '客户',
        screen: 'Customer',
        color: '#FF7875',
        bg: '#FFF1F0',
        permission: P.CUSTOMER_LIST,
        featureCodes: [F.CUSTOMER_BASIC],
      },
      {
        key: 'quotation',
        icon: 'document-text-outline',
        label: '报价单',
        screen: 'Quotation',
        color: '#EB2F96',
        bg: '#FFF0F6',
        permission: P.QUOTATION_LIST,
        featureCodes: [F.QUOTATION],
      },
      {
        key: 'sale_order',
        icon: 'receipt',
        label: '销售订单',
        screen: 'SaleOrder',
        color: '#F759AB',
        bg: '#FFF0F6',
        permission: P.SALE_ORDER_LIST,
        featureCodes: [F.SALE_ORDER],
      },
      {
        key: 'sale_delivery',
        icon: 'cube-outline',
        label: '销售出库单',
        screen: 'SaleDelivery',
        color: '#13C2C2',
        bg: '#E8FFFE',
        permission: P.SALE_DELIVERY_LIST,
        featureCodes: [F.SALE_DELIVERY],
      },
      {
        key: 'sale_return',
        icon: 'return-down-back-outline',
        label: '销售退货单',
        screen: 'SaleReturn',
        color: '#FA541C',
        bg: '#FFF2E8',
        permission: P.SALE_RETURN_LIST,
        featureCodes: [F.SALE_DELIVERY],
      },
      {
        key: 'finance',
        icon: 'wallet',
        label: '财务往来',
        screen: 'Finance',
        color: '#D48806',
        bg: '#FFFBE6',
        permission: [
          P.FINANCE_INVOICE_LIST,
          P.FINANCE_PAYMENT_LIST,
          P.FINANCE_PAYMENT_REQUEST_LIST,
          P.FINANCE_REPORT_VIEW,
        ],
        featureCodes: [F.BUSINESS_RECEIVABLES],
      },
      {
        key: 'my_expenses',
        icon: 'receipt-outline',
        label: '我的费用',
        screen: 'Finance',
        params: { screen: 'MyExpenses' },
        color: '#FA8C16',
        bg: '#FFF7E6',
        permission: [P.FUNDS_EXPENSE_LIST, P.FUNDS_ADVANCE_LIST],
        featureCodes: [F.BUSINESS_RECEIVABLES],
      },
    ],
  },
  {
    title: '生产管理',
    items: [
      {
        key: 'production_plan',
        icon: 'calendar',
        label: '生产计划',
        screen: 'ProductionPlan',
        color: '#1677FF',
        bg: '#E8F3FF',
        permission: P.PLAN_LIST,
        featureCodes: [F.PRODUCTION_PLAN],
      },
      {
        key: 'production_progress',
        icon: 'pulse',
        label: '生产进度',
        screen: 'ProductionProgress',
        color: '#52C41A',
        bg: '#F6FFED',
        permission: P.WORK_ORDER_LIST,
        featureCodes: [F.WORK_ORDER, F.REPORTING],
      },
      {
        key: 'temporary_workers',
        icon: 'people-outline',
        label: '临时工管理',
        screen: 'TemporaryWorker',
        color: '#531DAB',
        bg: '#F9F0FF',
        permission: P.TEMPORARY_WORKER_LIST,
      },
      {
        key: 'production_receipt',
        icon: 'checkmark-done-outline',
        label: '完工入库',
        screen: 'Warehouse',
        params: { screen: 'ProductionReceiptList' },
        color: '#13C2C2',
        bg: '#E6FFFB',
        permission: [P.PRODUCTION_RECEIPT_LIST, P.PRODUCTION_RECEIPT_VIEW],
        featureCodes: [F.WORK_ORDER, F.REPORTING],
      },
      {
        key: 'production_output_buffer',
        icon: 'file-tray-stacked-outline',
        label: '生产暂存',
        screen: 'Warehouse',
        params: { screen: 'OutputBufferList' },
        color: '#597EF7',
        bg: '#F0F5FF',
        permission: P.PRODUCTION_OUTPUT_BUFFER_LIST,
        featureCodes: [F.WORK_ORDER, F.REPORTING],
      },
      {
        key: 'outsourcing',
        icon: 'construct-outline',
        label: '委外加工',
        screen: 'Warehouse',
        params: { screen: 'OutsourcingList' },
        color: '#9254DE',
        bg: '#F9F0FF',
        permission: [P.PRODUCTION_OUTSOURCING_LIST, P.PRODUCTION_OUTSOURCING_VIEW],
        featureCodes: [F.OUTSOURCING],
      },
      {
        key: 'outsourcing_receipt',
        icon: 'cube-outline',
        label: '委外收货',
        screen: 'Warehouse',
        params: { screen: 'OutsourcingReceiptList' },
        color: '#D48806',
        bg: '#FFFBE6',
        permission: P.PRODUCTION_OUTSOURCING_RECEIPT_LIST,
        featureCodes: [F.OUTSOURCING],
      },
      {
        key: 'schedule',
        icon: 'calendar-number',
        label: '排产管理',
        screen: 'Schedule',
        color: '#389E0D',
        bg: '#F6FFED',
        permission: P.SCHEDULE_ENTRY_LIST,
        featureCodes: [F.SCHEDULE],
      },
      {
        key: 'forecast',
        icon: 'trending-up',
        label: '需求预测',
        screen: 'Forecast',
        color: '#08979C',
        bg: '#E6FFFB',
        permission: P.FORECAST_LIST,
        featureCodes: [F.FORECAST],
      },
      {
        key: 'work_center',
        icon: 'business',
        label: '工作中心',
        screen: 'WorkCenter',
        color: '#FA8C16',
        bg: '#FFF7E6',
        permission: P.SCHEDULE_WORK_CENTER_LIST,
        featureCodes: [F.WORK_CENTER],
      },
      {
        key: 'process_route',
        icon: 'git-network',
        label: '工艺路线',
        screen: 'ProcessRoute',
        color: '#9254DE',
        bg: '#F9F0FF',
        permission: P.PROCESS_LIST,
        featureCodes: [F.PROCESS_ROUTE],
      },
    ],
  },
  {
    // 质量管理紧跟生产（车间高频，与生产执行强相关）
    title: '质量管理',
    items: [
      {
        key: 'quality',
        icon: 'checkmark-circle',
        label: '质检单',
        screen: 'Quality',
        color: '#00B578',
        bg: '#E8FFF5',
        permission: P.INSPECTION_LIST,
        featureCodes: [F.BASIC_QUALITY],
      },
      {
        key: 'disposal',
        icon: 'trash-bin',
        label: '不合格品处置单',
        screen: 'Disposal',
        color: '#FF7A45',
        bg: '#FFF2E8',
        permission: P.DISPOSAL_LIST,
        featureCodes: [F.DISPOSAL],
      },
      {
        key: 'capa',
        icon: 'shield-checkmark',
        label: 'CAPA',
        screen: 'Capa',
        color: '#FF4D4F',
        bg: '#FFF1F0',
        permission: P.CAPA_LIST,
        featureCodes: [F.CAPA],
      },
      {
        key: 'spc',
        icon: 'analytics',
        label: 'SPC',
        screen: 'Spc',
        color: '#1890FF',
        bg: '#E6F7FF',
        permission: P.SPC_RECORDS_LIST,
        featureCodes: [F.SPC],
      },
    ],
  },
  {
    title: '物料仓储',
    items: [
      {
        key: 'material',
        icon: 'layers',
        label: '物料档案',
        screen: 'Material',
        color: '#722ED1',
        bg: '#F5EDFF',
        permission: P.MATERIAL_LIST,
        featureCodes: [F.PRODUCT_MASTER],
      },
      {
        key: 'bom',
        icon: 'git-merge',
        label: '物料清单（BOM）',
        screen: 'Bom',
        color: '#597EF7',
        bg: '#F0F5FF',
        permission: P.BOM_LIST,
        featureCodes: [F.BOM],
      },
      {
        key: 'warehouse',
        icon: 'cube',
        label: '库存管理',
        screen: 'Warehouse',
        color: '#13C2C2',
        bg: '#E6FFFB',
        permission: [
          P.WAREHOUSE_MANAGE,
          P.STOCK_LIST,
          P.BATCH_LIST,
        ],
        featureCodes: [F.BASIC_INVENTORY, F.BATCH_TRACEABILITY],
      },
      {
        key: 'stock_count',
        icon: 'checkbox-outline',
        label: '库存盘点',
        screen: 'Warehouse',
        params: { screen: 'StockCountList' },
        color: '#52C41A',
        bg: '#F6FFED',
        permission: P.STOCK_LIST,
        featureCodes: [F.BASIC_INVENTORY],
      },
      {
        key: 'customer_inbound',
        icon: 'cube-outline',
        label: '客户来料',
        screen: 'Warehouse',
        params: { screen: 'CustomerInboundList' },
        color: '#FA8C16',
        bg: '#FFF7E6',
        permission: [P.WAREHOUSE_CUSTOMER_INBOUND_LIST, P.WAREHOUSE_CUSTOMER_INBOUND_VIEW],
        featureCodes: [F.CUSTOMER_INBOUND],
      },
      {
        key: 'internal_issue',
        icon: 'build-outline',
        label: '内部领用',
        screen: 'Warehouse',
        params: { screen: 'InternalIssueList' },
        color: '#FA541C',
        bg: '#FFF2E8',
        permission: [P.INTERNAL_ISSUE_LIST, P.INTERNAL_ISSUE_VIEW],
        featureCodes: [F.INTERNAL_ISSUE],
      },
      {
        key: 'material_issue',
        icon: 'exit',
        label: '生产领料单',
        screen: 'MaterialIssue',
        color: '#F5222D',
        bg: '#FFF1F0',
        permission: [P.MATERIAL_REQ_LIST, P.MATERIAL_REQ_VIEW],
        featureCodes: [F.MATERIAL_ISSUE],
      },
      {
        key: 'purchase',
        icon: 'cart',
        label: '采购申请',
        screen: 'PurchaseRequisition',
        color: '#2F54EB',
        bg: '#F0F5FF',
        permission: [P.PR_LIST, P.PR_VIEW],
        featureCodes: [F.PURCHASE_REQUISITION],
      },
      {
        key: 'supplier',
        icon: 'people',
        label: '供应商',
        screen: 'Supplier',
        color: '#36CFC9',
        bg: '#E6FFFB',
        permission: P.SUPPLIER_LIST,
        featureCodes: [F.SUPPLIER_BASIC],
      },
      {
        key: 'purchase_order',
        icon: 'bag-handle',
        label: '采购订单',
        screen: 'PurchaseOrder',
        color: '#237804',
        bg: '#F6FFED',
        permission: P.PURCHASE_ORDER_LIST,
        featureCodes: [F.PURCHASE_ORDER],
      },
      {
        key: 'purchase_receipt',
        icon: 'clipboard-outline',
        label: '采购入库单',
        screen: 'PurchaseReceipt',
        color: '#389E0D',
        bg: '#F6FFED',
        permission: P.PURCHASE_RECEIPT_LIST,
        featureCodes: [F.PURCHASE_RECEIPT],
      },
      {
        key: 'purchase_return',
        icon: 'return-down-back-outline',
        label: '采购退料单',
        screen: 'PurchaseReturn',
        color: '#FA541C',
        bg: '#FFF2E8',
        permission: P.PURCHASE_RETURN_LIST,
        featureCodes: [F.PURCHASE_RECEIPT],
      },
      {
        key: 'batch',
        icon: 'barcode',
        label: '批号管理',
        screen: 'Batch',
        color: '#D48806',
        bg: '#FFFBE6',
        permission: P.BATCH_LIST,
        featureCodes: [F.BATCH_TRACEABILITY],
      },
      {
        key: 'mrp',
        icon: 'calculator',
        label: 'MRP',
        screen: 'Mrp',
        color: '#096DD9',
        bg: '#E6F4FF',
        permission: [P.MRP_LIST, P.MRP_CALCULATE],
        featureCodes: [F.MRP],
      },
    ],
  },
  {
    // 设备工装：IoT 物联网与设备管理强相关，归入此组
    title: '设备工装',
    items: [
      {
        key: 'equipment',
        icon: 'construct',
        label: '设备',
        screen: 'Equipment',
        color: '#FA541C',
        bg: '#FFF2E8',
        permission: P.EQUIPMENT_LIST,
        featureCodes: [F.EQUIPMENT_BASIC],
      },
      {
        key: 'equipment_fault',
        icon: 'warning',
        label: '故障',
        screen: 'EquipmentFault',
        color: '#FF3141',
        bg: '#FFF2F3',
        permission: P.FAULT_LIST,
        featureCodes: [F.EQUIPMENT_FAULT],
      },
      {
        key: 'tooling',
        icon: 'build',
        label: '工装',
        screen: 'Tooling',
        color: '#EB2F96',
        bg: '#FFF0F6',
        permission: P.TOOLING_LIST,
        featureCodes: [F.TOOLING],
      },
      {
        key: 'oee',
        icon: 'speedometer',
        label: 'OEE',
        screen: 'Oee',
        color: '#722ED1',
        bg: '#F9F0FF',
        permission: P.OEE_LIST,
        featureCodes: [F.OEE],
      },
    ],
  },
  {
    title: '更多功能',
    items: [
      {
        key: 'approval',
        icon: 'checkmark-done',
        label: '审批中心',
        screen: 'Approval',
        color: '#531DAB',
        bg: '#F9F0FF',
        permission: [P.APPROVAL_VIEW, P.APPROVAL_HANDLE, P.APPROVAL_CONFIG],
        featureCodes: [F.APPROVAL],
      },
      {
        key: 'barcode',
        icon: 'qr-code',
        label: '条码生成',
        screen: 'Barcode',
        color: '#595959',
        bg: '#F5F5F5',
        permission: P.BARCODE_USE,
        featureCodes: [F.SCAN],
      },
    ],
  },
];

export function getVisibleActionGroups(
  operationConfig: OperationConfigSummaryDto | null | undefined,
): ActionGroup[] {
  return ACTION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      canAccessQuickAction(item, operationConfig),
    ),
  })).filter((group) => group.items.length > 0);
}

export const DEFAULT_FAVORITE_ACTION_KEYS = [
  'production_progress',
  'production_receipt',
  'production_output_buffer',
  'process_route',
  'quality',
  'material',
  'warehouse',
  'stock_count',
] as const;

export const HOME_FAVORITE_ACTION_LIMIT = 8;

export type HomeQuickActionsDisplayMode = 'compact' | 'expanded';

export const DEFAULT_HOME_QUICK_ACTIONS_DISPLAY_MODE: HomeQuickActionsDisplayMode = 'compact';

export type HomePermissionMode = 'public' | 'any' | 'all';

export type HomeHeaderWidgetKey = 'dashboardSummary';

export interface HomeHeaderWidgetConfigItem {
  key: HomeHeaderWidgetKey;
  label: string;
  permissions: string[];
  featureCodes?: OperationFeatureCode[];
  permissionMode?: HomePermissionMode;
  sortable?: boolean;
  hidable?: boolean;
}

export const HOME_HEADER_WIDGET_CONFIGS: HomeHeaderWidgetConfigItem[] = [
  {
    key: 'dashboardSummary',
    label: '今日生产总览',
    permissions: [P.REPORT_DASHBOARD],
    featureCodes: [F.REPORTING],
    sortable: false,
    hidable: false,
  },
] as const;

// ─── 统计卡片配置 ─────────────────────────────────────────────────────────────
export const HOME_STAT_CONFIG = [
  {
    key: 'inProgress',
    label: '生产中工单',
    icon: 'play-circle' as const,
    color: '#FF8F1F',
    bg: '#FFF5E8',
  },
  { key: 'pending', label: '待开工', icon: 'time' as const, color: '#1677FF', bg: '#E8F3FF' },
  {
    key: 'todayQty',
    label: '今日产量',
    icon: 'trending-up' as const,
    color: '#00B578',
    bg: '#E8FFF5',
  },
  {
    key: 'overdue',
    label: '逾期工单',
    icon: 'alert-circle' as const,
    color: '#FF3141',
    bg: '#FFF2F3',
  },
] as const;

export type HomeStatKey = (typeof HOME_STAT_CONFIG)[number]['key'];

export interface HomeStats {
  inProgress: number;
  pending: number;
  todayQty: number;
  overdue: number;
}

// ─── 首页卡片配置（管理卡片）─────────────────────────────────────────────────

export type HomeCardPermissionMode = HomePermissionMode;

export type HomeCardKey =
  | 'quickActions'
  | 'productionWorkbench'
  | 'qualityWorkbench'
  | 'warehouseWorkbench'
  | 'equipmentWorkbench'
  | 'todo'
  | 'approval';

export interface HomeCardConfigItem {
  key: HomeCardKey;
  label: string;
  description: string;
  permissions: string[];
  featureCodes?: OperationFeatureCode[];
  permissionMode?: HomeCardPermissionMode;
  sortable?: boolean;
  hidable?: boolean;
}

const HOME_QUICK_ACTION_PERMISSIONS = Array.from(
  new Set(
    ACTION_GROUPS.flatMap((group) =>
      group.items.flatMap((item) => toPermissionList(item.permission)),
    ),
  ),
);

const HOME_PRODUCTION_WORKBENCH_PERMISSIONS = [
  P.WORK_ORDER_LIST,
  P.WORK_ORDER_REPORT,
  P.SCHEDULE_ENTRY_LIST,
  P.SCHEDULE_ENTRY_CREATE,
];

const HOME_QUALITY_WORKBENCH_PERMISSIONS = [P.INSPECTION_LIST, P.DISPOSAL_LIST];

const HOME_WAREHOUSE_WORKBENCH_PERMISSIONS = [
  P.STOCK_LIST,
  P.WAREHOUSE_MANAGE,
  P.MATERIAL_REQ_LIST,
  P.MATERIAL_REQ_VIEW,
  P.PURCHASE_RECEIPT_LIST,
  P.PURCHASE_RECEIPT_CREATE,
];

const HOME_EQUIPMENT_WORKBENCH_PERMISSIONS = [
  P.EQUIPMENT_LIST,
  P.FAULT_LIST,
  P.FAULT_CREATE,
  P.EQUIPMENT_MAINTENANCE_LIST,
  P.EQUIPMENT_MAINTENANCE_VIEW,
  P.EQUIPMENT_MAINTENANCE_CREATE,
  P.EQUIPMENT_MAINTENANCE_UPDATE,
  P.EQUIPMENT_MAINTENANCE_DELETE,
];

export const HOME_CARD_CONFIGS: HomeCardConfigItem[] = [
  {
    key: 'quickActions',
    label: '功能入口',
    description: '高频业务快捷入口',
    permissions: HOME_QUICK_ACTION_PERMISSIONS,
  },
  {
    key: 'productionWorkbench',
    label: '生产执行',
    description: '开工、排产与报工入口',
    permissions: HOME_PRODUCTION_WORKBENCH_PERMISSIONS,
    featureCodes: [F.WORK_ORDER, F.REPORTING, F.SCHEDULE, F.FREE_REPORT],
  },
  {
    key: 'qualityWorkbench',
    label: '质检任务',
    description: '待检、录入与处置入口',
    permissions: HOME_QUALITY_WORKBENCH_PERMISSIONS,
    featureCodes: [F.BASIC_QUALITY, F.DISPOSAL],
  },
  {
    key: 'warehouseWorkbench',
    label: '仓储作业',
    description: '发料、入库与低库存处理',
    permissions: HOME_WAREHOUSE_WORKBENCH_PERMISSIONS,
    featureCodes: [F.BASIC_INVENTORY, F.MATERIAL_ISSUE, F.PURCHASE_RECEIPT],
  },
  {
    key: 'equipmentWorkbench',
    label: '设备保障',
    description: '故障、保养与报修入口',
    permissions: HOME_EQUIPMENT_WORKBENCH_PERMISSIONS,
    featureCodes: [F.EQUIPMENT_BASIC, F.EQUIPMENT_FAULT, F.EQUIPMENT_MAINTENANCE],
  },
  {
    key: 'todo',
    label: '我的任务',
    description: '待办任务与催办提醒',
    permissions: [P.TODO_LIST],
    featureCodes: [F.TODO],
  },
  {
    key: 'approval',
    label: '待审批',
    description: '需要我处理的审批单据',
    permissions: [P.APPROVAL_VIEW, P.APPROVAL_HANDLE, P.APPROVAL_CONFIG],
    featureCodes: [F.APPROVAL],
  },
];

// ─── 首页报表 Tab 配置 ───────────────────────────────────────────────────────

export type HomeReportTabKey =
  | 'dashboard'
  | 'production'
  | 'quality'
  | 'stock'
  | 'piecework'
  | 'finance';

export interface HomeReportTabConfig {
  key: HomeReportTabKey;
  label: string;
  /** 任一权限命中即可显示 */
  permissions: string[];
  featureCodes?: OperationFeatureCode[];
}

export const HOME_REPORT_TABS: HomeReportTabConfig[] = [
  {
    key: 'dashboard',
    label: '看板',
    permissions: [P.REPORT_DASHBOARD],
    featureCodes: [F.REPORTING],
  },
  {
    key: 'production',
    label: '生产',
    permissions: [P.REPORT_PRODUCTION],
    featureCodes: [F.REPORTING],
  },
  {
    key: 'quality',
    label: '质量',
    permissions: [P.REPORT_QUALITY],
    featureCodes: [F.BASIC_QUALITY],
  },
  {
    key: 'stock',
    label: '库存',
    permissions: [P.REPORT_WAREHOUSE],
    featureCodes: [F.BASIC_INVENTORY],
  },
  {
    key: 'piecework',
    label: '计件',
    permissions: [P.PIECEWORK_VIEW, P.PIECEWORK_VIEW_ALL],
    featureCodes: [F.PIECEWORK],
  },
  {
    key: 'finance',
    label: '财务',
    permissions: [P.FINANCE_REPORT_VIEW],
    featureCodes: [F.BUSINESS_RECEIVABLES],
  },
];

export function canAccessHomeCard(
  card: HomeCardConfigItem,
  hasVisibleQuickActions: boolean,
  operationConfig: OperationConfigSummaryDto | null | undefined,
): boolean {
  if (card.key === 'quickActions') {
    return hasVisibleQuickActions;
  }

  return (
    hasPermissionAccess(card.permissions, card.permissionMode) &&
    hasFeatureVisibility(operationConfig, card.featureCodes)
  );
}

export function canAccessHomeHeaderWidget(
  widget: HomeHeaderWidgetConfigItem,
  operationConfig: OperationConfigSummaryDto | null | undefined,
): boolean {
  return (
    hasPermissionAccess(widget.permissions, widget.permissionMode) &&
    hasFeatureVisibility(operationConfig, widget.featureCodes)
  );
}

export function canAccessHomeReportTab(
  tab: HomeReportTabConfig,
  operationConfig: OperationConfigSummaryDto | null | undefined,
): boolean {
  return (
    hasPermissionAccess(tab.permissions, 'any') &&
    hasFeatureVisibility(operationConfig, tab.featureCodes)
  );
}

function hasPermissionAccess(
  permissions: string[],
  permissionMode: HomePermissionMode = 'any',
): boolean {
  const mode = permissionMode;
  if (mode === 'public') {
    return true;
  }

  if (permissions.length === 0) {
    return false;
  }

  if (mode === 'all') {
    return hasAllPermissions(permissions);
  }

  return hasAnyPermission(permissions);
}
