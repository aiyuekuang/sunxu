/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BomQuantityStrategyDto } from './BomQuantityStrategyDto';
import type { CostingStrategyDto } from './CostingStrategyDto';
import type { CustomerOrderPortalStrategyConfigDto } from './CustomerOrderPortalStrategyConfigDto';
import type { FinanceStrategyDto } from './FinanceStrategyDto';
import type { InventoryClosureStrategyDto } from './InventoryClosureStrategyDto';
import type { MaterialIssueStrategyDto } from './MaterialIssueStrategyDto';
import type { OperationExecutionQuantityStrategyDto } from './OperationExecutionQuantityStrategyDto';
import type { ProductionExecutionStrategyDto } from './ProductionExecutionStrategyDto';
import type { PurchaseInquiryStrategyDto } from './PurchaseInquiryStrategyDto';
import type { QualityStrategyDto } from './QualityStrategyDto';
import type { ReceivablesStrategyDto } from './ReceivablesStrategyDto';
import type { SaleOrderStrategyDto } from './SaleOrderStrategyDto';
import type { SchedulingStrategyDto } from './SchedulingStrategyDto';
import type { SourcingStrategyDto } from './SourcingStrategyDto';
import type { ToolingStrategyDto } from './ToolingStrategyDto';
import type { WorkOrderQuantityChangeStrategyDto } from './WorkOrderQuantityChangeStrategyDto';
export type OperationStrategyConfigDto = {
    /**
     * BOM 变动用量策略
     */
    bomQuantity?: BomQuantityStrategyDto;
    /**
     * 成本核算口径策略
     */
    costing?: CostingStrategyDto;
    /**
     * 客户订单公开查询策略
     */
    customerOrderPortal?: CustomerOrderPortalStrategyConfigDto;
    /**
     * 经营出纳客户端策略
     */
    finance?: FinanceStrategyDto;
    /**
     * 库存闭环策略
     */
    inventoryClosure?: InventoryClosureStrategyDto;
    /**
     * 物料领用策略
     */
    materialIssue?: MaterialIssueStrategyDto;
    /**
     * 加工计数策略
     */
    operationExecutionQuantity?: OperationExecutionQuantityStrategyDto;
    /**
     * 生产执行策略
     */
    productionExecution?: ProductionExecutionStrategyDto;
    /**
     * 采购询价策略
     */
    purchaseInquiry?: PurchaseInquiryStrategyDto;
    /**
     * 质量闭环策略
     */
    quality?: QualityStrategyDto;
    /**
     * 业务往来策略（账龄分段日界等）
     */
    receivables?: ReceivablesStrategyDto;
    /**
     * 销售订单策略（明细交货日期严格校验等）
     */
    saleOrder?: SaleOrderStrategyDto;
    /**
     * 排产策略
     */
    scheduling?: SchedulingStrategyDto;
    /**
     * 供应来源与等级管控策略
     */
    sourcing?: SourcingStrategyDto;
    /**
     * 工装绑定策略
     */
    toolingPolicy?: ToolingStrategyDto;
    /**
     * 工单数量变更策略
     */
    workOrderQuantityChange?: WorkOrderQuantityChangeStrategyDto;
};
