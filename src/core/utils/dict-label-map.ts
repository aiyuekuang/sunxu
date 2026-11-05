export type DictResourceStatus = 'idle' | 'loading' | 'ready' | 'error';

export const DICT_LABEL_MAP_STATUS: unique symbol = Symbol('dict-label-map-status');

export type DictLabelMap = Record<string, string> & {
  [DICT_LABEL_MAP_STATUS]?: DictResourceStatus;
};

export function createDictLabelMap(
  items: ReadonlyArray<{ itemValue: string; itemLabel: string }>,
  status: DictResourceStatus,
): DictLabelMap {
  const labelMap = Object.fromEntries(
    items.map((item) => [item.itemValue, item.itemLabel]),
  ) as DictLabelMap;
  labelMap[DICT_LABEL_MAP_STATUS] = status;
  return labelMap;
}

export function getDictLabelMapStatus(labelMap: DictLabelMap): DictResourceStatus {
  return labelMap[DICT_LABEL_MAP_STATUS] ?? (Object.keys(labelMap).length > 0 ? 'ready' : 'idle');
}

export interface ResolveDictLabelOptions {
  unknownLabel: string;
}

/** 解析字典展示值；加载中不回显原始编码，ready/error 未配置时显式标记未知。 */
export function resolveDictLabel(
  value: string | null | undefined,
  labelMap: DictLabelMap,
  options: ResolveDictLabelOptions,
): string {
  const normalized = value?.trim() || '';
  if (!normalized) return '';

  const label = labelMap[normalized];
  if (label) return label;
  if (Object.values(labelMap).includes(normalized)) return normalized;

  const status = getDictLabelMapStatus(labelMap);
  return status === 'idle' || status === 'loading' ? '' : options.unknownLabel;
}
