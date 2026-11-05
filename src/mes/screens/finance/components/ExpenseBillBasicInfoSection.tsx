import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { Field, FormSection } from '../../../../core/components/FormPage.tsx';
import { FUNDS_EXPENSE_SCENE_CONFIG } from '../../../constants/status-configs';
import type {
  ExpenseBillCounterpartyOption,
  ExpenseBillCounterpartyType,
  ExpenseBillFormState,
} from '../utils/expense-bill-form';
import { ExpenseBillCounterpartyField } from './ExpenseBillCounterpartyField.tsx';

type SetExpenseBillField = <K extends keyof ExpenseBillFormState>(
  key: K,
  value: ExpenseBillFormState[K],
) => void;

interface ExpenseBillBasicInfoSectionProps {
  form: ExpenseBillFormState;
  selectedCounterparty: ExpenseBillCounterpartyOption | null;
  errors: Record<string, string | undefined>;
  onSetField: SetExpenseBillField;
  onCounterpartyTypeChange: (type: ExpenseBillCounterpartyType | '') => void;
  onCounterpartyChange: (option: ExpenseBillCounterpartyOption | null) => void;
  onClearError: (key: string) => void;
}

const SCENE_OPTIONS = Object.entries(FUNDS_EXPENSE_SCENE_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}));

export function ExpenseBillBasicInfoSection({
  form,
  selectedCounterparty,
  errors,
  onSetField,
  onCounterpartyTypeChange,
  onCounterpartyChange,
  onClearError,
}: ExpenseBillBasicInfoSectionProps) {
  return (
    <FormSection title="基本信息">
      <Field label="费用场景" required>
        <ChipSelectField
          options={SCENE_OPTIONS}
          value={form.billScene}
          onChange={(value) => {
            onClearError('billScene');
            onSetField('billScene', value as ExpenseBillFormState['billScene']);
          }}
        />
      </Field>

      <ExpenseBillCounterpartyField
        type={form.counterpartyType}
        selected={selectedCounterparty}
        freeName={form.counterpartyName}
        error={errors.counterparty}
        onTypeChange={onCounterpartyTypeChange}
        onSelectedChange={onCounterpartyChange}
        onFreeNameChange={(value) => onSetField('counterpartyName', value)}
        onClearError={onClearError}
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
