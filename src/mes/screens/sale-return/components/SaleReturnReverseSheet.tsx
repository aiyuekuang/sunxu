import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { Spacing } from '../../../../core/theme/tokens';
import { today } from '../../../../core/utils/date';

interface SaleReturnReverseSheetProps {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (reason: string, businessDate: string) => void;
}

/** 销售退货已收货事实的唯一移动端冲正确认入口。 */
export function SaleReturnReverseSheet({
  visible,
  loading,
  onClose,
  onSubmit,
}: SaleReturnReverseSheetProps) {
  const [reason, setReason] = useState('');
  const [businessDate, setBusinessDate] = useState(today());

  useEffect(() => {
    if (visible) {
      setReason('');
      setBusinessDate(today());
    }
  }, [visible]);

  const close = () => {
    if (loading) return;
    setReason('');
    setBusinessDate(today());
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={close}
      title="冲正销售退货单"
      subtitle="系统会追加反向库存流水并冲销尚未外部核销的自动财务来源单，原单保留完整审计。"
      confirmText="确认冲正"
      onConfirm={() => onSubmit(reason.trim(), businessDate)}
      disabled={loading || !reason.trim()}
      confirmDisabledHint={!reason.trim() ? '请填写冲正原因' : undefined}
      loading={loading}
      closeDisabled={loading}
      avoidKeyboard
    >
      <FormField
        label="冲正原因"
        required
        value={reason}
        onChangeText={setReason}
        placeholder="请填写录入错误或需要纠正的业务原因"
        multiline
        containerStyle={styles.reasonField}
      />
      <DatePickerField
        label="冲正业务日期"
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
