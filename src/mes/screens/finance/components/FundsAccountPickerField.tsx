import type { PickerOption } from '../../../../core/components/PickerField.tsx';
import { PickerField } from '../../../../core/components/PickerField.tsx';
import {
  type FundsAccountPickerStatus,
  normalizeFundsCurrency,
  useFundsAccounts,
} from '../hooks/useFundsAccounts';

export type { FundsAccountPickerStatus } from '../hooks/useFundsAccounts';

interface FundsAccountPickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  currency?: string | null;
  required?: boolean;
  validationError?: string;
  enabled?: boolean;
  accountListOptional?: boolean;
  onStatusChange?: (status: FundsAccountPickerStatus) => void;
}

export function FundsAccountPickerField({
  label,
  value,
  onChange,
  currency,
  required = false,
  validationError,
  enabled = true,
  accountListOptional = false,
  onStatusChange,
}: FundsAccountPickerFieldProps) {
  const { accounts, canList, error, loading } = useFundsAccounts({
    enabled,
    currency,
    accountListOptional,
    onStatusChange,
  });
  const targetCurrency = normalizeFundsCurrency(currency);
  const options: PickerOption[] = accounts.map((account) => ({
    value: account.id,
    label: `${account.name}（${account.code} · ${account.currency}）`,
  }));
  const emptyReason = targetCurrency
    ? `没有启用的 ${targetCurrency} 资金账户，请先配置`
    : '没有启用的资金账户，请先配置';
  const disabledReason = !enabled
    ? undefined
    : !canList
      ? error
      : loading
        ? '正在加载资金账户，请稍候'
        : error
          ? error
          : options.length === 0
            ? emptyReason
            : undefined;

  return (
    <PickerField
      label={label}
      required={required}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={loading ? '正在加载账户...' : `请选择${label}`}
      searchable
      disabled={!enabled || Boolean(disabledReason)}
      disabledReason={disabledReason}
      error={validationError}
    />
  );
}
