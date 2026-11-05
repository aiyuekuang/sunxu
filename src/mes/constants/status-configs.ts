import type { Ionicons } from '@expo/vector-icons';
import { CustomerMaterialDispositionType } from '../host/api-types';
import { FinancePaymentRequestStatus } from '../host/api-types';
import { FreeReportMatchScope } from '../host/api-types';
import { TemporaryOutsourcingQualityMode } from '../host/api-types';
import type { StatusConfig } from '../../core/components/Badge';
import type { ChipOption } from '../../core/components/ChipSelectField';
import type {
  FilterConfig,
  ListFilterConfig,
  OptionFilterConfig,
} from '../../core/components/FilterBar';
import type { TabItem } from '../../core/components/StatusTabs';

// ═══════════════════════════════════════════
//  统一标签调色板（8 色）
//  所有 StatusConfig 必须引用此处常量，禁止散落硬编码色值
// ═══════════════════════════════════════════

/** 标签调色板 — 前景色 + 背景色成对定义 */
const TAG = {
  /** 成功/正常/启用/完成/通过 */
  green: { color: '#00B578', bg: '#E8FFF5' },
  /** 进行中/警告/待处理/中等 */
  orange: { color: '#FF8F1F', bg: '#FFF5E8' },
  /** 错误/取消/不合格/严重 */
  red: { color: '#FF3141', bg: '#FFF2F3' },
  /** 危急/致命（仅最高严重级别） */
  darkRed: { color: '#CF1322', bg: '#FFF1F0' },
  /** 信息/确认/已下达/待检 */
  blue: { color: '#1677FF', bg: '#E8F3FF' },
  /** 审批中/让步/流程中 */
  purple: { color: '#722ED1', bg: '#F5EDFF' },
  /** 物流/发货/收货/青色 */
  cyan: { color: '#13C2C2', bg: '#E6FFFB' },
  /** 草稿/关闭/停用/已报废 */
  gray: { color: '#999999', bg: '#F5F5F5' },
  /** 橙红色（返工/退料等偏负面的操作类型） */
  volcano: { color: '#FA541C', bg: '#FFF2E8' },
  /** 粉色（销售/报价等商务类实体区分色） */
  pink: { color: '#EB2F96', bg: '#FFF0F6' },
  /** 深绿（采购订单等供应链实体区分色） */
  darkGreen: { color: '#237804', bg: '#F6FFED' },
} as const;

// ═══════════════════════════════════════════
//  工具函数：从 StatusConfig 自动派生 Tabs / FilterOptions
// ═══════════════════════════════════════════

// ─── 统一筛选配置工具函数 ──────────────────────────────────────────────────

/** 分组 tab 配置：一个 tab 对应多个状态值 */
interface TabGroup {
  label: string;
  keys: string[];
}

/** 从 StatusConfig 生成 tab 型 ListFilterConfig */
export function configToTabFilter(
  config: StatusConfig<string>,
  opts: {
    key?: string;
    label?: string;
    scrollable?: boolean;
    includeAllOption?: boolean;
    /** 只在 tab 中展示的状态子集（不传则展示全部） */
    tabKeys?: string[];
    /** 分组 tab：一个 tab 对应多个状态值（与 tabKeys 互斥） */
    tabGroups?: TabGroup[];
  } = {},
): OptionFilterConfig {
  const {
    key = 'status',
    label = '状态',
    scrollable = true,
    includeAllOption,
    tabKeys,
    tabGroups,
  } = opts;

  if (tabGroups) {
    const options = tabGroups.map((g) => ({
      label: g.label,
      value: g.keys.join(','),
    }));
    return { key, label, options, placement: 'tab', scrollable, includeAllOption };
  }

  const entries = Object.entries(config);
  const options = tabKeys
    ? entries.filter(([k]) => tabKeys.includes(k)).map(([value, c]) => ({ label: c.label, value }))
    : entries.map(([value, c]) => ({ label: c.label, value }));
  return { key, label, options, placement: 'tab', scrollable, includeAllOption };
}

/** 从 StatusConfig 生成 quick 型 ListFilterConfig */
export function configToQuickFilter(
  config: StatusConfig<string>,
  opts: { key?: string; label?: string } = {},
): OptionFilterConfig {
  const { key = 'status', label = '状态' } = opts;
  return {
    key,
    label,
    options: Object.entries(config).map(([value, c]) => ({ label: c.label, value })),
    placement: 'quick',
  };
}

/** 创建日期范围型高级筛选（默认 persist: false，日期范围通常不需要记忆） */
export function dateRangeFilter(
  key: string,
  label: string,
  startKey = 'startDate',
  endKey = 'endDate',
  persist = false,
): ListFilterConfig {
  return { type: 'date_range', key, label, startKey, endKey, placement: 'advanced', persist };
}

// ═══════════════════════════════════════════
//  自由报工 Free Report
// ═══════════════════════════════════════════

export const FREE_REPORT_MATCH_SCOPE_CONFIG: StatusConfig<FreeReportMatchScope> = {
  [FreeReportMatchScope.DAY]: {
    label: '按日汇总',
    color: TAG.blue.color,
    bg: TAG.blue.bg,
  },
  [FreeReportMatchScope.SHIFT]: {
    label: '按日+班次',
    color: TAG.cyan.color,
    bg: TAG.cyan.bg,
  },
  [FreeReportMatchScope.TEAM]: {
    label: '按日+班组',
    color: TAG.green.color,
    bg: TAG.green.bg,
  },
  [FreeReportMatchScope.SHIFT_TEAM]: {
    label: '按日+班次+班组',
    color: TAG.purple.color,
    bg: TAG.purple.bg,
  },
};

// ═══════════════════════════════════════════
//  物料 Material
// ═══════════════════════════════════════════

/** 物料管理 — 状态筛选 */
export const MATERIAL_ACTIVE_FILTER: FilterConfig = {
  key: 'isActive',
  label: '状态',
  options: [
    { label: '启用', value: 'true' },
    { label: '停用', value: 'false' },
  ],
};

/** 物料管理 — 采购类型配置 */
export const PROCUREMENT_TYPE_CONFIG: StatusConfig<string> = {
  buy: { label: '外购', ...TAG.blue },
  make: { label: '自制', ...TAG.green },
  both: { label: '自制+外购', ...TAG.orange },
  outsource: { label: '委外', ...TAG.purple },
};

export const PROCUREMENT_TYPE_OPTIONS: ChipOption[] = [
  { value: 'buy', label: '外购' },
  { value: 'make', label: '自制' },
  { value: 'both', label: '自制+外购' },
  { value: 'outsource', label: '委外' },
];

export const SUPPLY_GRADE_MODE_CONFIG: StatusConfig<string> = {
  none: { label: '不管控', ...TAG.gray },
  optional: { label: '可选记录', ...TAG.blue },
  required: { label: '关键动作必填', ...TAG.orange },
};

export const SUPPLY_GRADE_MODE_OPTIONS: ChipOption[] = Object.entries(SUPPLY_GRADE_MODE_CONFIG).map(
  ([value, { label, color }]) => ({ value, label, color }),
);

export const MATERIAL_FAMILY_BOM_STRATEGY_CONFIG: StatusConfig<string> = {
  none: { label: '不启用', ...TAG.gray },
  optional: { label: '可选维护', ...TAG.blue },
  required: { label: '强制维护', ...TAG.orange },
  product_base_plus_model_overlay: { label: '基础BOM+型号差异', ...TAG.green },
};

export const MATERIAL_FAMILY_ROUTE_STRATEGY_CONFIG: StatusConfig<string> = {
  none: { label: '不启用', ...TAG.gray },
  optional: { label: '可选维护', ...TAG.blue },
  required: { label: '强制维护', ...TAG.orange },
  product_common_plus_model_specific: { label: '通用路线+型号专用', ...TAG.green },
};

export const MATERIAL_FAMILY_BATCH_STRATEGY_CONFIG: StatusConfig<string> = {
  none: { label: '不追踪', ...TAG.gray },
  optional: { label: '可选追踪', ...TAG.blue },
  tracked: { label: '默认追踪', ...TAG.green },
  required: { label: '强制追踪', ...TAG.orange },
};

/** 物料族 — 单位策略配置（fixed=型号继承锁定，改物料单位强制同步所有型号；optional=型号可自定义库存单位） */
export const MATERIAL_FAMILY_UNIT_STRATEGY_CONFIG: StatusConfig<string> = {
  fixed: { label: '型号继承锁定', ...TAG.orange },
  optional: { label: '型号可自定义', ...TAG.blue },
};

export const MATERIAL_EFFECTIVE_SOURCE_CONFIG: StatusConfig<string> = {
  template: { label: '模板继承', ...TAG.green },
  sku_override: { label: '型号覆盖', ...TAG.orange },
  snapshot: { label: '快照/默认', ...TAG.gray },
  manual: { label: '手工维护', ...TAG.blue },
};

export const PROCUREMENT_TYPE_FILTER: FilterConfig = {
  key: 'procurementType',
  label: '采购类型',
  options: [
    { label: '外购', value: 'buy' },
    { label: '自制', value: 'make' },
    { label: '自制+外购', value: 'both' },
  ],
};

export const MATERIAL_BASE_TYPE_CONFIG: StatusConfig<string> = {
  raw: { label: '原材料', ...TAG.blue },
  semi: { label: '半成品', ...TAG.orange },
  finished: { label: '成品', ...TAG.green },
};

export const MATERIAL_BASE_TYPE_OPTIONS: ChipOption[] = Object.entries(
  MATERIAL_BASE_TYPE_CONFIG,
).map(([value, { label, color }]) => ({ value, label, color }));

// ═══════════════════════════════════════════
//  打印平台 Print
// ═══════════════════════════════════════════

export const PRINT_JOB_STATUS_CONFIG: StatusConfig<string> = {
  rendered: { label: '已渲染', ...TAG.blue },
  printed: { label: '已确认', ...TAG.green },
  cancelled: { label: '已取消', ...TAG.gray },
};

export const PRINT_JOB_FILTERS: ListFilterConfig[] = [
  configToTabFilter(PRINT_JOB_STATUS_CONFIG, {
    label: '状态',
    includeAllOption: true,
  }),
];

// ═══════════════════════════════════════════
//  工艺路线 Process Route
// ═══════════════════════════════════════════

export const ROUTE_STATUS_CONFIG: StatusConfig<string> = {
  draft: { label: '草稿', ...TAG.gray },
  active: { label: '启用', ...TAG.green },
  obsolete: { label: '已归档', ...TAG.red },
};

// ═══════════════════════════════════════════
//  BOM
// ═══════════════════════════════════════════

export const BOM_STATUS_CONFIG: StatusConfig<string> = {
  draft: { label: '草稿', ...TAG.gray },
  active: { label: '激活', ...TAG.green },
  obsolete: { label: '已归档', ...TAG.red },
};

// ═══════════════════════════════════════════
//  工单 Work Order
// ═══════════════════════════════════════════

export const WORK_ORDER_STATUS_CONFIG: StatusConfig<string> = {
  draft: { label: '草稿', ...TAG.gray },
  submitted: { label: '审批中', ...TAG.purple },
  released: { label: '已下达', ...TAG.cyan },
  in_progress: { label: '进行中', ...TAG.orange },
  paused: { label: '暂停', ...TAG.purple },
  completed: { label: '已完工', ...TAG.green },
  cancelled: { label: '已取消', ...TAG.red },
  closed: { label: '已关闭', ...TAG.gray },
};

/** 工单展示态（含派生态，不用于后端筛选参数） */
export const WORK_ORDER_DISPLAY_STATUS_CONFIG: StatusConfig<string> = {
  ...WORK_ORDER_STATUS_CONFIG,
  pending_release: { label: '待下达', ...TAG.blue },
  unscheduled: { label: '待排产', ...TAG.orange },
  pending_confirm: { label: '待确认排产', ...TAG.purple },
  ready_to_start: { label: '待开工', ...TAG.blue },
};

export const CHILD_ORDER_TYPE_CONFIG: StatusConfig<string> = {
  split: { label: '拆分', ...TAG.purple },
  rework: { label: '返工', ...TAG.volcano },
  sub_assembly: { label: '子装配', ...TAG.blue },
  normal: { label: '常规', ...TAG.green },
};

export const WORK_ORDER_OP_STATUS: StatusConfig<string> = {
  pending: { label: '待执行', ...TAG.gray },
  in_progress: { label: '执行中', ...TAG.orange },
  completed: { label: '已完成', ...TAG.green },
  skipped: { label: '已跳过', ...TAG.gray },
};

export const REPORT_LOG_TYPE_CONFIG: StatusConfig<string> = {
  report: { label: '报工', ...TAG.green },
  revoke: { label: '冲正', ...TAG.red },
};

export const PRODUCTION_SCRAP_STATUS_CONFIG: StatusConfig<string> = {
  confirmed: { label: '已确认', ...TAG.red },
  pending_quality: { label: '质量待判定', ...TAG.orange },
  mixed: { label: '混合处置', ...TAG.purple },
  cancelled: { label: '已作废', ...TAG.gray },
};

export const PRODUCTION_NONCONFORMANCE_SOURCE_CONFIG: StatusConfig<string> = {
  report_scrap: { label: '报工不合格', ...TAG.red },
  receipt_diff: { label: '入库差异', ...TAG.orange },
  receipt_reverse: { label: '入库冲正异常', ...TAG.purple },
  buffer_exception: { label: '暂存异常', ...TAG.volcano },
};

export const PRODUCTION_RECEIPT_STATUS_CONFIG: StatusConfig<string> = {
  pending: { label: '待确认', ...TAG.orange },
  received: { label: '已入库', ...TAG.green },
  cancelled: { label: '已取消', ...TAG.red },
  reversed: { label: '已冲正', ...TAG.purple },
};

export const PRODUCTION_RECEIPT_VARIANCE_ACTION_CONFIG: StatusConfig<string> = {
  return_to_buffer: { label: '退回生产暂存', ...TAG.orange },
  final_write_off: { label: '最终核销', ...TAG.gray },
  quality_hold: { label: '转质量待处置', ...TAG.red },
};

export const PRODUCTION_OUTPUT_DISPOSAL_TYPE = {
  SCRAP: 'scrap',
  REWORK: 'rework',
  FINAL_WRITE_OFF: 'inventory_write_off',
} as const;

export const PRODUCTION_OUTPUT_BUFFER_STATUS_CONFIG: StatusConfig<string> = {
  open: { label: '待处理', ...TAG.orange },
  closed: { label: '已关闭', ...TAG.gray },
};

export const OUTSOURCING_ORDER_STATUS_CONFIG: StatusConfig<string> = {
  draft: { label: '待发料', ...TAG.gray },
  in_progress: { label: '加工中', ...TAG.orange },
  partial_received: { label: '部分收货', ...TAG.blue },
  received: { label: '已收货', ...TAG.green },
  repairing: { label: '返修中', ...TAG.volcano },
  qualified: { label: '已合格', ...TAG.green },
  unqualified: { label: '不合格', ...TAG.red },
  closed: { label: '已关闭', ...TAG.gray },
  cancelled: { label: '已取消', ...TAG.red },
};

export const OUTSOURCING_RECEIPT_STATUS_CONFIG: StatusConfig<string> = {
  pending: { label: '待确认', ...TAG.orange },
  received: { label: '已入库', ...TAG.green },
  cancelled: { label: '已取消', ...TAG.red },
  reversed: { label: '已冲正', ...TAG.purple },
};

/** 默认自制工序允许临时委外时的收货质量策略摘要。 */
export const TEMPORARY_OUTSOURCING_QUALITY_MODE_CONFIG: StatusConfig<TemporaryOutsourcingQualityMode> =
  {
    [TemporaryOutsourcingQualityMode.NO_AUTO_INSPECTION]: {
      label: '不自动检验',
      ...TAG.gray,
    },
    [TemporaryOutsourcingQualityMode.RECORD_NON_BLOCKING]: {
      label: 'IPQC 留档，不阻断',
      ...TAG.blue,
    },
    [TemporaryOutsourcingQualityMode.RELEASE_REQUIRED]: {
      label: 'IPQC 合格后放行',
      ...TAG.orange,
    },
  };

// ═══════════════════════════════════════════
//  生产计划 Production Plan
// ═══════════════════════════════════════════

export const PLAN_STATUS_CONFIG: StatusConfig<string> = {
  draft: { label: '草稿', ...TAG.gray },
  confirmed: { label: '已确认', ...TAG.blue },
  scheduled: { label: '已排产', ...TAG.purple },
  released: { label: '已下达', ...TAG.cyan },
  in_progress: { label: '进行中', ...TAG.orange },
  completed: { label: '已完成', ...TAG.green },
  closed: { label: '已关闭', ...TAG.gray },
  cancelled: { label: '已取消', ...TAG.red },
};

// ═══════════════════════════════════════════
//  设备 Equipment
// ═══════════════════════════════════════════

export const EQUIPMENT_STATUS_CONFIG: StatusConfig<string> = {
  active: { label: '可用', ...TAG.green },
  occupied: { label: '作业中', ...TAG.blue },
  maintenance: { label: '维保中', ...TAG.orange },
  repair: { label: '故障停机', ...TAG.red },
  retired: { label: '已报废', ...TAG.gray },
};

export const EQUIPMENT_MAINTENANCE_STATUS_CONFIG: StatusConfig<string> = {
  pending: { label: '待处理', ...TAG.orange },
  submitted: { label: '审批中', ...TAG.purple },
  in_progress: { label: '处理中', ...TAG.blue },
  completed: { label: '已完成', ...TAG.green },
  cancelled: { label: '已取消', ...TAG.gray },
};

// ═══════════════════════════════════════════
//  设备故障 Equipment Fault
// ═══════════════════════════════════════════

export const FAULT_STATUS_CONFIG: StatusConfig<string> = {
  open: { label: '待处理', ...TAG.red },
  in_repair: { label: '维修中', ...TAG.orange },
  pending_verify: { label: '待验收', ...TAG.purple },
  resolved: { label: '已解决', ...TAG.green },
  cancelled: { label: '已取消', ...TAG.gray },
};

export const FAULT_SEVERITY_CONFIG: StatusConfig<string> = {
  minor: { label: '轻微', ...TAG.gray },
  moderate: { label: '中等', ...TAG.orange },
  severe: { label: '严重', ...TAG.red },
  critical: { label: '紧急', ...TAG.darkRed },
};

/** 设备故障 — severity 筛选由字典 fault_severity 动态获取，此处不再定义 */

// ═══════════════════════════════════════════
//  工装 Tooling
// ═══════════════════════════════════════════

export const TOOLING_STATUS_CONFIG: StatusConfig<string> = {
  available: { label: '可用', ...TAG.green },
  in_use: { label: '使用中', ...TAG.blue },
  maintenance: { label: '维护中', ...TAG.orange },
  scrapped: { label: '已报废', ...TAG.gray },
};

export const TOOLING_SESSION_STATUS: StatusConfig<string> = {
  running: { label: '使用中', ...TAG.blue },
  completed: { label: '已完成', ...TAG.green },
};

export const TOOLING_USAGE_RECORD_STATUS: StatusConfig<string> = {
  effective: { label: '有效', ...TAG.green },
  reversed: { label: '已冲回', ...TAG.gray },
};

/** 工装寿命消耗来源（ToolingUsageSource） */
export const TOOLING_USAGE_SOURCE_CONFIG: StatusConfig<string> = {
  report: { label: '工序报工自动累计', ...TAG.blue },
  manual_session: { label: '下机手工补录', ...TAG.orange },
  initialization: { label: '期初建档', ...TAG.gray },
  reset: { label: '寿命重置', ...TAG.purple },
};

// ═══════════════════════════════════════════
//  质量检验 Quality
// ═══════════════════════════════════════════

export const INSPECTION_STATUS_CONFIG: StatusConfig<string> = {
  pending: { label: '待检', ...TAG.blue },
  in_progress: { label: '检验中', ...TAG.blue },
  submitted: { label: '审批中', ...TAG.purple },
  passed: { label: '合格', ...TAG.green },
  conditional: { label: '让步接收', ...TAG.purple },
  rejected: { label: '不合格', ...TAG.red },
  cancelled: { label: '已取消', ...TAG.gray },
};

export const INSPECTION_CONCLUSION_CONFIG: StatusConfig<string> = {
  passed: { label: '通过', ...TAG.green },
  conditional: { label: '条件接受', ...TAG.purple },
  rejected: { label: '拒绝', ...TAG.red },
  report_scrap_pending_disposition: {
    label: '报工报废待质量处置',
    ...TAG.orange,
  },
};

export function getInspectionConclusionLabel(conclusion?: string | null): string {
  if (!conclusion) return '-';
  return (
    INSPECTION_CONCLUSION_CONFIG[conclusion]?.label ??
    INSPECTION_STATUS_CONFIG[conclusion]?.label ??
    conclusion
  );
}

export const INSPECTION_TYPE_CONFIG: StatusConfig<string> = {
  iqc: { label: '来料检验（IQC）', ...TAG.blue },
  ipqc: { label: '过程检验（IPQC）', ...TAG.orange },
  fqc: { label: '成品检验（FQC）', ...TAG.green },
  oqc: { label: '出货检验（OQC）', ...TAG.purple },
};

export const INSPECTION_RECORD_TYPE_CONFIG: StatusConfig<string> = {
  first: { label: '首件检', ...TAG.blue },
  process: { label: '过程/巡检', ...TAG.orange },
  last: { label: '末件检', ...TAG.green },
  recheck: { label: '历史复检', ...TAG.purple },
  other: { label: '其他检查', ...TAG.gray },
};

export const INSPECTION_RECORD_STATUS_CONFIG: StatusConfig<string> = {
  submitted: { label: '有效', ...TAG.blue },
  voided: { label: '已作废', ...TAG.gray },
};

export const INCOMING_QUALITY_GATE_STATUS_CONFIG: StatusConfig<string> = {
  not_required: { label: '无需检验', ...TAG.gray },
  pending: { label: '待完成IQC', ...TAG.orange },
  ready: { label: 'IQC已放行', ...TAG.green },
  disposition_pending: { label: '待质量处置', ...TAG.purple },
  rejected: { label: 'IQC拒收', ...TAG.red },
  config_error: { label: '检验配置异常', ...TAG.red },
};

export const QUALITY_DEFECT_SEVERITY_CONFIG: StatusConfig<string> = {
  minor: { label: '轻微', ...TAG.orange },
  major: { label: '严重', ...TAG.red },
  critical: { label: '致命', ...TAG.darkRed },
};

// ═══════════════════════════════════════════
//  处置 Disposal
// ═══════════════════════════════════════════

export const DISPOSAL_STATUS_CONFIG: StatusConfig<string> = {
  pending: { label: '待处置', ...TAG.blue },
  submitted: { label: '审批中', ...TAG.purple },
  in_progress: { label: '处置中', ...TAG.orange },
  completed: { label: '已完成', ...TAG.green },
  cancelled: { label: '已取消', ...TAG.gray },
};

export const DISPOSAL_TYPE_CONFIG: StatusConfig<string> = {
  rework: { label: '返工', ...TAG.orange },
  scrap: { label: '报废', ...TAG.red },
  concession: { label: '让步接收', ...TAG.purple },
  sort_accept: { label: '挑选接收', ...TAG.blue },
  return_to_supplier: { label: '退供', ...TAG.red },
};

/** 处置单类型文案；未命中返回原始码，type 为空返回「待判定」（处置尚未生成时的展示口径） */
export function disposalTypeLabel(type?: string | null): string {
  if (!type) return '待判定';
  return DISPOSAL_TYPE_CONFIG[type]?.label ?? type;
}

// ═══════════════════════════════════════════
//  CAPA
// ═══════════════════════════════════════════

export const CAPA_STATUS_CONFIG: StatusConfig<string> = {
  open: { label: '待分析', ...TAG.blue },
  submitted: { label: '审批中', ...TAG.purple },
  in_analysis: { label: '分析中', ...TAG.orange },
  pending_verify: { label: '待验证', ...TAG.purple },
  closed: { label: '已关闭', ...TAG.green },
  cancelled: { label: '已取消', ...TAG.gray },
};

export const CAPA_SEVERITY_CONFIG: StatusConfig<string> = {
  low: { label: '低', ...TAG.gray },
  medium: { label: '中', ...TAG.orange },
  high: { label: '高', ...TAG.red },
  critical: { label: '严重', ...TAG.darkRed },
};

// ═══════════════════════════════════════════
//  仓库 Warehouse
// ═══════════════════════════════════════════

export const WAREHOUSE_TYPE_CONFIG: StatusConfig<string> = {
  raw_material: { label: '原材料仓', ...TAG.blue },
  wip: { label: '在制品仓', ...TAG.orange },
  finished_goods: { label: '成品仓', ...TAG.green },
  general: { label: '通用仓', ...TAG.gray },
  line_side: { label: '线边仓', ...TAG.cyan },
  defective: { label: '不良仓', ...TAG.red },
};

export const WAREHOUSE_TYPE_OPTIONS = Object.entries(WAREHOUSE_TYPE_CONFIG).map(
  ([value, { label }]) => ({
    label,
    value,
  }),
);

/** 库存货主类型。客户来料必须与公司自有库存分开识别。 */
export const INVENTORY_OWNER_TYPE_CONFIG: StatusConfig<string> = {
  company: { label: '公司自有', ...TAG.blue },
  customer: { label: '客户来料', ...TAG.orange },
  supplier: { label: '供应商寄存', ...TAG.purple },
};

/** 库存列表筛选范围；默认全部货主，避免客户来料被公司库存默认范围隐藏。 */
export const INVENTORY_OWNER_SCOPE_CONFIG: StatusConfig<string> = {
  all: { label: '全部货主', ...TAG.gray },
  ...INVENTORY_OWNER_TYPE_CONFIG,
};

export const WAREHOUSE_LOCATION_CONTROL_MODE_CONFIG: StatusConfig<string> = {
  none: { label: '不启用', ...TAG.gray },
  optional: { label: '可选仓位', ...TAG.blue },
  required: { label: '必须仓位', ...TAG.orange },
};

export const WAREHOUSE_LOCATION_CONTROL_MODE_OPTIONS: ChipOption[] = Object.entries(
  WAREHOUSE_LOCATION_CONTROL_MODE_CONFIG,
).map(([value, { label, color }]) => ({ value, label, color }));

export const CUSTOMER_INBOUND_USAGE_TYPE_CONFIG: StatusConfig<string> = {
  external_item: { label: '外来物品', ...TAG.purple },
  production_material: { label: '生产用客户料', ...TAG.blue },
};

export const CUSTOMER_INBOUND_STATUS_CONFIG: StatusConfig<string> = {
  received: { label: '已到厂', ...TAG.blue },
  returned: { label: '已归还', ...TAG.gray },
  closed: { label: '已关闭', ...TAG.gray },
  converted_to_stock: { label: '已入客户库存', ...TAG.green },
  scrapped: { label: '已损耗/作废', ...TAG.red },
  lost: { label: '已遗失', ...TAG.darkRed },
};

export const CUSTOMER_INBOUND_LOSS_TYPE_OPTIONS: ChipOption[] = [
  { value: 'scrapped', label: '损耗/作废' },
  { value: 'lost', label: '遗失' },
];

export const CUSTOMER_MATERIAL_DISPOSITION_TYPE_OPTIONS: ChipOption[] = [
  { value: CustomerMaterialDispositionType.RETURN, label: '退回客户' },
  { value: CustomerMaterialDispositionType.LOSS, label: '遗失' },
  { value: CustomerMaterialDispositionType.SCRAP, label: '损耗/报废' },
];

// ═══════════════════════════════════════════
//  供应商 Supplier
// ═══════════════════════════════════════════

export const SUPPLIER_STATUS_CONFIG: StatusConfig<string> = {
  active: { label: '合作中', ...TAG.green },
  inactive: { label: '已停用', ...TAG.gray },
};

// ═══════════════════════════════════════════
//  批号 Batch
// ═══════════════════════════════════════════

export const BATCH_STATUS_CONFIG: StatusConfig<string> = {
  available: { label: '可用', ...TAG.green },
  quarantine: { label: '隔离', ...TAG.orange },
  expired: { label: '过期', ...TAG.red },
  consumed: { label: '已消耗', ...TAG.gray },
};

// ═══════════════════════════════════════════
//  客户 Customer
// ═══════════════════════════════════════════

export const CUSTOMER_STATUS_CONFIG: StatusConfig<string> = {
  active: { label: '合作中', ...TAG.green },
  inactive: { label: '已停用', ...TAG.gray },
};

// ═══════════════════════════════════════════
//  销售订单 Sale Order
// ═══════════════════════════════════════════

export const SALE_ORDER_STATUS_CONFIG: StatusConfig<string> = {
  draft: { label: '草稿', ...TAG.gray },
  submitted: { label: '审批中', ...TAG.purple },
  confirmed: { label: '已确认', ...TAG.blue },
  production_pending: { label: '已转生产', ...TAG.gray },
  ready_to_start: { label: '待开工', ...TAG.blue },
  in_production: { label: '生产中', ...TAG.orange },
  partially_shipped: { label: '部分发货', ...TAG.cyan },
  shipped: { label: '已发货', ...TAG.cyan },
  completed: { label: '已完工', ...TAG.green },
  cancelled: { label: '已取消', ...TAG.red },
};

/** 销售订单的退货结果标识；这是销售退货事实的展示口径，不参与订单状态筛选。 */
export const SALE_ORDER_RETURN_STATUS_CONFIG: StatusConfig<string> = {
  returned: { label: '已退货', ...TAG.red },
  has_return: { label: '有退货', ...TAG.red },
};

// ═══════════════════════════════════════════
//  销售出库单 Sale Delivery
// ═══════════════════════════════════════════

export const SALE_DELIVERY_STATUS_CONFIG: StatusConfig<string> = {
  draft: { label: '待出库', ...TAG.orange },
  submitted: { label: '审批中', ...TAG.purple },
  delivered: { label: '已出库', ...TAG.green },
  reversed: { label: '已冲正', ...TAG.purple },
  cancelled: { label: '已取消', ...TAG.red },
};

// ═══════════════════════════════════════════
//  包装单元 Package Unit
// ═══════════════════════════════════════════

export const PACKAGE_UNIT_STATUS_CONFIG: StatusConfig<string> = {
  sealed: { label: '已封箱', ...TAG.blue },
  allocated: { label: '已分配出库', ...TAG.orange },
  shipped: { label: '已出库', ...TAG.green },
  cancelled: { label: '已取消', ...TAG.gray },
};

export const PACKAGE_TYPE_LABELS: Record<string, string> = {
  carton: '纸箱',
  bag: '袋',
  tray: '盘',
  pallet: '托',
};

// ═══════════════════════════════════════════
//  销售退货单 Sale Return
// ═══════════════════════════════════════════

export const SALE_RETURN_STATUS_CONFIG: StatusConfig<string> = {
  draft: { label: '草稿', ...TAG.gray },
  pending_approval: { label: '待审批', ...TAG.purple },
  pending_receive: { label: '待收货', ...TAG.orange },
  received: { label: '已收货', ...TAG.cyan },
  pending_inspection: { label: '待质检', ...TAG.blue },
  inspected: { label: '已质检', ...TAG.blue },
  completed: { label: '已完成', ...TAG.green },
  cancelled: { label: '已取消', ...TAG.red },
  reversed: { label: '已冲正', ...TAG.orange },
};

export const SALE_RETURN_TYPE_CONFIG: StatusConfig<string> = {
  physical_return: { label: '实物退货', ...TAG.cyan },
  refund_only: { label: '仅退款', ...TAG.orange },
  exchange_return: { label: '换货退回', ...TAG.purple },
};

export const SALE_RETURN_FILTERS: ListFilterConfig[] = [
  configToTabFilter(SALE_RETURN_STATUS_CONFIG, { label: '退货状态' }),
  dateRangeFilter('createdAt', '创建时间', 'startDate', 'endDate'),
];

export const SALE_RETURN_FINANCIAL_ACTION_CONFIG: StatusConfig<string> = {
  none: { label: '不处理', ...TAG.gray },
  credit_note: { label: '贷项通知', ...TAG.blue },
  receivable_offset: { label: '应收冲减', ...TAG.green },
  refund: { label: '退款', ...TAG.orange },
};

export const SALE_RETURN_DISPOSITION_CONFIG: StatusConfig<string> = {
  resellable: { label: '可再销售', ...TAG.green },
  pending: { label: '待处理', ...TAG.orange },
  defective: { label: '不良', ...TAG.red },
  scrap: { label: '报废', ...TAG.gray },
  rework: { label: '返工', ...TAG.purple },
  reject_to_customer: { label: '退回客户', ...TAG.volcano },
};

// ═══════════════════════════════════════════
//  采购订单 Purchase Order
// ═══════════════════════════════════════════

export const PURCHASE_ORDER_STATUS_CONFIG: StatusConfig<string> = {
  draft: { label: '草稿', ...TAG.gray },
  submitted: { label: '审批中', ...TAG.purple },
  confirmed: { label: '已确认', ...TAG.blue },
  partially_received: { label: '部分收货', ...TAG.cyan },
  received: { label: '已收货', ...TAG.cyan },
  completed: { label: '已完成', ...TAG.green },
  cancelled: { label: '已取消', ...TAG.red },
};

// ═══════════════════════════════════════════
//  工单提报 Ticket
// ═══════════════════════════════════════════

export const TICKET_STATUS_CONFIG: StatusConfig<string> = {
  open: { label: '待处理', ...TAG.orange },
  replied: { label: '已回复', ...TAG.green },
  closed: { label: '已关闭', ...TAG.gray },
};

// ═══════════════════════════════════════════
//  排产计划 Schedule
// ═══════════════════════════════════════════

export const SCHEDULE_STATUS_CONFIG: StatusConfig<string> = {
  scheduled: { label: '待确认', ...TAG.blue },
  confirmed: { label: '已确认', ...TAG.purple },
  in_progress: { label: '生产中', ...TAG.orange },
  completed: { label: '已完成', ...TAG.green },
  cancelled: { label: '已取消', ...TAG.red },
};

export const SCHEDULE_STATUS_TABS: TabItem<string>[] = [
  { key: 'all', label: '全部' },
  { key: 'scheduled', label: '待确认' },
  { key: 'confirmed', label: '已确认' },
  { key: 'in_progress', label: '生产中' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

/** 星期短文案；下标 0 = 周日，与 Date.getDay() 对齐（下标 7 循环回周日） */
export const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'] as const;

export const CALENDAR_EXCEPTION_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: string }
> = {
  holiday: { label: '假日', ...TAG.red, icon: 'sunny' },
  maintenance: { label: '维护', ...TAG.orange, icon: 'build' },
  overtime: { label: '加班', ...TAG.green, icon: 'time' },
};

// ═══════════════════════════════════════════
//  采购申请 Purchase Requisition
// ═══════════════════════════════════════════

export const PR_STATUS_CONFIG: StatusConfig<string> = {
  draft: { label: '草稿', ...TAG.gray },
  submitted: { label: '审批中', ...TAG.purple },
  approved: { label: '已批准', ...TAG.green },
  ordered: { label: '已下单', ...TAG.blue },
  rejected: { label: '已驳回', ...TAG.red },
  cancelled: { label: '已取消', ...TAG.red },
  closed: { label: '已关闭', ...TAG.gray },
};

export const PR_SOURCE_CONFIG: StatusConfig<string> = {
  manual: { label: '手工创建', ...TAG.gray },
  mrp: { label: 'MRP生成', ...TAG.blue },
  copy: { label: '复制创建', ...TAG.purple },
  bom_preparation: { label: 'BOM备料', ...TAG.cyan },
  bom_expansion: { label: 'BOM展开', ...TAG.cyan },
};

// ═══════════════════════════════════════════
//  生产领料单 Material Issue
// ═══════════════════════════════════════════

export const MATERIAL_ISSUE_STATUS_CONFIG: StatusConfig<string> = {
  draft: { label: '待发料', ...TAG.gray },
  submitted: { label: '审批中', ...TAG.purple },
  confirmed: { label: '已确认', ...TAG.blue },
  completed: { label: '已完成', ...TAG.green },
  reversed: { label: '已冲正', ...TAG.orange },
  cancelled: { label: '已取消', ...TAG.red },
};

export const MATERIAL_ISSUE_TYPE_CONFIG: StatusConfig<string> = {
  auto_issue: { label: '自动领料', ...TAG.blue },
  manual_issue: { label: '手动领料', ...TAG.orange },
  return: { label: '退料', ...TAG.purple },
};

// ═══════════════════════════════════════════
//  内部领用 Internal Issue
// ═══════════════════════════════════════════

export const INTERNAL_ISSUE_STATUS_CONFIG: StatusConfig<string> = {
  draft: { label: '草稿', ...TAG.gray },
  submitted: { label: '审批中', ...TAG.purple },
  approved: { label: '已批准', ...TAG.blue },
  completed: { label: '已完成', ...TAG.green },
  cancelled: { label: '已取消', ...TAG.red },
};

export const INTERNAL_ISSUE_TYPE_CONFIG: StatusConfig<string> = {
  maintenance: { label: '维修备件领用', ...TAG.orange },
  maintenance_plan: { label: '保养耗材领用', ...TAG.cyan },
  department: { label: '部门耗材领用', ...TAG.blue },
  trial: { label: '试制研发领用', ...TAG.purple },
  production_extra: { label: '工单临时领用', ...TAG.volcano },
  other: { label: '其他内部领用', ...TAG.gray },
};

// ═══════════════════════════════════════════
//  领料需求 Material Requisition
// ═══════════════════════════════════════════

export const MATERIAL_REQ_STATUS_CONFIG: StatusConfig<string> = {
  pending: { label: '待领', ...TAG.orange },
  partial: { label: '部分', ...TAG.purple },
  fulfilled: { label: '已满足', ...TAG.green },
  closed: { label: '已关闭', ...TAG.gray },
};

export const ISSUE_MODE_CONFIG: StatusConfig<string> = {
  direct: { label: '直接供料', ...TAG.gray },
  staged: { label: '线边供料', ...TAG.blue },
};

export const ISSUE_MODE_OPTIONS: ChipOption[] = Object.entries(ISSUE_MODE_CONFIG).map(
  ([value, { label, color }]) => ({ value, label, color }),
);

export const MATERIAL_READY_STATUS_CONFIG: StatusConfig<string> = {
  ready: { label: '已齐套', ...TAG.green },
  waiting_replenishment: { label: '线边待补料', ...TAG.orange },
  shortage: { label: '库存不足', ...TAG.red },
};

/** 领料需求用量口径（BomQuantityMode；后端当前仅 fixed） */
export const MATERIAL_REQ_QUANTITY_MODE_CONFIG: Record<string, string> = {
  fixed: '固定用量',
};

export const PRODUCTION_SUPPLY_BIZ_TYPE_CONFIG: StatusConfig<string> = {
  replenish: { label: '补料', ...TAG.blue },
  return: { label: '退回', ...TAG.volcano },
};

export const PRODUCTION_SUPPLY_STATUS_CONFIG: StatusConfig<string> = {
  draft: { label: '草稿', ...TAG.gray },
  submitted: { label: '待执行', ...TAG.blue },
  partial: { label: '部分执行', ...TAG.orange },
  completed: { label: '已完成', ...TAG.green },
  reversed: { label: '已冲正', ...TAG.purple },
  cancelled: { label: '已取消', ...TAG.gray },
};

// ═══════════════════════════════════════════
//  审批 Approval
// ═══════════════════════════════════════════

/** 审批时间线步骤状态（ApprovalStepDetail.status） */
export const APPROVAL_HISTORY_STATUS_CONFIG: StatusConfig<string> = {
  approved: { label: '已通过', ...TAG.green },
  rejected: { label: '已驳回', ...TAG.red },
  pending: { label: '待审批', ...TAG.orange },
  waiting: { label: '未到达', ...TAG.gray },
};

// ═══════════════════════════════════════════
//  报价单 Quotation
// ═══════════════════════════════════════════

export const QUOTATION_STATUS_CONFIG: StatusConfig<string> = {
  draft: { label: '草稿', ...TAG.gray },
  submitted: { label: '审批中', ...TAG.purple },
  sent: { label: '已发送', ...TAG.blue },
  accepted: { label: '已转单', ...TAG.cyan },
  rejected: { label: '已拒绝', ...TAG.red },
  expired: { label: '已过期', ...TAG.orange },
  cancelled: { label: '已取消', ...TAG.gray },
};

// ═══════════════════════════════════════════
//  Finance — 应收/应付单状态
// ═══════════════════════════════════════════

export const FINANCE_INVOICE_STATUS_CONFIG: StatusConfig = {
  confirmed: { label: '待结清', color: TAG.orange.color, bg: TAG.orange.bg },
  partial: { label: '部分结清', color: TAG.blue.color, bg: TAG.blue.bg },
  paid: { label: '已结清', color: TAG.green.color, bg: TAG.green.bg },
  cancelled: { label: '已取消', color: TAG.gray.color, bg: TAG.gray.bg },
};

export const FINANCE_INVOICE_TYPE_CONFIG: StatusConfig = {
  receivable: { label: '应收单', color: TAG.blue.color, bg: TAG.blue.bg },
  payable: { label: '应付单', color: TAG.volcano.color, bg: TAG.volcano.bg },
};

type FinanceInvoiceDirection = 'receivable' | 'payable';

export interface FinanceInvoiceVisualConfig {
  amountLabel: string;
  settledLabel: string;
  residualLabel: string;
  residualChipLabel: string;
  overdueLabel: string;
  accentColor: string;
  accentBg: string;
}

export const FINANCE_INVOICE_VISUAL_CONFIG: Record<
  FinanceInvoiceDirection,
  FinanceInvoiceVisualConfig
> = {
  receivable: {
    amountLabel: '应收',
    settledLabel: '已收款',
    residualLabel: '未收余额',
    residualChipLabel: '待收',
    overdueLabel: '逾期待收',
    accentColor: TAG.blue.color,
    accentBg: TAG.blue.bg,
  },
  payable: {
    amountLabel: '应付',
    settledLabel: '已付款',
    residualLabel: '未付余额',
    residualChipLabel: '待付',
    overdueLabel: '逾期待付',
    accentColor: TAG.volcano.color,
    accentBg: TAG.volcano.bg,
  },
};

const FINANCE_INVOICE_DEFAULT_VISUAL_CONFIG: FinanceInvoiceVisualConfig =
  FINANCE_INVOICE_VISUAL_CONFIG.receivable;

export function getFinanceInvoiceVisualConfig(type?: string): FinanceInvoiceVisualConfig {
  if (type === 'receivable' || type === 'payable') {
    return FINANCE_INVOICE_VISUAL_CONFIG[type];
  }
  return FINANCE_INVOICE_DEFAULT_VISUAL_CONFIG;
}

export const FINANCE_INVOICE_STATUS_CONFIG_BY_TYPE: Record<string, StatusConfig> = {
  receivable: {
    confirmed: { label: '待收款', color: TAG.orange.color, bg: TAG.orange.bg },
    partial: { label: '部分收款', color: TAG.blue.color, bg: TAG.blue.bg },
    paid: { label: '已收清', color: TAG.green.color, bg: TAG.green.bg },
    cancelled: { label: '已取消', color: TAG.gray.color, bg: TAG.gray.bg },
  },
  payable: {
    confirmed: { label: '待付款', color: TAG.orange.color, bg: TAG.orange.bg },
    partial: { label: '部分付款', color: TAG.blue.color, bg: TAG.blue.bg },
    paid: { label: '已付清', color: TAG.green.color, bg: TAG.green.bg },
    cancelled: { label: '已取消', color: TAG.gray.color, bg: TAG.gray.bg },
  },
};

export function getFinanceInvoiceStatusConfigByType(type?: string): StatusConfig {
  return FINANCE_INVOICE_STATUS_CONFIG_BY_TYPE[type ?? ''] ?? FINANCE_INVOICE_STATUS_CONFIG;
}

// 贷项通知(红冲/冲正)状态：用"待核销/待冲抵"语义，不复用应收/应付的"待收/待付款"。
// 冲正贷项单默认创建即自动冲抵同源原单，仅退货类或原单已收付时才保留开口"待核销"。
export const FINANCE_CREDIT_NOTE_STATUS_CONFIG: StatusConfig = {
  confirmed: { label: '待核销', color: TAG.orange.color, bg: TAG.orange.bg },
  partial: { label: '部分核销', color: TAG.blue.color, bg: TAG.blue.bg },
  paid: { label: '已核销', color: TAG.green.color, bg: TAG.green.bg },
  cancelled: { label: '已取消', color: TAG.gray.color, bg: TAG.gray.bg },
};

// 按方向+类别取状态配置：贷项通知走"待核销"语义，普通应收/应付走"待收/待付款"。
export function getFinanceInvoiceStatusConfig(type?: string, category?: string): StatusConfig {
  if (category === 'credit_note') return FINANCE_CREDIT_NOTE_STATUS_CONFIG;
  return getFinanceInvoiceStatusConfigByType(type);
}

export const FINANCE_INVOICE_FILTERS: ListFilterConfig[] = [
  {
    key: 'type',
    label: '单据类型',
    includeAllOption: false,
    options: [
      { value: 'receivable', label: '应收单' },
      { value: 'payable', label: '应付单' },
    ],
    placement: 'tab',
  },
  configToQuickFilter(FINANCE_INVOICE_STATUS_CONFIG, { key: 'status', label: '状态' }),
];

export const FINANCE_PAYMENT_TYPE_CONFIG: StatusConfig = {
  receive: { label: '收款', color: TAG.green.color, bg: TAG.green.bg },
  pay: { label: '付款', color: TAG.volcano.color, bg: TAG.volcano.bg },
};

/** 收付款软撤销记录默认隐藏，仅通过独立状态筛选查看。 */
export const FINANCE_PAYMENT_STATUS_CONFIG: StatusConfig = {
  active: { label: '有效', ...TAG.green },
  cancelled: { label: '已撤销', ...TAG.gray },
};

type FinancePaymentDirection = 'receive' | 'pay';

export interface FinancePaymentVisualConfig {
  directionLabel: string;
  partnerLabel: string;
  amountLabel: string;
  dateLabel: string;
  methodLabel: string;
  relatedInvoiceLabel: string;
  unallocatedLabel: string;
  unallocatedChipLabel: string;
  accentColor: string;
  accentBg: string;
}

export const FINANCE_PAYMENT_VISUAL_CONFIG: Record<
  FinancePaymentDirection,
  FinancePaymentVisualConfig
> = {
  receive: {
    directionLabel: '收款',
    partnerLabel: '客户',
    amountLabel: '收款金额',
    dateLabel: '收款日期',
    methodLabel: '收款方式',
    relatedInvoiceLabel: '应收单',
    unallocatedLabel: '未分配收款',
    unallocatedChipLabel: '待分配收款',
    accentColor: TAG.green.color,
    accentBg: TAG.green.bg,
  },
  pay: {
    directionLabel: '付款',
    partnerLabel: '供应商',
    amountLabel: '付款金额',
    dateLabel: '付款日期',
    methodLabel: '付款方式',
    relatedInvoiceLabel: '应付单',
    unallocatedLabel: '未分配付款',
    unallocatedChipLabel: '待分配付款',
    accentColor: TAG.volcano.color,
    accentBg: TAG.volcano.bg,
  },
};

const FINANCE_PAYMENT_DEFAULT_VISUAL_CONFIG: FinancePaymentVisualConfig =
  FINANCE_PAYMENT_VISUAL_CONFIG.receive;

export function getFinancePaymentVisualConfig(type?: string): FinancePaymentVisualConfig {
  if (type === 'receive' || type === 'pay') {
    return FINANCE_PAYMENT_VISUAL_CONFIG[type];
  }
  return FINANCE_PAYMENT_DEFAULT_VISUAL_CONFIG;
}

export const FINANCE_PAYMENT_FILTERS: ListFilterConfig[] = [
  {
    key: 'type',
    label: '收付类型',
    includeAllOption: false,
    options: [
      { value: 'receive', label: '收款' },
      { value: 'pay', label: '付款' },
    ],
    placement: 'tab',
  },
  configToQuickFilter(FINANCE_PAYMENT_STATUS_CONFIG, { label: '状态' }),
];

export const FINANCE_PAYMENT_REQUEST_STATUS_CONFIG: StatusConfig<FinancePaymentRequestStatus> = {
  [FinancePaymentRequestStatus.DRAFT]: { label: '草稿', ...TAG.gray },
  [FinancePaymentRequestStatus.PENDING_APPROVAL]: { label: '审批中', ...TAG.purple },
  [FinancePaymentRequestStatus.APPROVED]: { label: '已审批', ...TAG.blue },
  [FinancePaymentRequestStatus.REJECTED]: { label: '已驳回', ...TAG.red },
  [FinancePaymentRequestStatus.PAID]: { label: '已付款', ...TAG.green },
  [FinancePaymentRequestStatus.PAYMENT_CANCELLED]: { label: '付款已撤销', ...TAG.orange },
  [FinancePaymentRequestStatus.CANCELLED]: { label: '已取消', ...TAG.gray },
};

export const FINANCE_PAYMENT_REQUEST_FILTERS: ListFilterConfig[] = [
  configToTabFilter(FINANCE_PAYMENT_REQUEST_STATUS_CONFIG, { label: '状态' }),
];

export const FUNDS_EXPENSE_SCENE_CONFIG: StatusConfig = {
  reimbursement: { label: '费用报销', ...TAG.blue },
  direct: { label: '费用直付', ...TAG.volcano },
  monthly: { label: '月结费用', ...TAG.purple },
};

export const FUNDS_EXPENSE_STATUS_CONFIG: StatusConfig = {
  draft: { label: '草稿', ...TAG.gray },
  submitted: { label: '审批中', ...TAG.purple },
  approved: { label: '已审批', ...TAG.blue },
  paid: { label: '已付款', ...TAG.green },
  cancelled: { label: '已取消', ...TAG.gray },
};

export const FUNDS_EXPENSE_FILTERS: ListFilterConfig[] = [
  configToTabFilter(FUNDS_EXPENSE_STATUS_CONFIG, {
    key: 'status',
    label: '状态',
    scrollable: true,
  }),
  configToQuickFilter(FUNDS_EXPENSE_SCENE_CONFIG, { key: 'billScene', label: '费用场景' }),
];

/** 往来对象类型（费用单/借支单等共用枚举；文案归口，使用方按业务裁剪子集） */
export const COUNTERPARTY_TYPE_CONFIG: StatusConfig<string> = {
  customer: { label: '客户', ...TAG.blue },
  supplier: { label: '供应商', ...TAG.volcano },
  employee: { label: '员工', ...TAG.purple },
  other: { label: '其他', ...TAG.gray },
};

export const COUNTERPARTY_TYPE_OPTIONS: ChipOption[] = Object.entries(COUNTERPARTY_TYPE_CONFIG).map(
  ([value, { label, color }]) => ({ value, label, color }),
);

/** 借支往来对象仅允许员工/临时对象，文案与配色沿用借支单既有口径 */
export const FUNDS_ADVANCE_COUNTERPARTY_CONFIG: StatusConfig = {
  employee: { label: COUNTERPARTY_TYPE_CONFIG.employee.label, ...TAG.blue },
  other: { label: COUNTERPARTY_TYPE_CONFIG.other.label, ...TAG.gray },
};

export const FUNDS_ADVANCE_STATUS_CONFIG: StatusConfig = {
  draft: { label: '草稿', ...TAG.gray },
  submitted: { label: '审批中', ...TAG.purple },
  approved: { label: '已审批', ...TAG.blue },
  disbursed: { label: '已借出', ...TAG.green },
  partially_settled: { label: '部分归还', ...TAG.orange },
  settled: { label: '已结清', ...TAG.green },
  cancelled: { label: '已取消', ...TAG.gray },
};

export const FUNDS_ADVANCE_FILTERS: ListFilterConfig[] = [
  configToTabFilter(FUNDS_ADVANCE_STATUS_CONFIG, {
    key: 'status',
    label: '状态',
    scrollable: true,
  }),
];

/** 毛利试算成本来源（ProfitabilityTrialItem.costSource） */
export const COST_SOURCE_CONFIG: Record<string, string> = {
  actual_batch_cost: '实际出库成本',
  bom_route_standard_cost: 'BOM+工艺标准成本',
  bom_standard_cost: 'BOM标准成本',
  route_standard_cost: '工艺标准成本',
  period_purchase_avg: '当期采购均价',
  latest_purchase_price: '最近采购价',
  material_unit_cost: '物料标准成本',
  missing: '缺成本依据',
};

// ═══════════════════════════════════════════
//  未知状态 Fallback
// ═══════════════════════════════════════════

/** 状态配置未命中时的兜底色值 */
export const UNKNOWN_STATUS_FALLBACK = {
  label: '',
  ...TAG.gray,
} as const;

// ═══════════════════════════════════════════
//  审批实体类型 Approval Entity Type
// ═══════════════════════════════════════════

/** 所有业务实体类型配置（待办、审批、通知共用） */
export const ENTITY_TYPE_CONFIG: StatusConfig<string> = {
  purchase_requisition: { label: '采购申请', ...TAG.blue },
  work_order: { label: '生产工单', ...TAG.purple },
  disposal: { label: '不合格品处置单', ...TAG.red },
  quality_inspection: { label: '质检单', ...TAG.green },
  spc_alert: { label: 'SPC异常', ...TAG.orange },
  equipment_maintenance: { label: '设备保养记录', ...TAG.orange },
  equipment_fault: { label: '设备故障单', ...TAG.darkRed },
  equipment_inspection: { label: '设备巡检', ...TAG.cyan },
  sale_order: { label: '销售订单', ...TAG.pink },
  sale_delivery: { label: '销售出库单', ...TAG.cyan },
  material_issue: { label: '生产领料单', ...TAG.volcano },
  quotation: { label: '报价单', ...TAG.pink },
  purchase_order: { label: '采购订单', ...TAG.darkGreen },
  purchase_receipt: { label: '采购入库单', ...TAG.cyan },
  finance_payment_request: { label: '付款申请', ...TAG.volcano },
  expense_bill: { label: '费用单', ...TAG.volcano },
  cash_advance: { label: '借支单', ...TAG.orange },
  production_plan: { label: '生产计划', ...TAG.purple },
  purchase_return: { label: '采购退料单', ...TAG.orange },
  sale_return: { label: '销售退货单', ...TAG.pink },
  announcement: { label: '公告', ...TAG.cyan },
  material: { label: '物料', ...TAG.blue },
  tooling: { label: '工装', ...TAG.orange },
  process_route: { label: '工艺路线', ...TAG.cyan },
  production_receipt: { label: '生产入库单', ...TAG.green },
  capa: { label: 'CAPA', ...TAG.purple },
  schedule_entry: { label: '排产任务', ...TAG.purple },
};

const APPROVAL_ENTITY_FILTER_KEYS = [
  'purchase_requisition',
  'quality_inspection',
  'disposal',
  'work_order',
  'sale_order',
  'sale_delivery',
  'quotation',
  'equipment_maintenance',
  'purchase_order',
  'capa',
  'purchase_receipt',
  'finance_payment_request',
  'expense_bill',
  'cash_advance',
  'production_plan',
] as const;

export const APPROVAL_ENTITY_TYPE_FILTER_OPTIONS = [
  ...APPROVAL_ENTITY_FILTER_KEYS.map((value) => ({
    value,
    label: ENTITY_TYPE_CONFIG[value].label,
  })),
];

// ═══════════════════════════════════════════
//  MRP 建议 Suggestion
// ═══════════════════════════════════════════

export const MRP_SUGGESTION_CONFIG: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  purchase: { label: '建议采购', icon: 'cart-outline', ...TAG.red },
  produce: { label: '建议生产', icon: 'construct-outline', ...TAG.orange },
  customer_supply: { label: '待客户供料', icon: 'people-outline', ...TAG.orange },
  sufficient: { label: '库存充足', icon: 'checkmark-circle-outline', ...TAG.green },
};

export const MRP_FILTER_TABS: TabItem<string>[] = [
  { key: 'all', label: '全部' },
  { key: 'purchase', label: '需采购' },
  { key: 'produce', label: '需生产' },
  { key: 'customer_supply', label: '待客户供料' },
  { key: 'sufficient', label: '充足' },
];

// ═══════════════════════════════════════════
//  通知类型 Notification Type
// ═══════════════════════════════════════════

export const NOTIFICATION_TYPE_CONFIG: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  work_order: { icon: 'clipboard-outline', label: '工单' },
  quality: { icon: 'checkmark-circle-outline', label: '质检' },
  equipment: { icon: 'construct-outline', label: '设备' },
  equipment_fault: { icon: 'warning-outline', label: '故障' },
  warehouse: { icon: 'cube-outline', label: '仓库' },
  system: { icon: 'information-circle-outline', label: '系统' },
};

// ═══════════════════════════════════════════
//  客户等级 Customer Level
// ═══════════════════════════════════════════

export const CUSTOMER_LEVEL_COLOR: Record<string, string> = {
  A: TAG.green.color,
  B: TAG.blue.color,
  C: TAG.orange.color,
  D: TAG.red.color,
};

// ═══════════════════════════════════════════
//  设备上下机 Session
// ═══════════════════════════════════════════

export const MACHINE_SESSION_STATUS_CONFIG: Record<
  string,
  { label: string; themeColor: 'primary' | 'success' | 'warning' }
> = {
  running: { label: '上机中', themeColor: 'primary' },
  completed: { label: '已下机', themeColor: 'success' },
  interrupted: { label: '已中断', themeColor: 'warning' },
};

// ═══════════════════════════════════════════
//  工单状态流程 Work Order Status Flow
// ═══════════════════════════════════════════

export const WORK_ORDER_STATUS_FLOW = [
  { key: 'draft', label: '草稿' },
  { key: 'submitted', label: '审批中' },
  { key: 'released', label: '下达' },
  { key: 'in_progress', label: '生产中' },
  { key: 'completed', label: '完工' },
  { key: 'closed', label: '结案' },
];

export const WORK_ORDER_SPECIAL_STATUS: Record<string, string> = {
  paused: '暂停',
  cancelled: '已取消',
};

// ═══════════════════════════════════════════
//  预测模块 Forecast
// ═══════════════════════════════════════════

export const FORECAST_TABS: TabItem<string>[] = [
  { key: 'generate', label: '生成预测' },
  { key: 'results', label: '预测结果' },
];

// ═══════════════════════════════════════════
//  采购入库单 Purchase Receipt
// ═══════════════════════════════════════════

export const PURCHASE_RECEIPT_STATUS_CONFIG: StatusConfig<string> = {
  draft: { label: '待入库', ...TAG.orange },
  submitted: { label: '审批中', ...TAG.purple },
  received: { label: '已入库', ...TAG.green },
  reversed: { label: '已冲正', ...TAG.purple },
  cancelled: { label: '已取消', ...TAG.red },
};

// ═══════════════════════════════════════════
//  采购附加费用分摊单 Purchase Landed Cost
// ═══════════════════════════════════════════

export const PURCHASE_LANDED_COST_STATUS_CONFIG: StatusConfig<string> = {
  draft: { label: '草稿', ...TAG.gray },
  submitted: { label: '已提交', ...TAG.blue },
  confirmed: { label: '已确认', ...TAG.green },
  reversed: { label: '已冲销', ...TAG.orange },
  cancelled: { label: '已取消', ...TAG.red },
};

// ═══════════════════════════════════════════
//  采购退料单 Purchase Return
// ═══════════════════════════════════════════

export const PURCHASE_RETURN_STATUS_CONFIG: StatusConfig<string> = {
  draft: { label: '草稿', ...TAG.gray },
  pending_outbound: { label: '待退库', ...TAG.orange },
  outbound: { label: '已退库', ...TAG.cyan },
  completed: { label: '已完成', ...TAG.green },
  cancelled: { label: '已取消', ...TAG.red },
  reversed: { label: '已冲正', ...TAG.orange },
};

export const PURCHASE_RETURN_TYPE_CONFIG: StatusConfig<string> = {
  physical_return: { label: '实物退货', ...TAG.cyan },
  refund_only: { label: '仅退款', ...TAG.orange },
};

export const PURCHASE_RETURN_FINANCIAL_ACTION_CONFIG: StatusConfig<string> = {
  none: { label: '不处理', ...TAG.gray },
  payable_offset: { label: '应付冲减', ...TAG.green },
  refund: { label: '退款', ...TAG.orange },
};

// ═══════════════════════════════════════════════════════════════════════════════
//  统一筛选配置（新 API：每个模块一个 XXX_FILTERS 数组）
// ═══════════════════════════════════════════════════════════════════════════════

// ─── 工单 ───
export const WORK_ORDER_TYPE_CONFIG: StatusConfig<string> = {
  normal: { label: '正常', ...TAG.green },
  rework: { label: '返工', ...TAG.volcano },
  split: { label: '拆分', ...TAG.purple },
  sub_assembly: { label: '子装配', ...TAG.blue },
};

export const WORK_ORDER_PRIORITY_CONFIG: StatusConfig<string> = {
  high: { label: '高', ...TAG.red },
  medium: { label: '中', ...TAG.orange },
  low: { label: '低', ...TAG.gray },
};

export const WORK_ORDER_FILTERS: ListFilterConfig[] = [
  {
    key: 'status',
    label: '工单状态',
    placement: 'tab',
    scrollable: true,
    options: [
      { label: '草稿', value: 'draft' },
      { label: '审批中', value: 'submitted' },
      { label: '已下达', value: 'released' },
      { label: '进行中', value: 'in_progress' },
      { label: '暂停', value: 'paused' },
      { label: '已完工', value: 'completed' },
      { label: '已取消', value: 'cancelled' },
      { label: '已关闭', value: 'closed' },
    ],
  },
  configToQuickFilter(WORK_ORDER_TYPE_CONFIG, { key: 'workOrderType', label: '工单类型' }),
  configToQuickFilter(WORK_ORDER_PRIORITY_CONFIG, { key: 'priority', label: '优先级' }),
  dateRangeFilter('planStart', '计划开始时间', 'planStartFrom', 'planStartTo'),
  dateRangeFilter('planEnd', '计划结束时间', 'planEndFrom', 'planEndTo'),
];

// ─── 生产计划 ───
export const PLAN_FILTERS: ListFilterConfig[] = [
  configToTabFilter(PLAN_STATUS_CONFIG, {
    label: '计划状态',

    tabKeys: [
      'draft',
      'confirmed',
      'scheduled',
      'released',
      'in_progress',
      'completed',
      'closed',
      'cancelled',
    ],
  }),
  {
    key: 'priorityRange',
    label: '优先级',
    placement: 'advanced',
    options: [
      { label: '高 (8-10)', value: '8,10' },
      { label: '中 (4-7)', value: '4,7' },
      { label: '低 (1-3)', value: '1,3' },
    ],
  },
  {
    type: 'date_range',
    key: 'planStartDate',
    label: '计划开始日期',
    startKey: 'startDateFrom',
    endKey: 'startDateTo',
    placement: 'advanced',
    persist: false,
  },
  dateRangeFilter('planEndDate', '计划结束日期', 'endDateFrom', 'endDateTo'),
  dateRangeFilter('dueDate', '交货期限', 'dueDateFrom', 'dueDateTo'),
  dateRangeFilter('createdAt', '创建时间', 'createdAtFrom', 'createdAtTo'),
];

// ─── 销售订单 ───
export const SALE_ORDER_FILTERS: ListFilterConfig[] = [
  configToTabFilter(SALE_ORDER_STATUS_CONFIG, {
    label: '订单状态',

    tabKeys: [
      'draft',
      'confirmed',
      'production_pending',
      'ready_to_start',
      'in_production',
      'partially_shipped',
      'shipped',
      'completed',
      'cancelled',
    ],
  }),
  configToQuickFilter(
    { true: SALE_ORDER_RETURN_STATUS_CONFIG.returned },
    { key: 'fullyReturnedOnly', label: '退货状态' },
  ),
  dateRangeFilter('orderDate', '订单日期'),
];

// ─── 报价单 ───
export const QUOTATION_FILTERS: ListFilterConfig[] = [
  configToTabFilter(QUOTATION_STATUS_CONFIG, {
    label: '报价状态',
    tabKeys: ['draft', 'submitted', 'sent', 'accepted', 'rejected', 'expired', 'cancelled'],
  }),
  dateRangeFilter('quotationDate', '报价日期'),
];

// ─── 采购订单 ───
export const PURCHASE_ORDER_FILTERS: ListFilterConfig[] = [
  configToTabFilter(PURCHASE_ORDER_STATUS_CONFIG, {
    label: '订单状态',

    tabKeys: ['draft', 'confirmed', 'partially_received', 'received', 'completed', 'cancelled'],
  }),
  dateRangeFilter('createdAt', '创建时间', 'startDate', 'endDate'),
];

// ─── 采购入库单 ───
export const PURCHASE_RECEIPT_FILTERS: ListFilterConfig[] = [
  configToTabFilter(PURCHASE_RECEIPT_STATUS_CONFIG, { label: '入库状态' }),
  dateRangeFilter('receiptDate', '入库日期'),
];

// ─── 采购退料单 ───
export const PURCHASE_RETURN_FILTERS: ListFilterConfig[] = [
  configToTabFilter(PURCHASE_RETURN_STATUS_CONFIG, { label: '退货状态' }),
  dateRangeFilter('returnDate', '退货日期', 'returnDateStart', 'returnDateEnd'),
  dateRangeFilter('createdAt', '创建时间', 'createdAtStart', 'createdAtEnd'),
];

// ─── 生产入库单（待确认完工入库） ───
export const PRODUCTION_RECEIPT_FILTERS: ListFilterConfig[] = [
  configToTabFilter(PRODUCTION_RECEIPT_STATUS_CONFIG, { label: '入库状态' }),
  dateRangeFilter('createdAt', '生成日期', 'startDate', 'endDate'),
];

// ─── 生产输出暂存 ───
export const PRODUCTION_OUTPUT_BUFFER_FILTERS: ListFilterConfig[] = [
  configToTabFilter(PRODUCTION_OUTPUT_BUFFER_STATUS_CONFIG, { label: '暂存状态' }),
];

// ─── 委外现场 ───
export const OUTSOURCING_ORDER_FILTERS: ListFilterConfig[] = [
  configToTabFilter(OUTSOURCING_ORDER_STATUS_CONFIG, {
    label: '委外状态',
    tabKeys: ['draft', 'in_progress', 'partial_received', 'received', 'repairing', 'cancelled'],
  }),
];

export const OUTSOURCING_RECEIPT_FILTERS: ListFilterConfig[] = [
  configToTabFilter(OUTSOURCING_RECEIPT_STATUS_CONFIG, { label: '收货状态' }),
];

// ─── 客户来料 ───
export const CUSTOMER_INBOUND_FILTERS: ListFilterConfig[] = [
  configToTabFilter(CUSTOMER_INBOUND_STATUS_CONFIG, {
    label: '登记状态',
    tabKeys: ['received', 'converted_to_stock', 'closed', 'returned', 'scrapped', 'lost'],
  }),
  configToQuickFilter(CUSTOMER_INBOUND_USAGE_TYPE_CONFIG, {
    key: 'usageType',
    label: '用途',
  }),
];

// ─── 销售出库单 ───
export const SALE_DELIVERY_FILTERS: ListFilterConfig[] = [
  configToTabFilter(SALE_DELIVERY_STATUS_CONFIG, { label: '出库状态' }),
  dateRangeFilter('deliveryDate', '出库日期'),
];

// ─── 生产领料单 ───
export const MATERIAL_ISSUE_FILTERS: ListFilterConfig[] = [
  configToTabFilter(MATERIAL_ISSUE_STATUS_CONFIG, {
    label: '领料状态',
    tabKeys: ['draft', 'completed', 'cancelled'],
  }),
  configToQuickFilter(MATERIAL_ISSUE_TYPE_CONFIG, { key: 'type', label: '领料类型' }),
  dateRangeFilter('createdAt', '创建时间', 'startDate', 'endDate'),
];

// ─── 内部领用 ───
export const INTERNAL_ISSUE_FILTERS: ListFilterConfig[] = [
  configToTabFilter(INTERNAL_ISSUE_STATUS_CONFIG, {
    label: '领用状态',
    tabKeys: ['draft', 'completed', 'cancelled'],
  }),
  configToQuickFilter(INTERNAL_ISSUE_TYPE_CONFIG, {
    key: 'issueType',
    label: '领用类型',
  }),
  dateRangeFilter('createdAt', '创建时间', 'startDate', 'endDate'),
];

// ═══════════════════════════════════════════
//  库存盘点 Stock Count
// ═══════════════════════════════════════════

export const STOCK_COUNT_STATUS_CONFIG: StatusConfig<string> = {
  draft: { label: '草稿', ...TAG.gray },
  counting: { label: '盘点中', ...TAG.blue },
  submitted: { label: '待审核', ...TAG.purple },
  approved: { label: '已过账', ...TAG.green },
  reversed: { label: '已冲正', ...TAG.purple },
  cancelled: { label: '已取消', ...TAG.red },
};

// 后端 StockCountListDto 仅支持 status 过滤（无日期范围参数），故只出状态 tab 过滤
export const STOCK_COUNT_FILTERS: ListFilterConfig[] = [
  configToTabFilter(STOCK_COUNT_STATUS_CONFIG, {
    label: '盘点状态',
    tabKeys: ['draft', 'counting', 'submitted', 'approved', 'reversed', 'cancelled'],
  }),
];

// ─── 质量检验 ───
export const INSPECTION_FILTERS: ListFilterConfig[] = [
  configToTabFilter(INSPECTION_STATUS_CONFIG, {
    label: '检验状态',
    tabKeys: ['pending', 'in_progress', 'passed', 'rejected', 'cancelled'],
  }),
  configToQuickFilter(INSPECTION_TYPE_CONFIG, { key: 'type', label: '检验类型' }),
];

// ─── 处置 ───
export const DISPOSAL_FILTERS: ListFilterConfig[] = [
  configToTabFilter(DISPOSAL_STATUS_CONFIG, { label: '处置状态' }),
  configToQuickFilter(DISPOSAL_TYPE_CONFIG, { key: 'type', label: '处置类型' }),
  dateRangeFilter('createdAt', '创建时间', 'startDate', 'endDate'),
];

// ─── CAPA ───
export const CAPA_FILTERS: ListFilterConfig[] = [
  configToTabFilter(CAPA_STATUS_CONFIG, {
    label: 'CAPA 状态',
    tabKeys: ['open', 'in_analysis', 'pending_verify', 'closed', 'cancelled'],
  }),
  configToQuickFilter(CAPA_SEVERITY_CONFIG, { key: 'severity', label: '严重程度' }),
  dateRangeFilter('createdAt', '创建时间', 'startDate', 'endDate'),
];

// ─── 客户 ───
export const CUSTOMER_FILTERS: ListFilterConfig[] = [
  configToTabFilter(CUSTOMER_STATUS_CONFIG, { label: '客户状态' }),
];

// ─── 供应商 ───
export const SUPPLIER_FILTERS: ListFilterConfig[] = [
  configToTabFilter(SUPPLIER_STATUS_CONFIG, { label: '供应商状态' }),
];

// ─── 设备（equipmentType 由字典动态获取，在屏幕内 useMemo 追加） ───
export const EQUIPMENT_FILTERS: ListFilterConfig[] = [
  configToQuickFilter(EQUIPMENT_STATUS_CONFIG, { label: '设备状态' }),
];

// ─── 设备故障 ───
export const FAULT_FILTERS: ListFilterConfig[] = [
  configToTabFilter(FAULT_STATUS_CONFIG, {
    label: '故障状态',
    tabKeys: ['open', 'in_repair', 'pending_verify', 'resolved'],
  }),
  // severity 由字典动态获取，在屏幕内 useMemo 追加
  dateRangeFilter('createdAt', '创建时间', 'startDate', 'endDate'),
];

// ─── BOM ───
export const BOM_FILTERS: ListFilterConfig[] = [
  configToQuickFilter(BOM_STATUS_CONFIG, { label: 'BOM 状态' }),
];

// ─── 工艺路线 ───
export const PROCESS_ROUTE_FILTERS: ListFilterConfig[] = [
  configToQuickFilter(ROUTE_STATUS_CONFIG, { label: '路线状态' }),
];

// ─── 批号 ───
export const BATCH_FILTERS: ListFilterConfig[] = [
  configToQuickFilter(BATCH_STATUS_CONFIG, { label: '批号状态' }),
  dateRangeFilter('createdAt', '创建时间', 'startDate', 'endDate'),
];

// ─── 工单提报 ───
export const TICKET_FILTERS: ListFilterConfig[] = [
  configToTabFilter(TICKET_STATUS_CONFIG, { label: '工单状态' }),
  dateRangeFilter('createdAt', '创建时间', 'startDate', 'endDate'),
];

// ─── 排产 ───
export const SCHEDULE_FILTERS: ListFilterConfig[] = [
  configToTabFilter(SCHEDULE_STATUS_CONFIG, {
    label: '排产状态',
    tabKeys: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'],
  }),
];

// ─── 领料需求 ───
export const MATERIAL_REQ_FILTERS: ListFilterConfig[] = [
  configToTabFilter(MATERIAL_REQ_STATUS_CONFIG, { label: '领料需求状态' }),
  dateRangeFilter('createdAt', '创建时间', 'startDate', 'endDate'),
];

// ─── 采购申请 ───
export const PR_FILTERS: ListFilterConfig[] = [
  configToTabFilter(PR_STATUS_CONFIG, {
    label: '采购申请状态',
    tabKeys: ['draft', 'submitted', 'approved', 'ordered', 'rejected', 'cancelled'],
  }),
  dateRangeFilter('createdAt', '创建时间', 'startDate', 'endDate'),
];

// ─── 工装（type 由字典动态获取，在屏幕内 useMemo 追加） ───
export const TOOLING_FILTERS: ListFilterConfig[] = [
  configToTabFilter(TOOLING_STATUS_CONFIG, { label: '工装状态' }),
  {
    key: 'expiring',
    label: '到期预警',
    options: [{ label: '临近到期', value: 'true' }],
    placement: 'quick',
  },
  dateRangeFilter('createdAt', '创建时间', 'startDate', 'endDate'),
];

// ═══════════════════════════════════════════
//  待办 Todo
// ═══════════════════════════════════════════

export const TODO_PRIORITY_CONFIG: StatusConfig<string> = {
  high: { label: '高', ...TAG.red },
  medium: { label: '中', ...TAG.orange },
  low: { label: '低', ...TAG.gray },
};

export const TODO_STATUS_CONFIG: StatusConfig<string> = {
  pending: { label: '待处理', ...TAG.orange },
  in_progress: { label: '处理中', ...TAG.blue },
  done: { label: '已完成', ...TAG.green },
  cancelled: { label: '已取消', ...TAG.gray },
};

// ═══════════════════════════════════════════
//  通用启用/停用（物料、工作中心等 isActive 布尔值通用）
// ═══════════════════════════════════════════

export const ACTIVE_STATUS_CONFIG: StatusConfig<string> = {
  active: { label: '启用', ...TAG.green },
  inactive: { label: '停用', ...TAG.gray },
};

export const TEMPORARY_WORKER_STATUS_CONFIG: StatusConfig<string> = {
  active: { label: '启用', ...TAG.green },
  inactive: { label: '停用', ...TAG.gray },
  expired: { label: '已到期', ...TAG.gray },
  pending_setup: { label: '待补期限', ...TAG.orange },
};

export const TEMPORARY_WORKER_FILTERS: ListFilterConfig[] = [
  configToTabFilter(ACTIVE_STATUS_CONFIG, { key: 'isActive', label: '状态' }),
];

// ═══════════════════════════════════════════
//  公告 Announcement
// ═══════════════════════════════════════════

export const ANNOUNCEMENT_PRIORITY_CONFIG: StatusConfig<string> = {
  normal: { label: '普通', ...TAG.gray },
  important: { label: '重要', ...TAG.orange },
  urgent: { label: '紧急', ...TAG.red },
};

export const ANNOUNCEMENT_STATUS_CONFIG: StatusConfig<string> = {
  draft: { label: '草稿', ...TAG.gray },
  published: { label: '已发布', ...TAG.green },
  archived: { label: '已归档', ...TAG.gray },
};

// ═══════════════════════════════════════════
//  通用等级颜色映射（供应商评级 / 客户等级）
// ═══════════════════════════════════════════

/**
 * 获取 ABCD 等级对应的主题色。
 *
 * @example
 * const { colors } = useTheme();
 * const ratingColor = getGradeColor(supplier.rating, colors) ?? colors.textMuted;
 */
export function getGradeColor(
  grade: string | undefined | null,
  colors: { success: string; primary: string; warning: string; error: string },
): string | undefined {
  if (!grade) return undefined;
  const map: Record<string, string> = {
    A: colors.success,
    B: colors.primary,
    C: colors.warning,
    D: colors.error,
  };
  return map[grade];
}

// ═══════════════════════════════════════════
//  权限树节点色环（depth % length 循环取色）
// ═══════════════════════════════════════════

export const PERMISSION_NODE_COLORS = [
  TAG.blue.color,
  TAG.green.color,
  TAG.orange.color,
  TAG.purple.color,
  TAG.red.color,
  TAG.cyan.color,
];

// ═══════════════════════════════════════════
//  库存流水类型 Stock Transaction Type
//  唯一归口：库存流水的「类型 → 中文」字典，出入库弹窗、流水卡片共用；
//  未命中时显示原始类型码，禁止静默兜底
// ═══════════════════════════════════════════

export const STOCK_TRANSACTION_TYPE_CONFIG: StatusConfig<string> = {
  in_purchase: { label: '采购入库单', ...TAG.green },
  in_production: { label: '生产入库单', ...TAG.green },
  in_customer_supplied: { label: '客供入库', ...TAG.green },
  in_owner_transfer: { label: '货主转入', ...TAG.green },
  in_transfer: { label: '调拨入库', ...TAG.green },
  in_adjust: { label: '盘盈', ...TAG.green },
  in_return: { label: '退料入库', ...TAG.green },
  in_sale_return: { label: '销售退货入库', ...TAG.green },
  in_customer_disposition_reversal: { label: '客户料处置冲正入库', ...TAG.green },
  in_sale_reversal: { label: '销售出库单冲正', ...TAG.green },
  in_purchase_return_reversal: { label: '采购退料单冲正入库', ...TAG.green },
  in_production_reversal: { label: '生产领料单冲正', ...TAG.green },
  in_conversion: { label: '库存转换入库', ...TAG.green },
  in_conversion_reversal: { label: '库存转换冲正入库', ...TAG.green },
  in_other: { label: '其他入库', ...TAG.green },
  in_outsourcing: { label: '委外收货', ...TAG.green },
  out_production: { label: '生产领料单', ...TAG.red },
  out_sale: { label: '销售出库单', ...TAG.red },
  out_customer_return: { label: '客户退回', ...TAG.red },
  out_purchase_return: { label: '采购退料单出库', ...TAG.red },
  out_sale_return_reversal: { label: '销售退货单冲正出库', ...TAG.red },
  out_conversion: { label: '库存转换出库', ...TAG.red },
  out_conversion_reversal: { label: '库存转换冲正出库', ...TAG.red },
  out_owner_transfer: { label: '货主转出', ...TAG.red },
  out_transfer: { label: '调拨出库', ...TAG.red },
  out_adjust: { label: '盘亏', ...TAG.red },
  out_scrap: { label: '报废出库', ...TAG.red },
  out_other: { label: '其他出库', ...TAG.red },
  out_outsourcing: { label: '委外发料', ...TAG.red },
  out_outsourcing_return: { label: '委外退回', ...TAG.red },
  out_internal_issue: { label: '内部领用出库', ...TAG.red },
};

/** 库存流水类型中文名；未命中时显示原始类型码（显性可排查） */
export function stockTransactionLabel(type: string): string {
  return STOCK_TRANSACTION_TYPE_CONFIG[type]?.label ?? type;
}

/** 库存流水方向：in_ 前缀为入库，out_ 前缀为出库 */
export function isStockTransactionInbound(type: string): boolean {
  return type.startsWith('in_');
}

// ═══════════════════════════════════════════
//  MRP 供应来源与供应分配状态
// ═══════════════════════════════════════════

export const MRP_SUPPLY_SOURCE_CONFIG: Record<string, string> = {
  stock: '库存',
  work_order: '执行中工单',
  purchase_order: '采购订单',
  purchase_requisition: '待审批采购申请',
  new_production: '新生产计划',
};

export const MRP_SUPPLY_ALLOCATION_STATUS_CONFIG: Record<string, string> = {
  planned: '计划中',
  partial: '部分消费',
  consumed: '已消费',
  cancelled: '已取消',
};

// ═══════════════════════════════════════════
//  SPC 预警状态 / 类型 / 严重度
// ═══════════════════════════════════════════

export const SPC_ALERT_STATUS_CONFIG: StatusConfig<string> = {
  open: { label: '待处理', ...TAG.red },
  processing: { label: '处理中', ...TAG.orange },
  closed: { label: '已关闭', ...TAG.green },
  cancelled: { label: '已取消', ...TAG.gray },
};

export const SPC_ALERT_TYPE_CONFIG: Record<string, string> = {
  out_of_spec: '超规格',
  out_of_control: '超控制限',
};

export const SPC_ALERT_SEVERITY_CONFIG: StatusConfig<string> = {
  low: { label: '低', ...TAG.gray },
  medium: { label: '中', ...TAG.orange },
  high: { label: '高', ...TAG.red },
  critical: { label: '严重', ...TAG.darkRed },
};

// ═══════════════════════════════════════════
//  质检记录类型 / 常规检验类型
//  INSPECTION_RECORD_TYPE_CONFIG（上方质检域）为记录类型唯一归口；
//  此处仅补充“常规检验（other 记录）”按检验类型的展示名
// ═══════════════════════════════════════════

export const ROUTINE_INSPECTION_TYPE_CONFIG: Record<string, string> = {
  iqc: '常规来料检验',
  fqc: '常规成品检验',
  oqc: '常规出货检验',
};

// ═══════════════════════════════════════════
//  设备保养生成方式 / 周期状态
// ═══════════════════════════════════════════

export const MAINTENANCE_GENERATION_MODE_LABELS: Record<string, string> = {
  after_completion: '完成后顺延',
  fixed: '固定周期生成',
};

export const MAINTENANCE_RECURRENCE_STATUS_LABELS: Record<string, string> = {
  active: '执行中',
  inactive: '已停止',
};

// ═══════════════════════════════════════════
//  采购订单发送渠道
// ═══════════════════════════════════════════

export const SEND_CHANNEL_CONFIG: Record<string, string> = {
  email: '邮件发送',
  share: '系统分享',
  copy: '复制全文',
  manual: '手动发送',
};

// ═══════════════════════════════════════════
//  排产：缓冲来源 / 派工规则
// ═══════════════════════════════════════════

export const BUFFER_SOURCE_CONFIG: Record<string, string> = {
  company_default: '公司默认',
  manual_override: '手动覆盖',
  legacy_migration: '历史迁移',
};

export const SCHEDULE_DISPATCH_RULE_CONFIG: Record<string, string> = {
  edd: 'EDD — 最早交期优先',
  spt: 'SPT — 最短加工时间优先',
  cr: 'CR — 临界比率',
  wspt: 'WSPT — 加权最短加工时间',
  fifo: 'FIFO — 先进先出',
};

// ═══════════════════════════════════════════
//  生产报废质量结论
// ═══════════════════════════════════════════

export const SCRAP_QUALITY_CONCLUSION_CONFIG: Record<string, string> = {
  scrap: '报废',
  concession: '让步接收',
  rework: '返工',
  mixed: '混合处置',
};

// ═══════════════════════════════════════════
//  批次与追溯（序列号、追溯事件/节点）
//  批次状态唯一归口为上方 BATCH_STATUS_CONFIG（4 值，对齐后端 BatchStatus）；
//  allocated/produced/in_stock 等是序列号状态，不是批次状态
// ═══════════════════════════════════════════

export const BATCH_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(BATCH_STATUS_CONFIG).map(([key, cfg]) => [key, cfg.label]),
);

export const SERIAL_STATUS_CONFIG: StatusConfig<string> = {
  allocated: { label: '待生产', ...TAG.blue },
  produced: { label: '已产出', ...TAG.purple },
  in_stock: { label: '在库', ...TAG.cyan },
  shipped: { label: '已出库', ...TAG.green },
  scrapped: { label: '已报废', ...TAG.darkRed },
  voided: { label: '已作废', ...TAG.gray },
};

export const SERIAL_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(SERIAL_STATUS_CONFIG).map(([key, cfg]) => [key, cfg.label]),
);

/** 序列号流转事件（movementType → 时间线标题） */
export const SERIAL_MOVEMENT_TYPE_CONFIG: Record<string, string> = {
  allocated: '成品序列号分配',
  produced: '成品生产报工',
  received: '成品生产入库',
  shipped: '成品销售出库',
  reversed: '业务冲正',
  scrapped: '成品报废',
  voided: '成品序列号作废',
};

export const SERIAL_REFERENCE_TYPE_CONFIG: Record<string, string> = {
  work_order_report_log: '报工记录',
  production_receipt_order: '生产入库单',
  sale_delivery_item: '销售出库明细',
  disposal_order: '质量处置单',
  work_order: '工单',
};

export const TRACE_EVENT_TYPE_CONFIG: Record<string, string> = {
  batch: '批号记录',
  work_order: '工单',
  operation: '工序',
  report_log: '生产报工',
  stock_transaction: '库存变动',
  purchase_receipt: '采购入库',
  material_issue: '生产领料',
  quality_inspection: '质量检验',
  disposal_order: '质量处置',
  production_scrap: '生产不合格',
  package_unit: '包装',
  sale_delivery: '销售出库',
};

/** 追溯节点短标签（节点徽标空间受限，使用短名） */
export const TRACE_NODE_TYPE_CONFIG: Record<string, string> = {
  batch: '批号',
  work_order: '工单',
  operation: '工序',
  report_log: '报工',
  stock_transaction: '库存',
  purchase_receipt: '采购',
  material_issue: '领料',
  quality_inspection: '质检',
  disposal_order: '处置',
  production_scrap: '报废',
  package_unit: '包装',
  sale_delivery: '出库',
};
