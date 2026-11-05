import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type GanttData, scheduleService } from '../../../host/services';
import { ScheduleGanttDto } from '../../../types/models/ScheduleGanttDto';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { FAB } from '../../../../core/components/FAB.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { SelectableChip } from '../../../../core/components/SelectableChip.tsx';
import {
  SCHEDULE_STATUS_CONFIG,
  SCHEDULE_STATUS_TABS,
  UNKNOWN_STATUS_FALLBACK,
  WEEKDAY_LABELS,
  WORK_ORDER_DISPLAY_STATUS_CONFIG,
} from '../../../constants/status-configs';
import { FontSize, MIN_TOUCH_TARGET, Radius, Spacing } from '../../../../core/theme/tokens';
import { useDict } from '../../../host/hooks/useDict';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatShortDate, formatTime, toISO } from '../../../../core/utils/date';
import { formatQtyWithUnit, type UnitLabelMap } from '../../../utils/qty-unit';
import { toast } from '../../../../core/toast';
import { formatBufferPolicySummary } from '../buffer-policy';
import type { ScheduleAnalysisQuery } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const GANTT_ROW_HEIGHT = 82;
const GANTT_BAR_HEIGHT = 52;
const GANTT_EMPTY_ROW_HEIGHT = 82;
const GANTT_LABEL_WIDTH = 108;
const GANTT_HEADER_MAJOR_HEIGHT = 22;
const GANTT_HEADER_MINOR_HEIGHT = 36;
const GANTT_HEADER_HEIGHT = GANTT_HEADER_MAJOR_HEIGHT + GANTT_HEADER_MINOR_HEIGHT;
const MIN_CELL_WIDTH_PORTRAIT = {
  time: 72,
  day: 140,
  week: 168,
} as const;
const MIN_CELL_WIDTH_LANDSCAPE = {
  time: 72,
  day: 140,
  week: 160,
} as const;
const MIN_BAR_WIDTH = 80;
const MIN_DAY_WEEK_BAR_WIDTH = 160;
const MIN_BUFFER_BAR_WIDTH = 2;
const MIN_WEEK_BUFFER_BAR_WIDTH = 8;
const MIN_VISIBLE_ACTUAL_BAR_WIDTH = 2;
const PC_REFERENCE_CELL_WIDTH = {
  time: 80,
  day: 200,
  week: 240,
} as const;
const GANTT_BUFFER_TRACK_COLOR = '#D9822B';

type GanttExecutionVisualKey = 'pending_start' | 'running' | 'completed' | 'cancelled';

interface GanttExecutionVisual {
  label: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  trackColor: string;
  progressColor: string;
}

const GANTT_EXECUTION_STATUS_PENDING = new Set([
  'draft',
  'submitted',
  'pending_release',
  'released',
  'scheduled',
  'confirmed',
]);
const GANTT_EXECUTION_STATUS_RUNNING = new Set(['in_progress', 'paused']);
const GANTT_EXECUTION_STATUS_COMPLETED = new Set(['completed', 'closed']);
const GANTT_EXECUTION_STATUS_CANCELLED = new Set(['cancelled']);

function toRgba(color: string, alpha: number): string {
  const normalized = color.trim();
  if (!normalized.startsWith('#')) return color;

  let hex = normalized.slice(1);
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => `${char}${char}`)
      .join('');
  }
  if (hex.length !== 6) return color;

  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createExecutionVisual(
  label: string,
  color: string,
  backgroundAlpha: number,
  borderAlpha: number,
  trackAlpha: number,
  progressColor: string,
): GanttExecutionVisual {
  return {
    label,
    color,
    backgroundColor: toRgba(color, backgroundAlpha),
    borderColor: toRgba(color, borderAlpha),
    trackColor: toRgba(color, trackAlpha),
    progressColor,
  };
}

const GANTT_EXECUTION_STATUS_VISUALS: Record<GanttExecutionVisualKey, GanttExecutionVisual> = {
  pending_start: createExecutionVisual('待开工', '#1677FF', 0.18, 0.28, 0.3, '#0F5ED8'),
  running: createExecutionVisual('生产中', '#FF8F1F', 0.18, 0.3, 0.34, '#D46B08'),
  completed: createExecutionVisual('已完工', '#00B578', 0.28, 0.38, 0.42, '#00875A'),
  cancelled: createExecutionVisual('已取消', '#FF3141', 0.14, 0.24, 0.24, '#D32029'),
};

function toExecutionVisualKey(status?: string | null): GanttExecutionVisualKey | null {
  if (!status) return null;
  if (GANTT_EXECUTION_STATUS_COMPLETED.has(status)) return 'completed';
  if (GANTT_EXECUTION_STATUS_CANCELLED.has(status)) return 'cancelled';
  if (GANTT_EXECUTION_STATUS_RUNNING.has(status)) return 'running';
  if (GANTT_EXECUTION_STATUS_PENDING.has(status)) return 'pending_start';
  return null;
}

function getExecutionVisual(
  workOrderStatus?: string | null,
  scheduleStatus?: string | null,
): GanttExecutionVisual {
  const key =
    toExecutionVisualKey(workOrderStatus) ??
    toExecutionVisualKey(scheduleStatus) ??
    'pending_start';
  return GANTT_EXECUTION_STATUS_VISUALS[key];
}

const WEEKDAY_SHORT_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const GANTT_WC_TYPE_STORAGE_KEY = 'gantt_wc_type';
const GANTT_GROUP_BY_STORAGE_KEY = 'gantt_group_by';
const GANTT_CREATE_FAB_POSITION_STORAGE_KEY = 'gantt_create_fab_position';

type GanttGroupBy = ScheduleGanttDto.groupBy;

interface TimelineMajorCell {
  key: string;
  label: string;
  span: number;
  isCurrent: boolean;
}

function formatDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 本地日期格式化为 YYYY-MM-DD，避免 toISOString 的 UTC 时区偏移 */
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(d: Date): Date {
  const date = new Date(d);
  date.setHours(23, 59, 59, 999);
  return date;
}

function startOfMonth(d: Date): Date {
  return startOfDay(new Date(d.getFullYear(), d.getMonth(), 1));
}

function endOfMonth(d: Date): Date {
  return endOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

function addDays(d: Date, days: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + days);
  return date;
}

function addHours(d: Date, hours: number): Date {
  const date = new Date(d);
  date.setHours(date.getHours() + hours);
  return date;
}

function addMonths(d: Date, months: number): Date {
  const date = new Date(d);
  date.setMonth(date.getMonth() + months);
  return date;
}

function startOfWeek(d: Date): Date {
  const date = startOfDay(d);
  const mondayOffset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - mondayOffset);
  return date;
}

function endOfWeek(d: Date): Date {
  return endOfDay(addDays(startOfWeek(d), 6));
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameHour(a: Date, b: Date): boolean {
  return isSameDay(a, b) && a.getHours() === b.getHours();
}

function isWeekendDate(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function formatMonthLabel(d: Date): string {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatRangeLabel(start: Date, end: Date): string {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function padHour(hour: number): string {
  return String(hour).padStart(2, '0');
}

function isDateInRange(target: Date, start: Date, end: Date): boolean {
  return target.getTime() >= start.getTime() && target.getTime() <= end.getTime();
}

function getEntryVisualStart(entry: {
  plannedStart: string;
  occupiedStartAt?: string | null;
}): string {
  return entry.occupiedStartAt ?? entry.plannedStart;
}

function getEntryVisualEnd(entry: { plannedEnd: string; occupiedEndAt?: string | null }): string {
  return entry.occupiedEndAt ?? entry.plannedEnd;
}

type GanttEntry = GanttData['workCenters'][number]['entries'][number] & {
  bufferAfterEntryId?: string | null;
  durationMinutes?: number | null;
  isBuffer?: boolean;
};

function getDependencyMessage(entry: GanttEntry): string | null {
  return entry.dependencyConflictReason ?? entry.dependencyWarning ?? null;
}

function hasDependencyConflict(entry: GanttEntry): boolean {
  return entry.dependencyConflict === true || Boolean(entry.dependencyConflictReason);
}

function isGanttEntryEditable(entry: GanttEntry): boolean {
  if (entry.isBuffer || entry.isFirm) return false;
  if (entry.status !== 'scheduled' && entry.status !== 'confirmed') return false;
  return !entry.actualStartAt && (entry.runtimeStatus ?? 'pending') === 'pending';
}

function isGanttEntryDeletable(entry: GanttEntry): boolean {
  if (!isGanttEntryEditable(entry)) return false;
  const workOrderStatus = entry.workOrder?.status;
  return !['in_progress', 'paused', 'completed', 'closed'].includes(workOrderStatus ?? '');
}

function getPrimaryLabel(entry: GanttEntry): string {
  const materialName = entry.workOrder?.material?.name?.trim();
  if (materialName) return materialName;

  const orderNo = entry.workOrder?.orderNo?.trim();
  if (orderNo) return orderNo;

  const operationName = entry.operation?.operationName?.trim();
  if (operationName) return operationName;

  const workCenterName = entry.workCenter?.name?.trim();
  if (workCenterName) return workCenterName;

  return entry.id.slice(0, 8);
}

function getEntryQuantityLabel(entry: GanttEntry, unitLabelMap: UnitLabelMap): string | null {
  if (entry.workOrder?.plannedQty == null) return null;
  return formatQtyWithUnit(
    entry.workOrder.plannedQty,
    entry.workOrder.material?.unit,
    unitLabelMap,
  );
}

function getEntryResourceLabel(entry: GanttEntry): string | null {
  const resourceName = entry.equipment?.name?.trim() ?? entry.workCenter?.name?.trim();
  return resourceName && resourceName.length > 0 ? resourceName : null;
}

function formatDurationLabel(minutes?: number | null): string | null {
  if (minutes == null || minutes <= 0) return null;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;
  return remainMinutes > 0 ? `${hours}h${remainMinutes}m` : `${hours}h`;
}

function formatCompactDurationLabel(minutes?: number | null): string | null {
  if (minutes == null || minutes <= 0) return null;
  if (minutes < 60) return `${Math.round(minutes)}分`;
  const hours = Math.floor(minutes / 60);
  const remainMinutes = Math.round(minutes % 60);
  return remainMinutes > 0 ? `${hours}时${remainMinutes}分` : `${hours}时`;
}

function toCompactLabel(name: string, maxLength = 8): string {
  return name.length > maxLength ? `${name.slice(0, maxLength)}…` : name;
}

function computeProgress(entry: GanttEntry): number {
  const plannedQty = Number(entry.workOrder?.plannedQty ?? 0);
  if (plannedQty <= 0) return 0;

  const completedQty = Number(
    entry.workOrder?.bottleneckCompletedQty ?? entry.workOrder?.completedQty ?? 0,
  );
  return Math.min(Math.round((completedQty / plannedQty) * 100), 100);
}

interface RowDensityMetrics {
  barHeight: number;
  barGap: number;
  rowHeight: number;
}

interface PixelBarLayout {
  entry: GanttEntry;
  left: number;
  width: number;
  actualWidth: number;
  lane: number;
}

function getRowDensityMetrics(laneCount: number, selectedRow = false): RowDensityMetrics {
  let barHeight = GANTT_BAR_HEIGHT;
  let barGap = 4;

  if (selectedRow) {
    barHeight = Math.max(barHeight, 32);
    barGap = Math.max(barGap, 4);
  }

  return {
    barHeight,
    barGap,
    rowHeight: Math.max(GANTT_ROW_HEIGHT, laneCount * (barHeight + barGap) + barGap),
  };
}

type GanttViewMode = 'time' | 'day' | 'week';

function scaleReferenceWidth(
  mode: GanttViewMode,
  cellWidth: number,
  referenceWidth: number,
  minimumWidth = 0,
): number {
  const referenceCellWidth = PC_REFERENCE_CELL_WIDTH[mode];
  const scaledWidth = (referenceWidth / referenceCellWidth) * cellWidth;
  return Math.max(minimumWidth, scaledWidth);
}

function getScaledMinBarWidth(mode: GanttViewMode, cellWidth: number, isBuffer: boolean): number {
  if (isBuffer) {
    return 0;
  }

  const referenceMinWidth = isBuffer
    ? mode === 'week'
      ? MIN_WEEK_BUFFER_BAR_WIDTH
      : MIN_BUFFER_BAR_WIDTH
    : mode === 'time'
      ? MIN_BAR_WIDTH
      : MIN_DAY_WEEK_BAR_WIDTH;
  const mobileFloor = mode === 'time' ? 88 : mode === 'day' ? 120 : 136;

  return scaleReferenceWidth(mode, cellWidth, referenceMinWidth, mobileFloor);
}

function getScaledVisibleActualWidth(
  mode: GanttViewMode,
  cellWidth: number,
  isBuffer: boolean,
): number {
  if (isBuffer) {
    return 1;
  }

  return scaleReferenceWidth(mode, cellWidth, MIN_VISIBLE_ACTUAL_BAR_WIDTH);
}

interface BarTextMetrics {
  compactPrimaryLabelThreshold: number;
  fullSecondaryLabelThreshold: number;
  showPrimaryTextMinWidth: number;
  showSecondaryTextMinWidth: number;
  showStatusChipMinWidth: number;
  showTimeLabelMinWidth: number;
  showOrderNoMinWidth: number;
}

function getBarTextMetrics(
  mode: GanttViewMode,
  cellWidth: number,
  isBuffer: boolean,
  isSelected: boolean,
  canShowMetaLine: boolean,
): BarTextMetrics {
  return {
    compactPrimaryLabelThreshold: scaleReferenceWidth(mode, cellWidth, 120, 92),
    fullSecondaryLabelThreshold: scaleReferenceWidth(mode, cellWidth, 156, 108),
    showPrimaryTextMinWidth: isBuffer
      ? scaleReferenceWidth(mode, cellWidth, 56, 36)
      : scaleReferenceWidth(mode, cellWidth, isSelected ? 64 : 72, isSelected ? 56 : 64),
    showSecondaryTextMinWidth: canShowMetaLine
      ? scaleReferenceWidth(mode, cellWidth, MIN_BAR_WIDTH, 84)
      : Number.POSITIVE_INFINITY,
    showStatusChipMinWidth: canShowMetaLine
      ? scaleReferenceWidth(mode, cellWidth, 360, 220)
      : Number.POSITIVE_INFINITY,
    showTimeLabelMinWidth: canShowMetaLine
      ? scaleReferenceWidth(mode, cellWidth, isSelected ? 288 : 328, 240)
      : Number.POSITIVE_INFINITY,
    showOrderNoMinWidth: !isBuffer
      ? scaleReferenceWidth(mode, cellWidth, isSelected ? 84 : 96, 80)
      : Number.POSITIVE_INFINITY,
  };
}

function getActiveFilterCount(wcTypeFilter: string | null, statusFilter: StatusFilterKey): number {
  return (wcTypeFilter ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0);
}

interface TimelineCell {
  key: string;
  start: Date;
  end: Date;
  label: string;
  subLabel: string;
  isCurrent: boolean;
  isWeekend: boolean;
}

function getMajorCellKey(date: Date, mode: GanttViewMode): string {
  switch (mode) {
    case 'time':
      return toLocalDateStr(date);
    case 'day':
    case 'week':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    default:
      return toLocalDateStr(date);
  }
}

function getMajorCellLabel(date: Date, mode: GanttViewMode): string {
  switch (mode) {
    case 'time':
      return `${date.getMonth() + 1}月${date.getDate()}日 ${WEEKDAY_SHORT_LABELS[date.getDay()]}`;
    case 'day':
    case 'week':
      return `${date.getFullYear()}年${date.getMonth() + 1}月`;
    default:
      return formatMonthLabel(date);
  }
}

function buildTimeline(
  mode: GanttViewMode,
  offset: number,
): {
  startDate: Date;
  endDate: Date;
  cells: TimelineCell[];
  periodLabel: string;
} {
  const now = new Date();

  if (mode === 'time') {
    const startDate = startOfDay(addDays(now, offset));
    const endDate = endOfDay(addDays(startDate, 2));
    const cells: TimelineCell[] = [];

    let cursor = new Date(startDate);
    while (cursor.getTime() <= endDate.getTime()) {
      const cellStart = new Date(cursor);
      const next = addHours(cellStart, 1);
      const cellEnd = new Date(Math.min(endDate.getTime(), next.getTime() - 1));
      cells.push({
        key: `${toLocalDateStr(cellStart)}-${padHour(cellStart.getHours())}`,
        start: cellStart,
        end: cellEnd,
        label: `${padHour(cellStart.getHours())}:00`,
        subLabel: formatDate(cellStart),
        isCurrent: isSameHour(cellStart, now),
        isWeekend: isWeekendDate(cellStart),
      });
      cursor = next;
    }

    return {
      startDate,
      endDate,
      cells,
      periodLabel: offset === 0 ? '今天' : formatRangeLabel(startDate, endDate),
    };
  }

  if (mode === 'day') {
    const startDate = startOfDay(addDays(now, offset * 7));
    const endDate = endOfDay(addDays(startDate, 6));
    const cells: TimelineCell[] = [];

    for (let i = 0; i < 7; i++) {
      const dayDate = addDays(startDate, i);
      cells.push({
        key: `${toLocalDateStr(dayDate)}-d`,
        start: dayDate,
        end: endOfDay(dayDate),
        label: formatDate(dayDate),
        subLabel: `周${WEEKDAY_LABELS[dayDate.getDay()]}`,
        isCurrent: isSameDay(dayDate, now),
        isWeekend: isWeekendDate(dayDate),
      });
    }

    return {
      startDate,
      endDate,
      cells,
      periodLabel: offset === 0 ? '本周' : formatRangeLabel(startDate, endDate),
    };
  }

  const monthDate = addMonths(now, offset);
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const cells: TimelineCell[] = [];

  let cursor = new Date(startDate);
  while (cursor.getTime() <= endDate.getTime()) {
    const cellStart = new Date(cursor);
    const weekEnd = endOfDay(addDays(cellStart, 6));
    const cellEnd = new Date(Math.min(weekEnd.getTime(), endDate.getTime()));
    cells.push({
      key: `${toLocalDateStr(cellStart)}-w`,
      start: cellStart,
      end: cellEnd,
      label: formatDate(cellStart),
      subLabel: `~${formatDate(cellEnd)}`,
      isCurrent: isDateInRange(now, cellStart, cellEnd),
      isWeekend: false,
    });
    cursor = addDays(cellStart, 7);
  }

  return {
    startDate,
    endDate,
    cells,
    periodLabel: offset === 0 ? '本月' : formatMonthLabel(monthDate),
  };
}

function buildTimelineMajorCells(cells: TimelineCell[], mode: GanttViewMode): TimelineMajorCell[] {
  if (cells.length === 0) return [];

  const now = new Date();
  const groups: TimelineMajorCell[] = [];
  let startIndex = 0;
  let groupKey = getMajorCellKey(cells[0].start, mode);

  for (let index = 1; index <= cells.length; index += 1) {
    const atEnd = index === cells.length;
    const nextKey = atEnd ? '' : getMajorCellKey(cells[index].start, mode);

    if (!atEnd && nextKey === groupKey) continue;

    const span = index - startIndex;
    const groupedCells = cells.slice(startIndex, index);
    groups.push({
      key: `${groupKey}-${startIndex}`,
      label: getMajorCellLabel(groupedCells[0].start, mode),
      span,
      isCurrent:
        mode === 'week'
          ? groupedCells.some((cell) => isDateInRange(now, cell.start, cell.end))
          : groupedCells.some((cell) => isSameDay(cell.start, now)),
    });

    startIndex = index;
    groupKey = nextKey;
  }

  return groups;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusFilterKey = 'all' | 'scheduled' | 'confirmed' | 'in_progress' | 'completed';

const VIEW_MODE_OPTIONS: Array<{
  key: GanttViewMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: 'time', label: '时间', icon: 'time-outline' },
  { key: 'day', label: '日', icon: 'calendar-outline' },
  { key: 'week', label: '周', icon: 'albums-outline' },
];

const GROUP_BY_OPTIONS: Array<{
  key: GanttGroupBy;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: ScheduleGanttDto.groupBy.WORK_CENTER, label: '中心', icon: 'grid-outline' },
  { key: ScheduleGanttDto.groupBy.EQUIPMENT, label: '设备', icon: 'hardware-chip-outline' },
];

export interface GanttViewProps {
  onCreateSchedule?: () => void;
  onEditEntry?: (entry: GanttEntry) => void;
  onDeleteEntry?: (entry: GanttEntry) => void;
  onConfirmEntry?: (entry: GanttEntry) => void;
  onUnconfirmEntry?: (entry: GanttEntry) => void;
  refreshKey: number;
  isLandscape: boolean;
  onToggleLandscape: () => void;
  onAnalysisQueryChange?: (query: ScheduleAnalysisQuery) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GanttView({
  onCreateSchedule,
  onEditEntry,
  onDeleteEntry,
  onConfirmEntry,
  onUnconfirmEntry,
  refreshKey,
  isLandscape,
  onToggleLandscape,
  onAnalysisQueryChange,
}: GanttViewProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [gantt, setGantt] = useState<GanttData | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<GanttViewMode>('day');
  const [viewOffset, setViewOffset] = useState(0);
  const [wcTypeFilter, setWcTypeFilter] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<GanttGroupBy>(ScheduleGanttDto.groupBy.WORK_CENTER);
  const [wcTypeLoaded, setWcTypeLoaded] = useState(false);
  const [groupByLoaded, setGroupByLoaded] = useState(false);
  const { options: wcTypeOptions } = useDict('work_center_type');
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const [selectedEntry, setSelectedEntry] = useState<GanttEntry | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>('all');
  const [isFilterSheetVisible, setFilterSheetVisible] = useState(false);
  const [drillPath, setDrillPath] = useState<Array<{ id?: string; name: string }>>([
    { name: '全部' },
  ]);
  const { width: screenWidth } = useWindowDimensions();

  // 从 AsyncStorage 恢复上次选的工作中心类型
  useEffect(() => {
    AsyncStorage.getItem(GANTT_WC_TYPE_STORAGE_KEY).then((val) => {
      if (val) setWcTypeFilter(val);
      setWcTypeLoaded(true);
    });
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(GANTT_GROUP_BY_STORAGE_KEY).then((val) => {
      if (
        val === ScheduleGanttDto.groupBy.WORK_CENTER ||
        val === ScheduleGanttDto.groupBy.EQUIPMENT
      ) {
        setGroupBy(val);
      }
      setGroupByLoaded(true);
    });
  }, []);

  const handleWcTypeChange = useCallback((val: string | null) => {
    setWcTypeFilter(val);
    if (val) AsyncStorage.setItem(GANTT_WC_TYPE_STORAGE_KEY, val);
    else AsyncStorage.removeItem(GANTT_WC_TYPE_STORAGE_KEY);
  }, []);

  const handleGroupByChange = useCallback((next: GanttGroupBy) => {
    setGroupBy(next);
    AsyncStorage.setItem(GANTT_GROUP_BY_STORAGE_KEY, next);
    setSelectedEntry(null);
  }, []);

  const clearFilters = useCallback(() => {
    handleWcTypeChange(null);
    setStatusFilter('all');
  }, [handleWcTypeChange]);

  const verticalScrollRef = useRef<ScrollView>(null);
  const headerScrollRef = useRef<ScrollView>(null);
  const rowScrollRefs = useRef<Map<number, ScrollView>>(new Map());
  const isSyncing = useRef(false);

  const now = new Date();
  const { startDate, endDate, cells, periodLabel } = useMemo(
    () => buildTimeline(viewMode, viewOffset),
    [viewMode, viewOffset],
  );
  const minCellWidth = (isLandscape ? MIN_CELL_WIDTH_LANDSCAPE : MIN_CELL_WIDTH_PORTRAIT)[viewMode];
  const availableWidth = Math.max(screenWidth - GANTT_LABEL_WIDTH, 0);
  const cellCount = Math.max(cells.length, 1);
  const CELL_WIDTH = Math.max(Math.floor(availableWidth / cellCount), minCellWidth);
  const TOTAL_WIDTH = CELL_WIDTH * cellCount;
  const timelineStartMs = startDate.getTime();
  const timelineEndMs = endDate.getTime();
  const timelineMs = Math.max(timelineEndMs - timelineStartMs, 1);

  const currentDrillId = drillPath[drillPath.length - 1]?.id;

  useEffect(() => {
    onAnalysisQueryChange?.({
      startDate: toLocalDateStr(startDate),
      endDate: toLocalDateStr(endDate),
      workCenterId: currentDrillId,
      workCenterType: wcTypeFilter ?? undefined,
      statusFilter: statusFilter === 'all' ? undefined : [statusFilter],
    });
  }, [currentDrillId, endDate, onAnalysisQueryChange, startDate, statusFilter, wcTypeFilter]);

  const fetchGantt = useCallback(
    async (
      sd: Date,
      ed: Date,
      nextGroupBy: GanttGroupBy,
      wcType?: string | null,
      wcId?: string,
    ) => {
      setLoading(true);
      try {
        const data = await scheduleService.getGantt({
          startDate: toISO(sd),
          endDate: toISO(ed),
          groupBy: nextGroupBy,
          statuses: statusFilter === 'all' ? undefined : [statusFilter],
          workCenterType: wcType || undefined,
          workCenterId: wcId,
        });
        setGantt(data);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : '加载甘特图失败');
      } finally {
        setLoading(false);
      }
    },
    [statusFilter],
  );

  useFocusEffect(
    useCallback(() => {
      void refreshKey;
      if (!wcTypeLoaded || !groupByLoaded) return;
      fetchGantt(startDate, endDate, groupBy, wcTypeFilter, currentDrillId);
    }, [
      currentDrillId,
      endDate,
      fetchGantt,
      groupBy,
      groupByLoaded,
      refreshKey,
      startDate,
      wcTypeFilter,
      wcTypeLoaded,
    ]),
  );

  useEffect(() => {
    if (!gantt || !selectedEntry) return;
    const refreshedEntry = gantt.workCenters
      .flatMap((workCenter) => workCenter.entries)
      .find((entry) => entry.id === selectedEntry.id);
    setSelectedEntry(refreshedEntry ?? null);
  }, [gantt, selectedEntry]);

  useEffect(() => {
    void [currentDrillId, groupBy, statusFilter, viewMode, viewOffset, wcTypeFilter];
    setSelectedEntry(null);
  }, [currentDrillId, groupBy, statusFilter, viewMode, viewOffset, wcTypeFilter]);

  const drillDown = useCallback((wcId: string, wcName: string) => {
    setDrillPath((prev) => [...prev, { id: wcId, name: wcName }]);
  }, []);

  const drillTo = useCallback((index: number) => {
    setDrillPath((prev) => prev.slice(0, index + 1));
  }, []);

  const getBarLayout = useCallback(
    (entry: GanttEntry): { left: number; width: number; actualWidth: number } | null => {
      const entryStart = new Date(getEntryVisualStart(entry));
      const entryEnd = new Date(getEntryVisualEnd(entry));
      if (entryEnd.getTime() < timelineStartMs || entryStart.getTime() > timelineEndMs) {
        return null;
      }
      const clampedStart = entryStart < startDate ? startDate : entryStart;
      const clampedEnd = entryEnd > endDate ? endDate : entryEnd;
      const leftRatio = (clampedStart.getTime() - timelineStartMs) / timelineMs;
      const widthRatio = (clampedEnd.getTime() - clampedStart.getTime()) / timelineMs;
      const actualWidth = Math.max(
        widthRatio * TOTAL_WIDTH,
        getScaledVisibleActualWidth(viewMode, CELL_WIDTH, Boolean(entry.isBuffer)),
      );
      const minBarWidth = getScaledMinBarWidth(viewMode, CELL_WIDTH, Boolean(entry.isBuffer));

      return {
        left: leftRatio * TOTAL_WIDTH,
        width: Math.max(actualWidth, minBarWidth),
        actualWidth,
      };
    },
    [
      CELL_WIDTH,
      TOTAL_WIDTH,
      endDate,
      startDate,
      timelineEndMs,
      timelineMs,
      timelineStartMs,
      viewMode,
    ],
  );

  const syncScroll = (sourceIdx: number | 'header', x: number) => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    if (sourceIdx !== 'header') {
      headerScrollRef.current?.scrollTo({ x, animated: false });
    }
    rowScrollRefs.current.forEach((ref, idx) => {
      if (idx !== sourceIdx) ref.scrollTo({ x, animated: false });
    });
    setTimeout(() => {
      isSyncing.current = false;
    }, 50);
  };

  const getBarLayouts = useCallback(
    (entries: GanttEntry[]): PixelBarLayout[] => {
      const sortedEntries = [...entries].sort((a, b) => {
        const startDiff =
          new Date(getEntryVisualStart(a)).getTime() - new Date(getEntryVisualStart(b)).getTime();
        if (startDiff !== 0) return startDiff;

        if (a.workOrderId === b.workOrderId && a.isBuffer !== b.isBuffer) {
          return a.isBuffer ? 1 : -1;
        }

        if (a.isBuffer !== b.isBuffer) {
          return a.isBuffer ? -1 : 1;
        }

        const endDiff =
          new Date(getEntryVisualEnd(a)).getTime() - new Date(getEntryVisualEnd(b)).getTime();
        if (endDiff !== 0) return endDiff;

        return String(a.id).localeCompare(String(b.id));
      });

      const laneRightEdges: number[] = [];
      const entryLaneMap = new Map<string, number>();
      const workOrderAnchorMap = new Map<
        string,
        { lane: number; rightEdge: number; endTime: number }
      >();
      const layouts: PixelBarLayout[] = [];

      for (const entry of sortedEntries) {
        const pos = getBarLayout(entry);
        if (!pos) continue;

        const preferredLaneIndex = entry.isBuffer
          ? ((entry.bufferAfterEntryId ? entryLaneMap.get(entry.bufferAfterEntryId) : undefined) ??
            workOrderAnchorMap.get(entry.workOrderId)?.lane)
          : workOrderAnchorMap.get(entry.workOrderId)?.lane;
        const shouldOverlayAnchorLane = entry.isBuffer && preferredLaneIndex != null;

        let resolvedLaneIndex: number;
        if (shouldOverlayAnchorLane) {
          resolvedLaneIndex = preferredLaneIndex;
        } else if (
          preferredLaneIndex != null &&
          (laneRightEdges[preferredLaneIndex] ?? Number.NEGATIVE_INFINITY) <= pos.left
        ) {
          resolvedLaneIndex = preferredLaneIndex;
        } else {
          const laneIndex = laneRightEdges.findIndex((rightEdge) => rightEdge <= pos.left);
          resolvedLaneIndex = laneIndex >= 0 ? laneIndex : laneRightEdges.length;
        }

        const nextRightEdge = pos.left + pos.width;
        if (shouldOverlayAnchorLane) {
          laneRightEdges[resolvedLaneIndex] = Math.max(
            laneRightEdges[resolvedLaneIndex] ?? Number.NEGATIVE_INFINITY,
            nextRightEdge,
          );
        } else {
          laneRightEdges[resolvedLaneIndex] = nextRightEdge;
        }
        entryLaneMap.set(entry.id, resolvedLaneIndex);

        if (!entry.isBuffer) {
          const endTime = new Date(getEntryVisualEnd(entry)).getTime();
          const currentAnchor = workOrderAnchorMap.get(entry.workOrderId);
          if (
            !currentAnchor ||
            endTime > currentAnchor.endTime ||
            (endTime === currentAnchor.endTime && pos.left + pos.width >= currentAnchor.rightEdge)
          ) {
            workOrderAnchorMap.set(entry.workOrderId, {
              lane: resolvedLaneIndex,
              rightEdge: pos.left + pos.width,
              endTime,
            });
          }
        }

        layouts.push({
          entry,
          left: pos.left,
          width: pos.width,
          actualWidth: pos.actualWidth,
          lane: resolvedLaneIndex,
        });
      }

      return layouts;
    },
    [getBarLayout],
  );

  const currentGroupBy =
    GROUP_BY_OPTIONS.find((option) => option.key === groupBy) ?? GROUP_BY_OPTIONS[0];
  const activeFilterCount = getActiveFilterCount(wcTypeFilter, statusFilter);
  const hasActiveFilters = activeFilterCount > 0;

  const currentViewMode =
    VIEW_MODE_OPTIONS.find((option) => option.key === viewMode) ?? VIEW_MODE_OPTIONS[1];
  const selectedEntryId = selectedEntry?.id ?? null;
  const majorCells = useMemo(() => buildTimelineMajorCells(cells, viewMode), [cells, viewMode]);

  return (
    <View style={s.root}>
      {/* ─── 工具栏 ─── */}
      <View style={[s.toolbar, { borderBottomColor: colors.border }]}>
        {/* 时间导航 */}
        <View style={s.weekNavGroup}>
          <TouchableOpacity
            onPress={() => setViewOffset((o) => o - 1)}
            style={s.weekNavBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={16} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewOffset(0)} style={s.weekLabelBtn}>
            <Text style={[s.weekLabel, { color: viewOffset === 0 ? colors.primary : colors.text }]}>
              {periodLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewOffset((o) => o + 1)}
            style={s.weekNavBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-forward" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={[s.toolbarDivider, { backgroundColor: colors.border }]} />

        {/* 视图控制 */}
        <View style={s.filterGroup}>
          <TouchableOpacity
            style={[
              s.filterBtn,
              {
                backgroundColor:
                  viewMode !== 'day' ? `${colors.primary}12` : colors.surfaceSecondary,
                borderColor: viewMode !== 'day' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => {
              setViewMode((prev) => {
                const idx = VIEW_MODE_OPTIONS.findIndex((option) => option.key === prev);
                const next = VIEW_MODE_OPTIONS[(idx + 1) % VIEW_MODE_OPTIONS.length];
                return next.key;
              });
              setViewOffset(0);
            }}
          >
            <Ionicons
              name={currentViewMode.icon}
              size={12}
              color={viewMode !== 'day' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                s.filterBtnText,
                { color: viewMode !== 'day' ? colors.primary : colors.textSecondary },
              ]}
            >
              {currentViewMode.label}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              s.filterBtn,
              {
                backgroundColor:
                  groupBy !== ScheduleGanttDto.groupBy.WORK_CENTER
                    ? `${colors.primary}12`
                    : colors.surfaceSecondary,
                borderColor:
                  groupBy !== ScheduleGanttDto.groupBy.WORK_CENTER ? colors.primary : colors.border,
              },
            ]}
            onPress={() =>
              handleGroupByChange(
                groupBy === ScheduleGanttDto.groupBy.WORK_CENTER
                  ? ScheduleGanttDto.groupBy.EQUIPMENT
                  : ScheduleGanttDto.groupBy.WORK_CENTER,
              )
            }
          >
            <Ionicons
              name={currentGroupBy.icon}
              size={12}
              color={
                groupBy !== ScheduleGanttDto.groupBy.WORK_CENTER
                  ? colors.primary
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                s.filterBtnText,
                {
                  color:
                    groupBy !== ScheduleGanttDto.groupBy.WORK_CENTER
                      ? colors.primary
                      : colors.textSecondary,
                },
              ]}
            >
              {currentGroupBy.label}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              s.filterBtn,
              {
                backgroundColor: hasActiveFilters ? `${colors.primary}12` : colors.surfaceSecondary,
                borderColor: hasActiveFilters ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setFilterSheetVisible(true)}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <Ionicons
              name="options-outline"
              size={12}
              color={hasActiveFilters ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                s.filterBtnText,
                { color: hasActiveFilters ? colors.primary : colors.textSecondary },
              ]}
            >
              筛选
            </Text>
            {activeFilterCount > 0 && (
              <View style={[s.filterCountBadge, { backgroundColor: colors.primary }]}>
                <Text style={[s.filterCountBadgeText, { color: colors.textOnPrimary }]}>
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 操作按钮组 */}
        <View style={s.actionGroup}>
          <TouchableOpacity
            style={[
              s.iconBtn,
              {
                backgroundColor: isLandscape ? `${colors.primary}15` : colors.surfaceSecondary,
                borderColor: isLandscape ? colors.primary : colors.border,
              },
            ]}
            onPress={onToggleLandscape}
          >
            <Ionicons
              name={isLandscape ? 'phone-portrait-outline' : 'phone-landscape-outline'}
              size={14}
              color={isLandscape ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <BottomSheet
        visible={isFilterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        title="甘特图筛选"
        dynamicHeight
        maxHeightRatio={0.72}
      >
        <View style={s.filterSheetContent}>
          <View style={s.filterSection}>
            <View style={s.filterSectionHeader}>
              <Text style={[s.filterSectionTitle, { color: colors.text }]}>工作中心类型</Text>
              {wcTypeFilter && (
                <TouchableOpacity
                  style={s.filterSectionActionButton}
                  onPress={() => handleWcTypeChange(null)}
                  accessibilityRole="button"
                  accessibilityLabel="清除工作中心类型筛选"
                >
                  <Text style={[s.filterSectionAction, { color: colors.primary }]}>清除</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={s.filterOptionWrap}>
              <SelectableChip
                label="全部"
                selected={!wcTypeFilter}
                onPress={() => handleWcTypeChange(null)}
              />

              {wcTypeOptions.map((option) => {
                const selected = option.value === wcTypeFilter;
                return (
                  <SelectableChip
                    key={option.value}
                    label={option.label}
                    selected={selected}
                    onPress={() => handleWcTypeChange(selected ? null : option.value)}
                  />
                );
              })}
            </View>
          </View>

          <View style={s.filterSection}>
            <View style={s.filterSectionHeader}>
              <Text style={[s.filterSectionTitle, { color: colors.text }]}>状态</Text>
              {statusFilter !== 'all' && (
                <TouchableOpacity
                  style={s.filterSectionActionButton}
                  onPress={() => setStatusFilter('all')}
                  accessibilityRole="button"
                  accessibilityLabel="清除状态筛选"
                >
                  <Text style={[s.filterSectionAction, { color: colors.primary }]}>清除</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={s.filterOptionWrap}>
              {SCHEDULE_STATUS_TABS.map((option) => {
                const selected = option.key === statusFilter;
                return (
                  <SelectableChip
                    key={option.key}
                    label={option.label}
                    selected={selected}
                    onPress={() => setStatusFilter(option.key as StatusFilterKey)}
                  />
                );
              })}
            </View>
          </View>

          {hasActiveFilters && (
            <TouchableOpacity
              style={[s.filterResetBtn, { borderColor: colors.border }]}
              onPress={clearFilters}
            >
              <Ionicons name="close-circle-outline" size={14} color={colors.textSecondary} />
              <Text style={[s.filterResetText, { color: colors.textSecondary }]}>清除全部筛选</Text>
            </TouchableOpacity>
          )}
        </View>
      </BottomSheet>

      {/* ─── 下钻面包屑 ─── */}
      {drillPath.length > 1 && (
        <View style={[s.breadcrumbBar, { borderBottomColor: colors.border }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.breadcrumbContent}
            style={s.breadcrumbScroll}
          >
            {drillPath.map((crumb, idx) => {
              const isLast = idx === drillPath.length - 1;
              return (
                <View key={crumb.id ?? 'root'} style={s.breadcrumbItem}>
                  <TouchableOpacity onPress={() => !isLast && drillTo(idx)} disabled={isLast}>
                    <Text
                      style={[
                        s.breadcrumbText,
                        {
                          color: isLast ? colors.primary : colors.textSecondary,
                          fontWeight: isLast ? '600' : '400',
                        },
                      ]}
                    >
                      {crumb.name}
                    </Text>
                  </TouchableOpacity>
                  {!isLast && (
                    <Ionicons
                      name="chevron-forward"
                      size={11}
                      color={colors.textTertiary}
                      style={s.breadcrumbChevron}
                    />
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {loading && <InlineLoading />}

      {/* ─── 甘特图主体 ─── */}
      <View style={s.root}>
        {/* 固定表头行（日期） */}
        <View style={[s.headerRow, { borderBottomColor: colors.border }]}>
          <View
            style={[
              s.cornerCell,
              { borderRightColor: colors.border, backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <Text style={[s.cornerText, { color: colors.textMuted }]}>
              {groupBy === ScheduleGanttDto.groupBy.EQUIPMENT ? '设备' : '中心'}
            </Text>
          </View>
          <ScrollView
            ref={headerScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(e) => syncScroll('header', e.nativeEvent.contentOffset.x)}
          >
            <View style={[s.headerTimeline, { width: TOTAL_WIDTH }]}>
              <View style={[s.headerMajorRow, { borderBottomColor: colors.border }]}>
                {majorCells.map((majorCell) => (
                  <View
                    key={majorCell.key}
                    style={[
                      s.headerMajorCell,
                      {
                        width: majorCell.span * CELL_WIDTH,
                        borderRightColor: colors.border,
                        backgroundColor: majorCell.isCurrent
                          ? `${colors.primary}0A`
                          : colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        s.headerMajorText,
                        { color: majorCell.isCurrent ? colors.primary : colors.textMuted },
                      ]}
                      numberOfLines={1}
                    >
                      {majorCell.label}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={s.headerMinorRow}>
                {cells.map((cell) => (
                  <View
                    key={cell.key}
                    style={[
                      s.headerMinorCell,
                      {
                        width: CELL_WIDTH,
                        borderRightColor: colors.border,
                        backgroundColor: cell.isCurrent
                          ? `${colors.primary}08`
                          : cell.isWeekend
                            ? colors.warningSurface
                            : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        s.headerMinorPrimary,
                        { color: cell.isCurrent ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {cell.label}
                    </Text>
                    {viewMode !== 'time' && (
                      <Text
                        style={[
                          s.headerMinorSecondary,
                          { color: cell.isCurrent ? colors.primary : colors.textMuted },
                        ]}
                      >
                        {cell.subLabel}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* 内容区域 */}
        <ScrollView ref={verticalScrollRef} style={s.root} contentContainerStyle={s.bodyContent}>
          {gantt?.workCenters?.map((wc, rowIdx) => {
            const filteredEntries =
              statusFilter === 'all'
                ? ((wc.entries ?? []) as GanttEntry[]).filter((e) => e.status !== 'cancelled')
                : ((wc.entries ?? []) as GanttEntry[]).filter((e) => e.status === statusFilter);
            if (wc.id === 'unassigned' && filteredEntries.length === 0) {
              return null;
            }
            const barLayouts = getBarLayouts(filteredEntries);
            const laneCount =
              barLayouts.length > 0 ? Math.max(...barLayouts.map((bar) => bar.lane)) + 1 : 1;
            const isSelectedRow = barLayouts.some((bar) => bar.entry.id === selectedEntry?.id);
            const densityMetrics = getRowDensityMetrics(laneCount, isSelectedRow);
            const rowHeight = Math.max(GANTT_EMPTY_ROW_HEIGHT, densityMetrics.rowHeight);

            const isUnassigned = wc.id === 'unassigned';
            const canDrillDown = wc.hasChildren && !isUnassigned;
            const isCrowded = laneCount >= 3 || barLayouts.length >= 5;

            return (
              <View key={wc.id} style={[s.ganttRow, { borderBottomColor: colors.border }]}>
                {/* 左侧标签 */}
                <TouchableOpacity
                  style={[
                    s.rowLabel,
                    {
                      borderRightColor: colors.border,
                      height: rowHeight,
                      borderLeftColor: isSelectedRow ? colors.primary : 'transparent',
                      backgroundColor: isSelectedRow
                        ? `${colors.primary}10`
                        : isUnassigned
                          ? colors.warningSurface
                          : colors.surfaceSecondary,
                    },
                  ]}
                  onPress={() => canDrillDown && drillDown(wc.id, wc.name)}
                  disabled={!canDrillDown}
                  activeOpacity={0.6}
                >
                  <View style={s.rowLabelHeader}>
                    <View style={s.rowLabelTitleRow}>
                      {wc.type === 'equipment' && (
                        <Ionicons
                          name="hardware-chip-outline"
                          size={12}
                          color={colors.textTertiary}
                          style={s.equipmentIcon}
                        />
                      )}
                      <Text
                        style={[
                          s.rowLabelText,
                          {
                            color: colors.text,
                            fontWeight: isSelectedRow ? '600' : '500',
                          },
                          isUnassigned && s.unassignedLabel,
                        ]}
                        numberOfLines={2}
                      >
                        {wc.name}
                      </Text>
                    </View>
                    {canDrillDown && (
                      <Ionicons
                        name="chevron-forward"
                        size={12}
                        color={colors.textTertiary}
                        style={s.rowLabelChevron}
                      />
                    )}
                  </View>
                  {barLayouts.length > 0 && (
                    <View style={s.rowMeta}>
                      <View style={[s.rowMetaPill, { backgroundColor: `${colors.textMuted}12` }]}>
                        <Text style={[s.rowMetaText, { color: colors.textSecondary }]}>
                          {barLayouts.length}单
                        </Text>
                      </View>
                      {isCrowded && (
                        <View style={[s.rowMetaPill, { backgroundColor: `${colors.warning}12` }]}>
                          <Text style={[s.rowMetaText, { color: colors.warning }]}>
                            {laneCount}层
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>

                {/* 右侧甘特条区域 */}
                <ScrollView
                  ref={(ref: ScrollView | null) => {
                    if (ref) rowScrollRefs.current.set(rowIdx, ref);
                    else rowScrollRefs.current.delete(rowIdx);
                  }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  scrollEventThrottle={16}
                  onScroll={(e) => syncScroll(rowIdx, e.nativeEvent.contentOffset.x)}
                >
                  <View
                    style={[
                      s.rowTimelineSurface,
                      {
                        width: TOTAL_WIDTH,
                        height: rowHeight,
                        backgroundColor: isSelectedRow
                          ? `${colors.primary}04`
                          : isUnassigned
                            ? `${colors.warningSurface}66`
                            : colors.surfaceSecondary,
                      },
                    ]}
                  >
                    {/* 时间分隔线 + 当前周期高亮 */}
                    {cells.map((cell, cellIdx) => {
                      return (
                        <View
                          key={cell.key}
                          style={[
                            s.dayColumn,
                            {
                              left: cellIdx * CELL_WIDTH,
                              width: CELL_WIDTH,
                              borderRightColor: `${colors.border}50`,
                              backgroundColor: cell.isCurrent
                                ? `${colors.primary}05`
                                : cell.isWeekend
                                  ? `${colors.warningSurface}88`
                                  : 'transparent',
                            },
                          ]}
                        />
                      );
                    })}

                    {/* 当前时间指示线 */}
                    {(() => {
                      if (!isDateInRange(now, startDate, endDate)) return null;
                      const lineX = ((now.getTime() - timelineStartMs) / timelineMs) * TOTAL_WIDTH;
                      return (
                        <View
                          style={[
                            s.todayLine,
                            { left: lineX - 0.5, backgroundColor: `${colors.error}80` },
                          ]}
                          pointerEvents="none"
                        />
                      );
                    })()}

                    {/* 甘特条 */}
                    {barLayouts.map((bar) => {
                      const { entry, left, width, actualWidth, lane } = bar;
                      const isBuffer = entry.isBuffer === true;
                      const canEditEntry = Boolean(onEditEntry) && isGanttEntryEditable(entry);
                      const progress = computeProgress(entry);
                      const primaryLabel = getPrimaryLabel(entry);
                      const quantityLabel = getEntryQuantityLabel(entry, unitLabelMap);
                      const resourceLabel = getEntryResourceLabel(entry);
                      const orderNoLabel = entry.workOrder?.orderNo?.trim();
                      const durationLabel = formatDurationLabel(entry.durationMinutes);
                      const compactDurationLabel = formatCompactDurationLabel(
                        entry.durationMinutes,
                      );
                      const compactResourceLabel =
                        resourceLabel && resourceLabel.length > 6
                          ? `${resourceLabel.slice(0, 6)}…`
                          : resourceLabel;
                      const isCompact = densityMetrics.barHeight <= 30;
                      const isDenseRow = densityMetrics.barHeight <= 22;
                      const canShowMetaLine = densityMetrics.barHeight >= 36;
                      const isSelected = selectedEntryId === entry.id;
                      const barTextMetrics = getBarTextMetrics(
                        viewMode,
                        CELL_WIDTH,
                        isBuffer,
                        isSelected,
                        canShowMetaLine,
                      );
                      const titleFontSize =
                        densityMetrics.barHeight <= 22
                          ? FontSize.xs
                          : isCompact
                            ? FontSize.xs
                            : FontSize.sm;
                      const titleLineHeight =
                        densityMetrics.barHeight <= 22 ? 14 : isCompact ? 16 : 18;
                      const secondaryLineHeight = canShowMetaLine ? 16 : 14;
                      const compactPrimaryLabel =
                        isDenseRow || width <= barTextMetrics.compactPrimaryLabelThreshold
                          ? toCompactLabel(primaryLabel)
                          : primaryLabel;
                      const denseRowLabel = isBuffer
                        ? `${compactPrimaryLabel} 缓冲`
                        : compactPrimaryLabel;
                      const timeRange = `${formatTime(getEntryVisualStart(entry))}-${formatTime(
                        getEntryVisualEnd(entry),
                      )}`;
                      const secondaryParts = isBuffer
                        ? [durationLabel || '缓冲时间', resourceLabel]
                        : [quantityLabel, durationLabel, resourceLabel].filter(Boolean);
                      const compactSecondaryParts = isBuffer
                        ? [compactDurationLabel || '缓冲', compactResourceLabel]
                        : [quantityLabel, compactDurationLabel, compactResourceLabel].filter(
                            Boolean,
                          );
                      const secondaryLabel = secondaryParts.join(' · ') || timeRange;
                      const compactSecondaryLabel = compactSecondaryParts.join(' · ') || timeRange;
                      const renderedSecondaryLabel =
                        width >= barTextMetrics.fullSecondaryLabelThreshold
                          ? secondaryLabel
                          : compactSecondaryLabel;
                      const scheduleCfg = isBuffer
                        ? { color: colors.textMuted, bg: `${colors.textMuted}10` }
                        : (SCHEDULE_STATUS_CONFIG[entry.status] ?? UNKNOWN_STATUS_FALLBACK);
                      const dependencyMessage = getDependencyMessage(entry);
                      const dependencyConflict = hasDependencyConflict(entry);
                      const dependencyWarning =
                        !dependencyConflict && Boolean(entry.dependencyWarning);
                      const dependencyColor = dependencyConflict
                        ? colors.error
                        : dependencyWarning
                          ? colors.warning
                          : null;
                      const executionVisual = getExecutionVisual(
                        entry.workOrder?.statusDisplay ?? entry.workOrder?.status ?? null,
                        entry.status,
                      );
                      const statusChipLabel = entry.reconfirmRequired
                        ? '待重确认'
                        : (SCHEDULE_STATUS_CONFIG[entry.status]?.label ?? '未知状态');
                      const usesScheduleBorderCue =
                        entry.status === 'scheduled' || entry.status === 'confirmed';
                      const barBorderColor =
                        dependencyColor ??
                        (usesScheduleBorderCue
                          ? scheduleCfg.color
                          : isSelected
                            ? executionVisual.color
                            : executionVisual.borderColor);
                      const barBorderStyle =
                        dependencyWarning || entry.status === 'scheduled' ? 'dashed' : 'solid';
                      const topOffset =
                        densityMetrics.barGap +
                        lane * (densityMetrics.barHeight + densityMetrics.barGap);
                      const showPrimaryText = width >= barTextMetrics.showPrimaryTextMinWidth;
                      const showSecondaryText = width >= barTextMetrics.showSecondaryTextMinWidth;
                      const showStatusChip =
                        !isBuffer && width >= barTextMetrics.showStatusChipMinWidth;
                      const showTimeLabel =
                        secondaryLabel !== timeRange &&
                        width >= barTextMetrics.showTimeLabelMinWidth;
                      const showOrderNoRow =
                        !isBuffer &&
                        Boolean(orderNoLabel) &&
                        width >= barTextMetrics.showOrderNoMinWidth;
                      const durationTrackHeight = isDenseRow ? 6 : 10;
                      const durationTrackBottom = isDenseRow ? 4 : 6;
                      const horizontalPadding = width < 108 ? 7 : width < 148 ? 9 : 11;
                      const durationTrackInset = isBuffer ? 0 : Math.max(4, horizontalPadding);
                      const contentBottomPadding =
                        durationTrackHeight + durationTrackBottom + (width < 148 ? 4 : 6);
                      const durationTrackColor = GANTT_BUFFER_TRACK_COLOR;
                      const actualTrackWidth = isBuffer
                        ? Math.max(Math.min(actualWidth, width), 1)
                        : Math.max(Math.min(actualWidth, width) - durationTrackInset * 2, 6);

                      return (
                        <TouchableOpacity
                          key={entry.id}
                          activeOpacity={isBuffer ? 1 : 0.7}
                          accessibilityLabel={
                            isBuffer
                              ? `${denseRowLabel}，缓冲时间`
                              : `${denseRowLabel}，${executionVisual.label}，排产${statusChipLabel}${
                                  dependencyMessage ? `，${dependencyMessage}` : ''
                                }`
                          }
                          onPress={() => {
                            setSelectedEntry(isSelected ? null : entry);
                          }}
                          onLongPress={() => {
                            if (canEditEntry) onEditEntry?.(entry);
                          }}
                          style={[
                            s.ganttBar,
                            {
                              left,
                              width,
                              top: topOffset,
                              height: densityMetrics.barHeight,
                              backgroundColor: isBuffer
                                ? 'transparent'
                                : executionVisual.backgroundColor,
                              borderWidth: isBuffer ? 0 : isSelected ? 1.5 : 1,
                              borderColor: barBorderColor,
                              borderStyle: barBorderStyle,
                              shadowColor: isSelected ? executionVisual.color : '#0F172A',
                              shadowOpacity: isBuffer ? 0 : isSelected ? 0.14 : 0.04,
                              shadowRadius: isBuffer ? 0 : isSelected ? 10 : 3,
                              shadowOffset: { width: 0, height: isBuffer ? 0 : isSelected ? 4 : 1 },
                              elevation: isBuffer ? 0 : isSelected ? 3 : 0,
                              opacity: selectedEntryId && !isSelected ? 0.44 : 1,
                            },
                          ]}
                        >
                          <View
                            style={[
                              s.barDurationTrack,
                              {
                                left: durationTrackInset,
                                bottom: durationTrackBottom,
                                height: durationTrackHeight,
                                width: actualTrackWidth,
                                backgroundColor: isBuffer
                                  ? durationTrackColor
                                  : executionVisual.trackColor,
                                borderColor: isBuffer
                                  ? durationTrackColor
                                  : executionVisual.trackColor,
                                borderStyle: 'solid',
                              },
                            ]}
                          >
                            {!isBuffer && progress > 0 && (
                              <View
                                style={[
                                  s.barProgressFill,
                                  {
                                    width: `${progress}%`,
                                    backgroundColor: executionVisual.progressColor,
                                  },
                                ]}
                              />
                            )}
                          </View>
                          {!isBuffer && showOrderNoRow && (
                            <View
                              pointerEvents="none"
                              style={[
                                s.barOrderNoBadge,
                                {
                                  left: horizontalPadding,
                                  bottom: Math.max(durationTrackBottom - 1, 0),
                                  maxWidth: Math.max(width - horizontalPadding * 2, 0),
                                  height: durationTrackHeight + 2,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  s.barOrderNo,
                                  {
                                    color: isSelected ? colors.text : colors.textSecondary,
                                    lineHeight: durationTrackHeight + 2,
                                    fontSize: isDenseRow ? 8 : 10,
                                    fontWeight: isSelected ? '700' : '600',
                                    textShadowColor: toRgba(colors.surface, 0.92),
                                    textShadowOffset: { width: 0, height: 1 },
                                    textShadowRadius: 2,
                                  },
                                ]}
                                numberOfLines={1}
                              >
                                {orderNoLabel}
                              </Text>
                            </View>
                          )}
                          {!isBuffer && (
                            <View
                              style={[
                                s.barContent,
                                {
                                  gap: canShowMetaLine ? 2 : 0,
                                  paddingLeft: horizontalPadding,
                                  paddingRight: horizontalPadding,
                                  paddingBottom: contentBottomPadding,
                                },
                              ]}
                            >
                              {showPrimaryText && (
                                <View style={s.barPrimaryRow}>
                                  <Text
                                    style={[
                                      s.barTitle,
                                      {
                                        color: colors.text,
                                        fontSize: titleFontSize,
                                        lineHeight: titleLineHeight,
                                        fontWeight: isSelected ? '700' : '600',
                                      },
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {denseRowLabel}
                                  </Text>
                                  {showStatusChip && (
                                    <View
                                      style={[
                                        s.barStatusChip,
                                        { backgroundColor: `${scheduleCfg.color}14` },
                                      ]}
                                    >
                                      <Text
                                        style={[s.barStatusChipText, { color: scheduleCfg.color }]}
                                        numberOfLines={1}
                                      >
                                        {statusChipLabel}
                                      </Text>
                                    </View>
                                  )}
                                  {dependencyColor && (
                                    <Ionicons
                                      name={
                                        dependencyConflict
                                          ? 'alert-circle-outline'
                                          : 'information-circle-outline'
                                      }
                                      size={12}
                                      color={dependencyColor}
                                    />
                                  )}
                                </View>
                              )}
                              {showSecondaryText && (
                                <View style={s.barSecondaryRow}>
                                  <Text
                                    style={[
                                      s.barSubtitle,
                                      {
                                        color: colors.textSecondary,
                                        lineHeight: secondaryLineHeight,
                                      },
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {renderedSecondaryLabel}
                                  </Text>
                                  {showTimeLabel && (
                                    <Text
                                      style={[
                                        s.barMeta,
                                        {
                                          color: colors.textMuted,
                                          lineHeight: secondaryLineHeight,
                                        },
                                      ]}
                                      numberOfLines={1}
                                    >
                                      {timeRange}
                                    </Text>
                                  )}
                                </View>
                              )}
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            );
          })}

          {(!gantt?.workCenters || gantt.workCenters.length === 0) && !loading && (
            <EmptyState compact icon="calendar-outline" title="暂无排产记录" />
          )}
        </ScrollView>

        {onCreateSchedule && (
          <FAB
            onPress={onCreateSchedule}
            draggable
            storageKey={GANTT_CREATE_FAB_POSITION_STORAGE_KEY}
            accessibilityLabel="新增排产"
            accessibilityHint="可拖动到甘特图内合适位置"
          />
        )}
      </View>

      {/* ─── 选中条目信息卡片 ─── */}
      {selectedEntry &&
        (() => {
          const e = selectedEntry;
          const wo = e.workOrder;
          const cardTitle = getPrimaryLabel(e);
          const scheduleCfg = SCHEDULE_STATUS_CONFIG[e.status] ?? {
            ...UNKNOWN_STATUS_FALLBACK,
            label: '未知状态',
          };
          const workOrderStatusDisplay = wo?.statusDisplay ?? wo?.status ?? null;
          const workOrderCfg = workOrderStatusDisplay
            ? (WORK_ORDER_DISPLAY_STATUS_CONFIG[workOrderStatusDisplay] ?? {
                ...UNKNOWN_STATUS_FALLBACK,
                label: '未知状态',
              })
            : null;
          const canEditEntry = Boolean(onEditEntry) && isGanttEntryEditable(e);
          const canDeleteEntry = Boolean(onDeleteEntry) && isGanttEntryDeletable(e);
          const dependencyMessage = getDependencyMessage(e);
          const dependencyConflict = hasDependencyConflict(e);
          const canConfirmEntry =
            canEditEntry &&
            e.status === 'scheduled' &&
            !dependencyConflict &&
            Boolean(onConfirmEntry);
          const canUnconfirmEntry =
            canEditEntry && e.status === 'confirmed' && Boolean(onUnconfirmEntry);
          const dependencyTone = dependencyConflict ? colors.error : colors.warning;
          const bufferSummary = formatBufferPolicySummary({
            minutes: wo?.scheduleBufferMinutes,
            ratio: wo?.scheduleBufferRatio,
            source: wo?.scheduleBufferSource,
          });
          return (
            <View
              style={[
                s.infoCard,
                { backgroundColor: colors.surface, borderTopColor: colors.border },
              ]}
            >
              <View style={[s.infoCardAccent, { backgroundColor: scheduleCfg.color }]} />
              <View style={s.infoCardBody}>
                <View style={s.infoCardHeader}>
                  <Text style={[s.infoCardTitle, { color: colors.text }]} numberOfLines={1}>
                    {cardTitle}
                  </Text>
                  <View style={s.infoCardActions}>
                    <View style={[s.infoCardBadge, { backgroundColor: scheduleCfg.bg }]}>
                      <Text style={[s.infoCardBadgeText, { color: scheduleCfg.color }]}>
                        排产 {scheduleCfg.label}
                      </Text>
                    </View>
                    {e.reconfirmRequired && (
                      <View style={[s.infoCardBadge, { backgroundColor: `${colors.warning}18` }]}>
                        <Text style={[s.infoCardBadgeText, { color: colors.warning }]}>
                          待重确认
                        </Text>
                      </View>
                    )}
                    {workOrderCfg && (
                      <View style={[s.infoCardBadge, { backgroundColor: workOrderCfg.bg }]}>
                        <Text style={[s.infoCardBadgeText, { color: workOrderCfg.color }]}>
                          工单 {workOrderCfg.label}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => setSelectedEntry(null)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={s.infoTagRow}>
                  {wo?.material?.name && (
                    <Text style={s.infoTag}>
                      <Text style={[s.infoTag, { color: colors.textTertiary }]}>产品 </Text>
                      <Text style={[s.infoTag, { color: colors.textSecondary, fontWeight: '500' }]}>
                        {wo.material.name}
                      </Text>
                    </Text>
                  )}
                  {wo?.orderNo && (
                    <Text style={s.infoTag}>
                      <Text style={[s.infoTag, { color: colors.textTertiary }]}>工单 </Text>
                      <Text style={[s.infoTag, { color: colors.textSecondary, fontWeight: '500' }]}>
                        {wo.orderNo}
                      </Text>
                    </Text>
                  )}
                  {wo?.plannedQty != null && (
                    <Text style={s.infoTag}>
                      <Text style={[s.infoTag, { color: colors.textTertiary }]}>数量 </Text>
                      <Text style={[s.infoTag, { color: colors.textSecondary, fontWeight: '500' }]}>
                        {formatQtyWithUnit(wo.plannedQty, wo.material?.unit, unitLabelMap)}
                      </Text>
                    </Text>
                  )}
                  <Text style={s.infoTag}>
                    <Text style={[s.infoTag, { color: colors.textTertiary }]}>排产 </Text>
                    <Text style={[s.infoTag, { color: colors.textSecondary, fontWeight: '500' }]}>
                      {formatShortDate(e.plannedStart)}~{formatShortDate(e.plannedEnd)}
                    </Text>
                  </Text>
                  {e.durationMinutes != null && e.durationMinutes > 0 && (
                    <Text style={s.infoTag}>
                      <Text style={[s.infoTag, { color: colors.textTertiary }]}>工时 </Text>
                      <Text style={[s.infoTag, { color: colors.textSecondary, fontWeight: '500' }]}>
                        {formatDurationLabel(e.durationMinutes)}
                      </Text>
                    </Text>
                  )}
                  {!e.isBuffer && (
                    <>
                      <Text style={s.infoTag}>
                        <Text style={[s.infoTag, { color: colors.textTertiary }]}>准备 </Text>
                        <Text
                          style={[s.infoTag, { color: colors.textSecondary, fontWeight: '500' }]}
                        >
                          {formatDurationLabel(e.setupMinutes) ?? '0m'}
                        </Text>
                      </Text>
                      <Text style={s.infoTag}>
                        <Text style={[s.infoTag, { color: colors.textTertiary }]}>加工 </Text>
                        <Text
                          style={[s.infoTag, { color: colors.textSecondary, fontWeight: '500' }]}
                        >
                          {formatDurationLabel(e.runMinutes) ?? '0m'}
                        </Text>
                      </Text>
                      <Text style={s.infoTag}>
                        <Text style={[s.infoTag, { color: colors.textTertiary }]}>准备开始 </Text>
                        <Text
                          style={[s.infoTag, { color: colors.textSecondary, fontWeight: '500' }]}
                        >
                          {formatTime(e.setupStartTime)}
                        </Text>
                      </Text>
                      <Text style={s.infoTag}>
                        <Text style={[s.infoTag, { color: colors.textTertiary }]}>加工开始 </Text>
                        <Text
                          style={[s.infoTag, { color: colors.textSecondary, fontWeight: '500' }]}
                        >
                          {formatTime(e.productionStartTime)}
                        </Text>
                      </Text>
                    </>
                  )}
                  {e.operation && (
                    <Text style={s.infoTag}>
                      <Text style={[s.infoTag, { color: colors.textTertiary }]}>工序 </Text>
                      <Text style={[s.infoTag, { color: colors.textSecondary, fontWeight: '500' }]}>
                        {e.operation.operationName ?? '-'}
                      </Text>
                    </Text>
                  )}
                  {e.predecessorSummary && (
                    <Text style={s.infoTag}>
                      <Text style={[s.infoTag, { color: colors.textTertiary }]}>前置 </Text>
                      <Text style={[s.infoTag, { color: colors.textSecondary, fontWeight: '500' }]}>
                        {e.predecessorSummary}
                      </Text>
                    </Text>
                  )}
                  {e.equipment && (
                    <Text style={s.infoTag}>
                      <Text style={[s.infoTag, { color: colors.textTertiary }]}>设备 </Text>
                      <Text style={[s.infoTag, { color: colors.textSecondary, fontWeight: '500' }]}>
                        {e.equipment.name ?? '-'}
                      </Text>
                    </Text>
                  )}
                  {e.assignee && (
                    <Text style={s.infoTag}>
                      <Text style={[s.infoTag, { color: colors.textTertiary }]}>负责人 </Text>
                      <Text style={[s.infoTag, { color: colors.textSecondary, fontWeight: '500' }]}>
                        {e.assignee.realName ?? '-'}
                      </Text>
                    </Text>
                  )}
                  {bufferSummary && (
                    <Text style={s.infoTag}>
                      <Text style={[s.infoTag, { color: colors.textTertiary }]}>缓冲 </Text>
                      <Text style={[s.infoTag, { color: colors.textSecondary, fontWeight: '500' }]}>
                        {bufferSummary}
                      </Text>
                    </Text>
                  )}
                </View>
                {dependencyMessage && (
                  <View
                    style={[
                      s.infoDependencyBox,
                      {
                        borderColor: `${dependencyTone}40`,
                        backgroundColor: `${dependencyTone}10`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        dependencyConflict ? 'alert-circle-outline' : 'information-circle-outline'
                      }
                      size={14}
                      color={dependencyTone}
                    />
                    <Text style={[s.infoDependencyText, { color: colors.text }]} numberOfLines={3}>
                      {dependencyMessage}
                    </Text>
                  </View>
                )}
                {(canEditEntry || canDeleteEntry) && (
                  <View style={s.infoActionRow}>
                    {canConfirmEntry && (
                      <TouchableOpacity
                        onPress={() => onConfirmEntry?.(e)}
                        style={[
                          s.infoActionButton,
                          {
                            backgroundColor: `${colors.success}10`,
                            borderColor: `${colors.success}30`,
                          },
                        ]}
                      >
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={14}
                          color={colors.success}
                        />
                        <Text style={[s.infoActionText, { color: colors.success }]}>确认排产</Text>
                      </TouchableOpacity>
                    )}
                    {canUnconfirmEntry && (
                      <TouchableOpacity
                        onPress={() => onUnconfirmEntry?.(e)}
                        style={[
                          s.infoActionButton,
                          {
                            backgroundColor: `${colors.warning}10`,
                            borderColor: `${colors.warning}30`,
                          },
                        ]}
                      >
                        <Ionicons
                          name="arrow-undo-circle-outline"
                          size={14}
                          color={colors.warning}
                        />
                        <Text style={[s.infoActionText, { color: colors.warning }]}>取消确认</Text>
                      </TouchableOpacity>
                    )}
                    {canEditEntry && (
                      <TouchableOpacity
                        onPress={() => onEditEntry?.(e)}
                        style={[
                          s.infoActionButton,
                          {
                            backgroundColor: `${colors.primary}10`,
                            borderColor: `${colors.primary}30`,
                          },
                        ]}
                      >
                        <Ionicons name="create-outline" size={14} color={colors.primary} />
                        <Text style={[s.infoActionText, { color: colors.primary }]}>编辑</Text>
                      </TouchableOpacity>
                    )}
                    {canDeleteEntry && (
                      <TouchableOpacity
                        onPress={() => onDeleteEntry?.(e)}
                        style={[
                          s.infoActionButton,
                          {
                            backgroundColor: `${colors.error}10`,
                            borderColor: `${colors.error}30`,
                          },
                        ]}
                      >
                        <Ionicons name="trash-outline" size={14} color={colors.error} />
                        <Text style={[s.infoActionText, { color: colors.error }]}>移入已取消</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          );
        })()}

      {/* ─── 图例 ─── */}
      <View
        style={[
          s.legend,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.surface,
            paddingLeft: Math.max(Spacing.base, insets.left + Spacing.sm),
            paddingRight: Math.max(Spacing.base, insets.right + Spacing.sm),
            paddingBottom: Math.max(Spacing.sm, insets.bottom),
          },
        ]}
      >
        <View style={s.legendSection}>
          <Text style={[s.legendTitle, { color: colors.textMuted }]}>执行状态</Text>
          <View style={s.legendGroup}>
            {Object.entries(GANTT_EXECUTION_STATUS_VISUALS).map(([key, cfg]) => (
              <View key={key} style={s.legendItem}>
                <View
                  style={[
                    s.legendSwatch,
                    {
                      backgroundColor: cfg.backgroundColor,
                      borderLeftColor: cfg.color,
                      borderColor: cfg.borderColor,
                    },
                  ]}
                />
                <Text style={[s.legendText, { color: colors.textSecondary }]}>{cfg.label}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={s.legendSection}>
          <Text style={[s.legendTitle, { color: colors.textMuted }]}>排产状态</Text>
          <View style={s.legendGroup}>
            {Object.entries(SCHEDULE_STATUS_CONFIG).map(([key, cfg]) => (
              <View key={key} style={s.legendItem}>
                <View
                  style={[
                    s.legendSwatch,
                    {
                      backgroundColor: cfg.bg,
                      borderLeftColor: cfg.color,
                      borderColor: `${cfg.color}24`,
                    },
                  ]}
                />
                <Text style={[s.legendText, { color: colors.textSecondary }]}>{cfg.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },

  // Toolbar
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xs,
  },
  weekNavGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekNavBtn: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekLabelBtn: {
    minWidth: 56,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekLabel: { textAlign: 'center', fontSize: FontSize.sm, fontWeight: '600' },
  toolbarDivider: { width: 1, height: 16 },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  filterBtnText: { fontSize: FontSize.sm, fontWeight: '600' },
  filterCountBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountBadgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconBtn: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  filterSheetContent: {
    gap: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  filterSection: {
    gap: Spacing.sm,
  },
  filterSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterSectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  filterSectionAction: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  filterSectionActionButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  filterOptionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  filterResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: MIN_TOUCH_TARGET,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  filterResetText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },

  // Breadcrumb
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 32,
    overflow: 'hidden',
  },
  breadcrumbScroll: { flex: 1 },
  breadcrumbContent: { alignItems: 'center', paddingHorizontal: Spacing.sm },
  breadcrumbItem: { flexDirection: 'row', alignItems: 'center' },
  breadcrumbText: { fontSize: FontSize.xs },
  breadcrumbChevron: { marginHorizontal: 3 },

  // Header
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cornerCell: {
    width: GANTT_LABEL_WIDTH,
    height: GANTT_HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  cornerText: { fontSize: FontSize.sm, fontWeight: '600' },
  headerTimeline: {
    flexDirection: 'column',
  },
  headerMajorRow: {
    flexDirection: 'row',
    height: GANTT_HEADER_MAJOR_HEIGHT,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerMajorCell: {
    height: GANTT_HEADER_MAJOR_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  headerMajorText: { fontSize: FontSize.sm, fontWeight: '600' },
  headerMinorRow: { flexDirection: 'row' },
  headerMinorCell: {
    height: GANTT_HEADER_MINOR_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
    gap: 1,
  },
  headerMinorPrimary: { fontSize: FontSize.sm, fontWeight: '600' },
  headerMinorSecondary: { fontSize: FontSize.xs },

  // Body
  bodyContent: { paddingBottom: Spacing.lg },
  ganttRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    width: GANTT_LABEL_WIDTH,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    justifyContent: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 2,
  },
  rowLabelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 4,
  },
  rowLabelTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  rowLabelText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    lineHeight: 18,
    flex: 1,
  },
  rowLabelChevron: { marginLeft: 2, marginTop: 1 },
  rowMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: Spacing.xs,
  },
  rowMetaPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  rowMetaText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  unassignedLabel: { fontStyle: 'italic' },
  equipmentIcon: { marginBottom: 2 },
  rowTimelineSurface: {
    position: 'relative',
  },

  // Day columns
  dayColumn: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRightWidth: StyleSheet.hairlineWidth,
  },

  // Today indicator
  todayLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    zIndex: 10,
  },

  // Gantt bar
  ganttBar: {
    position: 'absolute',
    height: GANTT_BAR_HEIGHT,
    borderRadius: Radius.md,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  barContent: {
    flex: 1,
    paddingTop: Spacing.xs + 2,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.md,
    justifyContent: 'center',
    gap: 1,
    zIndex: 1,
  },
  barPrimaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  barSecondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  barTitle: { fontSize: FontSize.xs, fontWeight: '600', flex: 1 },
  barSubtitle: { fontSize: FontSize.xs, flex: 1 },
  barMeta: { fontSize: FontSize.xs, flexShrink: 0 },
  barStatusChip: {
    paddingHorizontal: 6,
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  barStatusChipText: {
    fontSize: FontSize.xs,
    lineHeight: 14,
    fontWeight: '700',
  },
  barDurationTrack: {
    position: 'absolute',
    borderRadius: Radius.full,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  barProgressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  barOrderNoBadge: {
    position: 'absolute',
    zIndex: 2,
    paddingHorizontal: 2,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  barOrderNo: {
    letterSpacing: 0.2,
  },

  // Info card
  infoCard: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  infoCardAccent: { width: 3, borderRadius: 2, alignSelf: 'stretch' },
  infoCardBody: { flex: 1, gap: Spacing.xs },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCardTitle: { fontSize: FontSize.sm, fontWeight: '700' },
  infoCardActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoCardBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  infoCardBadgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  infoTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, rowGap: 2 },
  infoTag: { fontSize: FontSize.xs },
  infoDependencyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  infoDependencyText: { flex: 1, fontSize: FontSize.xs, lineHeight: 16 },
  infoActionRow: {
    marginTop: Spacing.xs,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  infoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  infoActionText: { fontSize: FontSize.xs, fontWeight: '600' },

  // Legend
  legend: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    width: '100%',
  },
  legendSection: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
  },
  legendTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  legendGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    flexWrap: 'wrap',
    width: '100%',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderLeftWidth: 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
  legendText: { fontSize: FontSize.sm },
});
