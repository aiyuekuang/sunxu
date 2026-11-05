import { useCallback, useEffect, useState } from 'react';
import { today } from '../../../../core/utils/date';
import type { FundsAccountPickerStatus } from './useFundsAccounts';

interface UseFundsAccountActionStateOptions {
  visible: boolean;
  accountDefault?: string | null;
  accountOptional: boolean;
  amountDefault?: number;
  amountLabel?: string;
  amountMax?: number;
  amountMaxLabel?: string;
  accountLabel: string;
  dateLabel: string;
  loading: boolean;
}

export function useFundsAccountActionState({
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
}: UseFundsAccountActionStateOptions) {
  const [accountId, setAccountId] = useState(accountDefault ?? '');
  const [date, setDate] = useState(today());
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [accountStatus, setAccountStatus] = useState<FundsAccountPickerStatus>({
    loading: false,
    available: false,
    configured: false,
  });

  useEffect(() => {
    if (!visible) return;
    setAccountId(accountDefault ?? '');
    setDate(today());
    setAmount(amountDefault === undefined ? '' : amountDefault.toFixed(2));
    setRemark('');
  }, [accountDefault, amountDefault, visible]);

  const parsedAmount = amountLabel ? Number.parseFloat(amount) : undefined;
  const amountInvalid =
    amountLabel !== undefined &&
    (!parsedAmount ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      (amountMax !== undefined && parsedAmount > amountMax));
  const accountRequired = !accountOptional || accountStatus.configured;
  const disabledReason = loading
    ? '正在提交，请稍候'
    : accountStatus.loading
      ? '正在加载资金账户，请稍候'
      : accountStatus.error
        ? accountStatus.error
        : !accountStatus.available && accountRequired
          ? '没有启用的资金账户，请先配置'
          : accountRequired && !accountId
            ? `请选择${accountLabel}`
            : !date
              ? `请选择${dateLabel}`
              : amountInvalid
                ? amountMax !== undefined
                  ? `${amountLabel}不能超过${amountMaxLabel ?? `可用金额 ¥${amountMax.toFixed(2)}`}`
                  : `请输入有效的${amountLabel}`
                : undefined;

  const handleAccountStatusChange = useCallback(
    (status: FundsAccountPickerStatus) => setAccountStatus(status),
    [],
  );

  return {
    accountId,
    accountRequired,
    amount,
    amountInvalid,
    date,
    disabledReason,
    handleAccountStatusChange,
    parsedAmount,
    remark,
    setAccountId,
    setAmount,
    setDate,
    setRemark,
  };
}
