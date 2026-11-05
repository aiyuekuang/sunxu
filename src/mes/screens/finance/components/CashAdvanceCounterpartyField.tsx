import { useCallback } from 'react';
import { userService } from '../../../host/services';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { COUNTERPARTY_TYPE_OPTIONS } from '../../../constants/status-configs';
import type {
  CashAdvanceCounterpartyOption,
  CashAdvanceCounterpartyType,
} from '../utils/cash-advance-form';

interface FetchParams {
  page: number;
  pageSize: number;
  keyword?: string;
}

interface CashAdvanceCounterpartyFieldProps {
  type: CashAdvanceCounterpartyType;
  selected: CashAdvanceCounterpartyOption | null;
  freeName: string;
  error?: string;
  onTypeChange: (type: CashAdvanceCounterpartyType) => void;
  onSelectedChange: (option: CashAdvanceCounterpartyOption | null) => void;
  onFreeNameChange: (name: string) => void;
  onClearError: (key: string) => void;
}

/** 借支只允许员工或临时对象；文案与选项取归口往来对象类型后按业务裁剪子集 */
const CASH_ADVANCE_COUNTERPARTY_TYPE_OPTIONS = COUNTERPARTY_TYPE_OPTIONS.filter(
  ({ value }) => value === 'employee' || value === 'other',
);

export function CashAdvanceCounterpartyField({
  type,
  selected,
  freeName,
  error,
  onTypeChange,
  onSelectedChange,
  onFreeNameChange,
  onClearError,
}: CashAdvanceCounterpartyFieldProps) {
  const fetchEmployees = useCallback(async (params: FetchParams) => {
    const res = await userService.listForPicker(params);
    return {
      list: (res.list ?? []).map((item) => ({
        id: item.id,
        name: item.realName || item.username,
        code: item.username,
      })),
      total: res.total ?? 0,
    };
  }, []);

  return (
    <>
      <ChipSelectField
        label="借支对象类型"
        options={CASH_ADVANCE_COUNTERPARTY_TYPE_OPTIONS}
        value={type}
        onChange={(value) => {
          onClearError('counterparty');
          onTypeChange(value === 'other' ? 'other' : 'employee');
        }}
      />

      {type === 'employee' ? (
        <EntityPickerField<CashAdvanceCounterpartyOption>
          label="借支员工"
          value={selected}
          onChange={(option) => {
            onClearError('counterparty');
            onSelectedChange(option);
          }}
          fetchFn={fetchEmployees}
          keyExtractor={(item) => item.id}
          labelExtractor={(item) => item.name}
          sublabelExtractor={(item) => item.code || '-'}
          title="选择借支员工"
          placeholder="请选择借支员工"
          required
          error={error}
        />
      ) : (
        <FormField
          label="借支对象名称"
          value={freeName}
          onChangeText={(value) => {
            onClearError('counterparty');
            onFreeNameChange(value);
          }}
          placeholder="请填写临时对象名称"
          required
          error={error}
        />
      )}
    </>
  );
}
