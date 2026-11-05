import type { TraceContextDto } from './TraceContextDto.d.ts';
import type { TraceLinkDto } from './TraceLinkDto.d.ts';
export type TraceGraphNodeDto = {
    context?: TraceContextDto;
    id: string;
    links?: Array<TraceLinkDto>;
    missingContext?: Array<string>;
    occurredAt?: string;
    /**
     * 来源记录照片
     */
    photoUrls?: Array<string>;
    qty?: number;
    refId: string;
    /**
     * 来源记录备注
     */
    remarks?: string;
    status?: string;
    subtitle?: string;
    title: string;
    type: string;
    unit?: string;
};
