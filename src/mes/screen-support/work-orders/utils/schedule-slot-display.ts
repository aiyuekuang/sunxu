import { formatShortDateTime, parseDate } from '../../../../core/utils/date';

type ScheduleSlotDisplaySource = {
  plannedStart: string;
  plannedEnd: string;
  occupiedStartAt?: string | null;
  occupiedEndAt?: string | null;
  actualEndAt?: string | null;
  runtimeStatus?: string | null;
  status?: string | null;
  equipmentName?: string | null;
};

const RUNNING_RUNTIME_STATUSES = new Set(['running', 'paused']);
const RUNNING_SCHEDULE_STATUSES = new Set(['in_progress']);

function isSameMoment(left?: string | null, right?: string | null): boolean {
  const leftDate = parseDate(left);
  const rightDate = parseDate(right);
  if (!leftDate || !rightDate) return false;
  return leftDate.valueOf() === rightDate.valueOf();
}

function isEarlyRelease(slot: ScheduleSlotDisplaySource): boolean {
  const actualEndAt = parseDate(slot.actualEndAt);
  const plannedEnd = parseDate(slot.plannedEnd);
  if (!actualEndAt || !plannedEnd) return false;
  return actualEndAt.isBefore(plannedEnd);
}

function isRunningLike(slot: ScheduleSlotDisplaySource): boolean {
  return (
    RUNNING_RUNTIME_STATUSES.has(slot.runtimeStatus ?? '') ||
    RUNNING_SCHEDULE_STATUSES.has(slot.status ?? '')
  );
}

function formatSlotTimeRange(start?: string | null, end?: string | null): string {
  return `${formatShortDateTime(start ?? null)} - ${formatShortDateTime(end ?? null)}`;
}

export function formatScheduleSlotLabel(slot: ScheduleSlotDisplaySource): string {
  const equipmentPrefix = slot.equipmentName ? `${slot.equipmentName} · ` : '';
  return `${equipmentPrefix}${formatSlotTimeRange(slot.plannedStart, slot.plannedEnd)}`;
}

export function formatScheduleSlotSublabel(slot: ScheduleSlotDisplaySource): string {
  if (isEarlyRelease(slot)) {
    return `提前释放至 ${formatShortDateTime(slot.actualEndAt ?? null)}`;
  }

  if (!slot.occupiedStartAt || !slot.occupiedEndAt) {
    return '';
  }

  const sameStart = isSameMoment(slot.occupiedStartAt, slot.plannedStart);
  const sameEnd = isSameMoment(slot.occupiedEndAt, slot.plannedEnd);
  if (sameStart && sameEnd) {
    return '';
  }

  if (sameStart && !sameEnd) {
    return slot.actualEndAt
      ? `实际完成 ${formatShortDateTime(slot.occupiedEndAt)}`
      : `预计做到 ${formatShortDateTime(slot.occupiedEndAt)}`;
  }

  if (!sameStart && sameEnd) {
    return slot.actualEndAt
      ? `实际开工 ${formatShortDateTime(slot.occupiedStartAt)}`
      : `已占用 ${formatShortDateTime(slot.occupiedStartAt)} 起`;
  }

  const prefix = slot.actualEndAt ? '实际' : isRunningLike(slot) ? '预计占用' : '占用';
  return `${prefix} ${formatSlotTimeRange(slot.occupiedStartAt, slot.occupiedEndAt)}`;
}
