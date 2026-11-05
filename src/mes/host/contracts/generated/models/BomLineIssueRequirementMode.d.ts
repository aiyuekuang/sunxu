/**
 * 是否从该 BOM 行生成工单物料需求；不生成时仅作为结构、图纸或工艺参考，不参与领料
 */
export declare enum BomLineIssueRequirementMode {
    REQUIRED = "required",
    NOT_REQUIRED = "not_required"
}
