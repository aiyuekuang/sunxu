import type { Material } from '../host/services';

export interface DraftItem {
  key: string;
  saleOrderItemId?: string;
  requisitionItemId?: string;
  isCustom?: boolean;
  material: Material | null;
  quantity: string;
  purchaseUnit?: string;
  unitPrice: string;
  /** 行币别（手工单价币别）；与 mes-admin/后端价格快照一致 */
  currency?: string;
  supplierMaterialCode?: string;
  grade?: string | null;
  discountRate?: number | string | null;
  taxRate?: number | string | null;
  priceIncludesTax?: boolean | null;
  supplierPriceTierId?: string | null;
  customerMaterialCode?: string;
  customerMaterialName?: string;
  customerMaterialSpec?: string;
  /** 单据明细自定义字段值（key=字段 key）。 */
  customValues?: Record<string, unknown>;
  /** 明细交货日期（YYYY-MM-DD）；留空回退订单头交货日期，驱动下游转生产 dueDate */
  deliveryDate?: string;
  /** 采购申请行期望到货日期（YYYY-MM-DD）；提交/转采购订单前必须补齐 */
  expectedArrivalDate?: string;
  imageUrls?: string[];
  /** 销售订单行图纸，随订单行进入计划和工单。 */
  drawingUrls?: string[];
  batchNo?: string;
  /** 扫描或逐行输入的成品序列号，提交时转换为 serialNumbers。 */
  serialNumbersText?: string;
  locationId?: string;
  storageLocation?: string;
  packageUnitId?: string;
  packageUnitLineId?: string;
  /** 已选包装箱号；仅用于页面展示，提交以后端 packageUnitId/LineId 为准。 */
  packageUnitNo?: string;
  remarks: string;
}

export function newDraftItem(): DraftItem {
  return {
    key: String(Date.now() + Math.random()),
    material: null,
    isCustom: false,
    quantity: '',
    purchaseUnit: '',
    unitPrice: '',
    currency: '',
    supplierMaterialCode: '',
    grade: undefined,
    discountRate: '',
    taxRate: undefined,
    priceIncludesTax: undefined,
    supplierPriceTierId: undefined,
    customerMaterialCode: '',
    customerMaterialName: '',
    customerMaterialSpec: '',
    customValues: {},
    deliveryDate: '',
    expectedArrivalDate: '',
    imageUrls: [],
    drawingUrls: [],
    batchNo: '',
    remarks: '',
  };
}
