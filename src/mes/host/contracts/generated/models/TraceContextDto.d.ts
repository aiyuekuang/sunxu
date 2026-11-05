import type { TraceContextItemDto } from './TraceContextItemDto.d.ts';
import type { TraceEnvironmentItemDto } from './TraceEnvironmentItemDto.d.ts';
import type { TraceMeasurementItemDto } from './TraceMeasurementItemDto.d.ts';
export type TraceContextDto = {
    environment?: Array<TraceEnvironmentItemDto>;
    machine?: Array<TraceContextItemDto>;
    man?: Array<TraceContextItemDto>;
    material?: Array<TraceContextItemDto>;
    measurement?: Array<TraceMeasurementItemDto>;
    method?: Array<TraceContextItemDto>;
};
