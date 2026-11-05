import type { CashAdvance } from '../../../host/services';

export type CashAdvanceCounterpartyType = 'employee' | 'other';

export interface CashAdvanceCounterpartyOption {
  id: string;
  name: string;
  code: string;
}

export interface CashAdvanceFormState {
  counterpartyType: CashAdvanceCounterpartyType;
  counterpartyId: string;
  counterpartyName: string;
  amount: string;
  bizDate: string;
  currency: string;
  reason: string;
  remark: string;
}

export interface CashAdvanceFormPayload {
  counterpartyType?: CashAdvanceCounterpartyType;
  counterpartyId?: string;
  counterpartyName?: string;
  amount: number;
  bizDate: string;
  currency?: string;
  reason?: string;
  remark?: string;
}

function trimToUndefined(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function parsePositiveAmount(value: string): number | null {
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

function normalizeCounterpartyType(value?: string | null): CashAdvanceCounterpartyType {
  return value === 'other' ? 'other' : 'employee';
}

export function createInitialCashAdvanceForm(bizDate: string): CashAdvanceFormState {
  return {
    counterpartyType: 'employee',
    counterpartyId: '',
    counterpartyName: '',
    amount: '',
    bizDate,
    currency: '',
    reason: '',
    remark: '',
  };
}

export function buildCashAdvanceFormFromAdvance(advance: CashAdvance): CashAdvanceFormState {
  return {
    counterpartyType: normalizeCounterpartyType(advance.counterpartyType),
    counterpartyId: advance.counterpartyId ?? '',
    counterpartyName: advance.counterpartyName ?? '',
    amount: Number(advance.amount).toString(),
    bizDate: advance.bizDate,
    currency: advance.currency ?? '',
    reason: advance.reason ?? '',
    remark: advance.remark ?? '',
  };
}

export function buildCashAdvanceCounterpartyFromAdvance(
  advance: CashAdvance,
): CashAdvanceCounterpartyOption | null {
  if (advance.counterpartyType !== 'employee' || !advance.counterpartyId) {
    return null;
  }
  return {
    id: advance.counterpartyId,
    name: advance.counterpartyName || advance.counterpartyId,
    code: '',
  };
}

export function buildCashAdvancePayload(form: CashAdvanceFormState): CashAdvanceFormPayload {
  const amount = parsePositiveAmount(form.amount) ?? 0;
  const payload: CashAdvanceFormPayload = {
    counterpartyType: form.counterpartyType,
    amount,
    bizDate: form.bizDate,
  };
  const counterpartyId =
    form.counterpartyType === 'employee' ? trimToUndefined(form.counterpartyId) : undefined;
  const counterpartyName =
    form.counterpartyType === 'other' ? trimToUndefined(form.counterpartyName) : undefined;
  const currency = trimToUndefined(form.currency);
  const reason = trimToUndefined(form.reason);
  const remark = trimToUndefined(form.remark);
  if (counterpartyId) payload.counterpartyId = counterpartyId;
  if (counterpartyName) payload.counterpartyName = counterpartyName;
  if (currency) payload.currency = currency;
  if (reason) payload.reason = reason;
  if (remark) payload.remark = remark;
  return payload;
}

export function buildUpdateCashAdvancePayload(
  id: string,
  form: CashAdvanceFormState,
): CashAdvanceFormPayload & { id: string } {
  return {
    id,
    ...buildCashAdvancePayload(form),
  };
}

export function validateCashAdvanceForm(form: CashAdvanceFormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (form.counterpartyType === 'employee' && !trimToUndefined(form.counterpartyId)) {
    errors.counterparty = '请选择借支对象';
  }
  if (form.counterpartyType === 'other' && !trimToUndefined(form.counterpartyName)) {
    errors.counterparty = '请填写借支对象名称';
  }
  if (parsePositiveAmount(form.amount) === null) {
    errors.amount = '请输入大于 0 的借支金额';
  }
  if (!form.bizDate) {
    errors.bizDate = '请选择业务日期';
  }
  return errors;
}
