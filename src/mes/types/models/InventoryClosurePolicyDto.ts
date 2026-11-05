/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type InventoryClosurePolicyDto = {
    /**
     * 工单关闭遇到未处理生产输出暂存零头时的策略
     */
    closeWithOpenOutputBufferMode: InventoryClosurePolicyDto.closeWithOpenOutputBufferMode;
    /**
     * 委外收货闭环方式
     */
    outsourcingReceiptMode: InventoryClosurePolicyDto.outsourcingReceiptMode;
    /**
     * 完工入库闭环方式
     */
    receiptMode: InventoryClosurePolicyDto.receiptMode;
    /**
     * 生产入库包装规格来源（仅本次产出待确认入库时生效）
     */
    receiptPackageSource: InventoryClosurePolicyDto.receiptPackageSource;
    /**
     * 生产入库数量规则（仅本次产出待确认入库时生效）
     */
    receiptQuantityRule: InventoryClosurePolicyDto.receiptQuantityRule;
};
export namespace InventoryClosurePolicyDto {
    /**
     * 工单关闭遇到未处理生产输出暂存零头时的策略
     */
    export enum closeWithOpenOutputBufferMode {
        BLOCKING = 'blocking',
        ALLOW_WITH_REASON = 'allow_with_reason',
    }
    /**
     * 委外收货闭环方式
     */
    export enum outsourcingReceiptMode {
        DIRECT = 'direct',
        PENDING_CONFIRMATION = 'pending_confirmation',
    }
    /**
     * 完工入库闭环方式
     */
    export enum receiptMode {
        AUTO_ON_REPORT = 'auto_on_report',
        PENDING_CONFIRMATION = 'pending_confirmation',
        SEMIFINISHED_AUTO_FINISHED_PENDING = 'semifinished_auto_finished_pending',
    }
    /**
     * 生产入库包装规格来源（仅本次产出待确认入库时生效）
     */
    export enum receiptPackageSource {
        MATERIAL_DEFAULT = 'material_default',
        OPERATION_OVERRIDE = 'operation_override',
        MANUAL_ON_RECEIPT = 'manual_on_receipt',
    }
    /**
     * 生产入库数量规则（仅本次产出待确认入库时生效）
     */
    export enum receiptQuantityRule {
        REPORTED_GOOD_QTY = 'reported_good_qty',
        FULL_PACKAGE_ONLY = 'full_package_only',
    }
}
