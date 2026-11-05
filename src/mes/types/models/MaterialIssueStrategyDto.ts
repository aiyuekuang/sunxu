/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MaterialIssueStrategyDto = {
    /**
     * 是否允许已过到货日期仍未到货的采购订单作为计划供给；默认不允许，避免用逾期未到的在途误判成无需自制半成品
     */
    allowOverduePurchaseSupply?: boolean;
    /**
     * 是否允许自制专有物料（采购属性为自制）用采购在途替代自制供给；默认不允许，异常采购只提示不抵扣
     */
    allowPurchaseSupplyForMakeOnlyMaterial?: boolean;
    /**
     * BOM 需求展开方式
     */
    bomExpansionMode?: MaterialIssueStrategyDto.bomExpansionMode;
    /**
     * 是否启用 BOM 行级强制约束：开启后领料与委外发料的替代、改量、换单位、删行、追加非BOM发料行均受 BOM 行可调整能力模式限制；默认关闭(轻量放开)
     */
    enforceLineAdjustmentMode?: boolean;
    /**
     * 领料申请生成方式；默认手工，需要规范仓库发料时可配置为工单下达后自动生成
     */
    issueRequestCreationMode?: MaterialIssueStrategyDto.issueRequestCreationMode;
    /**
     * 公司默认生产用料消耗方式；物料档案与 BOM 明细可逐级覆盖
     */
    materialConsumptionMode?: MaterialIssueStrategyDto.materialConsumptionMode;
    /**
     * 产出物料作为投入料的需求行校验模式；用于本体加工/来料加工等产出物料本身也需要被领料扣减的场景，默认关闭，严格模式下 BOM/工单需求必须显式维护同物料投入行
     */
    outputMaterialInputRequirementMode?: MaterialIssueStrategyDto.outputMaterialInputRequirementMode;
    /**
     * 实发数量超出剩余可领量的处理方式；欠发天然合法不校验。默认 warning(放行并留痕)，定尺物料按整根/整卷发放必然超发
     */
    overIssueMode?: MaterialIssueStrategyDto.overIssueMode;
    /**
     * 缺料放行是否必须填写原因
     */
    overrideReasonRequired?: boolean;
    /**
     * 采购到货后预留的检验、入库缓冲天数；需要来料检验的物料必须配置，否则到货日不能当作可投料日
     */
    purchaseSupplyBufferDays?: number;
    /**
     * 系统自动执行齐套检查的节点
     */
    readinessCheckTiming?: MaterialIssueStrategyDto.readinessCheckTiming;
    /**
     * 齐套检查范围
     */
    readinessScope?: MaterialIssueStrategyDto.readinessScope;
    /**
     * 工单下达节点缺料处理方式
     */
    releaseReadinessMode?: MaterialIssueStrategyDto.releaseReadinessMode;
    /**
     * 报工节点投料缺口处理方式；按当前工序物料需求、已领数量和可用库存约束本次报工
     */
    reportMaterialGateMode?: MaterialIssueStrategyDto.reportMaterialGateMode;
    /**
     * 工单开工节点缺料处理方式
     */
    startReadinessMode?: MaterialIssueStrategyDto.startReadinessMode;
    /**
     * 半成品子工单生成时机；按需手工创建只关闭子工单自动生成，不关闭 BOM 需求展开、MRP 或领料申请
     */
    subAssemblyOrderCreationMode?: MaterialIssueStrategyDto.subAssemblyOrderCreationMode;
};
export namespace MaterialIssueStrategyDto {
    /**
     * BOM 需求展开方式
     */
    export enum bomExpansionMode {
        MANUAL = 'manual',
        WARNING = 'warning',
        BLOCKING = 'blocking',
    }
    /**
     * 领料申请生成方式；默认手工，需要规范仓库发料时可配置为工单下达后自动生成
     */
    export enum issueRequestCreationMode {
        MANUAL = 'manual',
        AUTO_ON_RELEASE = 'auto_on_release',
    }
    /**
     * 公司默认生产用料消耗方式；物料档案与 BOM 明细可逐级覆盖
     */
    export enum materialConsumptionMode {
        MANUAL_ISSUE = 'manual_issue',
        BACKFLUSH_ON_REPORT = 'backflush_on_report',
    }
    /**
     * 产出物料作为投入料的需求行校验模式；用于本体加工/来料加工等产出物料本身也需要被领料扣减的场景，默认关闭，严格模式下 BOM/工单需求必须显式维护同物料投入行
     */
    export enum outputMaterialInputRequirementMode {
        OFF = 'off',
        WARNING = 'warning',
        SUPERVISOR_OVERRIDE = 'supervisor_override',
        BLOCKING = 'blocking',
    }
    /**
     * 实发数量超出剩余可领量的处理方式；欠发天然合法不校验。默认 warning(放行并留痕)，定尺物料按整根/整卷发放必然超发
     */
    export enum overIssueMode {
        WARNING = 'warning',
        BLOCKING = 'blocking',
    }
    /**
     * 系统自动执行齐套检查的节点
     */
    export enum readinessCheckTiming {
        MANUAL = 'manual',
        RELEASE = 'release',
        START = 'start',
        RELEASE_AND_START = 'release_and_start',
    }
    /**
     * 齐套检查范围
     */
    export enum readinessScope {
        FULL_BOM = 'full_bom',
        FIRST_OPERATION = 'first_operation',
        CURRENT_OPERATION = 'current_operation',
    }
    /**
     * 工单下达节点缺料处理方式
     */
    export enum releaseReadinessMode {
        OFF = 'off',
        WARNING = 'warning',
        SUPERVISOR_OVERRIDE = 'supervisor_override',
        BLOCKING = 'blocking',
    }
    /**
     * 报工节点投料缺口处理方式；按当前工序物料需求、已领数量和可用库存约束本次报工
     */
    export enum reportMaterialGateMode {
        OFF = 'off',
        WARNING = 'warning',
        SUPERVISOR_OVERRIDE = 'supervisor_override',
        BLOCKING = 'blocking',
    }
    /**
     * 工单开工节点缺料处理方式
     */
    export enum startReadinessMode {
        OFF = 'off',
        WARNING = 'warning',
        SUPERVISOR_OVERRIDE = 'supervisor_override',
        BLOCKING = 'blocking',
    }
    /**
     * 半成品子工单生成时机；按需手工创建只关闭子工单自动生成，不关闭 BOM 需求展开、MRP 或领料申请
     */
    export enum subAssemblyOrderCreationMode {
        AUTO_ON_CREATE = 'auto_on_create',
        MANUAL_ON_DEMAND = 'manual_on_demand',
    }
}
