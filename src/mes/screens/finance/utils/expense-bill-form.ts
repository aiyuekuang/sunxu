import type { ExpenseBill } from '../../../host/services';
import type { CustomFieldDefinition } from '../../../host/services';
import { buildCustomFieldFormPayload } from '../../../components/custom-fields/CustomFieldFormSection';

export type ExpenseBillScene = 'reimbursement' | 'direct' | 'monthly';
export type ExpenseBillCounterpartyType = 'employee' | 'supplier' | 'customer' | 'other';
export type ExpenseBillLineSourceType = 'purchase_receipt' | 'purchase_order';

export interface ExpenseBillCounterpartyOption {
  id: string;
  name: string;
  code: string;
}

export interface ExpenseBillCounterpartyPermissions {
  canListCustomers: boolean;
  canListSuppliers: boolean;
  canListUsers: boolean;
}

export interface ExpenseBillLineDraft {
  key: string;
  id?: string;
  categoryId?: string;
  amount: string;
  description?: string;
  /** 兼容历史费用行备注：不在现行表单展示，编辑时原样回传，避免清空旧数据。 */
  remark?: string;
  sourceType?: ExpenseBillLineSourceType;
  sourceId?: string;
  sourceNo?: string;
  customValues?: Record<string, unknown>;
}

export interface ExpenseBillFormState {
  billScene: ExpenseBillScene | '';
  counterpartyType: ExpenseBillCounterpartyType | '';
  counterpartyId: string;
  counterpartyName: string;
  bizDate: string;
  currency: string;
  remark: string;
  attachments?: string[];
  lines: ExpenseBillLineDraft[];
}

export interface ExpenseBillFormPayload {
  billScene: ExpenseBillScene;
  counterpartyType?: ExpenseBillCounterpartyType;
  counterpartyId?: string;
  counterpartyName?: string;
  bizDate: string;
  currency?: string;
  remark?: string;
  attachments?: string[];
  lines: Array<{
    categoryId: string;
    amount: number;
    description?: string;
    remark?: string;
    sourceType?: ExpenseBillLineSourceType;
    sourceId?: string;
    sourceNo?: string;
    id?: string;
    customFieldSchemaVersion?: number;
    customValues?: Record<string, unknown>;
  }>;
}

let nextExpenseBillLineIndex = 0;

export function createExpenseBillLineDraft(
  line: Partial<ExpenseBillLineDraft> = {},
): ExpenseBillLineDraft {
  nextExpenseBillLineIndex += 1;
  return {
    key: line.key ?? `expense-line-${nextExpenseBillLineIndex}`,
    id: line.id,
    categoryId: line.categoryId,
    amount: line.amount ?? '',
    description: line.description,
    remark: line.remark,
    sourceType: line.sourceType,
    sourceId: line.sourceId,
    sourceNo: line.sourceNo,
    customValues: line.customValues ?? {},
  };
}

export function createInitialExpenseBillForm(bizDate: string): ExpenseBillFormState {
  return {
    billScene: 'direct',
    counterpartyType: '',
    counterpartyId: '',
    counterpartyName: '',
    bizDate,
    currency: '',
    remark: '',
    attachments: [],
    lines: [createExpenseBillLineDraft()],
  };
}

export function buildExpenseBillLinesFromBill(bill: ExpenseBill): ExpenseBillLineDraft[] {
  const lines =
    bill.lines?.map((line) =>
      createExpenseBillLineDraft({
        id: line.id,
        categoryId: line.categoryId ?? undefined,
        amount: Number(line.amount).toString(),
        description: line.description ?? undefined,
        remark: line.remark ?? undefined,
        sourceType: line.sourceType ?? undefined,
        sourceId: line.sourceId ?? undefined,
        sourceNo: line.sourceNo ?? undefined,
      }),
    ) ?? [];
  return lines.length > 0 ? lines : [createExpenseBillLineDraft()];
}

export function buildExpenseBillFormFromBill(bill: ExpenseBill): ExpenseBillFormState {
  return {
    billScene: bill.billScene,
    counterpartyType: bill.counterpartyType ?? '',
    counterpartyId: bill.counterpartyId ?? '',
    counterpartyName: bill.counterpartyName ?? '',
    bizDate: bill.bizDate,
    currency: bill.currency ?? '',
    remark: bill.remark ?? '',
    attachments: bill.attachments ?? [],
    lines: buildExpenseBillLinesFromBill(bill),
  };
}

export function buildExpenseBillCounterpartyFromBill(
  bill: ExpenseBill,
): ExpenseBillCounterpartyOption | null {
  if (!bill.counterpartyId || !bill.counterpartyType || bill.counterpartyType === 'other') {
    return null;
  }
  return {
    id: bill.counterpartyId,
    name: bill.counterpartyName || bill.counterpartyId,
    code: '',
  };
}

export function isMasterDataCounterparty(type?: string): boolean {
  return type === 'employee' || type === 'supplier' || type === 'customer';
}

export function canSelectExpenseCounterparty(
  type: ExpenseBillCounterpartyType | '',
  permissions: ExpenseBillCounterpartyPermissions,
): boolean {
  if (type === 'employee') return true;
  if (type === 'customer') return permissions.canListCustomers;
  if (type === 'supplier') return permissions.canListSuppliers;
  return false;
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

export function buildExpenseBillLinePayload(
  rows: ExpenseBillLineDraft[],
  customFields: CustomFieldDefinition[] = [],
  customFieldSchemaVersion: number | null = null,
): ExpenseBillFormPayload['lines'] {
  return rows
    .map((row) => {
      const amount = parsePositiveAmount(row.amount);
      if (amount === null) return null;
      const categoryId = trimToUndefined(row.categoryId);
      if (!categoryId) return null;
      const sourceId = trimToUndefined(row.sourceId);
      const payload: ExpenseBillFormPayload['lines'][number] = {
        amount,
        categoryId,
        id: row.id,
        ...buildCustomFieldFormPayload(
          customFields,
          customFieldSchemaVersion,
          row.customValues ?? {},
        ),
      };
      const description = trimToUndefined(row.description);
      const remark = trimToUndefined(row.remark);
      const sourceNo = sourceId ? trimToUndefined(row.sourceNo) : undefined;
      if (description) payload.description = description;
      if (remark) payload.remark = remark;
      if (sourceId) payload.sourceId = sourceId;
      if (sourceId && row.sourceType) payload.sourceType = row.sourceType;
      if (sourceNo) payload.sourceNo = sourceNo;
      return payload;
    })
    .filter((row): row is ExpenseBillFormPayload['lines'][number] => row !== null);
}

export function buildExpenseBillPayload(
  form: ExpenseBillFormState,
  customFields: CustomFieldDefinition[] = [],
  customFieldSchemaVersion: number | null = null,
): ExpenseBillFormPayload {
  const counterpartyType = trimToUndefined(form.counterpartyType) as
    | ExpenseBillCounterpartyType
    | undefined;
  const masterDataCounterparty = isMasterDataCounterparty(counterpartyType);
  const payload: ExpenseBillFormPayload = {
    billScene: form.billScene as ExpenseBillScene,
    bizDate: form.bizDate,
    lines: buildExpenseBillLinePayload(form.lines, customFields, customFieldSchemaVersion),
  };
  const counterpartyId = masterDataCounterparty ? trimToUndefined(form.counterpartyId) : undefined;
  const counterpartyName = masterDataCounterparty
    ? undefined
    : trimToUndefined(form.counterpartyName);
  const currency = trimToUndefined(form.currency);
  const remark = trimToUndefined(form.remark);
  if (counterpartyType) payload.counterpartyType = counterpartyType;
  if (counterpartyId) payload.counterpartyId = counterpartyId;
  if (counterpartyName) payload.counterpartyName = counterpartyName;
  if (currency) payload.currency = currency;
  if (remark) payload.remark = remark;
  if (form.attachments && form.attachments.length > 0) {
    payload.attachments = form.attachments;
  }
  return payload;
}

export function buildUpdateExpenseBillPayload(
  id: string,
  form: ExpenseBillFormState,
  customFields: CustomFieldDefinition[] = [],
  customFieldSchemaVersion: number | null = null,
): ExpenseBillFormPayload & { id: string } {
  return {
    id,
    ...buildExpenseBillPayload(form, customFields, customFieldSchemaVersion),
  };
}

export function validateExpenseBillForm(
  form: ExpenseBillFormState,
  selectableCategoryIds?: ReadonlySet<string>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.billScene) {
    errors.billScene = '请选择费用场景';
  }
  if (!form.bizDate) {
    errors.bizDate = '请选择业务日期';
  }
  if (isMasterDataCounterparty(form.counterpartyType) && !form.counterpartyId) {
    errors.counterparty = '请选择往来对象';
  }
  const positiveAmountLines = form.lines.filter(
    (line) => parsePositiveAmount(line.amount) !== null,
  );
  if (positiveAmountLines.length === 0) {
    errors.lines = '请至少填写一条有效费用明细';
  } else if (positiveAmountLines.some((line) => !trimToUndefined(line.categoryId))) {
    errors.lines = '每条有效费用明细都必须选择费用类别';
  } else if (
    selectableCategoryIds &&
    positiveAmountLines.some((line) => {
      const categoryId = trimToUndefined(line.categoryId);
      return Boolean(categoryId && !selectableCategoryIds.has(categoryId));
    })
  ) {
    errors.lines = '费用明细包含已停用或当前不可用的类别，请重新选择';
  }
  return errors;
}

export function getExpenseBillLineTotal(rows: ExpenseBillLineDraft[]): number {
  return rows.reduce((sum, row) => sum + (parsePositiveAmount(row.amount) ?? 0), 0);
}
