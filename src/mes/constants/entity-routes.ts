import { P } from '../host/authorization';

/**
 * entityType → 详情导航目标的唯一归口。
 * 待办中心、审批中心、系统通知的“点击跳转详情”都必须经由本表
 * （配合 navigation/open-entity-detail.ts 的 openEntityDetail），
 * 禁止在页面里另写 switch / 平行映射。
 */
export interface EntityDetailRoute {
  /** 嵌套导航器名；仅传 navigator 时直接切到该 navigator（不指定子页面） */
  navigator?: string;
  /** 目标 screen（navigator 内的子页面，或顶层 screen） */
  screen?: string;
  /** 详情参数名，默认 'id'（如生产入库单 receiptId、排产任务 entryId、SPC 预警 alertId） */
  paramKey?: string;
  /** 附加固定导航参数（如 SPC 打开预警页签） */
  extraParams?: Record<string, unknown>;
  /** 打开详情需持有的任一权限；不满足时提示后不跳转 */
  requiredAnyPermissions?: string[];
  /** 无 App 详情页时的提示文案（如引导 PC 处理）；配置后不跳转 */
  unsupportedHint?: string;
}

export const ENTITY_DETAIL_ROUTE: Record<string, EntityDetailRoute> = {
  purchase_requisition: { navigator: 'PurchaseRequisition', screen: 'PurchaseRequisitionDetail' },
  work_order: { navigator: 'WorkOrders', screen: 'WorkOrderDetail' },
  quality_inspection: { screen: 'QualityDetail' },
  spc_alert: { screen: 'Spc', paramKey: 'alertId', extraParams: { initialTab: 'alerts' } },
  disposal: { navigator: 'Disposal', screen: 'DisposalDetail' },
  sale_order: { navigator: 'SaleOrder', screen: 'SaleOrderDetail' },
  sale_delivery: { navigator: 'SaleDelivery', screen: 'SaleDeliveryDetail' },
  sale_return: { navigator: 'SaleReturn', screen: 'SaleReturnDetail' },
  material_issue: { navigator: 'MaterialIssue', screen: 'MaterialIssueDetail' },
  quotation: { navigator: 'Quotation', screen: 'QuotationDetail' },
  purchase_order: { navigator: 'PurchaseOrder', screen: 'PurchaseOrderDetail' },
  equipment_maintenance: { navigator: 'Equipment', screen: 'MaintenanceDetail' },
  equipment_fault: { navigator: 'EquipmentFault', screen: 'EquipmentFaultDetail' },
  equipment: { navigator: 'Equipment', screen: 'EquipmentDetail' },
  purchase_receipt: { navigator: 'PurchaseReceipt', screen: 'PurchaseReceiptDetail' },
  purchase_return: { navigator: 'PurchaseReturn', screen: 'PurchaseReturnDetail' },
  capa: { navigator: 'Capa', screen: 'CapaDetail' },
  announcement: { navigator: 'Announcements', screen: 'AnnouncementDetail' },
  schedule_entry: { screen: 'Schedule', paramKey: 'entryId' },
  finance_payment_request: { navigator: 'Finance', screen: 'PaymentRequestDetail' },
  expense_bill: { navigator: 'Finance', screen: 'ExpenseBillDetail' },
  cash_advance: { navigator: 'Finance', screen: 'CashAdvanceDetail' },
  production_plan: { navigator: 'ProductionPlan', screen: 'ProductionPlanDetail' },
  process_route: { navigator: 'ProcessRoute', screen: 'ProcessRouteDetail' },
  tooling: { navigator: 'Tooling', screen: 'ToolingDetail' },
  material: { navigator: 'Material', screen: 'MaterialDetail' },
  production_receipt: {
    navigator: 'Warehouse',
    screen: 'ProductionReceiptList',
    paramKey: 'receiptId',
    requiredAnyPermissions: [
      P.PRODUCTION_RECEIPT_LIST,
      P.PRODUCTION_RECEIPT_VIEW,
      P.PRODUCTION_RECEIPT_CONFIRM,
    ],
  },
  // 通知类型别名：通知 type=quality 与 quality_inspection 指向同一质检详情
  quality: { screen: 'QualityDetail' },
  // 旧通知（无 refType）warehouse 类型按既有口径回落物料详情
  warehouse: { navigator: 'Material', screen: 'MaterialDetail' },
  // App 无价格例外审批页面，保留 PC 端处理引导
  price_exception_approval: { unsupportedHint: '价格例外审批请在 PC 端“价格控制”中处理' },
};
