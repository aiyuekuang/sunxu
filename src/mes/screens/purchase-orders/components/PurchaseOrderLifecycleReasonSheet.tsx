import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';

export type PurchaseOrderLifecycleAction = 'complete' | 'reopen';

interface PurchaseOrderLifecycleReasonSheetProps {
  visible: boolean;
  action: PurchaseOrderLifecycleAction | null;
  orderNo?: string | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export function PurchaseOrderLifecycleReasonSheet({
  visible,
  action,
  orderNo,
  loading = false,
  onClose,
  onSubmit,
}: PurchaseOrderLifecycleReasonSheetProps) {
  const { colors } = useTheme();
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!visible) setReason('');
  }, [visible]);

  const isReopen = action === 'reopen';
  const actionLabel = isReopen ? '反关闭' : '关闭剩余';

  const handleSubmit = () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      toast.info(`请输入${actionLabel}原因`);
      return;
    }
    onSubmit(trimmedReason);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={`${actionLabel}采购订单${orderNo ? `「${orderNo}」` : ''}`}
      confirmText={`确认${actionLabel}`}
      onConfirm={handleSubmit}
      loading={loading}
      closeDisabled={loading}
      avoidKeyboard
      dynamicHeight
      confirmButtonColor={isReopen ? colors.warning : colors.success}
    >
      <View style={styles.content}>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {isReopen
            ? '反关闭只恢复采购订单继续收货，不会撤销已经发生的采购入库、库存、质检或财务记录。'
            : '关闭剩余只终止未履行的订购义务，不会生成收货数量，也不会改变已有采购入库记录。'}
        </Text>
        <FormField
          label={`${actionLabel}原因`}
          required
          value={reason}
          onChangeText={setReason}
          placeholder={`请输入${actionLabel}原因`}
          multiline
          numberOfLines={3}
          maxLength={500}
          textAlignVertical="top"
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.md },
  description: { fontSize: FontSize.sm, lineHeight: 20 },
});
