import { parseDate, toDateStr, today } from '../../core/utils/date';

export type ReportQuickRangeKey = 'today' | 'week' | 'month' | 'year';

export interface ReportPeriodState {
  key: ReportQuickRangeKey;
  /** 用于对齐周期的业务日期，始终保存为本地 YYYY-MM-DD。 */
  anchorDate: string;
}

export interface ReportQuickRangeOption {
  key: ReportQuickRangeKey;
  label: string;
  rangeLabel: string;
}

export interface ReportQuickRange {
  key: ReportQuickRangeKey;
  label: string;
  startDate: string;
  endDate: string;
}

export const REPORT_QUICK_RANGE_OPTIONS: ReportQuickRangeOption[] = [
  { key: 'today', label: '日', rangeLabel: '今日' },
  { key: 'week', label: '周', rangeLabel: '本周' },
  { key: 'month', label: '月', rangeLabel: '本月' },
  { key: 'year', label: '年', rangeLabel: '本年' },
];

export function isReportQuickRangeKey(value: unknown): value is ReportQuickRangeKey {
  return (
    typeof value === 'string' && REPORT_QUICK_RANGE_OPTIONS.some((option) => option.key === value)
  );
}

function startOfPeriod(anchorDate: string, key: ReportQuickRangeKey): string {
  const date = parseDate(anchorDate) ?? parseDate(today());
  if (!date) return today();

  if (key === 'today') return date.format('YYYY-MM-DD');
  if (key === 'month') return date.startOf('month').format('YYYY-MM-DD');
  if (key === 'year') return date.startOf('year').format('YYYY-MM-DD');

  const mondayOffset = (date.day() + 6) % 7;
  return date.subtract(mondayOffset, 'day').format('YYYY-MM-DD');
}

function endOfPeriod(anchorDate: string, key: ReportQuickRangeKey): string {
  const startDate = parseDate(startOfPeriod(anchorDate, key));
  if (!startDate) return today();
  if (key === 'today') return startDate.format('YYYY-MM-DD');
  if (key === 'week') return startDate.add(6, 'day').format('YYYY-MM-DD');
  if (key === 'month') return startDate.endOf('month').format('YYYY-MM-DD');
  return startDate.endOf('year').format('YYYY-MM-DD');
}

function weekLabel(date: ReturnType<typeof parseDate>): string {
  if (!date) return '';
  return ['日', '一', '二', '三', '四', '五', '六'][date.day()] ?? '';
}

function periodLabel(state: ReportPeriodState, startDate: string, endDate: string): string {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return '选择日期';
  if (state.key === 'today') return `${start.format('YYYY年M月D日')} 周${weekLabel(start)}`;
  if (state.key === 'week') return `${start.format('YYYY年M月D日')} - ${end.format('M月D日')}`;
  if (state.key === 'month') return start.format('YYYY年M月');
  return start.format('YYYY年');
}

const PERIOD_CURRENT_ALIAS: Record<ReportQuickRangeKey, string> = {
  today: '今天',
  week: '本周',
  month: '本月',
  year: '本年',
};

const PERIOD_PREVIOUS_ALIAS: Record<ReportQuickRangeKey, string> = {
  today: '昨天',
  week: '上周',
  month: '上月',
  year: '去年',
};

function reportPeriodRangeText(
  key: ReportQuickRangeKey,
  startDate: string,
  endDate: string,
): string {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return '选择日期';
  if (key === 'today') return start.format('YYYY/MM/DD');
  if (key === 'week') {
    return start.year() === end.year()
      ? `${start.format('M/D')} - ${end.format('M/D')}`
      : `${start.format('YYYY/M/D')} - ${end.format('YYYY/M/D')}`;
  }
  if (key === 'month') return start.format('YYYY年M月');
  return start.format('YYYY年');
}

/** 周期导航中间展示的紧凑文案：具体日期 + 相对别名，例如 2026/09/17 · 今天、9/8 - 9/14 · 上周。 */
export function reportPeriodDisplayLabel(state: ReportPeriodState): string {
  const resolved = resolveReportPeriodWithoutCurrent(state);
  const current = resolveReportPeriodWithoutCurrent(createReportPeriodState(state.key));
  const previous = resolveReportPeriodWithoutCurrent(
    shiftReportPeriod(createReportPeriodState(state.key), -1),
  );
  let alias = '';
  if (resolved.startDate === current.startDate) {
    alias = PERIOD_CURRENT_ALIAS[state.key];
  } else if (resolved.startDate === previous.startDate) {
    alias = PERIOD_PREVIOUS_ALIAS[state.key];
  } else if (state.key === 'today') {
    // 其余日期用星期兜底，保持与原周期文案一致的识别信息。
    alias = `周${weekLabel(parseDate(resolved.startDate))}`;
  }
  const dateText = reportPeriodRangeText(state.key, resolved.startDate, resolved.endDate);
  return alias ? `${dateText} · ${alias}` : dateText;
}

function resolveReportPeriodWithoutCurrent(state: ReportPeriodState): ReportQuickRange {
  const startDate = startOfPeriod(state.anchorDate, state.key);
  const endDate = endOfPeriod(state.anchorDate, state.key);
  return { key: state.key, label: periodLabel(state, startDate, endDate), startDate, endDate };
}

function capCurrentPeriodAtToday(range: ReportQuickRange): ReportQuickRange {
  // 周/月/年需要保留完整自然周期，趋势图才能稳定展示 7 天、当月天数和 12 个月。
  // 只有“日”需要按当前时点结束；历史周期仍保持完整范围。
  if (range.key !== 'today') return range;
  const currentDate = today();
  if (range.startDate <= currentDate && currentDate < range.endDate) {
    return { ...range, endDate: currentDate };
  }
  return range;
}

export function createReportPeriodState(
  key: ReportQuickRangeKey = 'today',
  anchorDate = today(),
): ReportPeriodState {
  return { key, anchorDate };
}

export function resolveReportQuickRange(key: ReportQuickRangeKey): ReportQuickRange {
  const option = REPORT_QUICK_RANGE_OPTIONS.find((item) => item.key === key);
  const resolved = capCurrentPeriodAtToday(
    resolveReportPeriodWithoutCurrent(createReportPeriodState(key)),
  );
  return { ...resolved, label: option?.rangeLabel ?? resolved.label };
}

export function resolveReportPeriod(state: ReportPeriodState): ReportQuickRange {
  const resolved = resolveReportPeriodWithoutCurrent(state);
  const currentBoundary = resolveReportPeriodWithoutCurrent(createReportPeriodState(state.key));
  const isCurrent =
    resolved.startDate === currentBoundary.startDate &&
    resolved.endDate === currentBoundary.endDate;
  const current = resolveReportQuickRange(state.key);
  return {
    ...resolved,
    endDate: isCurrent ? current.endDate : resolved.endDate,
    label: isCurrent ? current.label : resolved.label,
  };
}

export function shiftReportPeriod(state: ReportPeriodState, direction: -1 | 1): ReportPeriodState {
  const date = parseDate(state.anchorDate) ?? parseDate(today());
  if (!date) return state;
  const unit: 'day' | 'week' | 'month' | 'year' = state.key === 'today' ? 'day' : state.key;
  return { key: state.key, anchorDate: toDateStr(date.add(direction, unit)) };
}

export function isCurrentReportPeriod(state: ReportPeriodState): boolean {
  const current = resolveReportPeriodWithoutCurrent(createReportPeriodState(state.key));
  const resolved = resolveReportPeriodWithoutCurrent(state);
  return resolved.startDate === current.startDate && resolved.endDate === current.endDate;
}

export function getReportPeriodUnitLabel(key: ReportQuickRangeKey): string {
  return key === 'today' ? '天' : key === 'week' ? '周' : key === 'month' ? '月' : '年';
}

/**
 * 报表接口按整天范围查询。只传裸日期 YYYY-MM-DD，由后端 getLocalDayRange 统一把
 * dateFrom 补到当日 00:00:00、dateTo 补到 23:59:59.999（按业务时区）。
 */
export function toReportDateRangeParams(range: ReportQuickRange): {
  dateFrom: string;
  dateTo: string;
} {
  return {
    dateFrom: range.startDate,
    dateTo: range.endDate,
  };
}
