import { StyleSheet } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FontSize } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { today } from '../../../../core/utils/date';
import type { FundsAccountPickerStatus } from '../hooks/useFundsAccounts';
import { FundsAccountPickerField } from './FundsAccountPickerField.tsx';

interface FundsAccountActionFieldsProps {
  accountLabel: string;
  dateLabel: string;
  currency?: string | null;
  visible: boolean;
  accountRequired: boolean;
  accountId: string;
  date: string;
  amount: string;
  remark: string;
  amountLabel?: string;
  amountInvalid: boolean;
  amountMax?: number;
  disabledReason?: string;
  onAccountChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onRemarkChange: (value: string) => void;
  onAccountStatusChange: (status: FundsAccountPickerStatus) => void;
}

export function FundsAccountActionFields({
  accountLabel,
  dateLabel,
  currency,
  visible,
  accountRequired,
  accountId,
  date,
  amount,
  remark,
  amountLabel,
  amountInvalid,
  amountMax,
  disabledReason,
  onAccountChange,
  onDateChange,
  onAmountChange,
  onRemarkChange,
  onAccountStatusChange,
}: FundsAccountActionFieldsProps) {
  const { colors } = useTheme();
  return (
    <>
      <FundsAccountPickerField
        label={accountLabel}
        required={accountRequired}
        value={accountId}
        onChange={onAccountChange}
        currency={currency}
        enabled={visible}
        onStatusChange={onAccountStatusChange}
      />
      <DatePickerField
        label={dateLabel}
        required
        value={date}
        onChange={onDateChange}
        showCurrentShortcut
        clearable={false}
        maximumDate={today()}
      />
      {amountLabel ? (
        <FormField
          label={amountLabel}
          required
          value={amount}
          onChangeText={onAmountChange}
          keyboardType="decimal-pad"
          placeholder="请输入金额"
          error={amountInvalid ? disabledReason : undefined}
        />
      ) : null}
      <FormField
        label="备注"
        value={remark}
        onChangeText={onRemarkChange}
        placeholder="可填写本次业务说明"
        multiline
        numberOfLines={2}
      />
      {amountMax !== undefined ? (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          本次最多可处理 ¥{amountMax.toFixed(2)}，提交时系统会再次校验最新余额。
        </Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: FontSize.xs, lineHeight: 18 },
});
