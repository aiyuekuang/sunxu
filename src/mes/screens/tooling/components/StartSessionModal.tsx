import { useEffect, useState } from 'react';
import { EquipmentListDto } from '../../../types/models/EquipmentListDto';
import type { WorkOrderOperationDetailDto } from '../../../types/models/WorkOrderOperationDetailDto';
import type { Equipment } from '../../../host/services';
import { equipmentService } from '../../../host/services';
import { workOrderService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FontSize } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';

export interface StartSessionModalProps {
  visible: boolean;
  toolingName: string;
  onClose: () => void;
  onConfirm: (values: {
    equipmentId?: string;
    workOrderOpId?: string;
    usageLocation?: string;
  }) => Promise<void>;
}

export function StartSessionModal({
  visible,
  toolingName,
  onClose,
  onConfirm,
}: StartSessionModalProps) {
  const { colors } = useTheme();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<WorkOrderOperationDetailDto | null>(
    null,
  );
  const [usageLocation, setUsageLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSelectedEquipment(null);
      setSelectedOperation(null);
      setUsageLocation('');
    }
  }, [visible]);

  const handleConfirm = async () => {
    const normalizedUsageLocation = usageLocation.trim();
    if (!selectedEquipment && !normalizedUsageLocation) {
      toast.error('请选择设备或填写实际使用位置');
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm({
        equipmentId: selectedEquipment?.id,
        workOrderOpId: selectedOperation?.id,
        usageLocation: normalizedUsageLocation || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="上机确认"
      confirmText="确认上机"
      onConfirm={handleConfirm}
      loading={submitting}
      maxHeightRatio={0.65}
    >
      <Text style={{ fontSize: FontSize.sm, color: colors.textSecondary, marginBottom: 10 }}>
        将{' '}
        <Text style={{ fontSize: FontSize.sm, fontWeight: '600', color: colors.text }}>
          {toolingName}
        </Text>{' '}
        上机使用。请选择设备；如果不在具体设备上使用，必须填写实际使用位置。工单工序可补充追溯上下文：
      </Text>
      <EntityPickerField<Equipment>
        label="选择设备（可选）"
        value={selectedEquipment}
        onChange={setSelectedEquipment}
        fetchFn={(p) =>
          equipmentService.list({
            ...p,
            statuses: [EquipmentListDto.status.ACTIVE, EquipmentListDto.status.OCCUPIED],
          })
        }
        keyExtractor={(e) => e.id}
        labelExtractor={(e) => e.name}
        sublabelExtractor={(e) =>
          `${e.code}${e.workCenter ? ` · ${(e.workCenter as Record<string, unknown>).name}` : ''}`
        }
        placeholder="可选，选择设备"
        clearable
      />
      <FormField
        label="实际使用位置（未选设备时必填）"
        value={usageLocation}
        onChangeText={setUsageLocation}
        placeholder="如：装配一线 3 号工位"
      />
      <EntityPickerField<WorkOrderOperationDetailDto>
        label="选择工单工序（可选）"
        value={selectedOperation}
        onChange={setSelectedOperation}
        fetchFn={async (p) => {
          const res = await workOrderService.allOperations({ ...p });
          const selectableOperations = (res.list ?? []).filter(
            (item) => item.status !== 'completed' && item.status !== 'skipped',
          );
          return {
            list: selectableOperations as WorkOrderOperationDetailDto[],
            total: selectableOperations.length,
          };
        }}
        keyExtractor={(item) => item.id}
        labelExtractor={(item) =>
          `${item.workOrder?.orderNo ?? '未关联工单'} / ${item.operationName}`
        }
        sublabelExtractor={(item) =>
          [item.workOrder?.material?.name, item.equipment?.name, item.status]
            .filter(Boolean)
            .join(' · ')
        }
        placeholder="可选，绑定当前工单工序"
        clearable
      />
    </BottomSheet>
  );
}
