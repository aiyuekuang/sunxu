import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { Spacing } from '../../../../core/theme/tokens';

interface SaleDeliveryReverseSheetProps {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export function SaleDeliveryReverseSheet({
  visible,
  loading,
  onClose,
  onSubmit,
}: SaleDeliveryReverseSheetProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (visible) setReason('');
  }, [visible]);

  return (
    <BottomSheet
      visible={visible}
      onClose={() => {
        setReason('');
        onClose();
      }}
      title="冲正销售出库单"
      subtitle="冲正会回滚库存并更新关联销售订单状态，原单会保留完整审计。"
      confirmText="确认冲正"
      onConfirm={() => onSubmit(reason.trim())}
      disabled={loading || !reason.trim()}
      confirmDisabledHint={!reason.trim() ? '请填写冲正原因' : undefined}
      loading={loading}
    >
      <FormField
        label="冲正原因"
        required
        value={reason}
        onChangeText={setReason}
        placeholder="请填写冲正原因"
        multiline
        containerStyle={styles.reasonField}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  reasonField: { marginTop: Spacing.xs },
});
