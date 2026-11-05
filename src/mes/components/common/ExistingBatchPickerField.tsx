import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { InventoryOwnerType } from '../../types/models/InventoryOwnerType';
import { type BatchListDto, batchService, type MaterialBatch } from '../../host/services';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { EntityPickerField } from '../../../core/components/EntityPickerField.tsx';
import { EntityPickerModal } from '../../../core/components/EntityPickerModal.tsx';
import { BATCH_STATUS_LABELS } from '../../constants/status-configs';
import { FontSize, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET_ANDROID, Spacing } from '../../../core/theme/tokens';
import { useTheme } from '../../../core/theme/useTheme';
import { today } from '../../../core/utils/date';
import { formatNumber } from '../../../core/utils/format';
import { toast } from '../../../core/toast';

interface ExistingBatchPickerFieldProps {
  materialId?: string | null;
  warehouseId?: string | null;
  value?: string;
  onChangeBatchNo: (batchNo: string) => void;
  onSelectBatch?: (batch: MaterialBatch | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  /** 与独立扫码输入并存时可关闭选择器内的扫码按钮。 */
  scannable?: boolean;
  /** 与手动/扫码输入共用同一批号字段时，只渲染“选择已有批号”动作，不重复显示字段。 */
  presentation?: 'field' | 'action';
  /** 动作模式下的按钮文案 */
  actionLabel?: string;
  mode?: 'outbound' | 'inbound';
  sourceDocType?: BatchListDto['sourceDocType'];
  ownerType?: InventoryOwnerType | BatchListDto['ownerType'];
  ownerRefId?: string | null;
  customerId?: string | null;
}

type OwnerScopedBatchListParams = Omit<BatchListDto, 'ownerType'> & {
  ownerType?: BatchListDto['ownerType'];
  ownerRefId?: string;
  customerId?: string;
};

function buildBatchSublabel(batch: MaterialBatch): string {
  const statusText = batch.status ? BATCH_STATUS_LABELS[batch.status] : '';
  const ownerText =
    batch.ownerType === InventoryOwnerType.CUSTOMER
      ? '客户库存'
      : batch.ownerType === InventoryOwnerType.SUPPLIER
        ? '供应商货主'
        : '公司库存';
  const extras = [
    ownerText,
    statusText,
    `库存 ${formatNumber(batch.qty, { fallback: '0' })}`,
    batch.warehouse?.name,
  ].filter(Boolean);
  return extras.join(' · ');
}

function isBatchSelectable(
  batch: MaterialBatch,
  mode: NonNullable<ExistingBatchPickerFieldProps['mode']>,
): boolean {
  if (!batch.batchNo) return false;
  if (mode === 'inbound') {
    return batch.status !== 'consumed';
  }
  return batch.status === 'available' && (!batch.expiryDate || batch.expiryDate >= today());
}

function resolveServerStatus(
  mode: NonNullable<ExistingBatchPickerFieldProps['mode']>,
): BatchListDto['status'] | undefined {
  return mode === 'outbound' ? ('available' as BatchListDto['status']) : undefined;
}

export function ExistingBatchPickerField({
  materialId,
  warehouseId,
  value,
  onChangeBatchNo,
  onSelectBatch,
  label = '已有批号',
  placeholder = '选择已有批号（优先推荐）',
  required = false,
  disabled = false,
  disabledReason: explicitDisabledReason,
  scannable = true,
  presentation = 'field',
  actionLabel = '选择已有批号',
  mode = 'outbound',
  sourceDocType,
  ownerType,
  ownerRefId,
  customerId,
}: ExistingBatchPickerFieldProps) {
  const { colors } = useTheme();
  const [selectedBatch, setSelectedBatch] = useState<MaterialBatch | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const scopeRef = useRef({ materialId, warehouseId, ownerType, ownerRefId, customerId, mode });
  const lookupRef = useRef(0);

  useEffect(() => {
    const previous = scopeRef.current;
    const scopeChanged =
      previous.materialId !== materialId ||
      previous.warehouseId !== warehouseId ||
      previous.ownerType !== ownerType ||
      previous.ownerRefId !== ownerRefId ||
      previous.customerId !== customerId ||
      previous.mode !== mode;
    scopeRef.current = { materialId, warehouseId, ownerType, ownerRefId, customerId, mode };
    if (!scopeChanged) return;
    setSelectedBatch(null);
    if (value) onChangeBatchNo('');
  }, [customerId, materialId, mode, onChangeBatchNo, ownerRefId, ownerType, value, warehouseId]);

  useEffect(() => {
    if (!value) {
      setSelectedBatch(null);
      return;
    }

    if (selectedBatch && selectedBatch.batchNo !== value) {
      setSelectedBatch(null);
    }
  }, [selectedBatch, value]);

  useEffect(() => {
    if (presentation === 'action') return;
    if (!value || selectedBatch?.batchNo === value || !materialId) return;
    const lookupId = ++lookupRef.current;
    void batchService
      .list({
        page: 1,
        pageSize: 100,
        batchNo: value,
        materialId,
        warehouseId: warehouseId || undefined,
        status: resolveServerStatus(mode),
        excludeExpired: mode === 'outbound',
        sourceDocType,
        ownerType: ownerType as BatchListDto['ownerType'],
        ownerRefId: ownerRefId ?? undefined,
        customerId: customerId ?? undefined,
      })
      .then((result) => {
        if (lookupId !== lookupRef.current) return;
        const matches = (result.list ?? []).filter(
          (batch) => batch.batchNo === value && isBatchSelectable(batch, mode),
        );
        setSelectedBatch(matches.length === 1 ? matches[0] : null);
      })
      .catch(() => {
        if (lookupId === lookupRef.current) setSelectedBatch(null);
      });
    return () => {
      lookupRef.current += 1;
    };
  }, [
    customerId,
    materialId,
    mode,
    ownerRefId,
    ownerType,
    presentation,
    selectedBatch?.batchNo,
    sourceDocType,
    value,
    warehouseId,
  ]);

  const handleSelectBatch = useCallback(
    (batch: MaterialBatch | null) => {
      setSelectedBatch(batch);
      onChangeBatchNo(batch?.batchNo ?? '');
      onSelectBatch?.(batch);
    },
    [onChangeBatchNo, onSelectBatch],
  );

  const fetchBatches = useCallback(
    async ({ page, pageSize, keyword }: { page: number; pageSize: number; keyword?: string }) => {
      if (!materialId) {
        return { list: [], total: 0 };
      }
      const params: OwnerScopedBatchListParams = {
        page,
        pageSize,
        keyword,
        materialId,
        warehouseId: warehouseId || undefined,
        status: resolveServerStatus(mode),
        sourceDocType,
        ownerType: ownerType as BatchListDto['ownerType'],
        ownerRefId: ownerRefId ?? undefined,
        customerId: customerId ?? undefined,
      };
      const result = await batchService.list(params);
      return {
        list: (result.list ?? []).filter((batch) => isBatchSelectable(batch, mode)),
        total: result.total ?? 0,
      };
    },
    [customerId, materialId, mode, ownerRefId, ownerType, sourceDocType, warehouseId],
  );

  const handleScanBatch = useCallback(
    (code: string) => {
      const batchNo = code.trim();
      if (!batchNo) return;
      if (!materialId) {
        toast.info('请先选择物料');
        return;
      }
      if (mode === 'outbound' && !warehouseId) {
        toast.info('请先选择出库仓');
        return;
      }

      void batchService
        .list({
          page: 1,
          pageSize: 100,
          batchNo,
          materialId,
          warehouseId: warehouseId || undefined,
          status: resolveServerStatus(mode),
          excludeExpired: mode === 'outbound',
          sourceDocType,
          ownerType: ownerType as BatchListDto['ownerType'],
          ownerRefId: ownerRefId ?? undefined,
          customerId: customerId ?? undefined,
        })
        .then((result) => {
          const matches = (result.list ?? []).filter(
            (batch) => batch.batchNo === batchNo && isBatchSelectable(batch, mode),
          );
          if (matches.length !== 1) {
            toast.info(
              matches.length === 0
                ? '当前物料和库存范围内未找到可选批号'
                : '批号匹配多条记录，请从列表中选择',
            );
            return;
          }

          const [batch] = matches;
          setSelectedBatch(batch);
          onChangeBatchNo(batch.batchNo);
          onSelectBatch?.(batch);
          toast.success(`已选择批号 ${batch.batchNo}`);
        })
        .catch((error: unknown) => {
          toast.error(error instanceof Error ? error.message : '批号查询失败');
        });
    },
    [
      customerId,
      materialId,
      mode,
      onChangeBatchNo,
      onSelectBatch,
      ownerRefId,
      ownerType,
      sourceDocType,
      warehouseId,
    ],
  );

  const prerequisitePlaceholder = !materialId
    ? '请先选择物料'
    : mode === 'outbound' && !warehouseId
      ? '请先选择出库仓'
      : placeholder;
  const disabledReason = !materialId
    ? '请先选择物料'
    : mode === 'outbound' && !warehouseId
      ? '请先选择出库仓后再选择批号'
      : explicitDisabledReason;
  const actionDisabled = disabled || !materialId || (mode === 'outbound' && !warehouseId);

  if (presentation === 'action') {
    return (
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.7}
          disabled={actionDisabled}
          accessibilityRole="button"
          accessibilityState={{ disabled: actionDisabled }}
          accessibilityHint={actionDisabled ? disabledReason : '打开已有批号列表'}
        >
          <Text
            style={[
              styles.actionText,
              { color: actionDisabled ? colors.textMuted : colors.primary },
            ]}
          >
            {actionLabel}
          </Text>
        </TouchableOpacity>
        {actionDisabled && disabledReason ? (
          <Text style={[styles.actionHint, { color: colors.textTertiary }]}>{disabledReason}</Text>
        ) : null}
        <EntityPickerModal<MaterialBatch>
          visible={pickerVisible}
          title="选择已有批号"
          fetchFn={fetchBatches}
          keyExtractor={(batch) => batch.id}
          labelExtractor={(batch) => batch.batchNo}
          sublabelExtractor={buildBatchSublabel}
          initialSelected={selectedBatch ? [selectedBatch] : []}
          multi={false}
          onClose={() => setPickerVisible(false)}
          onConfirm={([batch]) => {
            setPickerVisible(false);
            handleSelectBatch(batch ?? null);
          }}
        />
      </View>
    );
  }

  return (
    <EntityPickerField<MaterialBatch>
      label={label}
      required={required}
      value={selectedBatch}
      onChange={handleSelectBatch}
      fetchFn={fetchBatches}
      keyExtractor={(batch) => batch.id}
      labelExtractor={(batch) => batch.batchNo}
      sublabelExtractor={buildBatchSublabel}
      placeholder={prerequisitePlaceholder}
      disabled={actionDisabled}
      disabledReason={disabledReason}
      clearable
      scannable={scannable}
      onScanResult={scannable ? handleScanBatch : undefined}
    />
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    gap: Spacing.xs,
  },
  actionButton: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    minHeight: Platform.OS === 'android' ? MIN_TOUCH_TARGET_ANDROID : MIN_TOUCH_TARGET,
  },
  actionText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  actionHint: {
    fontSize: FontSize.xs,
  },
});
