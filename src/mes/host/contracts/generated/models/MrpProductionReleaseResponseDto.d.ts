import type { MrpProductionReleaseResultItemDto } from './MrpProductionReleaseResultItemDto.d.ts';
export type MrpProductionReleaseResponseDto = {
    items: Array<MrpProductionReleaseResultItemDto>;
    runId: string;
    status: MrpProductionReleaseResponseDto.status;
};
export declare namespace MrpProductionReleaseResponseDto {
    enum status {
        CALCULATED = "calculated",
        PARTIALLY_RELEASED = "partially_released",
        RELEASED = "released"
    }
}
