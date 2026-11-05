import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ScheduleEntry } from '../../../host/services';
import { ScheduleExecutionSource } from '../../../types/models/ScheduleExecutionSource';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { PickerField, type PickerOption } from '../../../../core/components/PickerField.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDateTime } from '../../../../core/utils/date';
import { toast } from '../../../../core/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StartScheduleEntrySheetProps {
  /** 是否显示选择器 */
  visible: boolean;
  /** 当前可开工的排产实例；由后端候选规则筛选后传入 */
  entries: ScheduleEntry[];
  /** 当前工单号，仅用于向操作者说明上下文 */
  orderNo: string;
  /** 后端开工动作执行中状态 */
  loading?: boolean;
  /** 关闭选择器，不提交开工 */
  onClose: () => void;
  /** 已明确选择实际开工实例后提交 */
  onSubmit: (scheduleEntryId: string) => Promise<void>;
}

function formatScheduleEntryLabel(entry: ScheduleEntry): string {
  const operationName = entry.operation?.operationName ?? '整单执行资源';
  const resource =
    entry.executionSource === ScheduleExecutionSource.OUTSOURCED
      ? (entry.supplier?.name ?? '未指定供应商')
      : [entry.workCenter?.name, entry.equipment?.name].filter(Boolean).join(' / ') ||
        '未指定工作中心或设备';
  return `${operationName} · ${resource} · ${formatDateTime(entry.plannedStart)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StartScheduleEntrySheet({
  visible,
  entries,
  orderNo,
  loading = false,
  onClose,
  onSubmit,
}: StartScheduleEntrySheetProps) {
  const { colors } = useTheme();
  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>();
  const options = useMemo<PickerOption[]>(
    () =>
      entries.map((entry) => ({
        label: formatScheduleEntryLabel(entry),
        value: entry.id,
      })),
    [entries],
  );

  useEffect(() => {
    if (visible) {
      setSelectedEntryId(undefined);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!selectedEntryId) {
      toast.info('请选择实际开工的工作中心或设备');
      return;
    }
    await onSubmit(selectedEntryId);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="选择实际开工资源"
      subtitle={`工单 ${orderNo}`}
      confirmText="确认开工"
      onConfirm={handleSubmit}
      loading={loading}
      closeDisabled={loading}
      disabled={loading}
      maxHeightRatio={0.55}
    >
      <View
        style={[
          styles.notice,
          {
            backgroundColor: colors.warningLight,
            borderColor: colors.warning,
          },
        ]}
      >
        <Text style={[styles.noticeText, { color: colors.text }]}>
          当前工序存在多个可执行排产实例。请按实际开工的工作中心或设备选择，系统将锁定所选实例，其他未开工实例仍可继续排程。
        </Text>
      </View>
      <PickerField
        label="实际开工资源"
        required
        value={selectedEntryId}
        options={options}
        placeholder="请选择工作中心或设备"
        onChange={setSelectedEntryId}
        searchable={entries.length > 5}
      />
    </BottomSheet>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  notice: {
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  noticeText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
