import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { type ScheduleEntry, scheduleService } from '../../../host/services';
import { EquipmentListDto } from '../../../types/models/EquipmentListDto';
import { type Equipment, equipmentService } from '../../../host/services';
import { userService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import type { WorkCenter } from '../../../host/services';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { DetailCard, InfoRow } from '../../../../core/components/DetailCard.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { PickerField } from '../../../../core/components/PickerField.tsx';
import { PAGE_SIZE } from '../../../constants/enums';
import { SCHEDULE_STATUS_CONFIG, WORK_ORDER_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import type { RootStackParamList } from '../../../host/navigation';
import { formatDateTime, toDateTimeStr } from '../../../../core/utils/date';
import { formatQtyWithUnit } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';
import { showScheduleActionableError } from './schedule-error-action.ts';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EditEntryModalProps {
  visible: boolean;
  entry: ScheduleEntry | null;
  onClose: () => void;
  onSaved: () => void;
  onUnconfirm?: (entry: ScheduleEntry) => void;
}

function filterEquipmentsForOperation(
  list: Equipment[],
  operation: ScheduleEntry['operation'] | null | undefined,
): Equipment[] {
  let nextList = list;
  if (operation?.equipmentType) {
    nextList = nextList.filter((equipment) => equipment.equipmentType === operation.equipmentType);
  }
  if (operation?.allowedEquipmentIds?.length) {
    const allowedIdSet = new Set(operation.allowedEquipmentIds);
    nextList = nextList.filter((equipment) => allowedIdSet.has(equipment.id));
  }
  return nextList;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditEntryModal({
  visible,
  entry,
  onClose,
  onSaved,
  onUnconfirm,
}: EditEntryModalProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [plannedStart, setPlannedStart] = useState('');
  const [plannedEnd, setPlannedEnd] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [equipmentTouched, setEquipmentTouched] = useState(false);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [assignees, setAssignees] = useState<
    Array<{ id: string; username: string; realName: string | null }>
  >([]);

  const canEdit = entry?.status === 'scheduled' || entry?.status === 'confirmed';
  const isConfirmedEdit = entry?.status === 'confirmed';
  const filteredEquipments = filterEquipmentsForOperation(equipments, entry?.operation);

  const loadEquipments = useCallback(async (wc: WorkCenter) => {
    try {
      const res = await equipmentService.list({
        pageSize: PAGE_SIZE.MEDIUM,
        workCenterId: wc.id,
        statuses: [EquipmentListDto.status.ACTIVE, EquipmentListDto.status.OCCUPIED],
      } as Record<string, unknown>);
      setEquipments(res.list.filter((eq: Equipment) => eq.isActive));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '加载设备失败');
    }
  }, []);

  const loadAssignees = useCallback(async () => {
    try {
      const list = await userService.simpleList();
      setAssignees(list);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '加载人员失败');
    }
  }, []);

  React.useEffect(() => {
    if (visible && entry) {
      setPlannedStart(toDateTimeStr(entry.plannedStart));
      setPlannedEnd(toDateTimeStr(entry.plannedEnd));
      setSelectedEquipment(entry.equipment ? (entry.equipment as unknown as Equipment) : null);
      setEquipmentTouched(false);
      setSelectedAssigneeId(entry.assigneeId ?? '');
      // Load equipments for the current work center
      if (entry.workCenter) loadEquipments(entry.workCenter as WorkCenter);
      loadAssignees();
    }
  }, [visible, entry, loadAssignees, loadEquipments]);

  React.useEffect(() => {
    if (
      selectedEquipment &&
      !filteredEquipments.some((equipment) => equipment.id === selectedEquipment.id)
    ) {
      setSelectedEquipment(null);
    }
  }, [filteredEquipments, selectedEquipment]);

  const handleSave = async () => {
    if (!entry || !plannedStart || (!isConfirmedEdit && !plannedEnd)) {
      toast.info('请填写时间');
      return;
    }
    if (!isConfirmedEdit && new Date(plannedStart) >= new Date(plannedEnd)) {
      toast.error('计划结束时间必须晚于开始时间');
      return;
    }
    setSaving(true);
    try {
      const equipmentPayload = equipmentTouched
        ? selectedEquipment
          ? { equipmentId: selectedEquipment.id }
          : { clearEquipment: true }
        : {};
      const result = await scheduleService.updateEntry({
        id: entry.id,
        ...equipmentPayload,
        assigneeId: selectedAssigneeId || undefined,
        plannedStart: new Date(plannedStart).toISOString(),
        ...(isConfirmedEdit ? {} : { plannedEnd: new Date(plannedEnd).toISOString() }),
      });
      const dependencyMessage = result.dependencyConflictReason ?? result.dependencyWarning;
      const warnings = [
        ...(result.warnings ?? []),
        ...(dependencyMessage ? [dependencyMessage] : []),
      ];
      if (warnings.length) {
        toast.info([...new Set(warnings)].join('\n'), '保存成功');
      } else {
        toast.success('保存成功');
      }
      onSaved();
    } catch (e: unknown) {
      showScheduleActionableError(e, navigation, [entry.workOrder?.routeId], '保存失败', onClose);
    } finally {
      setSaving(false);
    }
  };

  const wo = entry?.workOrder;

  return (
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      title="编辑"
      confirmText={canEdit ? '保存' : undefined}
      onConfirm={canEdit ? handleSave : undefined}
      loading={saving}
      avoidKeyboard
    >
      {/* 工单信息卡片（只读） */}
      <DetailCard title="工单信息" style={styles.card}>
        <InfoRow label="工单号" value={wo?.orderNo ?? '-'} />
        <InfoRow label="产品" value={wo?.material?.name ?? '-'} />
        <InfoRow label="规格" value={wo?.material?.spec || '-'} />
        <InfoRow
          label="计划数量"
          value={
            wo?.plannedQty != null
              ? formatQtyWithUnit(wo.plannedQty, wo.material?.unit, unitLabelMap)
              : '-'
          }
        />
        <InfoRow
          label="工单状态"
          right={
            wo?.status ? (
              <ConfigBadge value={wo.status} config={WORK_ORDER_STATUS_CONFIG} size="sm" />
            ) : undefined
          }
        />
        <InfoRow
          label="排产状态"
          right={
            entry?.status ? (
              <ConfigBadge value={entry.status} config={SCHEDULE_STATUS_CONFIG} size="sm" />
            ) : undefined
          }
        />
        <InfoRow label="工序" value={entry?.operation?.operationName || '-'} last />
      </DetailCard>

      {canEdit ? (
        <View style={styles.editSection}>
          {/* 工作中心（只读，与Admin端保持一致） */}
          <DetailCard title="" style={styles.readOnlyWc}>
            <InfoRow label="工作中心" value={entry?.workCenter?.name ?? '-'} last />
          </DetailCard>

          {/* 设备 */}
          {filteredEquipments.length > 0 && (
            <PickerField
              label="设备（可选）"
              value={selectedEquipment?.id ?? ''}
              options={filteredEquipments.map((eq) => ({
                label: `${eq.name}（${eq.code}）`,
                value: eq.id,
              }))}
              onChange={(id) => {
                setEquipmentTouched(true);
                setSelectedEquipment(filteredEquipments.find((eq) => eq.id === id) ?? null);
              }}
              placeholder="选择设备（可选）"
              clearable
            />
          )}

          {/* 执行人 */}
          {assignees.length > 0 && (
            <PickerField
              label="执行人（可选）"
              value={selectedAssigneeId}
              options={assignees.map((u) => ({ label: u.realName || u.username, value: u.id }))}
              onChange={setSelectedAssigneeId}
              placeholder="选择执行人（可选）"
              clearable
            />
          )}

          {/* 时间 */}
          {isConfirmedEdit && (
            <View style={styles.inlineWarning}>
              <Text style={[styles.hintText, { color: colors.text }]}>
                已确认排产调整关键字段后会自动回退为待确认，并按原工时重算结束时间。
              </Text>
              {onUnconfirm && entry && (
                <TouchableOpacity onPress={() => onUnconfirm(entry)} style={styles.unconfirmBtn}>
                  <Text style={[styles.unconfirmText, { color: colors.warning }]}>
                    先取消确认再改工时
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          <DatePickerField
            label="计划开始"
            value={plannedStart}
            onChange={setPlannedStart}
            mode="datetime"
            placeholder="选择计划开始时间"
            required
          />
          <DatePickerField
            label="计划结束"
            value={plannedEnd}
            onChange={setPlannedEnd}
            mode="datetime"
            placeholder={isConfirmedEdit ? '结束时间已锁定' : '选择计划结束时间'}
            required={!isConfirmedEdit}
            disabled={isConfirmedEdit}
          />
        </View>
      ) : (
        <DetailCard title="排产信息" style={styles.card}>
          <InfoRow label="工作中心" value={entry?.workCenter?.name ?? '-'} />
          <InfoRow label="设备" value={entry?.equipment?.name || '-'} />
          <InfoRow label="负责人" value={entry?.assignee?.realName || '-'} />
          <InfoRow label="计划开始" value={formatDateTime(entry?.plannedStart)} />
          <InfoRow label="计划结束" value={formatDateTime(entry?.plannedEnd)} last />
        </DetailCard>
      )}
    </FullScreenModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.sm },
  editSection: { marginTop: Spacing.xs },
  readOnlyWc: { marginBottom: Spacing.xs },
  inlineWarning: {
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  hintText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  unconfirmBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  unconfirmText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
