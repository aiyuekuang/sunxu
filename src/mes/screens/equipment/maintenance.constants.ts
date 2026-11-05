import { MaintenanceGenerationMode } from '../../host/api-types';
import {
  MAINTENANCE_GENERATION_MODE_LABELS,
  MAINTENANCE_RECURRENCE_STATUS_LABELS,
} from '../../constants/status-configs';

// 枚举→中文字典唯一归口在 status-configs；此处仅保留表单选项并转发既有导出名
export { MAINTENANCE_GENERATION_MODE_LABELS, MAINTENANCE_RECURRENCE_STATUS_LABELS };

export const MAINTENANCE_GENERATION_MODE_OPTIONS: Array<{
  label: string;
  value: MaintenanceGenerationMode;
}> = [
  {
    label: MAINTENANCE_GENERATION_MODE_LABELS[MaintenanceGenerationMode.AFTER_COMPLETION],
    value: MaintenanceGenerationMode.AFTER_COMPLETION,
  },
  {
    label: MAINTENANCE_GENERATION_MODE_LABELS[MaintenanceGenerationMode.FIXED],
    value: MaintenanceGenerationMode.FIXED,
  },
];
