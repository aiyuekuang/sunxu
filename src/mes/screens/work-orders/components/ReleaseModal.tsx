import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Warehouse } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { WarehousePickerField } from '../../../components/common/WarehousePickerField.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';

export interface ReleaseModalProps {
  visible: boolean;
  orderNo: string;
  receiptWarehouseCandidates: Warehouse[];
  title?: string;
  confirmText?: string;
  notice?: string;
  onClose: () => void;
  onSubmit: (receiptWarehouseId: string) => void | Promise<void>;
}

export function ReleaseModal({
  visible,
  orderNo,
  receiptWarehouseCandidates,
  title = '选择入库仓并下达',
  confirmText = '确认下达',
  notice,
  onClose,
  onSubmit,
}: ReleaseModalProps) {
  const { colors } = useTheme();
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedWarehouse(receiptWarehouseCandidates[0] ?? null);
      return;
    }
    setSelectedWarehouse(null);
  }, [visible, receiptWarehouseCandidates]);

  const handleSubmit = async () => {
    if (!selectedWarehouse) {
      toast.info('请选择入库仓库');
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit(selectedWarehouse.id);
      setSelectedWarehouse(null);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '设置入库仓失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedWarehouse(null);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title={title}
      confirmText={confirmText}
      onConfirm={handleSubmit}
      loading={submitting}
      maxHeightRatio={0.45}
    >
      <View style={[styles.notice, { backgroundColor: `${colors.warning}12` }]}>
        <Ionicons name="alert-circle-outline" size={14} color={colors.warning} />
        <Text style={[styles.noticeText, { color: colors.warning }]}>
          {notice ?? `工单 ${orderNo} 尚未设置入库仓，请先选择本次下达使用的入库仓。`}
        </Text>
      </View>
      <WarehousePickerField
        label="入库仓库"
        value={selectedWarehouse}
        onChange={setSelectedWarehouse}
        candidateWarehouses={receiptWarehouseCandidates}
        candidateOrder="business-priority"
        placeholder="请选择入库仓"
        clearable={false}
        required
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  },
  noticeText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
});
