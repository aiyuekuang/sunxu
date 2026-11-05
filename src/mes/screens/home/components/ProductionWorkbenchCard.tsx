import { hasAnyPermission, hasPermission, OPERATION_FEATURE as F, hasVisibleFeature, P } from '../../../host/authorization';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { WorkOrderOperation } from '../../../host/services';
import { OperationOutputMode } from '../../../types/models/OperationOutputMode';
import { WorkOrderListDto } from '../../../types/models/WorkOrderListDto';
import { workOrderService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, HIT_SLOP, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import type { RootStackParamList } from '../../../host/navigation';
import { useAuthStore } from '../../../host/state/auth.store';
import { formatDuration } from '../../../../core/utils/date';
import { formatNumber } from '../../../../core/utils/format';
import {
  type HomeWorkbenchAction,
  HomeWorkbenchCard,
  type HomeWorkbenchMetric,
  toWorkbenchMetricValue,
} from './HomeWorkbenchCard.tsx';

interface ProductionWorkbenchSummary {
  myOperations: number | null;
  myInProgress: number | null;
  pendingStart: number | null;
  pendingSchedule: number | null;
}

function getOperationActionLabel(op: WorkOrderOperation): string {
  if (op.operationOutputMode === OperationOutputMode.EXECUTION_QUANTITY) return '记录工作量';
  if (op.operationOutputMode === OperationOutputMode.NON_OUTPUT_EXECUTION) return '记录执行';
  return '报工';
}

function getOperationProgressText(
  op: WorkOrderOperation,
  formatOperationUnit: (unit: string | null | undefined) => string,
): string {
  if (op.operationOutputMode === OperationOutputMode.EXECUTION_QUANTITY) {
    if (op.executionQtyVisible === false) return '加工计数工序';
    const executionQty = Number(op.executionQty ?? 0);
    const executionTarget = Number(op.executionQtyTarget ?? 0);
    const unit = formatOperationUnit(op.executionUnit || '次');
    return executionTarget > 0
      ? `工作量 ${formatNumber(executionQty, { maximumFractionDigits: 4 })}/${formatNumber(
          executionTarget,
          { maximumFractionDigits: 4 },
        )} ${unit}`
      : `工作量 ${formatNumber(executionQty, { maximumFractionDigits: 4 })} ${unit}`;
  }
  if (op.operationOutputMode === OperationOutputMode.NON_OUTPUT_EXECUTION) {
    return op.actualTime != null && op.actualTime > 0
      ? `已记工时 ${formatDuration(op.actualTime)}`
      : '只记录执行工时';
  }
  const reportedQty = Number(op.reportedQty ?? 0);
  const effectiveQty = Number(op.effectiveQty ?? op.plannedQty ?? 0);
  const scrappedQty = Number(op.scrappedQty ?? 0);
  return scrappedQty > 0
    ? `${formatNumber(reportedQty, { maximumFractionDigits: 4 })}/${formatNumber(effectiveQty, {
        maximumFractionDigits: 4,
      })}，废 ${formatNumber(scrappedQty, { maximumFractionDigits: 4 })}`
    : `${formatNumber(reportedQty, { maximumFractionDigits: 4 })}/${formatNumber(effectiveQty, {
        maximumFractionDigits: 4,
      })}`;
}

export function ProductionWorkbenchCard() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { formatUnit: formatOperationUnit } = useUnitDisplay('operation');
  const operationConfig = useAuthStore((state) => state.operationConfig);
  const canManageSchedule =
    (hasPermission(P.SCHEDULE_ENTRY_LIST) ||
      hasPermission(P.SCHEDULE_ENTRY_CREATE)) &&
    hasVisibleFeature(operationConfig, F.SCHEDULE);
  const canOpenWorkOrders =
    hasPermission(P.WORK_ORDER_LIST) && hasVisibleFeature(operationConfig, F.WORK_ORDER);
  const canReport =
    hasPermission(P.WORK_ORDER_REPORT) &&
    hasVisibleFeature(operationConfig, F.REPORTING);
  const canScanReport = canReport && hasVisibleFeature(operationConfig, F.SCAN);
  const [summary, setSummary] = useState<ProductionWorkbenchSummary>({
    myOperations: null,
    myInProgress: null,
    pendingStart: null,
    pendingSchedule: null,
  });
  const [myOperations, setMyOperations] = useState<WorkOrderOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const requestIdRef = useRef(0);

  const load = useCallback(
    async (silent: boolean) => {
      if (!canOpenWorkOrders) {
        requestIdRef.current += 1;
        hasLoadedRef.current = false;
        setSummary({
          myOperations: null,
          myInProgress: null,
          pendingStart: null,
          pendingSchedule: null,
        });
        setMyOperations([]);
        setErrorText(null);
        setLoading(false);
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      if (!silent) {
        setLoading(true);
      }

      try {
        const [operationsResult, pendingStartResult, pendingScheduleResult] =
          await Promise.allSettled([
            workOrderService.myOperations(),
            workOrderService.list({
              page: 1,
              pageSize: 1,
              status: WorkOrderListDto.status.RELEASED,
              executionState: 'ready_to_start',
            }),
            canManageSchedule
              ? workOrderService.list({
                  page: 1,
                  pageSize: 1,
                  status: WorkOrderListDto.status.RELEASED,
                  executionState: 'unscheduled',
                })
              : Promise.resolve(null),
          ]);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setSummary((prev) => ({
          myOperations:
            operationsResult.status === 'fulfilled'
              ? operationsResult.value.length
              : silent
                ? prev.myOperations
                : null,
          myInProgress:
            operationsResult.status === 'fulfilled'
              ? operationsResult.value.filter((item) => item.status === 'in_progress').length
              : silent
                ? prev.myInProgress
                : null,
          pendingStart:
            pendingStartResult.status === 'fulfilled'
              ? pendingStartResult.value.total
              : silent
                ? prev.pendingStart
                : null,
          pendingSchedule:
            canManageSchedule && pendingScheduleResult.status === 'fulfilled'
              ? (pendingScheduleResult.value?.total ?? null)
              : canManageSchedule && silent
                ? prev.pendingSchedule
                : null,
        }));
        if (operationsResult.status === 'fulfilled') {
          setMyOperations(operationsResult.value.slice(0, 3));
        } else if (!silent) {
          setMyOperations([]);
        }

        const hasFailure =
          operationsResult.status === 'rejected' ||
          pendingStartResult.status === 'rejected' ||
          (canManageSchedule && pendingScheduleResult.status === 'rejected');
        setErrorText(
          hasFailure && !silent ? '部分生产统计暂不可用，可直接进入排产或报工处理。' : null,
        );
        hasLoadedRef.current = true;
      } finally {
        if (requestId === requestIdRef.current && !silent) {
          setLoading(false);
        }
      }
    },
    [canManageSchedule, canOpenWorkOrders],
  );

  useFocusEffect(
    useCallback(() => {
      void load(hasLoadedRef.current);

      return () => {
        requestIdRef.current += 1;
      };
    }, [load]),
  );

  const openOperationAction = useCallback(
    (op: WorkOrderOperation) => {
      navigation.navigate('WorkOrders', {
        screen: 'WorkOrderDetail',
        params: {
          id: op.workOrderId,
          autoReportOperationId: op.id,
        },
      });
    },
    [navigation],
  );

  const metrics = useMemo<HomeWorkbenchMetric[]>(
    () => [
      { label: '我的工序', value: toWorkbenchMetricValue(summary.myOperations), tone: 'primary' },
      { label: '报工中', value: toWorkbenchMetricValue(summary.myInProgress), tone: 'warning' },
      { label: '待开工', value: toWorkbenchMetricValue(summary.pendingStart), tone: 'default' },
    ],
    [summary.myInProgress, summary.myOperations, summary.pendingStart],
  );

  const actions = useMemo<HomeWorkbenchAction[]>(() => {
    const nextActions: HomeWorkbenchAction[] = [];

    if (canManageSchedule) {
      nextActions.push({
        key: 'schedule',
        label: '去排产',
        icon: 'calendar-outline',
        tone: 'primary',
        onPress: () => navigation.navigate('Schedule'),
      });
    }

    if (canScanReport) {
      nextActions.push({
        key: 'scan-report',
        label: '扫码报工',
        icon: 'scan-outline',
        tone: 'success',
        onPress: () => navigation.navigate('Scan'),
      });
    }

    if (canManageSchedule && canOpenWorkOrders) {
      nextActions.push({
        key: 'pending-schedule',
        label:
          typeof summary.pendingSchedule === 'number' && summary.pendingSchedule > 0
            ? `待排产 ${summary.pendingSchedule}`
            : '待排产',
        icon: 'calendar-outline',
        tone: 'primary',
        onPress: () =>
          navigation.navigate('WorkOrders', {
            screen: 'WorkOrdersList',
            params: {
              initialTab: 'released',
              initialExecutionState: 'unscheduled',
            },
          }),
      });

      nextActions.push({
        key: 'released-orders',
        label: '待开工',
        icon: 'play-outline',
        tone: 'warning',
        onPress: () =>
          navigation.navigate('WorkOrders', {
            screen: 'WorkOrdersList',
            params: {
              initialTab: 'released',
              initialExecutionState: 'ready_to_start',
            },
          }),
      });
    }

    return nextActions;
  }, [canManageSchedule, canOpenWorkOrders, canScanReport, navigation, summary.pendingSchedule]);

  if (actions.length === 0) return null;

  return (
    <HomeWorkbenchCard
      icon="flash-outline"
      title="生产执行"
      description="待排产、待开工和现场报工都从这里继续。"
      metrics={metrics}
      actions={actions}
      loading={loading}
      errorText={errorText}
      note={
        !canOpenWorkOrders
          ? '当前角色以排产或报工操作为主，这里不展示工单统计。'
          : typeof summary.pendingSchedule === 'number' && summary.pendingSchedule > 0
            ? `当前还有 ${summary.pendingSchedule} 张已下达未排产工单，先补排产再等它们进入待开工。`
            : typeof summary.myOperations === 'number' && summary.myOperations > 0
              ? `当前有 ${summary.myOperations} 道工序分配给我，可直接开工或继续报工。`
              : '没有分配到我的工序时，可先处理待开工工单或调整排产。'
      }
      onPressMore={
        canOpenWorkOrders
          ? () =>
              navigation.navigate('WorkOrders', {
                screen: 'WorkOrdersList',
                params: {
                  initialExecutionState: undefined,
                },
              })
          : undefined
      }
      moreLabel="工单列表"
    >
      {myOperations.length > 0 ? (
        <View style={styles.operationList}>
          {myOperations.map((op) => {
            const actionLabel = getOperationActionLabel(op);
            const orderNo = op.workOrder?.orderNo ?? '';
            const materialName = op.workOrder?.material?.name ?? '';
            return (
              <View
                key={op.id}
                style={[
                  styles.operationRow,
                  { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderLight },
                ]}
              >
                <View style={styles.operationMain}>
                  <Text style={[styles.operationName, { color: colors.text }]} numberOfLines={1}>
                    {op.operationName}
                  </Text>
                  <Text
                    style={[styles.operationMeta, { color: colors.textMuted }]}
                    numberOfLines={1}
                  >
                    {[orderNo, materialName].filter(Boolean).join(' · ') || '我的工序'}
                  </Text>
                  <Text
                    style={[styles.operationProgress, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {getOperationProgressText(op, formatOperationUnit)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.operationAction,
                    {
                      backgroundColor: colors.primarySurface,
                      borderColor: `${colors.primary}30`,
                    },
                  ]}
                  activeOpacity={0.72}
                  hitSlop={HIT_SLOP}
                  onPress={() => openOperationAction(op)}
                >
                  <Ionicons name="create-outline" size={13} color={colors.primary} />
                  <Text style={[styles.operationActionText, { color: colors.primary }]}>
                    {actionLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      ) : null}
    </HomeWorkbenchCard>
  );
}

const styles = StyleSheet.create({
  operationList: {
    gap: Spacing.xs,
  },
  operationRow: {
    minHeight: 76,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  operationMain: {
    flex: 1,
    gap: 3,
  },
  operationName: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  operationMeta: {
    fontSize: FontSize.xs,
  },
  operationProgress: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  operationAction: {
    minHeight: 34,
    minWidth: 76,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  operationActionText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
