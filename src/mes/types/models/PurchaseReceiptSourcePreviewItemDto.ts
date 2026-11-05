/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PurchaseOrderItem } from './PurchaseOrderItem';
import type { Warehouse } from './Warehouse';
export type PurchaseReceiptSourcePreviewItemDto = {
    /**
     * 本行物料主档默认入库仓
     */
    defaultWarehouse?: Warehouse | null;
    /**
     * 本行物料主档默认入库仓ID；可由表头默认仓或用户行级选择覆盖
     */
    defaultWarehouseId?: string | null;
    /**
     * 按当前 IQC 选用规则预解析的收货策略摘要；创建草稿后由后端冻结，前端不得自行重算
     */
    incomingInspectionRequired: boolean;
    /**
     * 合同待收基础数量（订购-已收，最小为0）
     */
    outstandingQty: number;
    /**
     * 来源采购订单明细；价格字段按当前账号权限脱敏
     */
    purchaseOrderItem: PurchaseOrderItem;
    /**
     * 推荐使用的收货单位
     */
    receiptUnit: string;
    /**
     * 建议收货基础数量（合同待收扣除占用，不含超收）
     */
    receivableQty: number;
    /**
     * 按采购/收货单位折算的建议收货数量
     */
    receivableReceiptQty: number;
    /**
     * 最大允许再收基础数量（含超收上限并扣除已收及占用）
     */
    remainingReceiptCapacityQty: number;
    /**
     * 按采购/收货单位折算的最大允许再收数量
     */
    remainingReceiptCapacityReceiptQty: number;
    /**
     * 其他草稿/审批中采购入库单占用基础数量
     */
    reservedQty: number;
};
