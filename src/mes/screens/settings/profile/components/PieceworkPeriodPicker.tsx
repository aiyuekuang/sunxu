import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../../core/components/BottomSheet.tsx';
import { StatusTabs } from '../../../../../core/components/StatusTabs.tsx';
import { FontSize, Spacing } from '../../../../../core/theme/tokens';
import { useTheme } from '../../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PeriodOption {
  label: string;
  startDate: string;
  endDate: string;
}

interface PieceworkPeriodPickerProps {
  /** 是否显示选择器 */
  visible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 选中时间段后回调 */
  onSelect: (option: PeriodOption) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

type PickerMode = 'day' | 'week' | 'month' | 'year';

const PICKER_MODES: { key: PickerMode; label: string }[] = [
  { key: 'day', label: '日' },
  { key: 'week', label: '周' },
  { key: 'month', label: '月' },
  { key: 'year', label: '年' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

function getPeriodOptions(mode: PickerMode): PeriodOption[] {
  const today = new Date();

  if (mode === 'day') {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const s = fmt(d);
      return { label: i === 0 ? '今天' : i === 1 ? '昨天' : s, startDate: s, endDate: s };
    });
  }

  if (mode === 'week') {
    return Array.from({ length: 8 }, (_, i) => {
      const monday = new Date(today);
      monday.setDate(today.getDate() - today.getDay() + 1 - i * 7);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return {
        label: i === 0 ? '本周' : `${fmt(monday)} ~ ${fmt(sunday).slice(5)}`,
        startDate: fmt(monday),
        endDate: fmt(sunday),
      };
    });
  }

  if (mode === 'month') {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return {
        label: i === 0 ? '本月' : `${y}年${d.getMonth() + 1}月`,
        startDate: `${y}-${m}-01`,
        endDate: `${y}-${m}-${String(lastDay).padStart(2, '0')}`,
      };
    });
  }

  // year
  return Array.from({ length: 3 }, (_, i) => {
    const y = today.getFullYear() - i;
    return {
      label: i === 0 ? '今年' : `${y}年`,
      startDate: `${y}-01-01`,
      endDate: `${y}-12-31`,
    };
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PieceworkPeriodPicker({ visible, onClose, onSelect }: PieceworkPeriodPickerProps) {
  const { colors } = useTheme();
  const [pickerMode, setPickerMode] = useState<PickerMode>('month');

  const options = getPeriodOptions(pickerMode);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="选择时间范围" maxHeightRatio={0.6}>
      {/* 负 margin 抵消 BottomSheet body 的 Spacing.base(16px) padding，让选项列表贴边 */}
      <View style={styles.pickerBody}>
        <StatusTabs<PickerMode>
          tabs={PICKER_MODES}
          activeKey={pickerMode}
          onChange={setPickerMode}
          style={styles.modeTabs}
        />
        {options.map((item) => (
          <TouchableOpacity
            key={item.startDate}
            style={[styles.optionRow, { borderBottomColor: colors.border }]}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionLabel, { color: colors.text }]}>{item.label}</Text>
            <Text style={[styles.optionDate, { color: colors.textSecondary }]}>
              {item.startDate === item.endDate
                ? item.startDate
                : `${item.startDate} ~ ${item.endDate}`}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheet>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  pickerBody: {
    marginHorizontal: -Spacing.base,
  },
  modeTabs: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  optionLabel: {
    fontSize: FontSize.base,
    width: 60,
  },
  optionDate: {
    flex: 1,
    fontSize: FontSize.sm,
  },
});
