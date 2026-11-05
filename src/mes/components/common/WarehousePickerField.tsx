import {
  fetchWarehouseCandidateOptions,
  fetchWarehousePickerOptions,
  type Warehouse,
  type WarehouseCandidateOrder,
  type WarehousePickerOptions,
} from '../../host/services';
import { EntityPickerField, type EntityPickerFieldProps } from '../../../core/components/EntityPickerField.tsx';

export interface WarehousePickerFieldProps extends Omit<
  EntityPickerFieldProps<Warehouse>,
  'fetchFn' | 'keyExtractor' | 'labelExtractor' | 'sublabelExtractor'
> {
  /** 常规仓库选择的范围；默认排除线边仓。 */
  pickerOptions?: WarehousePickerOptions;
  /** 默认展示仓库编码；需要展示仓库类型等业务上下文时可替换副标题。 */
  sublabelExtractor?: (warehouse: Warehouse) => string;
  /**
   * 仅用于已由当前业务上下文筛选出的仓库候选集。公共组件仍会统一处理搜索、
   * 去重、sortOrder 显示排序和分页；常规选择不应传入，统一走 pickerOptions。
   */
  candidateWarehouses?: readonly Warehouse[];
  /**
   * 普通预筛选候选按显示排序；只有后端已计算业务优先级及同级显示排序的执行候选，
   * 才可声明 business-priority 以保留该权威顺序。
   */
  candidateOrder?: WarehouseCandidateOrder;
}

/**
 * 仓库选择的权威表单组件。
 *
 * 统一名称/编码展示、普通仓库候选数据源及 sortOrder 排序；页面只声明业务范围和
 * 选中后的联动。库存可用性或工单策略已预筛选的候选集通过 candidateWarehouses 接入。
 */
export function WarehousePickerField({
  pickerOptions,
  candidateWarehouses,
  candidateOrder = 'display',
  sublabelExtractor = (warehouse) => warehouse.code,
  ...props
}: WarehousePickerFieldProps) {
  return (
    <EntityPickerField<Warehouse>
      {...props}
      fetchFn={(params) =>
        candidateWarehouses === undefined
          ? fetchWarehousePickerOptions(params, pickerOptions)
          : fetchWarehouseCandidateOptions(params, candidateWarehouses, candidateOrder)
      }
      keyExtractor={(warehouse) => warehouse.id}
      labelExtractor={(warehouse) => warehouse.name}
      sublabelExtractor={sublabelExtractor}
    />
  );
}
