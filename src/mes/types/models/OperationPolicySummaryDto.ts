/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BomQuantityPolicyDto } from './BomQuantityPolicyDto';
import type { CostingPolicyDto } from './CostingPolicyDto';
import type { InventoryClosurePolicyDto } from './InventoryClosurePolicyDto';
import type { InventoryLocationPolicyDto } from './InventoryLocationPolicyDto';
import type { MaterialIssuePolicyDto } from './MaterialIssuePolicyDto';
import type { OperationExecutionQuantityPolicyDto } from './OperationExecutionQuantityPolicyDto';
import type { OperationStrategyConfigDto } from './OperationStrategyConfigDto';
import type { ProductionExecutionPolicyDto } from './ProductionExecutionPolicyDto';
import type { PurchaseInquiryPolicyDto } from './PurchaseInquiryPolicyDto';
import type { QualityPolicyDto } from './QualityPolicyDto';
import type { ReceivablesPolicyDto } from './ReceivablesPolicyDto';
import type { SaleOrderPolicyDto } from './SaleOrderPolicyDto';
import type { SchedulingPolicyDto } from './SchedulingPolicyDto';
import type { SourcingPolicyDto } from './SourcingPolicyDto';
import type { ToolingPolicyDto } from './ToolingPolicyDto';
import type { WorkOrderQuantityChangePolicyDto } from './WorkOrderQuantityChangePolicyDto';
export type OperationPolicySummaryDto = {
    /**
     * BOM 变动用量策略
     */
    bomQuantity: BomQuantityPolicyDto;
    /**
     * 成本核算口径策略
     */
    costing: CostingPolicyDto;
    /**
     * 库存闭环策略
     */
    inventoryClosure: InventoryClosurePolicyDto;
    /**
     * 仓位管控策略
     */
    inventoryLocation: InventoryLocationPolicyDto;
    /**
     * 物料领用策略
     */
    materialIssue: MaterialIssuePolicyDto;
    /**
     * 加工计数策略
     */
    operationExecutionQuantity: OperationExecutionQuantityPolicyDto;
    /**
     * 生产执行策略
     */
    productionExecution: ProductionExecutionPolicyDto;
    /**
     * 采购询价策略
     */
    purchaseInquiry: PurchaseInquiryPolicyDto;
    /**
     * 质量闭环策略
     */
    quality: QualityPolicyDto;
    /**
     * 业务往来策略（账龄分段日界等生效值）
     */
    receivables: ReceivablesPolicyDto;
    /**
     * 销售订单策略（明细交货日期严格校验等生效值）
     */
    saleOrder: SaleOrderPolicyDto;
    /**
     * 排产策略
     */
    scheduling: SchedulingPolicyDto;
    /**
     * 策略来源预设编码
     */
    selectedPresetCode: string;
    /**
     * 策略来源预设名称
     */
    selectedPresetName: string;
    /**
     * 供应来源与等级管控策略
     */
    sourcing: SourcingPolicyDto;
    /**
     * 保存的高级策略覆盖值
     */
    strategyConfig: OperationStrategyConfigDto;
    /**
     * 是否存在人工高级策略覆盖
     */
    strategyOverridden: boolean;
    /**
     * 工装绑定策略
     */
    toolingPolicy: ToolingPolicyDto;
    /**
     * 工单数量变更策略
     */
    workOrderQuantityChange: WorkOrderQuantityChangePolicyDto;
};
