import { useEffect, useState } from 'react';
import { FundsAccountService } from '../../../host/api-types';
import type { FundsAccount } from '../../../host/api-types';
import { P } from '../../../host/authorization';
import { usePermission } from '../../../host/hooks/usePermission';

const PAGE_SIZE = 100;
const MAX_PAGES = 30;

export interface FundsAccountPickerStatus {
  loading: boolean;
  available: boolean;
  configured: boolean;
  error?: string;
}

interface UseFundsAccountsOptions {
  enabled: boolean;
  currency?: string | null;
  accountListOptional?: boolean;
  onStatusChange?: (status: FundsAccountPickerStatus) => void;
}

function isFundsAccount(value: unknown): value is FundsAccount {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === 'string' &&
    typeof row.name === 'string' &&
    typeof row.code === 'string' &&
    typeof row.currency === 'string' &&
    row.isActive === true
  );
}

export function normalizeFundsCurrency(value?: string | null): string | undefined {
  const normalized = value?.trim().toUpperCase();
  return normalized || undefined;
}

export function useFundsAccounts({
  enabled,
  currency,
  accountListOptional = false,
  onStatusChange,
}: UseFundsAccountsOptions) {
  const canList = usePermission(P.FUNDS_ACCOUNT_LIST);
  const [accounts, setAccounts] = useState<FundsAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const targetCurrency = normalizeFundsCurrency(currency);

  useEffect(() => {
    if (!enabled) {
      setAccounts([]);
      setError(undefined);
      onStatusChange?.({ loading: false, available: false, configured: false });
      return;
    }
    if (!canList) {
      const permissionError = '当前账号没有资金账户查看权限，请联系管理员';
      setAccounts([]);
      setError(permissionError);
      onStatusChange?.(
        accountListOptional
          ? { loading: false, available: false, configured: false }
          : { loading: false, available: false, configured: false, error: permissionError },
      );
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(undefined);
    onStatusChange?.({ loading: true, available: false, configured: false });

    const load = async () => {
      try {
        const loaded: FundsAccount[] = [];
        let total = 0;
        for (let page = 1; page <= MAX_PAGES; page += 1) {
          const response = await FundsAccountService.fundsAccountControllerList({
            isActive: true,
            page,
            pageSize: PAGE_SIZE,
          });
          loaded.push(...(response.list ?? []).filter(isFundsAccount));
          total = Number(response.total ?? loaded.length);
          if (loaded.length >= total || response.list?.length === 0) break;
        }
        if (cancelled) return;
        const filtered = targetCurrency
          ? loaded.filter((account) => normalizeFundsCurrency(account.currency) === targetCurrency)
          : loaded;
        setAccounts(filtered);
        onStatusChange?.({
          loading: false,
          available: filtered.length > 0,
          configured: loaded.length > 0,
        });
      } catch (loadError: unknown) {
        if (cancelled) return;
        const message =
          loadError instanceof Error ? loadError.message : '资金账户加载失败，请关闭后重试';
        setAccounts([]);
        setError(message);
        onStatusChange?.({ loading: false, available: false, configured: false, error: message });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [accountListOptional, canList, enabled, onStatusChange, targetCurrency]);

  return { accounts, canList, error, loading };
}
