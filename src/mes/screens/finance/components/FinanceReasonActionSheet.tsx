import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { Spacing } from '../../../../core/theme/tokens';
import { today } from '../../../../core/utils/date';

interface FinanceReasonActionSheetProps {
  visible: boolean;
  title: string;
  subtitle: string;
  reasonLabel: string;
  dateLabel: string;
  loading: boolean;
  onClose: () => void;
  onSubmit: (reason: string, date: string) => void;
}

export function FinanceReasonActionSheet({
  visible,
  title,
  subtitle,
  reasonLabel,
  dateLabel,
  loading,
  onClose,
  onSubmit,
}: FinanceReasonActionSheetProps) {
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(today());

  useEffect(() => {
    if (!visible) return;
    setReason('');
    setDate(today());
  }, [visible]);

  const close = () => {
    if (loading) return;
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={close}
      title={title}
      subtitle={subtitle}
      confirmText={title}
      onConfirm={() => onSubmit(reason.trim(), date)}
      disabled={loading || !reason.trim() || !date}
      confirmDisabledHint={!reason.trim() ? `请填写${reasonLabel}` : undefined}
      loading={loading}
      closeDisabled={loading}
      avoidKeyboard
    >
      <FormField
        label={reasonLabel}
        required
        value={reason}
        onChangeText={setReason}
        placeholder={`请填写${reasonLabel}`}
        multiline
        numberOfLines={4}
        maxLength={500}
        containerStyle={styles.reasonField}
      />
      <DatePickerField
        label={dateLabel}
        required
        value={date}
        onChange={setDate}
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
