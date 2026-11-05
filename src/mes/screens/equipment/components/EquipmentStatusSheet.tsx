import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  type Equipment,
  type EquipmentStatus,
  equipmentService,
} from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { ChipSelectField, type ChipOption } from '../../../../core/components/ChipSelectField.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { EQUIPMENT_STATUS_CONFIG } from '../../../constants/status-configs';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';

interface EquipmentStatusSheetProps {
  equipment: Equipment | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MANUAL_STATUS_VALUES: EquipmentStatus[] = ['active', 'maintenance', 'repair'];

const MANUAL_STATUS_OPTIONS: ChipOption[] = MANUAL_STATUS_VALUES.map((value) => ({
  value,
  label: EQUIPMENT_STATUS_CONFIG[value].label,
  color: EQUIPMENT_STATUS_CONFIG[value].color,
}));

function isManualStatus(status: EquipmentStatus): boolean {
  return MANUAL_STATUS_VALUES.includes(status);
}

export function EquipmentStatusSheet({
  equipment,
  visible,
  onClose,
  onSuccess,
}: EquipmentStatusSheetProps) {
  const { colors } = useTheme();
  const [status, setStatus] = useState<EquipmentStatus | ''>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible || !equipment) return;
    setStatus(isManualStatus(equipment.status) ? equipment.status : '');
  }, [equipment, visible]);

  const handleSubmit = async () => {
    if (!equipment) return;
    if (!status) {
      toast.error('请选择设备状态');
      return;
    }

    setSaving(true);
    try {
      await equipmentService.updateStatus(equipment.id, status);
      toast.success('设备状态已更新');
      onSuccess();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '设备状态更新失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={`更新状态 - ${equipment?.name ?? ''}`}
      confirmText="确认更新"
      onConfirm={handleSubmit}
      loading={saving}
      dynamicHeight
      avoidKeyboard
    >
      <View style={styles.body}>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          当前状态：
          {equipment ? (EQUIPMENT_STATUS_CONFIG[equipment.status]?.label ?? '未知状态') : '-'}
        </Text>
        <ChipSelectField
          label="新状态"
          required
          options={MANUAL_STATUS_OPTIONS}
          value={status}
          onChange={(value) => setStatus(value as EquipmentStatus)}
          overflow="scroll"
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: Spacing.sm,
  },
  hint: {
    fontSize: FontSize.xs,
  },
});
