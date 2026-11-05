import { Ionicons } from '@expo/vector-icons';
import { type ReactNode, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ProductionReportQueryDto } from '../../../types/models/ProductionReportQueryDto';
import type { QualityReportQueryDto } from '../../../types/models/QualityReportQueryDto';
import type { StockWarningQueryDto } from '../../../types/models/StockWarningQueryDto';
import { materialService } from '../../../host/services';
import { type Warehouse, warehouseService } from '../../../host/services';
import { type WorkCenter, workCenterService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EntityFilterChip, type EntityFilterValue } from '../../../../core/components/EntityFilterChip.tsx';
import { MaterialFilterChip } from '../../../components/common/MaterialPickerField.tsx';
import {
  type AdvancedFilterConfig,
  FilterBar,
  type FilterConfig,
} from '../../../../core/components/FilterBar.tsx';
import type { ReportPeriodState } from '../../../constants/report-quick-range';
import {
  INSPECTION_STATUS_CONFIG,
  INSPECTION_TYPE_CONFIG,
  INVENTORY_OWNER_TYPE_CONFIG,
  QUALITY_DEFECT_SEVERITY_CONFIG,
  WORK_ORDER_STATUS_CONFIG,
} from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { ReportPeriodNavigator } from './ReportPeriodNavigator.tsx';

export type ReportFilterScope = 'dashboard' | 'production' | 'quality' | 'stock';

export interface ReportDateRange {
  label: string;
  startDate: string;
  endDate: string;
}

export interface ReportFilterState {
  dateFrom?: string;
  dateTo?: string;
  materialId?: string;
  materialDisplay?: string;
  workCenterId?: string;
  workCenterDisplay?: string;
  warehouseId?: string;
  warehouseDisplay?: string;
  productionStatus?: NonNullable<ProductionReportQueryDto['status']>;
  overdueOnly?: boolean;
  qualityType?: NonNullable<QualityReportQueryDto['type']>;
  qualityStatus?: NonNullable<QualityReportQueryDto['status']>;
  severity?: NonNullable<QualityReportQueryDto['severity']>;
  ownerType?: NonNullable<StockWarningQueryDto['ownerType']>;
}

interface ReportContextBarProps {
  scope: ReportFilterScope;
  period: ReportPeriodState;
  filters: ReportFilterState;
  onPeriodChange: (period: ReportPeriodState) => void;
  onChange: (filters: ReportFilterState) => void;
  onReset: () => void;
}

type ReportFilterKey = keyof ReportFilterState;
type ReportFilterValues = Record<string, string | undefined>;

interface AdvancedExtraArgs {
  values: ReportFilterValues;
  setValue: (key: string, value: string | undefined) => void;
}

interface ReportFilterDefinition {
  quickFilters: FilterConfig[];
  advancedFilters: AdvancedFilterConfig[];
  advancedExtraKeys: ReportFilterKey[];
  advancedExtraActiveKeys: ReportFilterKey[];
  keys: ReportFilterKey[];
  renderAdvancedExtra?: (args: AdvancedExtraArgs) => ReactNode;
}

const REPORT_DATE_FILTER: AdvancedFilterConfig = {
  type: 'date_range',
  key: 'reportDate',
  label: '统计日期',
  startKey: 'dateFrom',
  endKey: 'dateTo',
  persist: false,
};

const PRODUCTION_STATUS_OPTIONS = Object.entries(WORK_ORDER_STATUS_CONFIG).map(
  ([value, config]) => ({ value, label: config.label }),
);

const QUALITY_TYPE_OPTIONS = Object.entries(INSPECTION_TYPE_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}));

const QUALITY_STATUS_OPTIONS = Object.entries(INSPECTION_STATUS_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}));

const SEVERITY_OPTIONS = Object.entries(QUALITY_DEFECT_SEVERITY_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}));

const OWNER_TYPE_OPTIONS = Object.entries(INVENTORY_OWNER_TYPE_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}));

function selectedEntity(id?: string, display?: string): EntityFilterValue | null {
  return id ? { id, display: display ?? '已选择' } : null;
}

function setEntityValue(
  args: AdvancedExtraArgs,
  key: 'material' | 'workCenter' | 'warehouse',
  value: EntityFilterValue | null,
) {
  args.setValue(`${key}Id`, value?.id);
  args.setValue(`${key}Display`, value?.display);
}

function renderMaterialFilter({ values, setValue }: AdvancedExtraArgs): ReactNode {
  return (
    <MaterialFilterChip
      label="物料"
      variant="compact"
      value={selectedEntity(values.materialId, values.materialDisplay)}
      onChange={(value) => setEntityValue({ values, setValue }, 'material', value)}
      fetchFn={(params) => materialService.list({ ...params, includeInactive: true })}
      keyExtractor={(item) => item.id}
      labelExtractor={(item) => item.name}
      sublabelExtractor={(item) => item.code}
      title="选择物料"
    />
  );
}

function renderWorkCenterFilter({ values, setValue }: AdvancedExtraArgs): ReactNode {
  return (
    <EntityFilterChip<WorkCenter>
      label="工作中心"
      variant="compact"
      value={selectedEntity(values.workCenterId, values.workCenterDisplay)}
      onChange={(value) => setEntityValue({ values, setValue }, 'workCenter', value)}
      fetchFn={(params) =>
        workCenterService.list({
          page: params.page,
          pageSize: params.pageSize,
          keyword: params.keyword,
          isActive: true,
          leafOnly: true,
        })
      }
      keyExtractor={(item) => item.id}
      labelExtractor={(item) => item.name}
      sublabelExtractor={(item) => item.code}
      title="选择工作中心"
    />
  );
}

function renderWarehouseFilter({ values, setValue }: AdvancedExtraArgs): ReactNode {
  return (
    <EntityFilterChip<Warehouse>
      label="仓库"
      variant="compact"
      value={selectedEntity(values.warehouseId, values.warehouseDisplay)}
      onChange={(value) => setEntityValue({ values, setValue }, 'warehouse', value)}
      fetchFn={(params) => warehouseService.listWarehouses(params)}
      keyExtractor={(item) => item.id}
      labelExtractor={(item) => item.name}
      sublabelExtractor={(item) => item.code}
      title="选择仓库"
    />
  );
}

function renderEntityGroup(children: ReactNode): ReactNode {
  return <View style={styles.entityGroup}>{children}</View>;
}

function createQuickFilter(
  key: string,
  label: string,
  options: FilterConfig['options'],
): FilterConfig {
  return { key, label, options };
}

function createReportFilterDefinition(scope: ReportFilterScope): ReportFilterDefinition {
  const overdueFilter = createQuickFilter('overdueOnly', '交期风险', [
    { value: 'true', label: '仅交期逾期' },
  ]);

  if (scope === 'dashboard') {
    return {
      quickFilters: [overdueFilter],
      advancedFilters: [
        REPORT_DATE_FILTER,
        { key: 'productionStatus', label: '工单状态', options: PRODUCTION_STATUS_OPTIONS },
      ],
      advancedExtraKeys: ['materialId', 'materialDisplay', 'workCenterId', 'workCenterDisplay'],
      advancedExtraActiveKeys: ['materialId', 'workCenterId'],
      keys: [
        'dateFrom',
        'dateTo',
        'materialId',
        'materialDisplay',
        'workCenterId',
        'workCenterDisplay',
        'productionStatus',
        'overdueOnly',
      ],
      renderAdvancedExtra: (args) =>
        renderEntityGroup(
          <>
            {renderMaterialFilter(args)}
            {renderWorkCenterFilter(args)}
          </>,
        ),
    };
  }

  if (scope === 'production') {
    return {
      quickFilters: [overdueFilter],
      advancedFilters: [
        REPORT_DATE_FILTER,
        { key: 'productionStatus', label: '工单状态', options: PRODUCTION_STATUS_OPTIONS },
      ],
      advancedExtraKeys: ['materialId', 'materialDisplay', 'workCenterId', 'workCenterDisplay'],
      advancedExtraActiveKeys: ['materialId', 'workCenterId'],
      keys: [
        'dateFrom',
        'dateTo',
        'materialId',
        'materialDisplay',
        'workCenterId',
        'workCenterDisplay',
        'productionStatus',
        'overdueOnly',
      ],
      renderAdvancedExtra: (args) =>
        renderEntityGroup(
          <>
            {renderMaterialFilter(args)}
            {renderWorkCenterFilter(args)}
          </>,
        ),
    };
  }

  if (scope === 'quality') {
    return {
      quickFilters: [createQuickFilter('qualityStatus', '检验状态', QUALITY_STATUS_OPTIONS)],
      advancedFilters: [
        REPORT_DATE_FILTER,
        { key: 'qualityType', label: '检验类型', options: QUALITY_TYPE_OPTIONS },
        { key: 'severity', label: '缺陷严重度', options: SEVERITY_OPTIONS },
      ],
      advancedExtraKeys: ['materialId', 'materialDisplay'],
      advancedExtraActiveKeys: ['materialId'],
      keys: [
        'dateFrom',
        'dateTo',
        'materialId',
        'materialDisplay',
        'qualityType',
        'qualityStatus',
        'severity',
      ],
      renderAdvancedExtra: (args) => renderEntityGroup(renderMaterialFilter(args)),
    };
  }

  return {
    quickFilters: [createQuickFilter('ownerType', '货主类型', OWNER_TYPE_OPTIONS)],
    advancedFilters: [],
    advancedExtraKeys: ['warehouseId', 'warehouseDisplay', 'materialId', 'materialDisplay'],
    advancedExtraActiveKeys: ['warehouseId', 'materialId'],
    keys: ['warehouseId', 'warehouseDisplay', 'materialId', 'materialDisplay', 'ownerType'],
    renderAdvancedExtra: (args) =>
      renderEntityGroup(
        <>
          {renderWarehouseFilter(args)}
          {renderMaterialFilter(args)}
        </>,
      ),
  };
}

function toFilterValues(
  filters: ReportFilterState,
  keys: readonly ReportFilterKey[],
): ReportFilterValues {
  return keys.reduce<ReportFilterValues>((values, key) => {
    const value = filters[key];
    if (typeof value === 'string') values[key] = value;
    if (value === true) values[key] = 'true';
    return values;
  }, {});
}

function toReportFilterState(values: ReportFilterValues): ReportFilterState {
  return {
    dateFrom: values.dateFrom,
    dateTo: values.dateTo,
    materialId: values.materialId,
    materialDisplay: values.materialDisplay,
    workCenterId: values.workCenterId,
    workCenterDisplay: values.workCenterDisplay,
    warehouseId: values.warehouseId,
    warehouseDisplay: values.warehouseDisplay,
    productionStatus: values.productionStatus as ReportFilterState['productionStatus'],
    overdueOnly: values.overdueOnly === 'true' ? true : undefined,
    qualityType: values.qualityType as ReportFilterState['qualityType'],
    qualityStatus: values.qualityStatus as ReportFilterState['qualityStatus'],
    severity: values.severity as ReportFilterState['severity'],
    ownerType: values.ownerType as ReportFilterState['ownerType'],
  };
}

export function ReportContextBar({
  scope,
  period,
  filters,
  onPeriodChange,
  onChange,
  onReset,
}: ReportContextBarProps) {
  const { colors } = useTheme();
  const definition = useMemo(() => createReportFilterDefinition(scope), [scope]);
  const values = useMemo(
    () => toFilterValues(filters, definition.keys),
    [definition.keys, filters],
  );
  const hasCustomRange = Boolean(filters.dateFrom && filters.dateTo);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
    >
      {scope === 'stock' ? (
        <View style={[styles.snapshotLabel, { backgroundColor: colors.primarySurface }]}>
          <Ionicons name="flash-outline" size={16} color={colors.primary} />
          <Text style={[styles.snapshotText, { color: colors.primary }]}>实时库存快照</Text>
        </View>
      ) : (
        <ReportPeriodNavigator
          period={period}
          onChange={onPeriodChange}
          customRange={
            hasCustomRange ? { startDate: filters.dateFrom, endDate: filters.dateTo } : undefined
          }
          style={styles.periodControl}
        />
      )}
      <FilterBar
        key={scope}
        quickFilters={definition.quickFilters}
        advancedFilters={definition.advancedFilters}
        advancedExtra={definition.renderAdvancedExtra}
        advancedExtraKeys={definition.advancedExtraKeys}
        advancedExtraActiveKeys={definition.advancedExtraActiveKeys}
        values={values}
        onChange={(nextValues) => onChange(toReportFilterState(nextValues))}
        onResetAll={onReset}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  periodControl: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
  },
  snapshotLabel: {
    minHeight: 42,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
  snapshotText: { fontSize: FontSize.sm, fontWeight: '600' },
  entityGroup: {
    gap: Spacing.md,
  },
});
