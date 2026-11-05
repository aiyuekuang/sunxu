/**
 * Shared formatting utilities for display values.
 */

export interface FormatNumberOptions {
  compact?: boolean;
  fallback?: string;
  maximumFractionDigits?: number;
}

/** Round a calculated display value without leaking binary floating-point residue. */
export function roundNumber(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  const rounded = Math.round((value + Number.EPSILON) * factor) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function normalizeNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(num) ? num : null;
}

function trimTrailingZero(value: string): string {
  return value.replace(/\.0$/, '');
}

function formatCompactUnit(
  value: number,
  unitValue: number,
  unitLabel: string,
  maximumFractionDigits: number,
): string {
  const scaled = value / unitValue;
  return `${trimTrailingZero(
    scaled.toLocaleString('zh-CN', {
      minimumFractionDigits: 0,
      maximumFractionDigits,
    }),
  )}${unitLabel}`;
}

/**
 * Derive an avatar initial from a possibly-null/empty display name.
 * Centralizes the `name.charAt(0)` pattern so a null/blank name never crashes render.
 */
export function getNameInitial(name: string | null | undefined, fallback = '?'): string {
  const trimmed = typeof name === 'string' ? name.trim() : '';
  const source = trimmed.length > 0 ? trimmed : fallback;
  return source.charAt(0).toUpperCase();
}

/** Format a number as a currency string with optional sign prefix. */
export function formatAmount(n: number, showSign = false): string {
  const formatted = Math.abs(n).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (showSign && n > 0) return `+¥${formatted}`;
  if (showSign && n < 0) return `-¥${formatted}`;
  return `¥${formatted}`;
}

/** Format a number for narrow KPI areas such as stat cards and chart labels. */
export function formatCompactNumber(
  value: number | string | null | undefined,
  options: Omit<FormatNumberOptions, 'compact'> = {},
): string {
  return formatNumber(value, { ...options, compact: true });
}

/** Format a number with optional compact mode. */
export function formatNumber(
  value: number | string | null | undefined,
  options: FormatNumberOptions = {},
): string {
  const { compact = false, fallback = '-', maximumFractionDigits } = options;
  const num = normalizeNumber(value);
  if (num == null) return fallback;

  if (!compact) {
    return num.toLocaleString('zh-CN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: maximumFractionDigits ?? 3,
    });
  }

  const abs = Math.abs(num);
  const compactFractionDigits = maximumFractionDigits ?? 1;
  if (abs >= 100_000_000) {
    return formatCompactUnit(
      num,
      100_000_000,
      '亿',
      abs >= 1_000_000_000 ? 0 : compactFractionDigits,
    );
  }
  if (abs >= 10_000) {
    return formatCompactUnit(num, 10_000, '万', abs >= 1_000_000 ? 0 : compactFractionDigits);
  }
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: compactFractionDigits,
  });
}
