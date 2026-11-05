import type { Material } from './Material.d.ts';
import type { OutsourcingOrder } from './OutsourcingOrder.d.ts';
import type { OutsourcingReceiptStatus } from './OutsourcingReceiptStatus.d.ts';
import type { StockTransaction } from './StockTransaction.d.ts';
import type { Supplier } from './Supplier.d.ts';
import type { User } from './User.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
import type { WarehouseLocation } from './WarehouseLocation.d.ts';
export type OutsourcingReceiptOrder = {
    /**
     * 实收数量（确认后写入）
     */
    actualQty?: number | null;
    /**
     * 当前委外收货单允许的业务动作
     */
    availableActions?: Array<string>;
    /**
     * 收货批号
     */
    batchNo?: string | null;
    /**
     * 取消原因
     */
    cancelReason?: string | null;
    companyId: string;
    /**
     * 库存接收确认人
     */
    confirmBy?: string | null;
    /**
     * 库存接收确认时间
     */
    confirmedAt?: string | null;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    /**
     * 自定义公式字段计算错误
     */
    customComputedErrors?: Record<string, any>;
    /**
     * 自定义公式字段计算值
     */
    customComputedValues?: Record<string, any>;
    /**
     * 自定义字段 schema 版本
     */
    customFieldSchemaVersion?: number;
    /**
     * 自定义字段值
     */
    customValues?: Record<string, any>;
    /**
     * 收货批号有效期至
     */
    expiryDate?: string | null;
    id: string;
    location?: WarehouseLocation | null;
    locationId?: string | null;
    material?: Material;
    materialId: string;
    outsourcingOrder?: OutsourcingOrder;
    outsourcingOrderId: string;
    /**
     * 计划收货数量（基础单位）
     */
    plannedQty: number;
    /**
     * 收货批号生产日期
     */
    productionDate?: string | null;
    receiptNo: string;
    remarks?: string | null;
    /**
     * 冲正原因
     */
    reverseReason?: string | null;
    status: OutsourcingReceiptStatus;
    stockTransaction?: StockTransaction | null;
    /**
     * 实际入库库存流水ID；临时委外合格后放行用于追溯并解除对应批次隔离
     */
    stockTransactionId?: string | null;
    /**
     * 存放位置快照
     */
    storageLocationSnapshot?: string | null;
    supplier?: Supplier | null;
    supplierId?: string | null;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    warehouse?: Warehouse | null;
    warehouseId?: string | null;
};
