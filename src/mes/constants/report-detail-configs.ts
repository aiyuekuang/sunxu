import { P } from '../host/authorization';
import type { ListFilterConfig } from '../../core/components/FilterBar';

export type ReportDetailConfigCode =
  | 'sale_delivery_detail'
  | 'sale_order_detail'
  | 'purchase_receipt_detail'
  | 'purchase_order_detail';

const DATE_RANGE_FILTER: ListFilterConfig = {
  type: 'date_range',
  key: 'businessDate',
  label: '业务日期',
  startKey: 'startDate',
  endKey: 'endDate',
  placement: 'advanced',
};

const SALE_DELIVERY_STATUS_OPTIONS = [
  { label: '草稿', value: 'draft' },
  { label: '待提交', value: 'submitted' },
  { label: '已出库', value: 'delivered' },
  { label: '已冲正', value: 'reversed' },
  { label: '已取消', value: 'cancelled' },
];

const SALE_ORDER_STATUS_OPTIONS = [
  { label: '草稿', value: 'draft' },
  { label: '待提交', value: 'submitted' },
  { label: '已确认', value: 'confirmed' },
  { label: '待生产', value: 'production_pending' },
  { label: '待开工', value: 'ready_to_start' },
  { label: '生产中', value: 'in_production' },
  { label: '部分出货', value: 'partially_shipped' },
  { label: '已出货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
];

const PURCHASE_RECEIPT_STATUS_OPTIONS = [
  { label: '草稿', value: 'draft' },
  { label: '待提交', value: 'submitted' },
  { label: '已入库', value: 'received' },
  { label: '已冲正', value: 'reversed' },
  { label: '已取消', value: 'cancelled' },
];

const PURCHASE_ORDER_STATUS_OPTIONS = [
  { label: '草稿', value: 'draft' },
  { label: '待提交', value: 'submitted' },
  { label: '已确认', value: 'confirmed' },
  { label: '部分收货', value: 'partially_received' },
  { label: '已收货', value: 'received' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
];

export function getReportDetailFilters(code: ReportDetailConfigCode): ListFilterConfig[] {
  const statusOptions =
    code === 'sale_delivery_detail'
      ? SALE_DELIVERY_STATUS_OPTIONS
      : code === 'sale_order_detail'
        ? SALE_ORDER_STATUS_OPTIONS
        : code === 'purchase_receipt_detail'
          ? PURCHASE_RECEIPT_STATUS_OPTIONS
          : PURCHASE_ORDER_STATUS_OPTIONS;

  return [
    {
      key: 'status',
      label: '状态',
      options: statusOptions,
      placement: 'quick',
    },
    DATE_RANGE_FILTER,
  ];
}

export const REPORT_STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary' }
> = {
  draft: { label: '草稿', variant: 'default' },
  submitted: { label: '待提交', variant: 'warning' },
  confirmed: { label: '已确认', variant: 'primary' },
  delivered: { label: '已出库', variant: 'success' },
  received: { label: '已入库', variant: 'success' },
  partially_shipped: { label: '部分出货', variant: 'warning' },
  partially_received: { label: '部分收货', variant: 'warning' },
  production_pending: { label: '待生产', variant: 'info' },
  ready_to_start: { label: '待开工', variant: 'info' },
  in_production: { label: '生产中', variant: 'primary' },
  shipped: { label: '已出货', variant: 'success' },
  completed: { label: '已完成', variant: 'success' },
  reversed: { label: '已冲正', variant: 'error' },
  cancelled: { label: '已取消', variant: 'error' },
};

export const REPORT_CATEGORY_CONFIG = {
  sales: { label: '销售', icon: 'cart-outline' as const },
  purchase: { label: '采购', icon: 'bag-handle-outline' as const },
  warehouse: { label: '仓储', icon: 'cube-outline' as const },
  production: { label: '生产', icon: 'bar-chart-outline' as const },
  quality: { label: '质量', icon: 'shield-checkmark-outline' as const },
  finance: { label: '财务', icon: 'wallet-outline' as const },
  dashboard: { label: '经营概览', icon: 'grid-outline' as const },
} as const;

/** 各端只映射目录入口，访问授权仍由后端逐个报表校验。 */
export const REPORT_CATALOG_PERMISSIONS: Record<string, string> = {
  dashboard: P.REPORT_DASHBOARD,
  production: P.REPORT_PRODUCTION,
  quality: P.REPORT_QUALITY,
  stock: P.REPORT_WAREHOUSE,
  finance: P.FINANCE_REPORT_VIEW,
  sale_delivery_detail: P.SALE_DELIVERY_LIST,
  sale_order_detail: P.SALE_ORDER_LIST,
  purchase_receipt_detail: P.PURCHASE_RECEIPT_LIST,
  purchase_order_detail: P.PURCHASE_ORDER_LIST,
};
