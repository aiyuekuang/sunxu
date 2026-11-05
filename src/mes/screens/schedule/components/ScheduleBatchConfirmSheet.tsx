import { StyleSheet, View } from 'react-native';
import type { ScheduleEntry } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatScheduleTime } from '../../../../core/utils/date';

export type ScheduleBatchAction = 'confirm' | 'unconfirm';

interface ScheduleBatchConfirmSheetProps {
  visible: boolean;
  action: ScheduleBatchAction | null;
  entries: ScheduleEntry[];
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function formatQty(value?: number | null, unit?: string | null): string {
  if (value == null) return '—';
  const quantity = Number(value).toLocaleString('zh-CN');
  return unit ? `${quantity} ${unit}` : quantity;
}

export function ScheduleBatchConfirmSheet({
  visible,
  action,
  entries,
  loading,
  onClose,
  onConfirm,
}: ScheduleBatchConfirmSheetProps) {
  const { colors } = useTheme();
  const isConfirm = action === 'confirm';

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={isConfirm ? '批量确认排产' : '批量取消确认排产'}
      subtitle={`将对 ${entries.length} 条排产逐条执行校验`}
      confirmText={isConfirm ? '确认排产' : '取消确认'}
      confirmButtonColor={isConfirm ? colors.success : colors.warning}
      loading={loading}
      closeDisabled={loading}
      maxHeightRatio={0.82}
      onConfirm={onConfirm}
    >
      <View style={styles.content}>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          请核对工单、物料规格和本次排产数量。
        </Text>
        {entries.map((entry) => {
          const material = entry.workOrder?.material;
          const materialIdentity = [
            material?.name,
            material?.code ? `编码 ${material.code}` : undefined,
            material?.spec ? `规格 ${material.spec}` : undefined,
          ]
            .filter(Boolean)
            .join(' · ');
          const plannedQty = entry.workOrder?.plannedQty;
          return (
            <View
              key={entry.id}
              style={[styles.item, { backgroundColor: colors.surfaceSecondary }]}
            >
              <Text style={[styles.orderNo, { color: colors.text }]}>
                {entry.workOrder?.orderNo ?? '工单号缺失'}
              </Text>
              <Text style={[styles.detail, { color: colors.textSecondary }]}>
                物料：{materialIdentity || '未关联物料'}
              </Text>
              <Text style={[styles.detail, { color: colors.textSecondary }]}>
                工单计划量：{formatQty(plannedQty, material?.unit)}；本段排产量：
                {formatQty(entry.splitQty ?? plannedQty, material?.unit)}
              </Text>
              <Text style={[styles.detail, { color: colors.textSecondary }]}>
                工序：{entry.operation?.operationName ?? '—'}；计划时间：
                {formatScheduleTime(new Date(entry.plannedStart))} —{' '}
                {formatScheduleTime(new Date(entry.plannedEnd))}
              </Text>
            </View>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  hint: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  item: {
    gap: 4,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  orderNo: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  detail: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
});
