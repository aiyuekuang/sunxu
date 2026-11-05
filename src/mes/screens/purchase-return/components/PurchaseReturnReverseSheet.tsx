import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { Spacing } from '../../../../core/theme/tokens';
import { today } from '../../../../core/utils/date';

interface PurchaseReturnReverseSheetProps {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (reason: string, businessDate: string) => void;
}

export function PurchaseReturnReverseSheet({
  visible,
  loading,
  onClose,
  onSubmit,
}: PurchaseReturnReverseSheetProps) {
  const [reason, setReason] = useState('');
  const [businessDate, setBusinessDate] = useState(today());

  useEffect(() => {
    if (visible) {
      setReason('');
      setBusinessDate(today());
    }
  }, [visible]);

  return (
    <BottomSheet
      visible={visible}
      onClose={() => {
        setReason('');
        setBusinessDate(today());
        onClose();
      }}
      title="冲正采购退料单"
      subtitle="系统会冲正库存、供应商往来与退款收款等系统自动事实，原单会保留完整审计。"
      confirmText="确认冲正"
      onConfirm={() => onSubmit(reason.trim(), businessDate)}
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
      <DatePickerField
        label="库存业务日期"
        required
        value={businessDate}
        onChange={setBusinessDate}
        showCurrentShortcut
        clearable={false}
        maximumDate={today()}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  reasonField: { marginTop: Spacing.xs },
});
