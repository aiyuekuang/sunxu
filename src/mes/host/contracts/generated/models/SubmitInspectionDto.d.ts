import type { SubmitInspectionItemDto } from './SubmitInspectionItemDto.d.ts';
export type SubmitInspectionDto = {
    conclusion: string;
    disposalNote?: string;
    failQty: number;
    id: string;
    items?: Array<SubmitInspectionItemDto>;
    passQty: number;
    remarks?: string;
    sampleQty: number;
};
