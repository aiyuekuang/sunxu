import { ENTITY_TYPE_CONFIG } from '../constants/status-configs';

export interface EntityTypeCountChip {
  key: string;
  label: string;
  count: number;
  /** 字典命中时的标签色；未命中为 undefined，调用方使用中性色 */
  color?: string;
  bg?: string;
}

/**
 * 由待办/审批的 entityType 计数构造类型 Tab 或胶囊列表。
 * 字典命中的显示中文业务名；未命中的保留原始类型码 ——
 * 未知类型必须可见可排查，禁止静默隐藏。
 */
export function buildEntityTypeCountChips(
  byEntityType: Record<string, number> | null | undefined,
): EntityTypeCountChip[] {
  return Object.entries(byEntityType ?? {})
    .filter(([, count]) => count > 0)
    .map(([entityType, count]) => {
      const cfg = ENTITY_TYPE_CONFIG[entityType];
      return {
        key: entityType,
        label: cfg?.label ?? entityType,
        count,
        color: cfg?.color,
        bg: cfg?.bg,
      };
    });
}
