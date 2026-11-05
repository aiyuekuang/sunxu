import type { Material } from './Material.d.ts';
import type { PurchaseRequisitionItem } from './PurchaseRequisitionItem.d.ts';
export type PurchaseInquiryItem = {
    /**
     * 基础库存单位快照
     */
    baseUnit?: string | null;
    createdAt: string;
    id: string;
    /**
     * 采购询价
     */
    inquiry?: Record<string, any>;
    /**
     * 询价单ID
     */
    inquiryId: string;
    /**
     * 询价数量
     */
    inquiryQty: number;
    material?: Material | null;
    /**
     * 物料档案ID；临时询价品可为空，转采购订单前必须绑定正式物料档案
     */
    materialId?: string | null;
    /**
     * 已转采购订单数量
     */
    orderedQty: number;
    /**
     * 采购单位数量
     */
    purchaseQty?: number | null;
    /**
     * 采购单位
     */
    purchaseUnit?: string | null;
    /**
     * 行备注
     */
    remarks?: string | null;
    /**
     * 需求日期
     */
    requiredDate?: string | null;
    /**
     * 询价要求快照
     */
    requirementSnapshot?: Record<string, any> | null;
    requisitionItem?: PurchaseRequisitionItem | null;
    /**
     * 来源采购申请行ID
     */
    requisitionItemId?: string | null;
    /**
     * 排序号
     */
    sortOrder: number;
    /**
     * 来源价目行ID
     */
    sourcePriceTierId?: string | null;
    /**
     * 目标等级（material_grade 字典值）
     */
    targetGrade?: Record<string, any> | null;
    /**
     * 临时询价品编码/图号
     */
    temporaryItemCode?: string | null;
    /**
     * 临时询价品名称
     */
    temporaryItemName?: string | null;
    /**
     * 临时询价品规格
     */
    temporaryItemSpec?: string | null;
    updatedAt: string;
};
