import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { type ShiftCalendar, scheduleService } from '../../../host/services';
import { workCenterService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { DrillDownTreePicker, type TreePickerNode } from '../../../../core/components/DrillDownTreePicker.tsx';
import { FormField, FormSwitch } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { WEEKDAY_LABELS } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const;

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShiftBreak {
  id: string;
  startTime: string;
  endTime: string;
}

let shiftBreakSeed = 0;

function createShiftBreak(startTime = '12:00', endTime = '13:00'): ShiftBreak {
  shiftBreakSeed += 1;
  return {
    id: `shift-break-${shiftBreakSeed}`,
    startTime,
    endTime,
  };
}

export interface ShiftFormModalProps {
  visible: boolean;
  shift: ShiftCalendar | null;
  onClose: () => void;
  onSaved: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ShiftFormModal({ visible, shift, onClose, onSaved }: ShiftFormModalProps) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [crossDay, setCrossDay] = useState(false);
  const [breaks, setBreaks] = useState<ShiftBreak[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [workCenterId, setWorkCenterId] = useState<string | null>(null);
  const [workCenterName, setWorkCenterName] = useState('');
  const [saving, setSaving] = useState(false);
  const [treePickerVisible, setTreePickerVisible] = useState(false);
  const [treeData, setTreeData] = useState<TreePickerNode[]>([]);
  const [loadingTree, setLoadingTree] = useState(false);

  React.useEffect(() => {
    if (visible) {
      if (shift) {
        setName(shift.name);
        setStartTime(shift.startTime);
        setEndTime(shift.endTime);
        setWorkingDays(shift.workingDays.map(Number));
        setCrossDay(shift.crossDay ?? false);
        setBreaks(
          ((shift.breaks as Array<Pick<ShiftBreak, 'startTime' | 'endTime'>>) ?? []).map((item) =>
            createShiftBreak(item.startTime, item.endTime),
          ),
        );
        setIsActive(shift.isActive);
        setWorkCenterId(shift.workCenterId ?? null);
        setWorkCenterName(shift.workCenter?.name ?? '');
      } else {
        setName('');
        setStartTime('08:00');
        setEndTime('17:00');
        setWorkingDays([1, 2, 3, 4, 5]);
        setCrossDay(false);
        setBreaks([]);
        setIsActive(true);
        setWorkCenterId(null);
        setWorkCenterName('');
      }
    }
  }, [shift, visible]);

  const openTreePicker = async () => {
    setTreePickerVisible(true);
    setLoadingTree(true);
    try {
      const data = await workCenterService.tree();
      setTreeData(data as unknown as TreePickerNode[]);
    } finally {
      setLoadingTree(false);
    }
  };

  const toggleDay = (d: number) =>
    setWorkingDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b),
    );

  const addBreak = () => setBreaks((prev) => [...prev, createShiftBreak()]);

  const updateBreak = (index: number, field: 'startTime' | 'endTime', value: string) =>
    setBreaks((prev) => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)));

  const removeBreak = (index: number) => setBreaks((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('请填写班次名称');
      return;
    }
    if (!TIME_REGEX.test(startTime)) {
      toast.error('开始时间格式不正确，请输入 HH:mm');
      return;
    }
    if (!TIME_REGEX.test(endTime)) {
      toast.error('结束时间格式不正确，请输入 HH:mm');
      return;
    }
    // 非跨天班次：结束时间必须晚于开始时间
    if (!crossDay && startTime >= endTime) {
      toast.error('结束时间必须晚于开始时间（如需跨天请开启跨天开关）');
      return;
    }
    if (workingDays.length === 0) {
      toast.error('请至少选择一个工作日');
      return;
    }
    // 验证休息时段
    for (const brk of breaks) {
      if (!TIME_REGEX.test(brk.startTime) || !TIME_REGEX.test(brk.endTime)) {
        toast.error('休息时段时间格式不正确');
        return;
      }
      // 跨天班次的休息时段允许跨午夜（如 23:00 → 00:00）
      if (!crossDay && brk.startTime >= brk.endTime) {
        toast.error('休息时段结束时间必须晚于开始时间');
        return;
      }
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        workCenterId: workCenterId ?? undefined,
        startTime,
        endTime,
        workingDays,
        crossDay,
        breaks: breaks.map(({ startTime: breakStartTime, endTime: breakEndTime }) => ({
          startTime: breakStartTime,
          endTime: breakEndTime,
        })),
        isActive,
      };
      if (shift) {
        await scheduleService.updateShift({ id: shift.id, ...payload });
      } else {
        await scheduleService.createShift(payload);
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
      title={shift ? '编辑' : '新增'}
      confirmText="保存"
      onConfirm={handleSave}
      loading={saving}
      avoidKeyboard
    >
      <FormField
        label="班次名称"
        required
        value={name}
        onChangeText={setName}
        placeholder="例: 早班"
      />

      <View style={styles.treeFieldWrapper}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          工作中心（不选则为全局班次）
        </Text>
        <View style={styles.treeFieldRow}>
          <Pressable
            style={[styles.treeFieldBtn, { backgroundColor: colors.surfaceSecondary }]}
            onPress={openTreePicker}
          >
            <Text
              style={[
                styles.treeFieldText,
                { color: workCenterName ? colors.text : colors.textTertiary },
              ]}
              numberOfLines={1}
            >
              {workCenterName || '全局班次'}
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

      <DatePickerField
        label="开始时间"
        mode="time"
        value={startTime}
        onChange={setStartTime}
        placeholder="08:00"
      />
      <DatePickerField
        label="结束时间"
        mode="time"
        value={endTime}
        onChange={setEndTime}
        placeholder="17:00"
      />

      <FormSwitch
        label="跨天班次（如晚班 20:00 → 次日 08:00）"
        value={crossDay}
        onValueChange={setCrossDay}
      />

      {/* 休息时段 */}
      <View style={styles.breakSection}>
        <View style={styles.breakHeader}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>休息时段</Text>
          <Pressable onPress={addBreak} hitSlop={8}>
            <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
          </Pressable>
        </View>
        {breaks.map((brk, idx) => (
          <BreakRow
            key={brk.id}
            breakItem={brk}
            onUpdate={(field, value) => updateBreak(idx, field, value)}
            onRemove={() => removeBreak(idx)}
          />
        ))}
        {breaks.length === 0 && (
          <Text style={[styles.hint, { color: colors.textTertiary }]}>
            无休息时段，点击 + 添加（如午休 12:00-13:00）
          </Text>
        )}
      </View>

      <Text style={[styles.label, { color: colors.textSecondary }]}>工作日</Text>
      <View style={styles.daysRow}>
        {WEEKDAYS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[
              styles.dayBtn,
              { borderColor: workingDays.includes(d) ? colors.primary : colors.border },
              workingDays.includes(d) && { backgroundColor: colors.primary },
            ]}
            onPress={() => toggleDay(d)}
          >
            <Text
              style={[
                styles.dayBtnText,
                { color: workingDays.includes(d) ? colors.surface : colors.text },
              ]}
            >
              {WEEKDAY_LABELS[d % 7]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FormSwitch label="启用状态" value={isActive} onValueChange={setIsActive} />
    </FullScreenModal>
  );
}

// ─── BreakRow ─────────────────────────────────────────────────────────────────

function BreakRow({
  breakItem,
  onUpdate,
  onRemove,
}: {
  breakItem: ShiftBreak;
  onUpdate: (field: 'startTime' | 'endTime', value: string) => void;
  onRemove: () => void;
}) {
  const { colors } = useTheme();
  const [picking, setPicking] = useState<'startTime' | 'endTime' | null>(null);
  const [iosDate, setIosDate] = useState(new Date());

  const parseTime = (t: string): Date => {
    const [h, m] = t.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  const formatTime = (d: Date): string => {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const openPicker = (field: 'startTime' | 'endTime') => {
    setIosDate(parseTime(breakItem[field]));
    setPicking(field);
  };

  const handleAndroidChange = (_: DateTimePickerEvent, date?: Date) => {
    setPicking(null);
    if (date && picking) {
      onUpdate(picking, formatTime(date));
    }
  };

  const handleIosConfirm = () => {
    if (picking) {
      onUpdate(picking, formatTime(iosDate));
    }
    setPicking(null);
  };

  return (
    <View style={[styles.breakRow, { backgroundColor: colors.surfaceSecondary }]}>
      <TouchableOpacity
        style={[styles.timeBtn, { backgroundColor: colors.surfaceSecondary }]}
        onPress={() => openPicker('startTime')}
        activeOpacity={0.7}
      >
        <Ionicons name="time-outline" size={16} color={colors.primary} />
        <Text style={[styles.timeBtnText, { color: colors.text }]}>{breakItem.startTime}</Text>
      </TouchableOpacity>

      <Text style={[styles.breakDash, { color: colors.textSecondary }]}>至</Text>

      <TouchableOpacity
        style={[styles.timeBtn, { backgroundColor: colors.surfaceSecondary }]}
        onPress={() => openPicker('endTime')}
        activeOpacity={0.7}
      >
        <Ionicons name="time-outline" size={16} color={colors.primary} />
        <Text style={[styles.timeBtnText, { color: colors.text }]}>{breakItem.endTime}</Text>
      </TouchableOpacity>

      <Pressable onPress={onRemove} hitSlop={8}>
        <Ionicons name="close-circle" size={20} color={colors.error} />
      </Pressable>

      {/* Android: inline picker */}
      {Platform.OS === 'android' && picking && (
        <DateTimePicker
          value={parseTime(breakItem[picking])}
          mode="time"
          display="default"
          onChange={handleAndroidChange}
        />
      )}

      {/* iOS: modal picker */}
      {Platform.OS === 'ios' && picking && (
        <Modal visible transparent animationType="fade">
          <Pressable style={styles.pickerOverlay} onPress={() => setPicking(null)}>
            <Pressable style={[styles.pickerSheet, { backgroundColor: colors.surface }]}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setPicking(null)}>
                  <Text style={{ color: colors.textSecondary, fontSize: FontSize.base }}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleIosConfirm}>
                  <Text
                    style={{ color: colors.primary, fontSize: FontSize.base, fontWeight: '600' }}
                  >
                    确定
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={iosDate}
                mode="time"
                display="spinner"
                onChange={(_, d) => d && setIosDate(d)}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  label: { fontSize: FontSize.sm, fontWeight: '500', marginBottom: Spacing.xs },
  daysRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: Spacing.sm },
  dayBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayBtnText: { fontSize: FontSize.xs, fontWeight: '600' },
  breakSection: { marginBottom: Spacing.sm },
  breakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  breakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: Spacing.xs,
  },
  timeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  timeBtnText: { fontSize: FontSize.base, fontWeight: '500' },
  breakDash: { fontSize: FontSize.sm },
  hint: { fontSize: FontSize.xs, marginTop: Spacing.xs },
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
  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerSheet: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingBottom: Spacing.lg,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
