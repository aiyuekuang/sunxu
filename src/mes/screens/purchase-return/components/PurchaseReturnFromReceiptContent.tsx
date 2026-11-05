import { StyleSheet } from 'react-native';
import type { ListPurchaseReceiptDto } from '../../../types/models/ListPurchaseReceiptDto';
import { PurchaseReturnFinancialAction } from '../../../types/models/PurchaseReturnFinancialAction';
import {
  type PurchaseReceipt,
  purchaseReceiptService,
} from '../../../host/services';
import type { PurchaseReturnReturnableLineDto } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { PickerField, type PickerOption } from '../../../../core/components/PickerField.tsx';
import { PURCHASE_RETURN_FINANCIAL_ACTION_CONFIG } from '../../../constants/status-configs';
import { FontSize } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { today } from '../../../../core/utils/date';
import { PurchaseReturnSourceItemsSection } from './PurchaseReturnSourceItemsSection.tsx';

interface PurchaseReturnFromReceiptContentProps {
  receipt: PurchaseReceipt | null;
  quantityByLine: Record<string, string>;
  returnDate: string;
  financialAction: PurchaseReturnFinancialAction;
  reasonCode: string;
  reasonOptions: PickerOption[];
  lines: PurchaseReturnReturnableLineDto[];
  canManagePrice: boolean;
  onSelectReceipt: (receipt: PurchaseReceipt | null) => void;
  onReturnDateChange: (returnDate: string) => void;
  onFinancialActionChange: (financialAction: PurchaseReturnFinancialAction) => void;
  onReasonCodeChange: (reasonCode: string) => void;
  onQuantityChange: (sourceReceiptItemId: string, returnQty: string) => void;
}

const financialActionOptions = Object.entries(PURCHASE_RETURN_FINANCIAL_ACTION_CONFIG).map(
  ([value, config]) => ({ value, label: config.label }),
);

export function PurchaseReturnFromReceiptContent({
  receipt,
  quantityByLine,
  returnDate,
  financialAction,
  reasonCode,
  reasonOptions,
  lines,
  canManagePrice,
  onSelectReceipt,
  onReturnDateChange,
  onFinancialActionChange,
  onReasonCodeChange,
  onQuantityChange,
}: PurchaseReturnFromReceiptContentProps) {
  const { colors } = useTheme();

  return (
    <>
      <EntityPickerField<PurchaseReceipt>
        label="来源采购入库单"
        required
        value={receipt}
        onChange={onSelectReceipt}
        fetchFn={(params) =>
          purchaseReceiptService.list({
            ...params,
            status: 'received' as ListPurchaseReceiptDto.status,
          })
        }
        keyExtractor={(item) => item.id}
        labelExtractor={(item) => item.receiptNo}
        sublabelExtractor={(item) => item.partnerNameSnapshot ?? item.supplierName ?? ''}
        placeholder="请选择已确认的采购入库单"
      />
      <DatePickerField
        label="申请日期"
        value={returnDate}
        onChange={onReturnDateChange}
        showCurrentShortcut
        required
        clearable={false}
        minimumDate={receipt?.receiptDate ?? undefined}
        maximumDate={today()}
      />
      {canManagePrice ? (
        <ChipSelectField
          label="财务处理"
          options={financialActionOptions}
          value={financialAction}
          onChange={(financialAction) =>
            onFinancialActionChange(financialAction as PurchaseReturnFinancialAction)
          }
        />
      ) : null}
      <PickerField
        label="退货原因"
        required
        value={reasonCode}
        options={reasonOptions}
        onChange={onReasonCodeChange}
        placeholder="请选择退货原因"
      />
      {canManagePrice && financialAction === PurchaseReturnFinancialAction.NONE ? (
        <Text style={[styles.warning, { color: colors.warning }]}>
          不处理财务不会生成应付冲减或退款记录，请确认已由其他业务单据处理。
        </Text>
      ) : !canManagePrice ? (
        <Text style={[styles.warning, { color: colors.warning }]}>
          当前账号无价格查看权限，系统会按来源采购入库单的冻结金额自动处理财务，不显示金额与财务选项。
        </Text>
      ) : null}
      {lines.length > 0 ? (
        <PurchaseReturnSourceItemsSection
          lines={lines}
          values={lines.map((line) => ({
            sourceReceiptItemId: line.sourceReceiptItemId,
            returnQty: quantityByLine[line.sourceReceiptItemId] ?? '',
          }))}
          onChange={onQuantityChange}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  warning: { fontSize: FontSize.xs, lineHeight: 18 },
});
