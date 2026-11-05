/**
 * 仅过程检验（IPQC）填写：首件检、过程/巡检、末件检或其他检查。来料、成品、出货检验不传，由检验方案决定；复检通过 recheckOfRecordId 关联来源记录。
 */
export declare enum SubmitInspectionRecordType {
    FIRST = "first",
    PROCESS = "process",
    LAST = "last",
    OTHER = "other"
}
