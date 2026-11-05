/**
 * 全项目唯一日期操作入口。
 *
 * 业务代码禁止直接使用 new Date()、Date.now()、.toISOString()、.slice() 做日期操作，
 * 全部通过本模块的函数完成。
 */
import dayjs from 'dayjs';

// ─── 解析 ─────────────────────────────────────────────────────────────────────

/** 解析 API 返回的日期字符串，无效返回 null */
export function parseDate(str: string | null | undefined): dayjs.Dayjs | null {
  if (!str) return null;
  const d = dayjs(str);
  return d.isValid() ? d : null;
}

/** 将 API 日期时间转为毫秒时间戳，无效返回 null；业务代码用它做时间比较和排序。 */
export function timestamp(str: string | null | undefined): number | null {
  return parseDate(str)?.valueOf() ?? null;
}

/** 当前本地时刻的毫秒时间戳，用于与 API 日期时间比较。 */
export function currentTimestamp(): number {
  return dayjs().valueOf();
}

// ─── 格式化（显示用）──────────────────────────────────────────────────────────

/** 格式化为 'YYYY/MM/DD'，无效返回 '-' */
export function formatDate(str: string | null | undefined): string {
  if (!str) return '-';
  const d = dayjs(str);
  return d.isValid() ? d.format('YYYY/MM/DD') : '-';
}

/** 格式化为 'YYYY/MM/DD HH:mm'，无效返回 '-' */
export function formatDateTime(str: string | null | undefined): string {
  if (!str) return '-';
  const d = dayjs(str);
  return d.isValid() ? d.format('YYYY/MM/DD HH:mm') : '-';
}

/** 格式化为 'MM/DD'，无效返回 '-' */
export function formatShortDate(str: string | null | undefined): string {
  if (!str) return '-';
  const d = dayjs(str);
  return d.isValid() ? d.format('MM/DD') : '-';
}

/** 格式化为 'MM/DD HH:mm'，无效返回 '-' */
export function formatShortDateTime(str: string | null | undefined): string {
  if (!str) return '-';
  const d = dayjs(str);
  return d.isValid() ? d.format('MM/DD HH:mm') : '-';
}

/** 格式化为 'HH:mm'，无效返回 '--:--' */
export function formatTime(str: string | null | undefined): string {
  if (!str) return '--:--';
  const d = dayjs(str);
  return d.isValid() ? d.format('HH:mm') : '--:--';
}

/** 从 ISO 日期字符串中提取日期部分 'YYYY-MM-DD'，无效返回 '-'。仅用于展示已知为纯日期的 API 字段。 */
export function formatDateStr(str: string | null | undefined): string {
  if (!str) return '-';
  return str.slice(0, 10);
}

/** 格式化分钟为可读时长：'3 小时 20 分钟' */
export function formatDuration(minutes: number | null | undefined): string {
  if (minutes == null) return '-';
  if (minutes < 60) return `${minutes} 分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} 小时 ${m} 分钟` : `${h} 小时`;
}

/** 格式化 Date 对象为 'MM/DD HH:mm'（排产甘特图用） */
export function formatScheduleTime(date: Date): string {
  return dayjs(date).format('MM/DD HH:mm');
}

// ─── 生成（表单默认值 / API 参数用）───────────────────────────────────────────

/** 今天日期 'YYYY-MM-DD'（本地时区） */
export function today(): string {
  return dayjs().format('YYYY-MM-DD');
}

/** 本月第一天 'YYYY-MM-DD'（本地时区） */
export function monthStart(): string {
  return dayjs().startOf('month').format('YYYY-MM-DD');
}

/** 本月最后一天 'YYYY-MM-DD'（本地时区） */
export function monthEnd(): string {
  return dayjs().endOf('month').format('YYYY-MM-DD');
}

/** 本年度第一天 'YYYY-MM-DD'（本地时区） */
export function yearStart(): string {
  return dayjs().startOf('year').format('YYYY-MM-DD');
}

/** 本年度最后一天 'YYYY-MM-DD'（本地时区） */
export function yearEnd(): string {
  return dayjs().endOf('year').format('YYYY-MM-DD');
}

/** 本周第一天（周一）'YYYY-MM-DD'（本地时区） */
export function weekStart(): string {
  const now = dayjs();
  const mondayOffset = (now.day() + 6) % 7;
  return now.subtract(mondayOffset, 'day').format('YYYY-MM-DD');
}

/** 本周最后一天（周日）'YYYY-MM-DD'（本地时区） */
export function weekEnd(): string {
  return dayjs(weekStart()).add(6, 'day').format('YYYY-MM-DD');
}

/** 本季度第一天 'YYYY-MM-DD'（本地时区） */
export function quarterStart(): string {
  const now = dayjs();
  const quarterStartMonth = Math.floor(now.month() / 3) * 3;
  return now.month(quarterStartMonth).startOf('month').format('YYYY-MM-DD');
}

/** 当前时刻 'YYYY-MM-DDTHH:mm'（本地时区，给 DatePickerField datetime 模式） */
export function now(): string {
  return dayjs().format('YYYY-MM-DD[T]HH:mm');
}

/** N 天后/前的日期 'YYYY-MM-DD'（正数=未来，负数=过去） */
export function daysFromNow(n: number): string {
  return dayjs().add(n, 'day').format('YYYY-MM-DD');
}

/** 生成日期范围内的每日日期列表（含首尾，YYYY-MM-DD） */
export function listDateRange(startDate: string, endDate: string): string[] {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  if (!start.isValid() || !end.isValid() || start.isAfter(end)) return [];

  const dates: string[] = [];
  let cursor = start.startOf('day');
  const endDay = end.startOf('day');
  while (cursor.isBefore(endDay) || cursor.isSame(endDay)) {
    dates.push(cursor.format('YYYY-MM-DD'));
    cursor = cursor.add(1, 'day');
  }
  return dates;
}

/** dayjs/Date/字符串 → 'YYYY-MM-DD' */
export function toDateStr(d: Date | dayjs.Dayjs | string): string {
  return dayjs(d).format('YYYY-MM-DD');
}

/** dayjs/Date/字符串 → 'YYYY-MM-DDTHH:mm'（给 DatePickerField datetime 模式） */
export function toDateTimeStr(d: Date | dayjs.Dayjs | string): string {
  return dayjs(d).format('YYYY-MM-DD[T]HH:mm');
}

/** dayjs/Date/字符串 → ISO UTC 字符串（给 API 提交用） */
export function toISO(d: Date | dayjs.Dayjs | string): string {
  return dayjs(d).toISOString();
}

// Re-export dayjs 类型，业务代码如需类型注解用这个
export type { Dayjs } from 'dayjs';
