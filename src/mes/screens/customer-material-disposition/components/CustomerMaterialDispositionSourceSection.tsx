import { StyleSheet } from 'react-native';
import type { ConfirmCustomerMaterialDispositionDto } from '../../../types/models/ConfirmCustomerMaterialDispositionDto';
import type { Customer } from '../../../host/services';
import { customerService } from '../../../host/services';
import type { CustomerMaterialDispositionAvailableSourceDto } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import type { EntityPickerFetchFn } from '../../../../core/components/EntityPickerModal.tsx';
import { FormSection } from '../../../../core/components/FormPage.tsx';
import { CUSTOMER_MATERIAL_DISPOSITION_TYPE_OPTIONS } from '../../../constants/status-configs';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatNumber } from '../../../../core/utils/format';

interface CustomerMaterialDispositionSourceSectionProps {
  customer: Customer | null;
  source: CustomerMaterialDispositionAvailableSourceDto | null;
  dispositionType: ConfirmCustomerMaterialDispositionDto.dispositionType;
  errors: Record<string, string>;
  fetchSources: EntityPickerFetchFn<CustomerMaterialDispositionAvailableSourceDto>;
  onCustomerChange: (customer: Customer | null) => void;
  onSourceChange: (source: CustomerMaterialDispositionAvailableSourceDto | null) => void;
  onDispositionTypeChange: (
    dispositionType: ConfirmCustomerMaterialDispositionDto.dispositionType,
  ) => void;
}

function sourceKey(source: CustomerMaterialDispositionAvailableSourceDto): string {
  return source.sourceLayerId ?? source.customerInboundId ?? '';
}

function sourceLabel(source: CustomerMaterialDispositionAvailableSourceDto): string {
  return [source.sourceLabel, source.materialLabel, source.batchNo ? `批号 ${source.batchNo}` : '']
    .filter(Boolean)
    .join(' / ');
}

function sourceSublabel(source: CustomerMaterialDispositionAvailableSourceDto): string {
  return `可处置余额 ${formatNumber(source.remainingQty, {
    fallback: '0',
    maximumFractionDigits: 4,
  })}`;
}

export function CustomerMaterialDispositionSourceSection({
  customer,
  source,
  dispositionType,
  errors,
  fetchSources,
  onCustomerChange,
  onSourceChange,
  onDispositionTypeChange,
}: CustomerMaterialDispositionSourceSectionProps) {
  const { colors } = useTheme();

  return (
    <FormSection title="来源与处置">
      <EntityPickerField<Customer>
        label="客户"
        required
        value={customer}
        onChange={onCustomerChange}
        fetchFn={customerService.list}
        keyExtractor={(item) => item.id}
        labelExtractor={(item) => item.name}
        error={errors.customer}
      />
      <EntityPickerField<CustomerMaterialDispositionAvailableSourceDto>
        label="可处置来源"
        required
        value={source}
        onChange={onSourceChange}
        fetchFn={fetchSources}
        keyExtractor={sourceKey}
        labelExtractor={sourceLabel}
        sublabelExtractor={sourceSublabel}
        placeholder={customer ? '选择客户料来源' : '请先选择客户'}
        disabled={!customer}
        disabledReason={!customer ? '请先选择客户后再选择可处置来源' : undefined}
        error={errors.source}
      />
      {source && !source.stockManaged ? (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          未转库存外来物品：本次只登记处置事实，不产生库存流水。
        </Text>
      ) : null}
      {source?.sourceLayerType === 'legacy_unallocated' ? (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          该库存来自历史数据，来源单据未分摊；本次处置仍会完整记录。
        </Text>
      ) : null}
      <ChipSelectField
        label="处置类型"
        required
        options={CUSTOMER_MATERIAL_DISPOSITION_TYPE_OPTIONS}
        value={dispositionType}
        onChange={(value) =>
          onDispositionTypeChange(value as ConfirmCustomerMaterialDispositionDto.dispositionType)
        }
      />
    </FormSection>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs + Spacing.sm,
    marginTop: -Spacing.xs,
  },
});
