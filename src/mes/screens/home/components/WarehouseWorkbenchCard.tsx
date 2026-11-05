import { hasAnyPermission, hasPermission, OPERATION_FEATURE as F, hasVisibleFeature, P } from '../../../host/authorization';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ListPurchaseReceiptDto } from '../../../types/models/ListPurchaseReceiptDto';
import { MaterialIssueListDto } from '../../../types/models/MaterialIssueListDto';
import { materialIssueService } from '../../../host/services';
import { purchaseReceiptService } from '../../../host/services';
import { reportService } from '../../../host/services';
import { useAnyPermission, useCanCreateManualMaterialIssue } from '../../../host/hooks/usePermission';
import type { RootStackParamList } from '../../../host/navigation';
import { useAuthStore } from '../../../host/state/auth.store';
import {
  type HomeWorkbenchAction,
  HomeWorkbenchCard,
  type HomeWorkbenchMetric,
  toWorkbenchMetricValue,
} from './HomeWorkbenchCard.tsx';

interface WarehouseWorkbenchSummary {
  lowStock: number | null;
  pendingIssue: number | null;
  pendingReceipt: number | null;
}

export function WarehouseWorkbenchCard() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const operationConfig = useAuthStore((state) => state.operationConfig);
  const canViewStockSummary =
    hasPermission(P.REPORT_WAREHOUSE) &&
    hasVisibleFeature(operationConfig, F.BASIC_INVENTORY);
  const canOpenWarehouse =
    (hasPermission(P.STOCK_LIST) || hasPermission(P.WAREHOUSE_MANAGE)) &&
    hasVisibleFeature(operationConfig, F.BASIC_INVENTORY);
  const canViewMaterialIssue = useAnyPermission(P.MATERIAL_REQ_LIST, P.MATERIAL_REQ_VIEW);
  const canCreateMaterialIssue = useCanCreateManualMaterialIssue();
  const canViewInternalIssue =
    (hasPermission(P.INTERNAL_ISSUE_LIST) ||
      hasPermission(P.INTERNAL_ISSUE_VIEW)) &&
    hasVisibleFeature(operationConfig, F.INTERNAL_ISSUE);
  const canCreateInternalIssue =
    hasPermission(P.INTERNAL_ISSUE_CREATE) &&
    hasVisibleFeature(operationConfig, F.INTERNAL_ISSUE);
  const canListReceipt =
    hasPermission(P.PURCHASE_RECEIPT_LIST) &&
    hasVisibleFeature(operationConfig, F.PURCHASE_RECEIPT);
  const canCreateReceipt =
    hasPermission(P.PURCHASE_RECEIPT_CREATE) &&
    hasVisibleFeature(operationConfig, F.PURCHASE_RECEIPT);
  const canConfirmReceipt = hasPermission(P.PURCHASE_RECEIPT_CONFIRM);
  const [summary, setSummary] = useState<WarehouseWorkbenchSummary>({
    lowStock: null,
    pendingIssue: null,
    pendingReceipt: null,
  });
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const requestIdRef = useRef(0);

  const load = useCallback(
    async (silent: boolean) => {
      if (!canViewStockSummary && !canViewMaterialIssue && !canListReceipt) {
        requestIdRef.current += 1;
        hasLoadedRef.current = false;
        setSummary({
          lowStock: null,
          pendingIssue: null,
          pendingReceipt: null,
        });
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
        const [stockWarningResult, issueResult, receiptResult] = await Promise.allSettled([
          canViewStockSummary ? reportService.getStockWarning() : Promise.resolve(null),
          canViewMaterialIssue
            ? materialIssueService.list({
                page: 1,
                pageSize: 1,
                statuses: [
                  MaterialIssueListDto.status.DRAFT,
                  MaterialIssueListDto.status.SUBMITTED,
                  MaterialIssueListDto.status.CONFIRMED,
                ],
              })
            : Promise.resolve(null),
          canListReceipt
            ? purchaseReceiptService.list({
                page: 1,
                pageSize: 1,
                status: ListPurchaseReceiptDto.status.SUBMITTED,
              })
            : Promise.resolve(null),
        ]);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setSummary((prev) => ({
          lowStock:
            canViewStockSummary && stockWarningResult.status === 'fulfilled'
              ? (stockWarningResult.value?.lowStockSummaries.length ?? null)
              : canViewStockSummary && silent
                ? prev.lowStock
                : null,
          pendingIssue:
            canViewMaterialIssue && issueResult.status === 'fulfilled'
              ? (issueResult.value?.total ?? null)
              : canViewMaterialIssue && silent
                ? prev.pendingIssue
                : null,
          pendingReceipt:
            canListReceipt && receiptResult.status === 'fulfilled'
              ? (receiptResult.value?.total ?? null)
              : canListReceipt && silent
                ? prev.pendingReceipt
                : null,
        }));

        const hasFailure =
          (canViewStockSummary && stockWarningResult.status === 'rejected') ||
          (canViewMaterialIssue && issueResult.status === 'rejected') ||
          (canListReceipt && receiptResult.status === 'rejected');

        setErrorText(
          hasFailure && !silent ? '部分仓储统计暂不可用，可直接进入对应列表处理。' : null,
        );
        hasLoadedRef.current = true;
      } finally {
        if (requestId === requestIdRef.current && !silent) {
          setLoading(false);
        }
      }
    },
    [canListReceipt, canViewMaterialIssue, canViewStockSummary],
  );

  useFocusEffect(
    useCallback(() => {
      void load(hasLoadedRef.current);

      return () => {
        requestIdRef.current += 1;
      };
    }, [load]),
  );

  const metrics = useMemo<HomeWorkbenchMetric[]>(
    () => [
      { label: '待领料', value: toWorkbenchMetricValue(summary.pendingIssue), tone: 'warning' },
      { label: '待入库', value: toWorkbenchMetricValue(summary.pendingReceipt), tone: 'primary' },
      { label: '低库存', value: toWorkbenchMetricValue(summary.lowStock), tone: 'error' },
    ],
    [summary.lowStock, summary.pendingIssue, summary.pendingReceipt],
  );

  const actions = useMemo<HomeWorkbenchAction[]>(() => {
    const nextActions: HomeWorkbenchAction[] = [];

    if (canCreateMaterialIssue) {
      nextActions.push({
        key: 'manual-issue',
        label: '手工领料',
        icon: 'exit-outline',
        tone: 'warning',
        onPress: () => navigation.navigate('MaterialIssue', { screen: 'ManualIssueForm' }),
      });
    } else if (canViewMaterialIssue) {
      nextActions.push({
        key: 'issue-list',
        label: '领料列表',
        icon: 'document-text-outline',
        tone: 'warning',
        onPress: () => navigation.navigate('MaterialIssue', { screen: 'MaterialIssueList' }),
      });
    }

    if (canCreateInternalIssue) {
      nextActions.push({
        key: 'internal-issue-create',
        label: '内部领用',
        icon: 'build-outline',
        tone: 'warning',
        onPress: () => navigation.navigate('Warehouse', { screen: 'InternalIssueForm' }),
      });
    } else if (canViewInternalIssue) {
      nextActions.push({
        key: 'internal-issue-list',
        label: '领用列表',
        icon: 'reader-outline',
        tone: 'warning',
        onPress: () => navigation.navigate('Warehouse', { screen: 'InternalIssueList' }),
      });
    }

    if (canListReceipt) {
      nextActions.push({
        key: 'receipt-list',
        label: canConfirmReceipt ? '确认入库' : '入库列表',
        icon: 'download-outline',
        tone: 'primary',
        onPress: () => navigation.navigate('PurchaseReceipt', { screen: 'PurchaseReceiptList' }),
      });
    } else if (canCreateReceipt) {
      nextActions.push({
        key: 'receipt-create',
        label: '新增',
        icon: 'add-circle-outline',
        tone: 'primary',
        onPress: () => navigation.navigate('PurchaseReceipt', { screen: 'PurchaseReceiptForm' }),
      });
    }

    if (canOpenWarehouse) {
      nextActions.push({
        key: 'low-stock',
        label: '低库存',
        icon: 'warning-outline',
        tone: 'error',
        onPress: () =>
          navigation.navigate('Warehouse', {
            screen: 'WarehousesList',
            params: { lowStock: true },
          }),
      });
    }

    return nextActions.slice(0, 4);
  }, [
    canConfirmReceipt,
    canCreateInternalIssue,
    canCreateMaterialIssue,
    canCreateReceipt,
    canListReceipt,
    canOpenWarehouse,
    canViewInternalIssue,
    canViewMaterialIssue,
    navigation,
  ]);

  if (actions.length === 0) return null;

  return (
    <HomeWorkbenchCard
      icon="cube-outline"
      title="仓储作业"
      description="优先处理发料、入库和低库存异常。"
      metrics={metrics}
      actions={actions}
      loading={loading}
      errorText={errorText}
      note={
        typeof summary.lowStock === 'number' && summary.lowStock > 0
          ? `当前有 ${summary.lowStock} 个物料低于安全线，建议优先检查补货或替代方案。`
          : !canViewStockSummary && !canViewMaterialIssue && !canListReceipt
            ? '当前角色以快捷处理为主，这里不展示跨模块仓储汇总。'
            : '把待领料和待入库放到首页，仓储处理会比只保留菜单入口更直接。'
      }
      onPressMore={
        canOpenWarehouse
          ? () =>
              navigation.navigate('Warehouse', {
                screen: 'WarehousesList',
              })
          : undefined
      }
      moreLabel="库存列表"
    />
  );
}
