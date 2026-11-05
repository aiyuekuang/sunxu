import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { useFundsAccountActionState } from '../hooks/useFundsAccountActionState';
import { FundsAccountActionFields } from './FundsAccountActionFields.tsx';

export interface FundsAccountActionInput {
  accountId: string;
  date: string;
  amount?: number;
  remark?: string;
}

interface FundsAccountActionSheetProps {
  visible: boolean;
  title: string;
  subtitle: string;
  accountLabel: string;
  dateLabel: string;
  amountLabel?: string;
  amountDefault?: number;
  amountMax?: number;
  amountMaxLabel?: string;
  currency?: string | null;
  accountDefault?: string | null;
  accountOptional?: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (input: FundsAccountActionInput) => void;
}

export function FundsAccountActionSheet({
  visible,
  title,
  subtitle,
  accountLabel,
  dateLabel,
  amountLabel,
  amountDefault,
  amountMax,
  amountMaxLabel,
  currency,
  accountDefault,
  accountOptional = false,
  loading,
  onClose,
  onSubmit,
}: FundsAccountActionSheetProps) {
  const state = useFundsAccountActionState({
    visible,
    accountDefault,
    accountOptional,
    amountDefault,
    amountLabel,
    amountMax,
    amountMaxLabel,
    accountLabel,
    dateLabel,
    loading,
  });

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      confirmText={title}
      onConfirm={() => {
        if (
          (state.accountRequired && !state.accountId) ||
          !state.date ||
          state.disabledReason ||
          (amountLabel && state.parsedAmount === undefined)
        )
          return;
        onSubmit({
          accountId: state.accountId,
          date: state.date,
          amount: state.parsedAmount,
          remark: state.remark.trim() || undefined,
        });
      }}
      disabled={Boolean(state.disabledReason)}
      confirmDisabledHint={state.disabledReason}
      loading={loading}
      closeDisabled={loading}
      avoidKeyboard
    >
      <FundsAccountActionFields
        accountLabel={accountLabel}
        dateLabel={dateLabel}
        currency={currency}
        visible={visible}
        accountRequired={state.accountRequired}
        accountId={state.accountId}
        date={state.date}
        amount={state.amount}
        remark={state.remark}
        amountLabel={amountLabel}
        amountInvalid={state.amountInvalid}
        amountMax={amountMax}
        disabledReason={state.disabledReason}
        onAccountChange={state.setAccountId}
        onDateChange={state.setDate}
        onAmountChange={state.setAmount}
        onRemarkChange={state.setRemark}
        onAccountStatusChange={state.handleAccountStatusChange}
      />
    </BottomSheet>
  );
}
