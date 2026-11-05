import { hasAnyPermission, hasPermission, hasVisibleFeature, OPERATION_FEATURE as F, P } from '../../../host/authorization';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useRef, useState } from 'react';
import { DisposalListDto } from '../../../types/models/DisposalListDto';
import { QualityInspectionListDto } from '../../../types/models/QualityInspectionListDto';
import { disposalService } from '../../../host/services';
import { qualityService } from '../../../host/services';
import type { RootStackParamList } from '../../../host/navigation';
import { useAuthStore } from '../../../host/state/auth.store';
import {
  HomeWorkbenchCard,
  type HomeWorkbenchAction,
  type HomeWorkbenchMetric,
  toWorkbenchMetricValue,
} from './HomeWorkbenchCard.tsx';

interface QualityWorkbenchSummary {
  pendingInspection: number | null;
  inProgressInspection: number | null;
  pendingDisposal: number | null;
}

export function QualityWorkbenchCard() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const operationConfig = useAuthStore((state) => state.operationConfig);
  const canListInspection =
    hasPermission(P.INSPECTION_LIST) &&
    hasVisibleFeature(operationConfig, F.BASIC_QUALITY);
  const canViewDisposal =
    hasPermission(P.DISPOSAL_LIST) && hasVisibleFeature(operationConfig, F.DISPOSAL);
  const [summary, setSummary] = useState<QualityWorkbenchSummary>({
    pendingInspection: null,
    inProgressInspection: null,
    pendingDisposal: null,
  });
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const requestIdRef = useRef(0);

  const load = useCallback(
    async (silent: boolean) => {
      if (!canListInspection && !canViewDisposal) {
        requestIdRef.current += 1;
        hasLoadedRef.current = false;
        setSummary({
          pendingInspection: null,
          inProgressInspection: null,
          pendingDisposal: null,
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
        const [pendingInspectionResult, progressInspectionResult, disposalResult] =
          await Promise.allSettled([
            canListInspection
              ? qualityService.list({
                  page: 1,
                  pageSize: 1,
                  status: QualityInspectionListDto.status.PENDING,
                })
              : Promise.resolve(null),
            canListInspection
              ? qualityService.list({
                  page: 1,
                  pageSize: 1,
                  status: QualityInspectionListDto.status.IN_PROGRESS,
                })
              : Promise.resolve(null),
            canViewDisposal
              ? disposalService.list({
                  page: 1,
                  pageSize: 1,
                  status: DisposalListDto.status.PENDING,
                })
              : Promise.resolve(null),
          ]);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setSummary((prev) => ({
          pendingInspection:
            canListInspection && pendingInspectionResult.status === 'fulfilled'
              ? (pendingInspectionResult.value?.total ?? null)
              : canListInspection && silent
                ? prev.pendingInspection
                : null,
          inProgressInspection:
            canListInspection && progressInspectionResult.status === 'fulfilled'
              ? (progressInspectionResult.value?.total ?? null)
              : canListInspection && silent
                ? prev.inProgressInspection
                : null,
          pendingDisposal:
            canViewDisposal && disposalResult.status === 'fulfilled'
              ? (disposalResult.value?.total ?? null)
              : canViewDisposal && silent
                ? prev.pendingDisposal
                : null,
        }));

        const hasFailure =
          (canListInspection && pendingInspectionResult.status === 'rejected') ||
          (canListInspection && progressInspectionResult.status === 'rejected') ||
          (canViewDisposal && disposalResult.status === 'rejected');

        setErrorText(
          hasFailure && !silent ? '部分质检统计暂不可用，可直接进入列表继续处理。' : null,
        );
        hasLoadedRef.current = true;
      } finally {
        if (requestId === requestIdRef.current && !silent) {
          setLoading(false);
        }
      }
    },
    [canListInspection, canViewDisposal],
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
      {
        label: '待检任务',
        value: toWorkbenchMetricValue(summary.pendingInspection),
        tone: 'warning',
      },
      {
        label: '录入中',
        value: toWorkbenchMetricValue(summary.inProgressInspection),
        tone: 'primary',
      },
      {
        label: '待处置',
        value: toWorkbenchMetricValue(summary.pendingDisposal),
        tone: 'error',
      },
    ],
    [summary.inProgressInspection, summary.pendingDisposal, summary.pendingInspection],
  );

  const actions = useMemo<HomeWorkbenchAction[]>(() => {
    const nextActions: HomeWorkbenchAction[] = [];

    if (canListInspection) {
      nextActions.push({
        key: 'pending-inspection',
        label: '开始检验',
        icon: 'checkmark-circle-outline',
        tone: 'warning',
        onPress: () =>
          navigation.navigate('Quality', {
            screen: 'QualityList',
            params: { initialTab: 'pending' },
          }),
      });
    }

    if (canListInspection) {
      nextActions.push({
        key: 'inspection-progress',
        label: '录入结果',
        icon: 'create-outline',
        tone: 'primary',
        onPress: () =>
          navigation.navigate('Quality', {
            screen: 'QualityList',
            params: { initialTab: 'in_progress' },
          }),
      });
    }

    if (canViewDisposal) {
      nextActions.push({
        key: 'disposal',
        label: '不合格处置',
        icon: 'alert-circle-outline',
        tone: 'error',
        onPress: () => navigation.navigate('Disposal', { screen: 'DisposalList' }),
      });
    }

    return nextActions.slice(0, 3);
  }, [canListInspection, canViewDisposal, navigation]);

  if (actions.length === 0) return null;

  return (
    <HomeWorkbenchCard
      icon="shield-checkmark-outline"
      title="质检任务"
      description="优先处理待检、录入结果和不合格处置。"
      metrics={metrics}
      actions={actions}
      loading={loading}
      errorText={errorText}
      note={
        typeof summary.pendingDisposal === 'number' && summary.pendingDisposal > 0
          ? `当前有 ${summary.pendingDisposal} 条待处置任务，建议优先完成异常闭环。`
          : !canListInspection && canViewDisposal
            ? '当前角色以处置闭环为主，这里不展示检验列表统计。'
            : '把待检和录入中任务留在首页，减少在质检列表里来回切换。'
      }
      onPressMore={
        canListInspection
          ? () =>
              navigation.navigate('Quality', {
                screen: 'QualityList',
              })
          : undefined
      }
      moreLabel="质检列表"
    />
  );
}
