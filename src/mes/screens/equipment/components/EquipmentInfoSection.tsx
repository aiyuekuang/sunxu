import type { Equipment } from '../../../host/services';
import { DetailCard, InfoRow } from '../../../../core/components/DetailCard.tsx';
import { useDict } from '../../../host/hooks/useDict';
import { formatDate, formatDateTime } from '../../../../core/utils/date';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EquipmentInfoSectionProps {
  equipment: Equipment;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EquipmentInfoSection({ equipment: data }: EquipmentInfoSectionProps) {
  const { labelMap: equipmentTypeLabelMap } = useDict('equipment_type');
  const { labelMap: equipmentManufacturerLabelMap } = useDict('equipment_manufacturer');

  return (
    <DetailCard title="基本信息">
      <InfoRow
        label="设备类型"
        value={
          data.equipmentType
            ? (equipmentTypeLabelMap[data.equipmentType] ?? data.equipmentType)
            : '-'
        }
      />
      <InfoRow label="序列号" value={data.serialNo ?? '-'} />
      <InfoRow
        label="厂商"
        value={
          data.manufacturer
            ? (equipmentManufacturerLabelMap[data.manufacturer] ?? data.manufacturer)
            : '-'
        }
      />
      <InfoRow label="工作中心" value={data.workCenter?.name ?? '-'} />
      <InfoRow label="购置日期" value={formatDate(data.purchaseDate)} />
      <InfoRow label="质保到期" value={formatDate(data.warrantyExpiry)} />
      <InfoRow
        label="购置价格"
        value={data.purchasePrice != null ? `¥${data.purchasePrice}` : '-'}
      />
      <InfoRow
        label="负责人"
        value={data.responsibleUser?.realName ?? data.responsibleUser?.username ?? '-'}
      />
      <InfoRow label="维保供应商" value={data.maintSupplier?.name ?? '-'} />
      <InfoRow
        label="点检模板"
        value={
          data.inspectionTemplateRef
            ? `${data.inspectionTemplateRef.name}${
                data.inspectionTemplateRef.isActive ? '' : '（已停用，按设备快照点检）'
              }`
            : data.inspectionTemplate.length > 0
              ? `设备快照（${data.inspectionTemplate.length} 项）`
              : '-'
        }
      />
      <InfoRow label="二维码" value={data.qrCode ?? '-'} />
      <InfoRow label="描述" value={data.description ?? '-'} />
      <InfoRow label="创建时间" value={formatDateTime(data.createdAt)} last />
    </DetailCard>
  );
}
