import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FundsAccountService } from '../../../host/services';
import type { FundsAccount } from '../../../types/models/FundsAccount';
import type {
  OutboundPurchaseReturnItemDto,
  OutboundPurchaseReturnDto,
  PurchaseReturnDetail,
} from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { ExistingBatchPickerField } from '../../../components/common/ExistingBatchPickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { PickerField } from '../../../../core/components/PickerField.tsx';
import { FontSize } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { StockBalancePreview } from '../../warehouse/components/StockBalancePreview.tsx';
import {
  StockLocationField,
  type SelectedStockLocation,
} from '../../warehouse/components/StockLocationField.tsx';
import { today } from '../../../../core/utils/date';
import { formatQtyWithUnit, formatUnitLabel } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';

type PurchaseReturnOutboundInput = Pick<
  OutboundPurchaseReturnDto,
  'businessDate' | 'refundAccountId' | 'refundDate'
> &
  Pick<OutboundPurchaseReturnDto, 'items'>;

interface OutboundPurchaseReturnDraftItem extends OutboundPurchaseReturnItemDto {
  selectedLocation: SelectedStockLocation | null;
  outboundQtyInput: string;
}

interface PurchaseReturnOutboundSheetProps {
  visible: boolean;
  detail: PurchaseReturnDetail;
  loading: boolean;
  onClose: () => void;
  onSubmit: (input: PurchaseReturnOutboundInput) => void;
}

function isFundsAccount(value: unknown): value is FundsAccount {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === 'string' &&
    typeof row.name === 'string' &&
    typeof row.code === 'string' &&
    typeof row.isActive === 'boolean'
  );
}

function parseOutboundQty(value: string): number | undefined {
  const normalized = value.trim();
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return undefined;
  const quantity = Number(normalized);
  return Number.isFinite(quantity) && quantity >= 0 ? quantity : undefined;
}

export function PurchaseReturnOutboundSheet({
  visible,
  detail,
  loading,
  onClose,
  onSubmit,
}: PurchaseReturnOutboundSheetProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const [accounts, setAccounts] = useState<FundsAccount[]>([]);
  const [refundAccountId, setRefundAccountId] = useState('');
  const [refundDate, setRefundDate] = useState('');
  const [businessDate, setBusinessDate] = useState('');
  const [outboundItems, setOutboundItems] = useState<OutboundPurchaseReturnDraftItem[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const isRefund = detail.financialAction === 'refund';

  useEffect(() => {
    if (!visible) return;
    const initialBusinessDate = today();
    setRefundAccountId('');
    setBusinessDate(initialBusinessDate);
    setRefundDate(isRefund ? initialBusinessDate : '');
    setOutboundItems(
      (detail.items ?? []).map((item) => ({
        id: item.id,
        outboundQty: item.returnQty,
        outboundQtyInput: String(item.returnQty),
        batchNo: item.batchNo ?? undefined,
        locationId: item.locationId ?? undefined,
        storageLocation: item.storageLocationSnapshot ?? undefined,
        remarks: item.remarks ?? undefined,
        selectedLocation: item.location
          ? {
              id: item.location.id,
              warehouseId: item.location.warehouseId,
              code: item.location.code,
              name: item.location.name,
              pathName: item.location.pathName || item.location.name,
            }
          : null,
      })),
    );
    if (!isRefund) return;
    let cancelled = false;
    setLoadingAccounts(true);
    void FundsAccountService.fundsAccountControllerList({ isActive: true, page: 1, pageSize: 100 })
      .then((response) => {
        if (cancelled) return;
        setAccounts((response.list ?? []).filter(isFundsAccount));
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : '收款账户加载失败');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingAccounts(false);
      });
    return () => {
      cancelled = true;
    };
  }, [detail.items, isRefund, visible]);

  const accountOptions = useMemo(
    () =>
      accounts.map((account) => ({
        value: account.id,
        label: `${account.name}（${account.code}）`,
      })),
    [accounts],
  );

  const handleBusinessDateChange = (nextBusinessDate: string) => {
    setBusinessDate(nextBusinessDate);
    setRefundDate((currentRefundDate) =>
      currentRefundDate && currentRefundDate < nextBusinessDate
        ? nextBusinessDate
        : currentRefundDate,
    );
  };

  const confirmDisabledHint = loading
    ? '正在提交退库出库，请稍候'
    : loadingAccounts
      ? '正在加载退款账户，请稍候'
      : !businessDate
        ? '请选择退库出库日期'
        : isRefund && !refundAccountId
          ? '请选择退款收款账户'
          : isRefund && !refundDate
            ? '请选择退款入账日期'
            : (detail.items ?? []).some((item) => {
                  const draft = outboundItems.find((row) => row.id === item.id);
                  const quantity = draft ? parseOutboundQty(draft.outboundQtyInput) : undefined;
                  return quantity === undefined || quantity - Number(item.returnQty) > 1e-8;
                })
              ? '请填写有效的本次出库数量，且不能超过申请退料数量'
              : undefined;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="退库出库"
      subtitle="系统会按当前库存、批号和仓位实时校验后生成采购退料单库存流水。"
      confirmText="确认退库出库"
      onConfirm={() => {
        const hasInvalidQty = (detail.items ?? []).some((item) => {
          const draft = outboundItems.find((row) => row.id === item.id);
          const quantity = draft ? parseOutboundQty(draft.outboundQtyInput) : undefined;
          return quantity === undefined || quantity - Number(item.returnQty) > 1e-8;
        });
        if (hasInvalidQty) {
          toast.info('请填写有效的本次出库数量，且不能超过申请退料数量');
          return;
        }
        onSubmit({
          businessDate: businessDate || undefined,
          refundAccountId: refundAccountId || undefined,
          refundDate: isRefund ? refundDate || undefined : undefined,
          items: outboundItems.map(
            ({ selectedLocation: _selectedLocation, outboundQtyInput, ...item }) => ({
              ...item,
              outboundQty: parseOutboundQty(outboundQtyInput),
            }),
          ),
        });
      }}
      disabled={
        loading ||
        loadingAccounts ||
        !businessDate ||
        (isRefund && (!refundAccountId || !refundDate)) ||
        (detail.items ?? []).some((item) => {
          const draft = outboundItems.find((row) => row.id === item.id);
          const quantity = draft ? parseOutboundQty(draft.outboundQtyInput) : undefined;
          return quantity === undefined || quantity - Number(item.returnQty) > 1e-8;
        })
      }
      confirmDisabledHint={confirmDisabledHint}
      loading={loading}
    >
      <Text style={[styles.summary, { color: colors.textSecondary }]}>
        调整本次实际出库数量、批号和仓位；最终库存按提交时实时校验。
      </Text>
      {(detail.items ?? []).map((item, index) => {
        const outboundItem = outboundItems.find((row) => row.id === item.id);
        const selectedLocation = outboundItem?.selectedLocation ?? null;
        const qty = outboundItem ? parseOutboundQty(outboundItem.outboundQtyInput) : undefined;
        const requiredQty = qty !== undefined && qty > 0 ? qty : undefined;
        const unitLabel = formatUnitLabel(item.material?.unit, unitLabelMap);
        const quantityError = !outboundItem
          ? undefined
          : !outboundItem.outboundQtyInput.trim()
            ? '请输入本次出库数量；不出库请填 0'
            : qty === undefined
              ? '请输入有效的非负数量'
              : qty - Number(item.returnQty) > 1e-8
                ? `不能超过申请退料数量 ${formatQtyWithUnit(item.returnQty, item.material?.unit, unitLabelMap)}`
                : undefined;
        const updateItem = (patch: Partial<OutboundPurchaseReturnDraftItem>) =>
          setOutboundItems((current) =>
            current.map((row) => (row.id === item.id ? { ...row, ...patch } : row)),
          );
        return (
          <View key={item.id} style={styles.item}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>
              {index + 1}. {item.material?.name ?? '未知物料'}
            </Text>
            <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
              {item.material?.code ?? '-'} · 申请退料{' '}
              {formatQtyWithUnit(item.returnQty, item.material?.unit, unitLabelMap)}
            </Text>
            <FormField
              label={`本次出库数量${unitLabel ? `（${unitLabel}）` : ''}`}
              value={outboundItem?.outboundQtyInput ?? ''}
              onChangeText={(value) => updateItem({ outboundQtyInput: value })}
              keyboardType="decimal-pad"
              placeholder="0"
              error={quantityError}
            />
            {item.material?.hasBatchTracking ? (
              <ExistingBatchPickerField
                materialId={item.materialId}
                warehouseId={detail.outboundWarehouseId ?? null}
                value={outboundItem?.batchNo ?? ''}
                onChangeBatchNo={(batchNo) =>
                  updateItem(
                    batchNo === outboundItem?.batchNo
                      ? { batchNo }
                      : {
                          batchNo,
                          locationId: undefined,
                          selectedLocation: null,
                          storageLocation: undefined,
                        },
                  )
                }
                mode="outbound"
                label="出库批号"
                placeholder="扫码或选择出库批号"
              />
            ) : (
              <FormField
                label="出库批号"
                value={outboundItem?.batchNo ?? ''}
                onChangeText={(batchNo) =>
                  updateItem({
                    batchNo,
                    locationId: undefined,
                    selectedLocation: null,
                    storageLocation: undefined,
                  })
                }
                placeholder="选填"
              />
            )}
            <StockLocationField
              label="出库仓位"
              action="stock/out"
              warehouseId={detail.outboundWarehouseId}
              value={selectedLocation}
              onChange={(next) => updateItem({ locationId: next?.id, selectedLocation: next })}
              storageLocation={outboundItem?.storageLocation}
              onStorageLocationChange={(storageLocation) => updateItem({ storageLocation })}
              showStorageLocationText
              materialId={item.materialId}
              batchNo={outboundItem?.batchNo}
              minAvailableQty={requiredQty}
            />
            <StockBalancePreview
              warehouseId={detail.outboundWarehouseId}
              materialId={item.materialId}
              locationId={outboundItem?.locationId}
              storageLocation={outboundItem?.storageLocation}
              batchNo={outboundItem?.batchNo}
              requiredQty={requiredQty}
            />
            <FormField
              label="出库备注"
              value={outboundItem?.remarks ?? ''}
              onChangeText={(remarks) => updateItem({ remarks })}
              placeholder="选填"
            />
          </View>
        );
      })}
      <DatePickerField
        label="退库出库日期"
        required
        value={businessDate}
        onChange={handleBusinessDateChange}
        showCurrentShortcut
        clearable={false}
        maximumDate={today()}
      />
      {isRefund ? (
        <>
          <PickerField
            label="退款收款账户"
            required
            value={refundAccountId}
            onChange={setRefundAccountId}
            options={accountOptions}
            placeholder={loadingAccounts ? '正在加载账户...' : '请选择收款账户'}
          />
          <DatePickerField
            label="退款入账日期"
            required
            value={refundDate}
            onChange={setRefundDate}
            showCurrentShortcut
            clearable={false}
            minimumDate={businessDate || undefined}
            maximumDate={today()}
          />
        </>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  summary: { fontSize: FontSize.sm, lineHeight: 20 },
  item: { gap: 8, paddingVertical: 8 },
  itemTitle: { fontSize: FontSize.base, fontWeight: '600' },
  itemMeta: { fontSize: FontSize.xs, lineHeight: 18 },
});
