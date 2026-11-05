import type { Equipment } from '../../../host/services';
import { DetailCard, InfoRow, StatusTag } from '../../../../core/components/DetailCard.tsx';
import { EQUIPMENT_STATUS_CONFIG } from '../../../constants/status-configs';
import { useDict } from '../../../host/hooks/useDict';

interface EquipmentIdentitySectionProps {
  equipment: Equipment;
}

export function EquipmentIdentitySection({ equipment }: EquipmentIdentitySectionProps) {
  const { labelMap: equipmentModelLabelMap } = useDict('equipment_model');
  const status = EQUIPMENT_STATUS_CONFIG[equipment.status];

  return (
    <DetailCard title="设备识别">
      <InfoRow label="设备编码" value={equipment.code} />
      {equipment.model && (
        <InfoRow label="型号" value={equipmentModelLabelMap[equipment.model] ?? equipment.model} />
      )}
      <InfoRow
        label="状态"
        right={<StatusTag label={status.label} color={status.color} bg={`${status.color}20`} />}
        last
      />
    </DetailCard>
  );
}
