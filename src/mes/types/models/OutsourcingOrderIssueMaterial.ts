/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BomItem } from './BomItem';
import type { BomLineAdjustmentMode } from './BomLineAdjustmentMode';
import type { DocumentBomLine } from './DocumentBomLine';
import type { Material } from './Material';
import type { Warehouse } from './Warehouse';
import type { WorkOrderMaterialReq } from './WorkOrderMaterialReq';
export type OutsourcingOrderIssueMaterial = {
    /**
     * 调整原因/说明
     */
    adjustReason?: string | null;
    /**
     * 来源 BOM 行
     */
    bomItem?: BomItem | null;
    /**
     * 来源 BOM 行ID
     */
    bomItemId?: string | null;
    companyId: string;
    createdAt: string;
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
     * 来源工单单据 BOM 行
     */
    documentBomLine?: DocumentBomLine | null;
    /**
     * 来源工单单据 BOM 行ID；由工单物料需求带入
     */
    documentBomLineId?: string | null;
    id: string;
    /**
     * 固定用量:true=不随委外数量比例联动(固定值),false=按 BOM 单耗×委外数量比例联动
     */
    isFixedQty: boolean;
    /**
     * 已发料数量
     */
    issuedQty: number;
    /**
     * 创建委外单时冻结的 BOM 行可调整能力模式
     */
    lineAdjustmentMode: BomLineAdjustmentMode;
    /**
     * 发料/投入子件
     */
    material?: Material;
    /**
     * 发料/投入子件物料ID
     */
    materialId: string;
    order?: Record<string, any>;
    /**
     * 所属委外加工单ID
     */
    orderId: string;
    /**
     * 计划发料/投入数量
     */
    plannedIssueQty: number;
    /**
     * 当前最多可退回的投入料数量；由净发料数量扣除已收产出折算消耗（含待确认收货占用）派生
     */
    returnableQty?: number;
    /**
     * 已退回投入料数量
     */
    returnedQty: number;
    /**
     * 排序
     */
    sortOrder: number;
    /**
     * 建议发料仓：关联工单需求时取需求来源仓，无关联需求时取投入物料默认仓；为空表示没有可用默认仓，仅作动作默认值，不保存
     */
    suggestedIssueWarehouse?: Warehouse | null;
    /**
     * 发料/投入单位
     */
    unit: string;
    updatedAt: string;
    /**
     * 来源工单物料需求行
     */
    workOrderMaterialReq?: WorkOrderMaterialReq | null;
    /**
     * 来源工单物料需求行ID；从委外工序生成时冻结
     */
    workOrderMaterialReqId?: string | null;
};
