/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Customer } from './Customer';
import type { InventoryOwnerType } from './InventoryOwnerType';
import type { Material } from './Material';
import type { StockTransactionType } from './StockTransactionType';
import type { Supplier } from './Supplier';
import type { User } from './User';
import type { Warehouse } from './Warehouse';
import type { WarehouseLocation } from './WarehouseLocation';
export type StockTransaction = {
    allocationRefId?: string | null;
    allocationRefType?: string | null;
    batchId?: string | null;
    batchNo?: string | null;
    /**
     * 库存实际业务发生日期；历史未补齐流水为空
     */
    businessDate?: string | null;
    companyId: string;
    /**
     * 单位换算快照
     */
    conversionSnapshot: Record<string, any>;
    /**
     * 发生时成本币别快照
     */
    costCurrencySnapshot?: string | null;
    /**
     * 发生时成本单价快照
     */
    costUnitPriceSnapshot?: number | null;
    createdAt: string;
    customer?: Customer | null;
    customerId?: string | null;
    /**
     * 业务显示数量快照
     */
    displayQty?: number | null;
    /**
     * 业务显示单位快照
     */
    displayUnit?: string | null;
    fromLocation?: WarehouseLocation | null;
    /**
     * 调拨来源仓位
     */
    fromLocationId?: string | null;
    /**
     * 发生时物料等级快照（material_grade 字典值）；历史不随批次后续改级漂移
     */
    grade?: string | null;
    id: string;
    location?: WarehouseLocation | null;
    /**
     * 本流水实际落点仓位
     */
    locationId?: string | null;
    material?: Material;
    materialId: string;
    operator?: User | null;
    operatorId?: string | null;
    /**
     * 流水归属方 ID；公司自有库存默认等于 companyId
     */
    ownerRefId: string;
    /**
     * 流水归属方类型，默认 company=公司自有库存
     */
    ownerType: InventoryOwnerType;
    photoUrls: Array<string>;
    qty: number;
    qtyAfter: number;
    /**
     * 库存动作原因码
     */
    reasonCode?: string | null;
    referenceId?: string | null;
    referenceNo?: string | null;
    remarks?: string | null;
    /**
     * 退料入库对应的原出库流水ID；用于准确限制多次生产退料
     */
    returnOfTransactionId?: string | null;
    /**
     * 红冲流水指向被红冲的原流水ID（本流水是一次红冲对冲流水）
     */
    reverseOfTransactionId?: string | null;
    /**
     * 原流水指向其红冲对冲流水ID；非空表示该流水已被红冲（不可重复红冲）
     */
    reversedByTransactionId?: string | null;
    /**
     * 来源单据类型快照；来源单驱动库存动作必须填写
     */
    sourceDocType?: string | null;
    /**
     * 发生时供应来源快照（货主/供应商/等级/价目/成本/来源单），历史事实，不随批次后续改级或补成本漂移
     */
    sourceSnapshot?: Record<string, any> | null;
    /**
     * 库存动作发生时的仓位快照
     */
    storageLocationSnapshot?: string | null;
    supplier?: Supplier | null;
    supplierId?: string | null;
    /**
     * 发生时供应商价目来源
     */
    supplierPriceTierId?: string | null;
    toLocation?: WarehouseLocation | null;
    /**
     * 调拨目标仓位
     */
    toLocationId?: string | null;
    transactionNo?: string | null;
    transferGroupId?: string | null;
    /**
     * 调拨操作时间；仅调拨流水使用，不作为库存业务日期
     */
    transferTime?: string | null;
    type: StockTransactionType;
    updatedAt: string;
    warehouse?: Warehouse;
    warehouseId: string;
    workOrderId?: string | null;
};
