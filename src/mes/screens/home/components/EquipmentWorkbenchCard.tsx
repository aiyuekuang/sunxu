import { hasAnyPermission, hasPermission, hasVisibleFeature, OPERATION_FEATURE as F, P } from '../../../host/authorization';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { MaintenanceListDto } from '../../../types/models/MaintenanceListDto';
import { equipmentService } from '../../../host/services';
import { equipmentFaultService } from '../../../host/services';
import type { RootStackParamList } from '../../../host/navigation';
import { useAuthStore } from '../../../host/state/auth.store';
import {
  HomeWorkbenchCard,
  type HomeWorkbenchAction,
  type HomeWorkbenchMetric,
  toWorkbenchMetricValue,
} from './HomeWorkbenchCard.tsx';

interface EquipmentWorkbenchSummary {
  openFaults: number | null;
  pendingVerify: number | null;
  pendingMaintenance: number | null;
}

const MAINTENANCE_READ_PERMISSIONS = [
  P.EQUIPMENT_MAINTENANCE_LIST,
  P.EQUIPMENT_MAINTENANCE_VIEW,
  P.EQUIPMENT_MAINTENANCE_CREATE,
  P.EQUIPMENT_MAINTENANCE_UPDATE,
  P.EQUIPMENT_MAINTENANCE_DELETE,
] as const;

export function EquipmentWorkbenchCard() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const operationConfig = useAuthStore((state) => state.operationConfig);
  const canListFaults =
    hasPermission(P.FAULT_LIST) && hasVisibleFeature(operationConfig, F.EQUIPMENT_FAULT);
  const canCreateFault =
    hasPermission(P.FAULT_CREATE) &&
    hasVisibleFeature(operationConfig, F.EQUIPMENT_FAULT);
  const canListEquipment =
    hasPermission(P.EQUIPMENT_LIST) &&
    hasVisibleFeature(operationConfig, F.EQUIPMENT_BASIC);
  const canViewMaintenance =
    hasAnyPermission(MAINTENANCE_READ_PERMISSIONS) &&
    hasVisibleFeature(operationConfig, F.EQUIPMENT_MAINTENANCE);
  const [summary, setSummary] = useState<EquipmentWorkbenchSummary>({
    openFaults: null,
    pendingVerify: null,
    pendingMaintenance: null,
  });
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (!canListFaults && !canViewMaintenance) {
      setSummary({
        openFaults: null,
        pendingVerify: null,
        pendingMaintenance: null,
      });
      setErrorText(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    const load = async () => {
      const [openFaultsResult, pendingVerifyResult, pendingMaintenanceResult] =
        await Promise.allSettled([
          canListFaults
            ? equipmentFaultService.list({ page: 1, pageSize: 1, status: 'open' })
            : Promise.resolve(null),
          canListFaults
            ? equipmentFaultService.list({ page: 1, pageSize: 1, status: 'pending_verify' })
            : Promise.resolve(null),
          canViewMaintenance
            ? equipmentService.listMaintenance({
                page: 1,
                pageSize: 1,
                status: MaintenanceListDto.status.PENDING,
              })
            : Promise.resolve(null),
        ]);

      if (!mounted) return;

      const nextSummary: EquipmentWorkbenchSummary = {
        openFaults:
          canListFaults && openFaultsResult.status === 'fulfilled'
            ? (openFaultsResult.value?.total ?? null)
            : null,
        pendingVerify:
          canListFaults && pendingVerifyResult.status === 'fulfilled'
            ? (pendingVerifyResult.value?.total ?? null)
            : null,
        pendingMaintenance:
          canViewMaintenance && pendingMaintenanceResult.status === 'fulfilled'
            ? (pendingMaintenanceResult.value?.total ?? null)
            : null,
      };

      const hasFailure =
        (canListFaults && openFaultsResult.status === 'rejected') ||
        (canListFaults && pendingVerifyResult.status === 'rejected') ||
        (canViewMaintenance && pendingMaintenanceResult.status === 'rejected');

      setSummary(nextSummary);
      setErrorText(hasFailure ? '部分设备统计暂不可用，可直接进入故障或保养列表继续处理。' : null);
      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [canListFaults, canViewMaintenance]);

  const metrics = useMemo<HomeWorkbenchMetric[]>(
    () => [
      { label: '待维修', value: toWorkbenchMetricValue(summary.openFaults), tone: 'error' },
      { label: '待验收', value: toWorkbenchMetricValue(summary.pendingVerify), tone: 'warning' },
      {
        label: '待保养',
        value: toWorkbenchMetricValue(summary.pendingMaintenance),
        tone: 'primary',
      },
    ],
    [summary.openFaults, summary.pendingMaintenance, summary.pendingVerify],
  );

  const actions = useMemo<HomeWorkbenchAction[]>(() => {
    const nextActions: HomeWorkbenchAction[] = [];

    if (canListFaults) {
      nextActions.push({
        key: 'faults',
        label: '故障处理',
        icon: 'warning-outline',
        tone: 'error',
        onPress: () =>
          navigation.navigate('EquipmentFault', {
            screen: 'EquipmentFaultList',
          }),
      });
    }

    if (canViewMaintenance) {
      nextActions.push({
        key: 'maintenance',
        label: '保养任务',
        icon: 'construct-outline',
        tone: 'primary',
        onPress: () =>
          navigation.navigate('Equipment', {
            screen: 'MaintenanceList',
          }),
      });
    }

    if (canCreateFault) {
      nextActions.push({
        key: 'fault-create',
        label: '新增报修',
        icon: 'add-circle-outline',
        tone: 'warning',
        onPress: () =>
          navigation.navigate('EquipmentFault', {
            screen: 'EquipmentFaultForm',
          }),
      });
    } else if (canListEquipment) {
      nextActions.push({
        key: 'equipment',
        label: '设备台账',
        icon: 'hardware-chip-outline',
        tone: 'default',
        onPress: () =>
          navigation.navigate('Equipment', {
            screen: 'EquipmentList',
          }),
      });
    }

    return nextActions.slice(0, 3);
  }, [canCreateFault, canListEquipment, canListFaults, canViewMaintenance, navigation]);

  if (actions.length === 0) return null;

  return (
    <HomeWorkbenchCard
      icon="build-outline"
      title="设备保障"
      description="把故障、保养和报修入口集中到首页。"
      metrics={metrics}
      actions={actions}
      loading={loading}
      errorText={errorText}
      note={
        typeof summary.openFaults === 'number' && summary.openFaults > 0
          ? `当前有 ${summary.openFaults} 条故障待处理，建议优先跟进停机与待验收任务。`
          : !canListFaults && !canViewMaintenance
            ? '当前角色以报修入口为主，这里不展示故障或保养统计。'
            : '设备保障首页卡更适合维修和设备岗位，不再重复展示普通概览数据。'
      }
      onPressMore={
        canListEquipment
          ? () =>
              navigation.navigate('Equipment', {
                screen: 'EquipmentList',
              })
          : undefined
      }
      moreLabel="设备列表"
    />
  );
}
