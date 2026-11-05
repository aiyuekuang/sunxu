import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FormSection } from '../../../../core/components/FormPage.tsx';
import type {
  CashAdvanceCounterpartyOption,
  CashAdvanceCounterpartyType,
  CashAdvanceFormState,
} from '../utils/cash-advance-form';
import { CashAdvanceCounterpartyField } from './CashAdvanceCounterpartyField.tsx';

type SetCashAdvanceField = <K extends keyof CashAdvanceFormState>(
  key: K,
  value: CashAdvanceFormState[K],
) => void;

interface CashAdvanceBasicInfoSectionProps {
  form: CashAdvanceFormState;
  selectedCounterparty: CashAdvanceCounterpartyOption | null;
  errors: Record<string, string | undefined>;
  onSetField: SetCashAdvanceField;
  onCounterpartyTypeChange: (type: CashAdvanceCounterpartyType) => void;
  onCounterpartyChange: (option: CashAdvanceCounterpartyOption | null) => void;
  onClearError: (key: string) => void;
}

export function CashAdvanceBasicInfoSection({
  form,
  selectedCounterparty,
  errors,
  onSetField,
  onCounterpartyTypeChange,
  onCounterpartyChange,
  onClearError,
}: CashAdvanceBasicInfoSectionProps) {
  return (
    <FormSection title="基本信息">
      <CashAdvanceCounterpartyField
        type={form.counterpartyType}
        selected={selectedCounterparty}
        freeName={form.counterpartyName}
        error={errors.counterparty}
        onTypeChange={onCounterpartyTypeChange}
        onSelectedChange={onCounterpartyChange}
        onFreeNameChange={(value) => onSetField('counterpartyName', value)}
        onClearError={onClearError}
      />

      <FormField
        label="借支金额"
        required
        value={form.amount}
        onChangeText={(value) => {
          onClearError('amount');
          onSetField('amount', value);
        }}
        keyboardType="decimal-pad"
        placeholder="请输入借支金额"
        error={errors.amount}
      />

      <DatePickerField
        label="业务日期"
        required
        value={form.bizDate}
        onChange={(value) => {
          onClearError('bizDate');
          onSetField('bizDate', value);
        }}
        showCurrentShortcut
        clearable={false}
        error={errors.bizDate}
      />

      <FormField
        label="币种"
        value={form.currency}
        onChangeText={(value) => onSetField('currency', value)}
        placeholder="留空使用公司本位币"
        autoCapitalize="characters"
      />

      <FormField
        label="借支事由"
        value={form.reason}
        onChangeText={(value) => onSetField('reason', value)}
        placeholder="可选填写借支用途"
        multiline
        numberOfLines={2}
      />

      <FormField
        label="备注"
        value={form.remark}
        onChangeText={(value) => onSetField('remark', value)}
        placeholder="可选"
        multiline
        numberOfLines={3}
      />
    </FormSection>
  );
}
