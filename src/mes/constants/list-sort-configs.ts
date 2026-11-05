import type { ListSortConfig, ListSortOption } from '../../core/components/ListSortSheet';

const desc = 'DESC' as const;
const asc = 'ASC' as const;

const option = (
  key: string,
  label: string,
  defaultDir: 'ASC' | 'DESC',
  directions?: Array<'ASC' | 'DESC'>,
): ListSortOption => ({
  key,
  label,
  defaultDir,
  directions,
});

const codeNameCreated: ListSortOption[] = [
  option('code', '编码', asc),
  option('name', '名称', asc),
  option('createdAt', '创建时间', desc),
];

const businessPriority = option('businessPriority', '业务优先', asc, ['ASC']);

export const LIST_SORT_CONFIGS: Record<string, ListSortConfig> = {
  materials: {
    defaultSort: { orderBy: 'code', orderDir: asc },
    sortOptions: codeNameCreated,
  },
  customer: {
    defaultSort: { orderBy: 'code', orderDir: asc },
    sortOptions: codeNameCreated,
  },
  supplier: {
    defaultSort: { orderBy: 'code', orderDir: asc },
    sortOptions: codeNameCreated,
  },
  equipment: {
    defaultSort: { orderBy: 'code', orderDir: asc },
    sortOptions: codeNameCreated,
  },
  tooling: {
    defaultSort: { orderBy: 'code', orderDir: asc },
    sortOptions: codeNameCreated,
  },
  'process-routes': {
    defaultSort: { orderBy: 'code', orderDir: asc },
    sortOptions: codeNameCreated,
  },
  bom: {
    defaultSort: { orderBy: 'materialCode', orderDir: asc },
    sortOptions: [
      option('materialCode', '产品编码', asc),
      option('version', '版本', desc),
      option('createdAt', '创建时间', desc),
    ],
  },
  batch: {
    defaultSort: { orderBy: 'businessPriority', orderDir: asc },
    sortOptions: [
      businessPriority,
      option('expiryDate', '到期日期', asc),
      option('batchNo', '批号', desc),
      option('createdAt', '创建时间', desc),
    ],
  },
  warehouse: {
    defaultSort: { orderBy: 'materialCode', orderDir: asc },
    sortOptions: [
      option('materialCode', '物料编码', asc),
      option('materialName', '物料名称', asc),
      option('availableQty', '可用库存', asc),
      option('quantity', '当前库存', desc),
    ],
  },
  'warehouse-transactions': {
    defaultSort: { orderBy: 'createdAt', orderDir: desc },
    sortOptions: [
      option('createdAt', '操作时间', desc),
      option('transactionNo', '流水号', desc),
      option('quantity', '数量', desc),
    ],
  },
  'work-orders': {
    defaultSort: { orderBy: 'businessPriority', orderDir: asc },
    sortOptions: [
      businessPriority,
      option('priority', '优先级', desc),
      option('planEndTime', '交期', asc),
      option('createdAt', '创建时间', desc),
      option('orderNo', '工单号', asc),
    ],
  },
  'production-plans': {
    defaultSort: { orderBy: 'businessPriority', orderDir: asc },
    sortOptions: [
      businessPriority,
      option('priority', '优先级', desc),
      option('planEndDate', '截止日期', asc),
      option('dueDate', '交货期限', asc),
      option('planStartDate', '开始日期', asc),
      option('createdAt', '创建时间', desc),
      option('planNo', '计划单号', asc),
    ],
  },
  'maintenance-list': {
    defaultSort: { orderBy: 'businessPriority', orderDir: asc },
    sortOptions: [
      businessPriority,
      option('plannedDate', '计划日期', asc),
      option('createdAt', '创建时间', desc),
      option('maintenanceNo', '保养单号', asc),
    ],
  },
  'equipment-fault': {
    defaultSort: { orderBy: 'businessPriority', orderDir: asc },
    sortOptions: [
      businessPriority,
      option('createdAt', '提报时间', desc),
      option('faultNo', '故障单号', desc),
      option('severity', '严重程度', desc),
    ],
  },
  capa: {
    defaultSort: { orderBy: 'businessPriority', orderDir: asc },
    sortOptions: [
      businessPriority,
      option('dueDate', '截止日期', asc),
      option('createdAt', '创建时间', desc),
      option('investigationNo', 'CAPA单号', desc),
    ],
  },
  disposal: {
    defaultSort: { orderBy: 'businessPriority', orderDir: asc },
    sortOptions: [
      businessPriority,
      option('createdAt', '创建时间', desc),
      option('disposalNo', '处置单号', desc),
    ],
  },
  quality: {
    defaultSort: { orderBy: 'businessPriority', orderDir: asc },
    sortOptions: [
      businessPriority,
      option('createdAt', '创建时间', desc),
      option('inspectionNo', '检验单号', desc),
    ],
  },
  'material-issue': {
    defaultSort: { orderBy: 'businessPriority', orderDir: asc },
    sortOptions: [
      businessPriority,
      option('createdAt', '创建时间', desc),
      option('issueNo', '生产领料单号', desc),
    ],
  },
  'purchase-requisition': {
    defaultSort: { orderBy: 'businessPriority', orderDir: asc },
    sortOptions: [
      businessPriority,
      option('createdAt', '创建时间', desc),
      option('prNo', '申请单号', desc),
    ],
  },
  'purchase-orders': {
    defaultSort: { orderBy: 'businessPriority', orderDir: asc },
    sortOptions: [
      businessPriority,
      option('expectedDate', '预计到货', asc),
      option('createdAt', '创建时间', desc),
      option('orderNo', '采购单号', desc),
    ],
  },
  'purchase-receipt': {
    defaultSort: { orderBy: 'businessPriority', orderDir: asc },
    sortOptions: [
      businessPriority,
      option('receiptDate', '入库日期', desc),
      option('createdAt', '创建时间', desc),
      option('receiptNo', '采购入库单编号', desc),
    ],
  },
  quotation: {
    defaultSort: { orderBy: 'businessPriority', orderDir: asc },
    sortOptions: [
      businessPriority,
      option('validUntil', '有效期', asc),
      option('quotationDate', '报价日期', desc),
      option('createdAt', '创建时间', desc),
      option('quotationNo', '报价单号', desc),
    ],
  },
  'sale-orders': {
    defaultSort: { orderBy: 'businessPriority', orderDir: asc },
    sortOptions: [
      businessPriority,
      option('deliveryDate', '交付日期', asc),
      option('createdAt', '创建时间', desc),
      option('orderNo', '销售单号', desc),
    ],
  },
  'sale-delivery': {
    defaultSort: { orderBy: 'businessPriority', orderDir: asc },
    sortOptions: [
      businessPriority,
      option('deliveryDate', '发货日期', asc),
      option('createdAt', '创建时间', desc),
      option('deliveryNo', '销售出库单编号', desc),
    ],
  },
  'invoice-list': {
    defaultSort: { orderBy: 'businessPriority', orderDir: asc },
    sortOptions: [
      businessPriority,
      option('dueDate', '到期日期', asc),
      option('invoiceDate', '开票日期', desc),
      option('amount', '金额', desc),
    ],
  },
  'payment-list': {
    defaultSort: { orderBy: 'paymentDate', orderDir: desc },
    sortOptions: [
      option('paymentDate', '收付日期', desc),
      option('amount', '金额', desc),
      option('createdAt', '创建时间', desc),
    ],
  },
  approval: {
    defaultSort: { orderBy: 'submittedAt', orderDir: desc },
    sortOptions: [option('submittedAt', '提交时间', desc), option('documentNo', '单号', asc)],
  },
  todo: {
    defaultSort: { orderBy: 'priority', orderDir: desc },
    sortOptions: [
      option('priority', '优先级', desc),
      option('dueDate', '截止时间', asc),
      option('createdAt', '创建时间', desc),
    ],
  },
  'announcements-admin': {
    defaultSort: { orderBy: 'createdAt', orderDir: desc },
    sortOptions: [option('createdAt', '发布时间', desc), option('priority', '优先级', desc)],
  },
  'announcements-user': {
    defaultSort: { orderBy: 'pinned', orderDir: desc },
    sortOptions: [
      option('pinned', '置顶优先', desc, ['DESC']),
      option('createdAt', '发布时间', desc),
      option('priority', '优先级', desc),
    ],
  },
  'oee-records': {
    defaultSort: { orderBy: 'recordDate', orderDir: desc },
    sortOptions: [option('recordDate', '记录日期', desc), option('createdAt', '创建时间', desc)],
  },
  tickets: {
    defaultSort: { orderBy: 'createdAt', orderDir: desc },
    sortOptions: [
      option('createdAt', '提交时间', desc),
      option('updatedAt', '最近回复', desc),
      option('ticketNo', '工单号', desc),
    ],
  },
};

export function getListSortConfig(key?: string) {
  return key ? LIST_SORT_CONFIGS[key] : undefined;
}
