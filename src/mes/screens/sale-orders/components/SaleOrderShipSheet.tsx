import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ApiBusinessError } from '../../../host/api-client';
import {
  type CustomFieldDefinition,
  customFieldService,
} from '../../../host/services';
import { saleDeliveryService } from '../../../host/services';
import type { SaleOrder, SaleOrderItem } from '../../../host/services';
import type { Warehouse } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { confirmAlert } from '../../../../core/components/ConfirmAlert.ts';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { ExistingBatchPickerField } from '../../../components/common/ExistingBatchPickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { WarehousePickerField } from '../../../components/common/WarehousePickerField.tsx';
import {
  buildCustomFieldFormPayload,
  buildCustomValuesPayload,
  CustomFieldFormSection,
  validateCustomFields,
} from '../../../components/custom-fields/CustomFieldFormSection.tsx';
import { useCustomFieldSchema } from '../../../components/custom-fields/useCustomFieldSchema.ts';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import {
  SaleDeliveryPackageUnitField,
  type SaleDeliveryPackageUnitOption,
} from '../../../components/sale-delivery/SaleDeliveryPackageUnitField.tsx';
import {
  type SelectedStockLocation,
  StockLocationField,
} from '../../warehouse/components/StockLocationField.tsx';
import { today } from '../../../../core/utils/date';
import { formatQtyWithUnit, formatUnitLabel } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';

interface SaleOrderShipSheetProps {
  visible: boolean;
  order: SaleOrder;
  onClose: () => void;
  onSuccess: () => void;
}

interface ShipItemDraft {
  source: SaleOrderItem;
  quantity: string;
  batchNo: string;
  location: SelectedStockLocation | null;
  storageLocation: string;
  packageUnitId?: string;
  packageUnitLineId?: string;
  packageUnitNo?: string;
  customValues: Record<string, unknown>;
}

function createClientRequestId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ?? `app-sale-ship-${Math.random().toString(36).slice(2, 14)}`
  );
}

function toDraft(item: SaleOrderItem): ShipItemDraft {
  const remainingQty = Math.max(Number(item.remainingQty ?? 0), 0);
  return {
    source: item,
    quantity: String(remainingQty),
    batchNo: '',
    location: null,
    storageLocation: '',
    customValues: {},
  };
}

function materialLabel(item: SaleOrderItem): string {
  const material = item.material;
  return `${material?.name ?? item.materialId}${material?.code ? `（${material.code}）` : ''}`;
}

interface ShipItemLocationFieldProps {
  index: number;
  item: ShipItemDraft;
  warehouseId: string;
  updateItem: (index: number, patch: Partial<ShipItemDraft>) => void;
}

function ShipItemLocationField({
  index,
  item,
  warehouseId,
  updateItem,
}: ShipItemLocationFieldProps) {
  const handleChange = useCallback(
    (location: SelectedStockLocation | null) => {
      updateItem(index, { location });
    },
    [index, updateItem],
  );
  const handleStorageLocationChange = useCallback(
    (storageLocation: string) => {
      updateItem(index, { storageLocation });
    },
    [index, updateItem],
  );

  return (
    <StockLocationField
      label="出库仓位"
      action="stock/out"
      warehouseId={warehouseId}
      materialId={item.source.materialId}
      batchNo={item.batchNo.trim() || undefined}
      value={item.location}
      onChange={handleChange}
      storageLocation={item.storageLocation}
      onStorageLocationChange={handleStorageLocationChange}
      showStorageLocationText
    />
  );
}

export function SaleOrderShipSheet({
  visible,
  order,
  onClose,
  onSuccess,
}: SaleOrderShipSheetProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const saleDeliveryItemCustomFieldSchema = useCustomFieldSchema('sale_delivery_item');
  const [items, setItems] = useState<ShipItemDraft[]>([]);
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [deliveryDate, setDeliveryDate] = useState(today());
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [deliveryCustomFields, setDeliveryCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [deliveryCustomFieldSchemaVersion, setDeliveryCustomFieldSchemaVersion] = useState<
    number | null
  >(null);
  const [deliveryCustomValues, setDeliveryCustomValues] = useState<Record<string, unknown>>({});
  const [deliveryCustomFieldErrors, setDeliveryCustomFieldErrors] = useState<
    Record<string, string>
  >({});
  const [itemCustomFieldErrors, setItemCustomFieldErrors] = useState<
    Record<string, Record<string, string>>
  >({});
  const [deliveryCustomFieldsLoading, setDeliveryCustomFieldsLoading] = useState(false);
  const [deliveryCustomFieldsLoadError, setDeliveryCustomFieldsLoadError] = useState<string | null>(
    null,
  );

  const confirmCreditOverride = useCallback(
    (message: string): Promise<boolean> =>
      new Promise((resolve) => {
        confirmAlert(
          '信用额度超限',
          message,
          () => resolve(true),
          '继续出库',
          true,
          () => resolve(false),
        );
      }),
    [],
  );

  useEffect(() => {
    if (!visible) return;
    setItems((order.items ?? []).map(toDraft).filter((item) => Number(item.quantity) > 0));
    setWarehouse(null);
    setDeliveryDate(today());
    setRemarks('');
    setRequestId(createClientRequestId());
    setDeliveryCustomFields([]);
    setDeliveryCustomFieldSchemaVersion(null);
    setDeliveryCustomValues({});
    setDeliveryCustomFieldErrors({});
    setItemCustomFieldErrors({});
    setDeliveryCustomFieldsLoading(true);
    setDeliveryCustomFieldsLoadError(null);
    let active = true;
    void customFieldService
      .formSchema('sale_delivery')
      .then((schema) => {
        if (!active) return;
        setDeliveryCustomFields(schema?.fields ?? []);
        setDeliveryCustomFieldSchemaVersion(schema?.schemaVersion ?? null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setDeliveryCustomFieldsLoadError(
          error instanceof Error ? error.message : '销售出库单自定义字段加载失败',
        );
      })
      .finally(() => {
        if (active) setDeliveryCustomFieldsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [order, visible]);

  const updateItem = useCallback((index: number, patch: Partial<ShipItemDraft>) => {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );
  }, []);

  const handleSelectPackageUnit = useCallback(
    (index: number, unit: SaleDeliveryPackageUnitOption | null) => {
      if (!unit) {
        updateItem(index, {
          packageUnitId: undefined,
          packageUnitLineId: undefined,
          packageUnitNo: undefined,
          batchNo: '',
          location: null,
          storageLocation: '',
        });
        return;
      }
      const primaryLine = unit.lines && unit.lines.length === 1 ? unit.lines[0] : undefined;
      if (!primaryLine?.id) {
        toast.info('当前仅支持选择单明细包装箱发货，请先确认包装内容');
        return;
      }
      const locationName = primaryLine.storageLocationSnapshot || '已选仓位';
      updateItem(index, {
        packageUnitId: unit.id,
        packageUnitLineId: primaryLine.id,
        packageUnitNo: unit.packageNo,
        quantity: String(primaryLine.qty ?? unit.totalQty ?? 0),
        batchNo: primaryLine.batchNo ?? unit.batchNo ?? '',
        location:
          primaryLine.locationId && warehouse
            ? {
                id: primaryLine.locationId,
                warehouseId: warehouse.id,
                code: '',
                name: locationName,
                pathName: locationName,
              }
            : null,
        storageLocation: primaryLine.storageLocationSnapshot ?? '',
      });
    },
    [updateItem, warehouse],
  );

  const handleSubmit = useCallback(async () => {
    if (!warehouse || !requestId) return;
    if (deliveryCustomFieldsLoading || deliveryCustomFieldsLoadError) {
      toast.info('销售出库单自定义字段尚未成功加载，请稍后重试');
      return;
    }
    if (saleDeliveryItemCustomFieldSchema.loading || saleDeliveryItemCustomFieldSchema.loadError) {
      toast.info('销售出库明细自定义字段尚未成功加载，请稍后重试');
      return;
    }
    const preparedItems = items.map((item) => ({
      ...item,
      quantity: Number(item.quantity || 0),
      maxQuantity: Math.max(Number(item.source.remainingQty ?? 0), 0),
    }));
    const validItems = preparedItems.filter((item) => item.quantity > 0);
    if (validItems.length === 0) {
      toast.info('至少填写一行本次出库数量');
      return;
    }
    const invalid = validItems.find(
      (item) =>
        !Number.isFinite(item.quantity) ||
        item.quantity > item.maxQuantity ||
        (item.source.material?.hasBatchTracking && !item.batchNo.trim() && !item.packageUnitId),
    );
    if (invalid) {
      toast.info('请检查出库数量及批号');
      return;
    }

    const nextItemCustomFieldErrors: Record<string, Record<string, string>> = {};
    for (const item of validItems) {
      const customErrors = validateCustomFields(
        saleDeliveryItemCustomFieldSchema.fields,
        item.customValues,
        'create',
      );
      if (Object.keys(customErrors).length > 0) {
        nextItemCustomFieldErrors[item.source.id] = customErrors;
      }
    }
    setItemCustomFieldErrors(nextItemCustomFieldErrors);
    if (Object.keys(nextItemCustomFieldErrors).length > 0) {
      toast.info('请完善出库明细自定义字段');
      return;
    }

    const customFieldErrors = validateCustomFields(
      deliveryCustomFields,
      deliveryCustomValues,
      'create',
    );
    setDeliveryCustomFieldErrors(customFieldErrors);
    if (Object.keys(customFieldErrors).length > 0) {
      toast.info('请完善销售出库单自定义字段');
      return;
    }
    const customValues = buildCustomValuesPayload(deliveryCustomFields, deliveryCustomValues);
    setSubmitting(true);
    try {
      const shipPayload = {
        saleOrderId: order.id,
        warehouseId: warehouse.id,
        deliveryDate: deliveryDate || undefined,
        remarks: remarks.trim() || undefined,
        clientRequestId: requestId,
        ...(deliveryCustomFieldSchemaVersion !== null && Object.keys(customValues).length > 0
          ? {
              customFieldSchemaVersion: deliveryCustomFieldSchemaVersion,
              customValues,
            }
          : {}),
        items: validItems.map((item) => ({
          saleOrderItemId: item.source.id,
          materialId: item.source.materialId,
          quantity: item.quantity,
          batchNo: item.batchNo.trim() || undefined,
          locationId: item.location?.id,
          storageLocation: item.storageLocation.trim() || undefined,
          packageUnitId: item.packageUnitId,
          packageUnitLineId: item.packageUnitLineId,
          ...buildCustomFieldFormPayload(
            saleDeliveryItemCustomFieldSchema.fields,
            saleDeliveryItemCustomFieldSchema.schemaVersion,
            item.customValues,
          ),
        })),
      };
      let result: Awaited<ReturnType<typeof saleDeliveryService.ship>>;
      try {
        result = await saleDeliveryService.ship(shipPayload);
      } catch (error: unknown) {
        if (!(error instanceof ApiBusinessError) || error.code !== 4001) throw error;
        const proceed = await confirmCreditOverride(error.message);
        if (!proceed) return;
        result = await saleDeliveryService.ship({ ...shipPayload, skipCreditCheck: true });
      }
      toast.success(result.message);
      onSuccess();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '出库失败');
    } finally {
      setSubmitting(false);
    }
  }, [
    confirmCreditOverride,
    deliveryDate,
    deliveryCustomFieldSchemaVersion,
    deliveryCustomFields,
    deliveryCustomFieldsLoadError,
    deliveryCustomFieldsLoading,
    deliveryCustomValues,
    items,
    onSuccess,
    order.id,
    remarks,
    requestId,
    saleDeliveryItemCustomFieldSchema.fields,
    saleDeliveryItemCustomFieldSchema.loadError,
    saleDeliveryItemCustomFieldSchema.loading,
    saleDeliveryItemCustomFieldSchema.schemaVersion,
    warehouse,
  ]);

  const canSubmit = Boolean(
    warehouse &&
    items.length > 0 &&
    !submitting &&
    !deliveryCustomFieldsLoading &&
    !deliveryCustomFieldsLoadError &&
    !saleDeliveryItemCustomFieldSchema.loading &&
    !saleDeliveryItemCustomFieldSchema.loadError,
  );
  const confirmDisabledHint = submitting
    ? '正在提交销售出库，请稍候'
    : !warehouse
      ? '请选择出库仓库'
      : items.length === 0
        ? '当前订单没有可出库数量'
        : deliveryCustomFieldsLoading
          ? '正在加载销售出库单字段，请稍候'
          : deliveryCustomFieldsLoadError
            ? '销售出库单字段加载失败，请检查网络后重试'
            : undefined;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="销售订单出库"
      subtitle={`${order.orderNo} · ${order.partnerNameSnapshot ?? order.customer?.name ?? '客户'}`}
      confirmText="确认出库"
      onConfirm={handleSubmit}
      loading={submitting}
      disabled={!canSubmit}
      confirmDisabledHint={confirmDisabledHint}
      avoidKeyboard
      maxHeightRatio={0.92}
    >
      <WarehousePickerField
        label="出库仓库"
        required
        value={warehouse}
        onChange={(nextWarehouse) => {
          if (nextWarehouse?.id === warehouse?.id) {
            setWarehouse(nextWarehouse);
            return;
          }
          setWarehouse(nextWarehouse);
          setItems((current) =>
            current.map((item) => ({
              ...item,
              batchNo: '',
              location: null,
              storageLocation: '',
              packageUnitId: undefined,
              packageUnitLineId: undefined,
              packageUnitNo: undefined,
            })),
          );
        }}
        placeholder="请选择出库仓库"
        clearable={false}
      />
      <DatePickerField
        label="出库日期"
        value={deliveryDate}
        onChange={setDeliveryDate}
        showCurrentShortcut
        required
        clearable={false}
      />
      <CustomFieldFormSection
        title="销售出库单自定义字段"
        fields={deliveryCustomFields}
        values={deliveryCustomValues}
        errors={deliveryCustomFieldErrors}
        mode="create"
        loading={deliveryCustomFieldsLoading}
        loadError={deliveryCustomFieldsLoadError}
        onChange={(fieldKey, value) => {
          setDeliveryCustomValues((current) => ({
            ...current,
            [fieldKey]: value,
          }));
          setDeliveryCustomFieldErrors((current) => {
            if (!current[fieldKey]) return current;
            const next = { ...current };
            delete next[fieldKey];
            return next;
          });
        }}
      />
      {items.length === 0 ? (
        <View style={[styles.notice, { backgroundColor: colors.warningSurface }]}>
          <Text style={[styles.noticeText, { color: colors.warning }]}>当前订单没有可出库数量</Text>
        </View>
      ) : (
        items.map((item, index) => {
          const source = item.source;
          const material = source.material;
          const unit = formatUnitLabel(material?.unit, unitLabelMap);
          const remainingQty = Math.max(Number(source.remainingQty ?? 0), 0);
          return (
            <DetailCard key={source.id} title={`明细 ${index + 1}`}>
              <View style={styles.itemHeader}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {materialLabel(source)}
                </Text>
                <Text style={[styles.itemHint, { color: colors.textSecondary }]}>
                  可出 {formatQtyWithUnit(remainingQty, material?.unit, unitLabelMap)}
                </Text>
              </View>
              <Text style={[styles.itemHint, { color: colors.textSecondary }]}>
                订单量 {formatQtyWithUnit(source.quantity, material?.unit, unitLabelMap)}
                {source.shippedQty != null
                  ? ` · 已出 ${formatQtyWithUnit(source.shippedQty, material?.unit, unitLabelMap)}`
                  : ''}
              </Text>
              {item.packageUnitId ? (
                <FormField label="本次出库数量" value={item.quantity} editable={false} />
              ) : (
                <QuickNumInput
                  label="本次出库数量"
                  value={item.quantity}
                  onChangeText={(value) => updateItem(index, { quantity: value })}
                  min={0}
                  max={remainingQty}
                  precision={4}
                  unit={unit}
                  hint={`最大 ${remainingQty} ${unit}`}
                />
              )}
              {item.packageUnitId ? (
                <Text style={[styles.itemHint, { color: colors.textSecondary }]}>
                  数量、批号和仓位由包装箱带出。
                </Text>
              ) : null}
              {material?.traceabilityMode !== 'serial' ? (
                <SaleDeliveryPackageUnitField
                  warehouseId={warehouse?.id}
                  materialId={source.materialId}
                  batchNo={item.batchNo}
                  value={
                    item.packageUnitId && item.packageUnitNo
                      ? { id: item.packageUnitId, packageNo: item.packageUnitNo }
                      : null
                  }
                  onChange={(nextUnit) => handleSelectPackageUnit(index, nextUnit)}
                />
              ) : null}
              {material?.hasBatchTracking ? (
                <ExistingBatchPickerField
                  materialId={source.materialId}
                  warehouseId={warehouse?.id}
                  value={item.batchNo}
                  onChangeBatchNo={(batchNo) =>
                    updateItem(
                      index,
                      batchNo === item.batchNo
                        ? { batchNo }
                        : {
                            batchNo,
                            location: null,
                            storageLocation: '',
                            packageUnitId: undefined,
                            packageUnitLineId: undefined,
                            packageUnitNo: undefined,
                          },
                    )
                  }
                  label="批号"
                  required={Number(item.quantity || 0) > 0 && !item.packageUnitId}
                  mode="outbound"
                  placeholder="扫码或选择出库批号"
                  disabled={Boolean(item.packageUnitId)}
                  disabledReason="已选包装箱，批号由包装箱带出"
                />
              ) : (
                <FormField
                  label="批号（选填）"
                  value={item.batchNo}
                  onChangeText={(batchNo) => updateItem(index, { batchNo })}
                  placeholder="可选"
                  editable={!item.packageUnitId}
                />
              )}
              {warehouse ? (
                item.packageUnitId ? (
                  <FormField
                    label="出库仓位"
                    value={item.storageLocation || item.location?.pathName || '由包装箱带出'}
                    editable={false}
                  />
                ) : (
                  <ShipItemLocationField
                    index={index}
                    item={item}
                    warehouseId={warehouse.id}
                    updateItem={updateItem}
                  />
                )
              ) : null}
              <CustomFieldFormSection
                fields={saleDeliveryItemCustomFieldSchema.fields}
                values={item.customValues}
                errors={itemCustomFieldErrors[item.source.id] ?? {}}
                mode="create"
                loading={saleDeliveryItemCustomFieldSchema.loading}
                loadError={saleDeliveryItemCustomFieldSchema.loadError}
                showSection={false}
                onChange={(fieldKey, value) => {
                  updateItem(index, {
                    customValues: { ...item.customValues, [fieldKey]: value },
                  });
                  setItemCustomFieldErrors((current) => {
                    if (!current[item.source.id]?.[fieldKey]) return current;
                    const nextItemErrors = { ...current[item.source.id] };
                    delete nextItemErrors[fieldKey];
                    return { ...current, [item.source.id]: nextItemErrors };
                  });
                }}
              />
            </DetailCard>
          );
        })
      )}
      <FormField
        label="出库备注"
        value={remarks}
        onChangeText={setRemarks}
        placeholder="可选"
        multiline
        numberOfLines={2}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  notice: {
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  noticeText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  itemTitle: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  itemHint: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
});
