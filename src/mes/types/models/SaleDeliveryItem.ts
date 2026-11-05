/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Material } from './Material';
import type { PackageUnit } from './PackageUnit';
import type { PackageUnitLine } from './PackageUnitLine';
import type { WarehouseLocation } from './WarehouseLocation';
export type SaleDeliveryItem = {
    amount?: number | null;
    /**
     * 批次ID（confirm 时按批号解析回填；销售订单成本归集直连批次成本快照）
     */
    batchId?: string | null;
    /**
     * 批号
     */
    batchNo?: string | null;
    createdAt: string;
    /**
     * 客户料号快照
     */
    customerMaterialCode?: string | null;
    /**
     * 客户物料名称快照
     */
    customerMaterialName?: string | null;
    /**
     * 客户规格/型号快照
     */
    customerMaterialSpec?: string | null;
    deliveryOrder?: Record<string, any>;
    deliveryOrderId: string;
    /**
     * 折扣金额
     */
    discountAmount?: number | null;
    /**
     * 折扣率（%），100 表示无折扣
     */
    discountRate: number;
    /**
     * 折后未税金额
     */
    discountedAmount?: number | null;
    id: string;
    location?: WarehouseLocation | null;
    /**
     * 实际出库仓位ID
     */
    locationId?: string | null;
    material?: Material;
    materialId: string;
    packageUnit?: PackageUnit | null;
    /**
     * 包装单元ID
     */
    packageUnitId?: string | null;
    packageUnitLine?: PackageUnitLine | null;
    /**
     * 包装单元明细ID
     */
    packageUnitLineId?: string | null;
    /**
     * 价格例外审批ID
     */
    priceExceptionApprovalId?: string | null;
    /**
     * 单价是否含税
     */
    priceIncludesTax?: boolean | null;
    /**
     * 销售发货价格来源快照
     */
    priceSnapshot?: Record<string, any> | null;
    quantity: number;
    remarks?: string | null;
    /**
     * 关联销售订单明细行ID（用于精确追踪来源行）
     */
    saleOrderItemId?: string | null;
    /**
     * 本行实际出库成品序列号；仅详情响应返回
     */
    serialNumbers?: Array<string>;
    /**
     * 实际出仓位置快照
     */
    storageLocationSnapshot?: string | null;
    /**
     * 税额
     */
    taxAmount?: number | null;
    /**
     * 税率（%）
     */
    taxRate?: number | null;
    /**
     * 总金额（价税合计）
     */
    totalAmount?: number | null;
    unitPrice?: number | null;
    updatedAt: string;
};
