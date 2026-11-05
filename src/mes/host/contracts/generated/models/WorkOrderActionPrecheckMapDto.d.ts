import type { WorkOrderActionPrecheckDto } from './WorkOrderActionPrecheckDto.d.ts';
export type WorkOrderActionPrecheckMapDto = {
    /**
     * 工单结案动作预检（阻断判定与 close 提交强校验共用同一实现，含 FQC 未完成/供料未闭环/待确认入库/暂存/成本结算阻断项）
     */
    close: WorkOrderActionPrecheckDto;
    /**
     * 工单领料动作预检
     */
    materialIssue: WorkOrderActionPrecheckDto;
    /**
     * 完工入库动作预检
     */
    productionIn: WorkOrderActionPrecheckDto;
    /**
     * 线边补退料动作预检
     */
    productionSupply: WorkOrderActionPrecheckDto;
    /**
     * 工单下达动作预检
     */
    release: WorkOrderActionPrecheckDto;
    /**
     * 撤销完工动作预检
     */
    reopen: WorkOrderActionPrecheckDto;
    /**
     * 工单报工动作预检
     */
    report: WorkOrderActionPrecheckDto;
    /**
     * 工单开工动作预检
     */
    start: WorkOrderActionPrecheckDto;
};
