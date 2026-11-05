import type { SubmitInspectionItemDto } from './SubmitInspectionItemDto.d.ts';
import type { SubmitInspectionRecordType } from './SubmitInspectionRecordType.d.ts';
export type SubmitInspectionRecordDto = {
    /**
     * 本次不合格数
     */
    failQty: number;
    id: string;
    items?: Array<SubmitInspectionItemDto>;
    /**
     * 本次受检作业人ID；过程检验（IPQC）必填
     */
    operatorId?: string;
    /**
     * 本次合格数
     */
    passQty: number;
    /**
     * 复检来源检查记录ID；仅从有效不合格检查记录发起复检时传入
     */
    recheckOfRecordId?: string;
    /**
     * 仅过程检验（IPQC）填写：首件检、过程/巡检、末件检或其他检查。来料、成品、出货检验不传，由检验方案决定；复检通过 recheckOfRecordId 关联来源记录。
     */
    recordType?: SubmitInspectionRecordType;
    remarks?: string;
    /**
     * 本次抽样数量
     */
    sampleQty: number;
};
