export type CompleteMaterialIssueItemDto = {
    /**
     * 确认出库批号
     */
    batchNo?: string;
    /**
     * 前端当前领料明细自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 领料明细自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    /**
     * 等级/来源不匹配例外放行原因；blocking 模式下持有放行权限并填写原因才可继续
     */
    gradeExceptionReason?: string;
    /**
     * 实发数量（按 issueUnit 录入口径，如「4 根」）；0 表示本行本次不发料；不传表示按需求数量全额发料
     */
    issueQty?: number;
    /**
     * 实发录入单位；不传表示基础单位。须与 issueQty 同时提供，换算系数取物料单位换算表
     */
    issueUnit?: string;
    /**
     * 领料单明细ID
     */
    itemId: string;
    /**
     * 确认出库仓位ID；按仓库仓位管控模式校验
     */
    locationId?: string;
    /**
     * 超发例外放行原因；blocking 模式下持有放行权限并填写原因才可继续
     */
    overIssueReason?: string;
    /**
     * 确认出库存放位置文本；未启用仓位管控时仅作为位置快照
     */
    storageLocation?: string;
    /**
     * 确认出库仓ID；不传使用申请行仓库
     */
    warehouseId?: string;
};
