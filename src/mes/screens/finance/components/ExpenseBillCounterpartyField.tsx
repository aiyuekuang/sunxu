import { useCallback } from 'react';
import type { Customer } from '../../../host/services';
import { customerService } from '../../../host/services';
import type { Supplier } from '../../../host/services';
import { supplierService } from '../../../host/services';
import { userService } from '../../../host/services';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { CUSTOMER_PERMS, SUPPLIER_PERMS } from '../../../host/authorization';
import { COUNTERPARTY_TYPE_CONFIG, COUNTERPARTY_TYPE_OPTIONS } from '../../../constants/status-configs';
import { useModulePermissions } from '../../../host/hooks/useModulePermissions';
import {
  canSelectExpenseCounterparty,
  type ExpenseBillCounterpartyOption,
  type ExpenseBillCounterpartyType,
} from '../utils/expense-bill-form';

interface FetchParams {
  page: number;
  pageSize: number;
  keyword?: string;
}

interface ExpenseBillCounterpartyFieldProps {
  type: ExpenseBillCounterpartyType | '';
  selected: ExpenseBillCounterpartyOption | null;
  freeName: string;
  error?: string;
  onTypeChange: (type: ExpenseBillCounterpartyType | '') => void;
  onSelectedChange: (option: ExpenseBillCounterpartyOption | null) => void;
  onFreeNameChange: (name: string) => void;
  onClearError: (key: string) => void;
}

export function ExpenseBillCounterpartyField({
  type,
  selected,
  freeName,
  error,
  onTypeChange,
  onSelectedChange,
  onFreeNameChange,
  onClearError,
}: ExpenseBillCounterpartyFieldProps) {
  const customerPerms = useModulePermissions(CUSTOMER_PERMS);
  const supplierPerms = useModulePermissions(SUPPLIER_PERMS);

  const fetchCounterparties = useCallback(
    async (params: FetchParams) => {
      if (type === 'customer') {
        const res = await customerService.list(params);
        return {
          list: (res.list ?? []).map((item: Customer) => ({
            id: item.id,
            name: item.name,
            code: item.customerCode,
          })),
          total: res.total ?? 0,
        };
      }
      if (type === 'supplier') {
        const res = await supplierService.list(params);
        return {
          list: (res.list ?? []).map((item: Supplier) => ({
            id: item.id,
            name: item.name,
            code: item.supplierCode,
          })),
          total: res.total ?? 0,
        };
      }
      const res = await userService.listForPicker(params);
      return {
        list: (res.list ?? []).map((item) => ({
          id: item.id,
          name: item.realName || item.username,
          code: item.username,
        })),
        total: res.total ?? 0,
      };
    },
    [type],
  );

  const canSelect = canSelectExpenseCounterparty(type, {
    canListCustomers: customerPerms.list,
    canListSuppliers: supplierPerms.list,
    canListUsers: false,
  });
  const isMasterDataType = type === 'customer' || type === 'supplier' || type === 'employee';
  const label = type ? (COUNTERPARTY_TYPE_CONFIG[type]?.label ?? type) : '往来对象';

  return (
    <>
      <ChipSelectField
        label="往来类型"
        options={COUNTERPARTY_TYPE_OPTIONS}
        value={type}
        onChange={(value) => {
          onClearError('counterparty');
          onTypeChange(value as ExpenseBillCounterpartyType | '');
        }}
        clearable
      />

      {isMasterDataType ? (
        <EntityPickerField<ExpenseBillCounterpartyOption>
          key={`expense-counterparty-${type}`}
          label={label}
          value={selected}
          onChange={(option) => {
            onClearError('counterparty');
            onSelectedChange(option);
          }}
          fetchFn={fetchCounterparties}
          keyExtractor={(item) => item.id}
          labelExtractor={(item) => item.name}
          sublabelExtractor={(item) => item.code || '-'}
          title={`选择${label}`}
          placeholder={
            !canSelect && !selected ? `当前账号没有${label}列表查看权限` : `请选择${label}`
          }
          required
          error={error}
          disabledReason={
            !canSelect && !selected ? `当前账号没有${label}列表查看权限，请联系管理员` : undefined
          }
          disabled={!canSelect}
        />
      ) : (
        <FormField
          label="往来对象名称"
          value={freeName}
          onChangeText={(value) => {
            onClearError('counterparty');
            onFreeNameChange(value);
          }}
          placeholder="可选填写临时对象名称"
          error={error}
        />
      )}
    </>
  );
}
