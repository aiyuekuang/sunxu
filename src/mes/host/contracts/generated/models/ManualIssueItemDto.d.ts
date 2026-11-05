export type ManualIssueItemDto = {
    batchNo?: string;
    /**
     * 前端当前手动领料明细自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 手动领料明细自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    /**
     * 等级/来源不匹配例外放行原因；blocking 模式下持有放行权限并填写原因才可继续
     */
    gradeExceptionReason?: string;
    /**
     * 领料显示数量；配合 issueUnit 使用，不传则使用 qty
     */
    issueQty?: number;
    /**
     * 领料显示单位；不传表示基础单位
     */
    issueUnit?: string;
    /**
     * 实际出库仓位ID；按仓库仓位管控模式校验
     */
    locationId?: string;
    /**
     * 需求物料档案ID
     */
    materialId: string;
    /**
     * 物料需求ID；手动领料必须先绑定工单物料需求行
     */
    materialReqId: string;
    /**
     * 超发例外放行原因；blocking 模式下持有放行权限并填写原因才可继续
     */
    overIssueReason?: string;
    /**
     * 领料数量
     */
    qty: number;
    /**
     * 行备注
     */
    remarks?: string;
    /**
     * 存放位置文本；未启用仓位管控时仅作为位置快照
     */
    storageLocation?: string;
    /**
     * 实际替代物料档案ID；填写后 materialId 仍表示原需求物料档案
     */
    substituteMaterialId?: string;
    /**
     * 替代原因
     */
    substitutionReason?: string;
    /**
     * 实际出库仓ID；前端可回显带出，后端最终按需求行策略解析
     */
    warehouseId?: string;
};
