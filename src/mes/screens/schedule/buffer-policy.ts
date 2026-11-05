import { BUFFER_SOURCE_CONFIG } from '../../constants/status-configs';

export const BUFFER_RATIO_OPTIONS = [
  { value: '0', label: '不加缓冲' },
  { value: '0.1', label: '10%' },
  { value: '0.15', label: '15%（推荐）' },
  { value: '0.2', label: '20%' },
];

// 枚举→中文字典唯一归口在 status-configs；沿用既有导出名转发
export const BUFFER_SOURCE_LABELS = BUFFER_SOURCE_CONFIG;

export function formatBufferRatio(value?: number | null): string | null {
  if (value == null || Number.isNaN(Number(value))) {
    return null;
  }
  return `${Math.round(Number(value) * 100)}%`;
}

export function formatBufferPolicySummary(params: {
  minutes?: number | null;
  ratio?: number | null;
  source?: string | null;
}): string | null {
  const parts: string[] = [];
  if (params.minutes != null) {
    parts.push(`${params.minutes}分`);
  }
  const ratioLabel = formatBufferRatio(params.ratio);
  if (ratioLabel) {
    parts.push(ratioLabel);
  }
  if (params.source) {
    parts.push(BUFFER_SOURCE_CONFIG[params.source] ?? params.source);
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}
