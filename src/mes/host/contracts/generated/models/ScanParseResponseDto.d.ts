import type { ScanEntityInfoDto } from './ScanEntityInfoDto.d.ts';
import type { ScanOperationInfoDto } from './ScanOperationInfoDto.d.ts';
import type { ScanWorkOrderInfoDto } from './ScanWorkOrderInfoDto.d.ts';
export type ScanParseResponseDto = {
    entity?: ScanEntityInfoDto | null;
    operation?: ScanOperationInfoDto | null;
    operations?: Array<ScanOperationInfoDto> | null;
    prevOpCompletedQty?: number | null;
    scanType: ScanParseResponseDto.scanType;
    workOrder?: ScanWorkOrderInfoDto | null;
};
export declare namespace ScanParseResponseDto {
    enum scanType {
        WORK_ORDER = "work_order",
        OPERATION = "operation",
        ENTITY = "entity"
    }
}
