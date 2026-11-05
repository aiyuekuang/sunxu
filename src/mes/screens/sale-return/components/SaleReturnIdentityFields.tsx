import { StyleSheet, TouchableOpacity } from 'react-native';
import type { Customer } from '../../../host/services';
import type { Warehouse } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import type { EntityPickerFetchFn } from '../../../../core/components/EntityPickerModal.tsx';
import { FormSection } from '../../../../core/components/FormPage.tsx';
import { PickerField, type PickerOption } from '../../../../core/components/PickerField.tsx';
import { WarehousePickerField } from '../../../components/common/WarehousePickerField.tsx';
import { FontSize, MIN_TOUCH_TARGET, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

interface SaleReturnIdentityFieldsProps {
  customer: Customer | null;
  warehouse: Warehouse | null;
  reasonCode: string;
  reasonOptions: PickerOption[];
  reasonsLoading: boolean;
  reasonsError: string | null;
  onRetryReasons: () => void;
  errors: Record<string, string>;
  onCustomerChange: (customer: Customer | null) => void;
  onWarehouseChange: (warehouse: Warehouse | null) => void;
  onReasonChange: (reasonCode: string) => void;
  fetchCustomers: EntityPickerFetchFn<Customer>;
}

export function SaleReturnIdentityFields({
  customer,
  warehouse,
  reasonCode,
  reasonOptions,
  reasonsLoading,
  reasonsError,
  onRetryReasons,
  errors,
  onCustomerChange,
  onWarehouseChange,
  onReasonChange,
  fetchCustomers,
}: SaleReturnIdentityFieldsProps) {
  const { colors } = useTheme();

  return (
    <FormSection title="退货信息">
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        仅用于无法确认原销售出库单的客户退回；能找到原单时，请从销售出库单发起退货。
      </Text>
      <EntityPickerField<Customer>
        label="客户"
        required
        value={customer}
        onChange={onCustomerChange}
        fetchFn={fetchCustomers}
        keyExtractor={(item) => item.id}
        labelExtractor={(item) => item.name}
        sublabelExtractor={(item) => item.customerCode}
        placeholder="请选择客户"
        error={errors.customer}
      />
      <WarehousePickerField
        label="退回仓库"
        required
        value={warehouse}
        onChange={onWarehouseChange}
        placeholder="请选择退回仓库"
        error={errors.warehouse}
      />
      <PickerField
        label="退货原因"
        required
        value={reasonCode}
        options={reasonOptions}
        onChange={onReasonChange}
        placeholder={reasonsLoading ? '正在加载退货原因…' : '请选择退货原因'}
        error={
          errors.reasonCode ??
          reasonsError ??
          (!reasonsLoading && reasonOptions.length === 0
            ? '没有可选退货原因，请联系管理员维护'
            : undefined)
        }
      />
      {reasonsError ? (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetryReasons}
          accessibilityRole="button"
          accessibilityLabel="重试加载退货原因"
        >
          <Text style={[styles.retry, { color: colors.primary }]}>重试加载退货原因</Text>
        </TouchableOpacity>
      ) : null}
    </FormSection>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: FontSize.xs, lineHeight: 18 },
  retryButton: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  retry: { fontSize: FontSize.xs, fontWeight: '600' },
});
