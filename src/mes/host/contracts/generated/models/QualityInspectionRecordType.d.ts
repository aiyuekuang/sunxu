/**
 * 检查方式。复检通过 recheckOfRecordId 关联原不合格检查记录，不再作为新建检查方式。
 */
export declare enum QualityInspectionRecordType {
    FIRST = "first",
    PROCESS = "process",
    LAST = "last",
    RECHECK = "recheck",
    OTHER = "other"
}
