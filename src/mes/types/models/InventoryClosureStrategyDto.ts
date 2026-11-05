/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type InventoryClosureStrategyDto = {
    /**
     * 工单关闭遇到未处理生产输出暂存零头时的策略；默认阻断，放开时关闭必须填写原因（待确认生产入库不受放开影响，必须先确认或取消）
     */
    closeWithOpenOutputBufferMode?: InventoryClosureStrategyDto.closeWithOpenOutputBufferMode;
    /**
     * 委外收货闭环方式；默认收货直接入库（现状），启用待确认后收货生成委外收货单、库存接收确认后才入库
     */
    outsourcingReceiptMode?: InventoryClosureStrategyDto.outsourcingReceiptMode;
    /**
     * 完工入库闭环方式
     */
    receiptMode?: InventoryClosureStrategyDto.receiptMode;
    /**
     * 生产入库包装规格来源；仅在本次产出产生待确认生产入库单时生效，其他模式下忽略
     */
    receiptPackageSource?: InventoryClosureStrategyDto.receiptPackageSource;
    /**
     * 生产入库数量规则；仅在本次产出产生待确认生产入库单时生效，其他模式下忽略
     */
    receiptQuantityRule?: InventoryClosureStrategyDto.receiptQuantityRule;
};
export namespace InventoryClosureStrategyDto {
    /**
     * 工单关闭遇到未处理生产输出暂存零头时的策略；默认阻断，放开时关闭必须填写原因（待确认生产入库不受放开影响，必须先确认或取消）
     */
    export enum closeWithOpenOutputBufferMode {
        BLOCKING = 'blocking',
        ALLOW_WITH_REASON = 'allow_with_reason',
    }
    /**
     * 委外收货闭环方式；默认收货直接入库（现状），启用待确认后收货生成委外收货单、库存接收确认后才入库
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
     * 生产入库包装规格来源；仅在本次产出产生待确认生产入库单时生效，其他模式下忽略
     */
    export enum receiptPackageSource {
        MATERIAL_DEFAULT = 'material_default',
        OPERATION_OVERRIDE = 'operation_override',
        MANUAL_ON_RECEIPT = 'manual_on_receipt',
    }
    /**
     * 生产入库数量规则；仅在本次产出产生待确认生产入库单时生效，其他模式下忽略
     */
    export enum receiptQuantityRule {
        REPORTED_GOOD_QTY = 'reported_good_qty',
        FULL_PACKAGE_ONLY = 'full_package_only',
    }
}
