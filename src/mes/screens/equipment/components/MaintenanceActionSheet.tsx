import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { EquipmentMaintenance } from '../../../host/services';
import { equipmentService } from '../../../host/services';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { confirmAlert } from '../../../../core/components/ConfirmAlert.ts';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { InfoRow } from '../../../../core/components/DetailCard.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { EQUIPMENT_MAINTENANCE_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useDict } from '../../../host/hooks/useDict';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDate, today } from '../../../../core/utils/date';
import { toast } from '../../../../core/toast';
import {
  MAINTENANCE_GENERATION_MODE_LABELS,
  MAINTENANCE_RECURRENCE_STATUS_LABELS,
} from '../maintenance.constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MaintenanceActionSheetProps {
  /** 当前选中的保养记录，null 时隐藏弹窗 */
  item: EquipmentMaintenance | null;
  /** 是否有保养更新权限，默认 true */
  canUpdate?: boolean;
  /** 是否有保养删除权限，默认 false */
  canDelete?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MaintenanceActionSheet({
  item,
  canUpdate = true,
  canDelete = false,
  onClose,
  onSuccess,
}: MaintenanceActionSheetProps) {
  const { colors } = useTheme();
  const { labelMap: maintenanceTypeLabelMap } = useDict('maintenance_type');
  const [completedDate, setCompletedDate] = useState('');
  const [result, setResult] = useState('');
  const [saving, setSaving] = useState(false);
  const maintenanceId = item?.id;
  const actions = item?.availableActions;

  const canComplete = canUpdate && !!item && (actions?.includes('complete') ?? false);
  const canCancel = canUpdate && !!item && (actions?.includes('cancel') ?? false);
  const canStopRecurring = canUpdate && !!item && (actions?.includes('stopRecurring') ?? false);
  const canRemove = canDelete && !!item && (actions?.includes('delete') ?? false);

  useEffect(() => {
    if (canComplete && maintenanceId) setCompletedDate(today());
  }, [canComplete, maintenanceId]);

  const handleClose = () => {
    setCompletedDate('');
    setResult('');
    onClose();
  };

  const handleComplete = async () => {
    if (!item) return;
    if (!completedDate) {
      toast.error('请填写完成日期');
      return;
    }
    setSaving(true);
    try {
      await equipmentService.completeMaintenance({
        id: item.id,
        completedDate,
        result: result || undefined,
      });
      toast.success('保养已完成');
      setCompletedDate('');
      setResult('');
      onSuccess();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '完成保养失败');
    } finally {
      setSaving(false);
    }
  };

  const handleStopRecurring = () => {
    if (!item) return;
    confirmAlert(
      '停止重复',
      '停止后将不再自动生成新的保养单。',
      async () => {
        try {
          await equipmentService.stopMaintenanceRecurring(item.id);
          toast.success('已停止重复计划');
          onSuccess();
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : '停止重复失败');
        }
      },
      '停止',
      false,
    );
  };

  const handleCancel = () => {
    if (!item) return;
    confirmAlert(
      '取消保养',
      '取消后当前保养将不再继续执行。',
      async () => {
        try {
          await equipmentService.cancelMaintenance(item.id);
          toast.success('已取消保养');
          onSuccess();
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : '取消保养失败');
        }
      },
      '取消保养',
      true,
    );
  };

  const handleDelete = () => {
    if (!item) return;
    confirmAlert(
      '删除保养',
      '删除后当前保养记录及关联审批记录将一并移除，且不可恢复。',
      async () => {
        try {
          await equipmentService.deleteMaintenance(item.id);
          toast.success('已删除保养记录');
          onSuccess();
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : '删除保养失败');
        }
      },
      '删除',
      true,
    );
  };

  return (
    <FullScreenModal
      visible={!!item}
      onClose={handleClose}
      title="保养详情"
      renderFooter={
        canComplete || canCancel || canStopRecurring || canRemove
          ? () => (
              <View style={styles.footer}>
                {canStopRecurring && (
                  <TextButton label="停止重复" variant="secondary" onPress={handleStopRecurring} />
                )}
                {canCancel && (
                  <TextButton label="取消保养" variant="secondary" onPress={handleCancel} />
                )}
                {canRemove && (
                  <TextButton label="删除记录" variant="danger" onPress={handleDelete} />
                )}
                {canComplete && (
                  <TextButton label="完成保养" onPress={handleComplete} loading={saving} />
                )}
              </View>
            )
          : undefined
      }
      loading={saving}
      avoidKeyboard
    >
      {item && (
        <View style={styles.body}>
          {/* 保养信息 */}
          <View style={styles.infoSection}>
            <View style={styles.headerRow}>
              <Text style={[styles.maintenanceNo, { color: colors.text }]}>
                {item.maintenanceNo}
              </Text>
              <ConfigBadge value={item.status} config={EQUIPMENT_MAINTENANCE_STATUS_CONFIG} />
            </View>
            <InfoRow label="计划日期" value={formatDate(item.plannedDate)} />
            <InfoRow
              label="保养类型"
              value={item.type ? (maintenanceTypeLabelMap[item.type] ?? item.type) : '-'}
            />
            <InfoRow label="执行人" value={item.assignee?.realName ?? '-'} />
            {(item.generationMode || item.intervalDays != null || item.nextDueDate) && (
              <InfoRow
                label="重复状态"
                value={
                  MAINTENANCE_RECURRENCE_STATUS_LABELS[
                    item.plan?.isActive === false ? 'inactive' : 'active'
                  ]
                }
              />
            )}
            {item.generationMode && (
              <InfoRow
                label="重复方式"
                value={
                  MAINTENANCE_GENERATION_MODE_LABELS[item.generationMode] ?? item.generationMode
                }
              />
            )}
            {item.intervalDays != null && (
              <InfoRow label="间隔天数" value={`${item.intervalDays} 天`} />
            )}
            {item.plan?.isActive !== false && item.nextDueDate && (
              <InfoRow label="下次保养日期" value={formatDate(item.nextDueDate)} />
            )}
            {item.description && <InfoRow label="说明" value={item.description} />}
            {item.completedDate && (
              <InfoRow label="完成日期" value={formatDate(item.completedDate)} />
            )}
            {item.result && <InfoRow label="保养结果" value={item.result} last />}
          </View>

          {/* 完成保养表单（仅在可操作状态时显示） */}
          {canComplete && (
            <View style={[styles.formSection, { borderTopColor: colors.borderLight }]}>
              <Text style={[styles.formTitle, { color: colors.text }]}>完成保养</Text>
              <DatePickerField
                label="完成日期"
                value={completedDate}
                onChange={setCompletedDate}
                showCurrentShortcut
                required
              />
              <FormField
                label="保养结果"
                value={result}
                onChangeText={setResult}
                placeholder="填写保养结果或备注..."
                multiline
                numberOfLines={3}
              />
            </View>
          )}
        </View>
      )}
    </FullScreenModal>
  );
}

function TextButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.footerBtnWrap}>
      <TouchableOpacity
        disabled={loading}
        activeOpacity={loading ? 1 : 0.7}
        onPress={onPress}
        style={[
          styles.footerBtn,
          variant === 'primary'
            ? { backgroundColor: colors.primary }
            : variant === 'danger'
              ? { backgroundColor: colors.error }
              : {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: StyleSheet.hairlineWidth,
                },
        ]}
      >
        {loading ? (
          <InlineLoading
            color={
              variant === 'primary' || variant === 'danger' ? colors.textOnPrimary : colors.text
            }
          />
        ) : (
          <Text
            style={[
              styles.footerBtnText,
              {
                color:
                  variant === 'primary' || variant === 'danger'
                    ? colors.textOnPrimary
                    : colors.text,
              },
            ]}
          >
            {label}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  body: {
    gap: Spacing.sm,
  },
  infoSection: {
    gap: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  maintenanceNo: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  formSection: {
    borderTopWidth: 0.5,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  formTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  footerBtnWrap: {
    flex: 1,
  },
  footerBtn: {
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  footerBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
