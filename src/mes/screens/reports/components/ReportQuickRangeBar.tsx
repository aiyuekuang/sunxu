import type { StyleProp, ViewStyle } from 'react-native';
import { StatusTabs } from '../../../../core/components/StatusTabs.tsx';
import {
  isReportQuickRangeKey,
  REPORT_QUICK_RANGE_OPTIONS,
  type ReportQuickRangeKey,
} from '../../../constants/report-quick-range';

interface ReportQuickRangeBarProps {
  value: ReportQuickRangeKey | null;
  onChange: (next: ReportQuickRangeKey) => void;
  style?: StyleProp<ViewStyle>;
}

export function ReportQuickRangeBar({ value, onChange, style }: ReportQuickRangeBarProps) {
  const activeKey = value ?? '__custom_range__';

  return (
    <StatusTabs<string>
      tabs={REPORT_QUICK_RANGE_OPTIONS.map((option) => ({
        key: option.key,
        label: option.label,
      }))}
      activeKey={activeKey}
      onChange={(next) => {
        if (isReportQuickRangeKey(next)) onChange(next);
      }}
      density="compact"
      style={style}
    />
  );
}
