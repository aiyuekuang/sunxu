import { getMesHostHooks } from './adapters';

export type UnitDomain = 'material' | 'operation';
export interface UnitDisplay {
  formatUnit(unit: string | null | undefined): string;
  formatQty(value: number | string | null | undefined, unit: string | null | undefined, options?: unknown): string;
  withCurrentOption(options: import('../../../core/components/PickerField').PickerOption[], unit: string | null | undefined): import('../../../core/components/PickerField').PickerOption[];
  options: import('../../../core/components/PickerField').PickerOption[];
  loading: boolean;
  items: import('../contracts/services/dict.service').DictItem[];
  labelMap: import('../../../core/utils/dict-label-map').DictLabelMap;
  error: string | null;
  retry(): void;
  statusConfig: import('../../../core/components/Badge').StatusConfig<string>;
  tabItems: import('../../../core/components/StatusTabs').TabItem<string>[];
}
export type { UnitLabelMap } from '../../utils/qty-unit';
export function useUnitDisplay(domain: UnitDomain): UnitDisplay {
  const hook = getMesHostHooks().useUnitDisplay;
  if (!hook) throw new Error('The host app must configure useUnitDisplay before rendering MES components.');
  return hook(domain);
}
