import { Ionicons } from '@expo/vector-icons';
import { today } from '../../../../core/utils/date';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  type CalendarException,
  type CalendarExceptionType,
  type ShiftCalendar,
  scheduleService,
} from '../../../host/services';
import type { CreateCalendarExceptionDto } from '../../../types/models/CreateCalendarExceptionDto';
import type { UpdateCalendarExceptionDto } from '../../../types/models/UpdateCalendarExceptionDto';
import { workCenterService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { DateRangeQuickSelect } from '../../../../core/components/DateRangeQuickSelect.tsx';
import { DrillDownTreePicker, type TreePickerNode } from '../../../../core/components/DrillDownTreePicker.tsx';
import { FormField, FormSwitch } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { PickerField } from '../../../../core/components/PickerField.tsx';
import { PAGE_SIZE } from '../../../constants/enums';
import { CALENDAR_EXCEPTION_TYPE_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExceptionCreateModalProps {
  visible: boolean;
  exception: CalendarException | null;
  onClose: () => void;
  onSaved: () => void;
}

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

// ─── Component ────────────────────────────────────────────────────────────────

export function ExceptionCreateModal({
  visible,
  exception,
  onClose,
  onSaved,
}: ExceptionCreateModalProps) {
  const { colors } = useTheme();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('20:00');
  const [type, setType] = useState<CalendarExceptionType>('holiday');
  const [remarks, setRemarks] = useState('');
  const [workCenterId, setWorkCenterId] = useState<string | null>(null);
  const [workCenterName, setWorkCenterName] = useState('');
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');
  const [shifts, setShifts] = useState<ShiftCalendar[]>([]);
  const [saving, setSaving] = useState(false);
  const [treePickerVisible, setTreePickerVisible] = useState(false);
  const [treeData, setTreeData] = useState<TreePickerNode[]>([]);
  const [loadingTree, setLoadingTree] = useState(false);

  const loadShifts = useCallback(async () => {
    try {
      const res = await scheduleService.listShifts({ pageSize: PAGE_SIZE.MEDIUM });
      setShifts(res.list);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '加载班次失败');
    }
  }, []);

  React.useEffect(() => {
    if (visible) {
      loadShifts();
      if (exception) {
        const resolvedStartDate =
          exception.startDate?.split('T')[0] ?? exception.exceptionDate?.split('T')[0] ?? today();
        const resolvedEndDate =
          exception.endDate?.split('T')[0] ??
          exception.startDate?.split('T')[0] ??
          resolvedStartDate;
        setStartDate(resolvedStartDate);
        setEndDate(resolvedEndDate);
        const resolvedAllDay = exception.isAllDay ?? (!exception.startTime && !exception.endTime);
        setIsAllDay(resolvedAllDay);
        setStartTime(exception.startTime ?? '08:00');
        setEndTime(exception.endTime ?? '20:00');
        setType(exception.type);
        setRemarks(exception.remarks ?? '');
        setWorkCenterId(exception.workCenterId ?? null);
        setWorkCenterName(exception.workCenter?.name ?? '');
        setSelectedShiftId(exception.shiftCalendarId ?? '');
      } else {
        const todayStr = today();
        setStartDate(todayStr);
        setEndDate(todayStr);
        setIsAllDay(true);
        setStartTime('08:00');
        setEndTime('20:00');
        setType('holiday');
        setRemarks('');
        setWorkCenterId(null);
        setWorkCenterName('');
        setSelectedShiftId('');
      }
    }
  }, [visible, exception, loadShifts]);

  const handleSave = async () => {
    const start = startDate.trim();
    const end = (endDate.trim() || start).trim();
    if (!start) {
      toast.error('请填写开始日期');
      return;
    }
    if (!end) {
      toast.error('请填写结束日期');
      return;
    }
    if (end < start) {
      toast.error('结束日期不能早于开始日期');
      return;
    }
    if (!isAllDay) {
      if (!TIME_REGEX.test(startTime) || !TIME_REGEX.test(endTime)) {
        toast.error('时间格式必须为 HH:mm');
        return;
      }
      if (startTime === endTime) {
        toast.error('开始时间不能与结束时间相同');
        return;
      }
    }

    const payload: CreateCalendarExceptionDto = {
      startDate: start,
      endDate: end,
      isAllDay,
      startTime: isAllDay ? undefined : startTime,
      endTime: isAllDay ? undefined : endTime,
      // 兼容旧后端字段
      exceptionDate: start,
      type: type as unknown as CreateCalendarExceptionDto.type,
      workCenterId: workCenterId || undefined,
      shiftCalendarId: selectedShiftId || undefined,
      remarks: remarks.trim() ? remarks.trim() : undefined,
    };

    if (!payload.startDate) {
      toast.error('请填写例外日期');
      return;
    }
    setSaving(true);
    try {
      if (exception) {
        const updatePayload: UpdateCalendarExceptionDto = {
          id: exception.id,
          exceptionDate: payload.exceptionDate,
          startDate: payload.startDate,
          endDate: payload.endDate,
          isAllDay: payload.isAllDay,
          startTime: payload.startTime,
          endTime: payload.endTime,
          type: payload.type as unknown as UpdateCalendarExceptionDto.type,
          workCenterId: payload.workCenterId ?? undefined,
          shiftCalendarId: payload.shiftCalendarId ?? undefined,
          remarks: payload.remarks ?? undefined,
        };
        await scheduleService.updateException(updatePayload);
      } else {
        await scheduleService.createException(payload);
      }
      onSaved();
      onClose();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? '请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      title={exception ? '编辑' : '新增'}
      confirmText="保存"
      onConfirm={handleSave}
      loading={saving}
      avoidKeyboard
    >
      <DatePickerField
        label="开始日期"
        value={startDate}
        onChange={setStartDate}
        mode="date"
        showCurrentShortcut={false}
        placeholder="选择开始日期"
        required
      />
      <DatePickerField
        label="结束日期"
        value={endDate}
        onChange={setEndDate}
        mode="date"
        showCurrentShortcut={false}
        placeholder="选择结束日期"
        required
      />
      <DateRangeQuickSelect
        onSelect={([start, end]) => {
          setStartDate(start);
          setEndDate(end);
        }}
      />
      <FormSwitch label="全天例外" value={isAllDay} onValueChange={setIsAllDay} />
      {!isAllDay && (
        <View style={styles.timeRow}>
          <DatePickerField
            label="开始时间"
            value={startTime}
            onChange={setStartTime}
            mode="time"
            placeholder="选择开始时间"
            containerStyle={styles.timeField}
            required
          />
          <DatePickerField
            label="结束时间"
            value={endTime}
            onChange={setEndTime}
            mode="time"
            placeholder="选择结束时间"
            containerStyle={styles.timeField}
            required
          />
        </View>
      )}
      <ChipSelectField
        label="类型"
        required
        value={type}
        onChange={(value) => setType(value as CalendarExceptionType)}
        options={(['holiday', 'maintenance', 'overtime'] as CalendarExceptionType[]).map((t) => ({
          value: t,
          label: CALENDAR_EXCEPTION_TYPE_CONFIG[t].label,
          color: CALENDAR_EXCEPTION_TYPE_CONFIG[t].color,
        }))}
      />

      {/* 工作中心（可选，不选则为全局例外） */}
      <View style={styles.treeFieldWrapper}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          工作中心（不选则为全局例外）
        </Text>
        <View style={styles.treeFieldRow}>
          <Pressable
            style={[styles.treeFieldBtn, { backgroundColor: colors.surfaceSecondary }]}
            onPress={async () => {
              setTreePickerVisible(true);
              setLoadingTree(true);
              try {
                const data = await workCenterService.tree();
                setTreeData(data as unknown as TreePickerNode[]);
              } finally {
                setLoadingTree(false);
              }
            }}
          >
            <Text
              style={[
                styles.treeFieldText,
                { color: workCenterName ? colors.text : colors.textTertiary },
              ]}
              numberOfLines={1}
            >
              {workCenterName || '全局例外'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </Pressable>
          {workCenterId && (
            <Pressable
              onPress={() => {
                setWorkCenterId(null);
                setWorkCenterName('');
              }}
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      <DrillDownTreePicker
        visible={treePickerVisible}
        onClose={() => setTreePickerVisible(false)}
        title="选择工作中心"
        data={treeData}
        selectedId={workCenterId ?? undefined}
        onSelect={(id, name) => {
          setWorkCenterId(id);
          setWorkCenterName(name);
          setTreePickerVisible(false);
        }}
        loading={loadingTree}
        allowSelectParent
      />

      {/* 关联班次（可选） */}
      {shifts.length > 0 && (
        <PickerField
          label="关联班次（可选）"
          value={selectedShiftId}
          options={shifts.map((s) => ({
            label: `${s.name}（${s.startTime}-${s.endTime}）`,
            value: s.id,
          }))}
          onChange={setSelectedShiftId}
          placeholder="选择关联班次"
          clearable
        />
      )}

      <FormField
        label="备注"
        value={remarks}
        onChangeText={setRemarks}
        placeholder="例如: 国庆节、设备维修..."
      />
    </FullScreenModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  label: { fontSize: FontSize.sm, fontWeight: '500', marginBottom: Spacing.xs },
  timeRow: { flexDirection: 'row', gap: Spacing.sm },
  timeField: { flex: 1 },
  treeFieldWrapper: { marginBottom: Spacing.sm },
  treeFieldRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  treeFieldBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    minHeight: 44,
  },
  treeFieldText: { fontSize: FontSize.base, flex: 1 },
});
