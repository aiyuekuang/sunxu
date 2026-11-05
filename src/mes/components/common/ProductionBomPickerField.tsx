import { useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import type { BomHeader } from '../../host/services';
import { EntityPickerField } from '../../../core/components/EntityPickerField.tsx';
import type { FieldHelpContent } from '../../../core/components/FormLabel.tsx';
import { getBomLabel, getBomSublabel, requestProductionBomOptions } from '../../utils/bom-options';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductionBomPickerFieldProps {
  /** 当前选中的 BOM 头 */
  value?: BomHeader | null;
  /** 选中 BOM 变化回调 */
  onChange: (bom: BomHeader | null) => void;
  /** 成品物料档案 ID，用于加载该型号可用 BOM */
  materialId?: string | null;
  /** 销售订单 ID；仅用于后端策略上下文，BOM 候选仍只来自标准 BOM */
  saleOrderId?: string | null;
  /** 销售订单明细 ID；仅用于后端策略上下文，BOM 候选仍只来自标准 BOM */
  saleOrderItemId?: string | null;
  /** 物料名称兜底，用于列表标签展示 */
  fallbackMaterialName?: string;
  /** 字段标题，默认 BOM版本 */
  label?: string;
  /** 字段帮助说明 */
  help?: FieldHelpContent;
  /** 占位文案 */
  placeholder?: string;
  /** 弹窗标题 */
  title?: string;
  /** 是否必填 */
  required?: boolean;
  /** 错误提示 */
  error?: string;
  /** 是否允许清空，默认允许 */
  clearable?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 禁用时展示给用户的原因，并作为无障碍提示 */
  disabledReason?: string;
  /** 容器样式 */
  containerStyle?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductionBomPickerField({
  value,
  onChange,
  materialId,
  saleOrderId,
  saleOrderItemId,
  fallbackMaterialName,
  label = 'BOM版本',
  help,
  placeholder = '可选，不选则自动使用默认BOM',
  title = '选择BOM版本',
  required,
  error,
  clearable = true,
  disabled = false,
  disabledReason,
  containerStyle,
}: ProductionBomPickerFieldProps) {
  const fetchBoms = useCallback(
    (params: { page: number; pageSize: number; keyword?: string }) =>
      requestProductionBomOptions({
        ...params,
        materialId,
        saleOrderId,
        saleOrderItemId,
      }),
    [materialId, saleOrderId, saleOrderItemId],
  );

  return (
    <EntityPickerField<BomHeader>
      label={label}
      help={help}
      value={value}
      onChange={onChange}
      fetchFn={fetchBoms}
      keyExtractor={(bom) => bom.id}
      labelExtractor={(bom) => getBomLabel(bom, fallbackMaterialName)}
      sublabelExtractor={getBomSublabel}
      placeholder={materialId ? placeholder : '请先选择生产物料'}
      title={title}
      required={required}
      error={error}
      clearable={clearable}
      disabled={disabled || !materialId}
      disabledReason={
        !materialId
          ? '请先选择生产物料后再选择 BOM 版本'
          : disabled
            ? (disabledReason ?? '当前字段不可修改')
            : undefined
      }
      containerStyle={containerStyle}
    />
  );
}
