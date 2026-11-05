import type { RealtimeEquipmentStatusDto } from './RealtimeEquipmentStatusDto.d.ts';
import type { RealtimeQualityDto } from './RealtimeQualityDto.d.ts';
import type { RealtimeWorkOrdersDto } from './RealtimeWorkOrdersDto.d.ts';
export type RealtimeDashboardResponseDto = {
    equipment: Array<RealtimeEquipmentStatusDto>;
    quality: RealtimeQualityDto;
    workOrders: RealtimeWorkOrdersDto;
};
