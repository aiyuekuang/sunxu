import type { Material } from './Material.d.ts';
import type { MaterialPackageSpec } from './MaterialPackageSpec.d.ts';
import type { WarehouseLocation } from './WarehouseLocation.d.ts';
export type ProductionReceiptItem = {
    /**
     * 产出批次
     */
    batchNo?: string | null;
    createdAt: string;
    /**
     * 展示数量（如 2）
     */
    displayQty?: number | null;
    /**
     * 展示单位（如 箱）
     */
    displayUnit?: string | null;
    id: string;
    location?: WarehouseLocation | null;
    /**
     * 确认入库仓位ID
     */
    locationId?: string | null;
    material?: Material;
    materialId: string;
    /**
     * 包装单元编码（确认时生成或扫描绑定；客户现场可显示为箱码）
     */
    packageNo?: string | null;
    packageSpec?: MaterialPackageSpec | null;
    /**
     * 包装规格ID
     */
    packageSpecId?: string | null;
    /**
     * 产品基础单位数量
     */
    qty: number;
    receiptOrder?: Record<string, any>;
    receiptOrderId: string;
    /**
     * 来源生产输出暂存ID
     */
    sourceOutputBufferId?: string | null;
    /**
     * 来源报工流水ID
     */
    sourceReportLogId?: string | null;
    updatedAt: string;
};
