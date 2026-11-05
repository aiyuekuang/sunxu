import { StyleSheet } from 'react-native';
import type { CustomerMaterialDispositionAvailableSourceDto } from '../../../host/services';
import type { Warehouse } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FormSection } from '../../../../core/components/FormPage.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { ScanInput } from '../../../../core/components/ScanInput.tsx';
import { WarehousePickerField } from '../../../components/common/WarehousePickerField.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import {
  type SelectedStockLocation,
  StockLocationField,
} from '../../warehouse/components/StockLocationField.tsx';
import { formatNumber } from '../../../../core/utils/format';

interface CustomerMaterialDispositionStockSectionProps {
  source: CustomerMaterialDispositionAvailableSourceDto | null;
  warehouse: Warehouse | null;
  location: SelectedStockLocation | null;
  qty: string;
  batchNo: string;
  errors: Record<string, string>;
  onWarehouseChange: (warehouse: Warehouse | null) => void;
  onLocationChange: (location: SelectedStockLocation | null) => void;
  onLocationRequirementChange: (required: boolean) => void;
  onQtyChange: (qty: string) => void;
  onBatchNoChange: (batchNo: string) => void;
}

export function CustomerMaterialDispositionStockSection({
  source,
  warehouse,
  location,
  qty,
  batchNo,
  errors,
  onWarehouseChange,
  onLocationChange,
  onLocationRequirementChange,
  onQtyChange,
  onBatchNoChange,
}: CustomerMaterialDispositionStockSectionProps) {
  const { colors } = useTheme();
  const stockManaged = source?.stockManaged === true;
  const isLegacySource = source?.sourceLayerType === 'legacy_unallocated';

  return (
    <FormSection title={stockManaged ? '实际出库与数量' : '本次处置数量'}>
      {stockManaged ? (
        <>
          <WarehousePickerField
            label="实际出库仓"
            required
            value={warehouse}
            onChange={onWarehouseChange}
            sublabelExtractor={(item) => item.type ?? ''}
            error={errors.warehouse}
          />
          <StockLocationField
            label="实际出库仓位"
            action="stock/out"
            warehouseId={warehouse?.id}
            value={location}
            onChange={onLocationChange}
            onRequirementChange={onLocationRequirementChange}
            materialId={source?.materialId}
            batchNo={isLegacySource ? batchNo || undefined : (source?.batchNo ?? undefined)}
          />
          {errors.location ? (
            <Text style={[styles.error, { color: colors.error }]}>{errors.location}</Text>
          ) : null}
          {isLegacySource ? (
            <ScanInput
              label="实际出库批号"
              value={batchNo}
              onChangeText={onBatchNoChange}
              placeholder="扫码或按实际库存填写"
            />
          ) : (
            <FormField
              label="实际出库批号"
              value={batchNo}
              editable={false}
              placeholder="由来源批号确定"
            />
          )}
        </>
      ) : source ? (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          该来源尚未形成库存，不需要填写出库仓、仓位或批号。
        </Text>
      ) : null}
      <QuickNumInput
        label="本次处置数量"
        required
        value={qty}
        onChangeText={onQtyChange}
        min={0.0001}
        max={source?.remainingQty}
        precision={4}
        hint={
          source
            ? `来源可处置余额 ${formatNumber(source.remainingQty, {
                maximumFractionDigits: 4,
              })}`
            : undefined
        }
        error={errors.qty}
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
  error: { fontSize: FontSize.xs, marginTop: -Spacing.xs },
});
