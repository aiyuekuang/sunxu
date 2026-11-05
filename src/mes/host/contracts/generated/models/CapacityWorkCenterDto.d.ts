import type { CapacityDayDto } from './CapacityDayDto.d.ts';
export type CapacityWorkCenterDto = {
    capacity: Array<CapacityDayDto>;
    id: string;
    name: string;
};
