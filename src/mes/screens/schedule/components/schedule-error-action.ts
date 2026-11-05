import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { confirmAlert } from '../../../../core/components/ConfirmAlert.ts';
import type { RootStackParamList } from '../../../host/navigation';
import { toast } from '../../../../core/toast';

const ACTIONABLE_SCHEDULE_ERROR_PATTERNS = [
  /未配置设备类型，无法排产/,
  /工序依赖网络存在循环，无法排产/,
  /工序依赖网络排序异常，前置工序尚未排产/,
  /设备类型["“].+?["”]没有可用设备.*无法排产/,
  /指定的设备中没有类型为["“].+?["”]的设备，无法排产/,
  /工作中心["“].+?["”]及其下级没有类型为["“].+?["”]的设备.*无法排产/,
  /所选设备不在工序允许设备范围内/,
  /所选设备与工序设备类型不匹配/,
  /没有可用的工作中心或设备用于重排/,
];

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function resolveErrorMessage(error: unknown, fallback: string): string {
  const record = asRecord(error);
  const response = asRecord(record?.response);
  const data = asRecord(response?.data);
  return (
    asNonEmptyString(data?.message) ??
    asNonEmptyString(data?.msg) ??
    (error instanceof Error ? asNonEmptyString(error.message) : null) ??
    asNonEmptyString(record?.message) ??
    asNonEmptyString(record?.msg) ??
    fallback
  );
}

function normalizeRouteIds(routeIds: Array<string | null | undefined>): string[] {
  return [...new Set(routeIds.map((id) => id?.trim()).filter((id): id is string => !!id))];
}

export function isActionableScheduleError(messageText: string): boolean {
  return ACTIONABLE_SCHEDULE_ERROR_PATTERNS.some((pattern) => pattern.test(messageText));
}

export function navigateToScheduleRoute(
  navigation: RootNavigation,
  routeIds: Array<string | null | undefined>,
) {
  const uniqueRouteIds = normalizeRouteIds(routeIds);
  if (uniqueRouteIds.length === 1) {
    navigation.navigate('ProcessRoute', {
      screen: 'ProcessRouteDetail',
      params: { id: uniqueRouteIds[0] },
    });
    return;
  }

  navigation.navigate('ProcessRoute', { screen: 'ProcessRoutesList' });
}

export function showScheduleActionableError(
  error: unknown,
  navigation: RootNavigation,
  routeIds: Array<string | null | undefined>,
  fallback = '排产失败',
  beforeNavigate?: () => void,
) {
  const messageText = resolveErrorMessage(error, fallback);
  if (!isActionableScheduleError(messageText)) {
    toast.error(messageText, fallback);
    return;
  }

  confirmAlert(
    '排产配置需维护',
    messageText,
    () => {
      beforeNavigate?.();
      requestAnimationFrame(() => navigateToScheduleRoute(navigation, routeIds));
    },
    '去维护工艺路线',
    false,
    undefined,
    true,
    '知道了',
  );
}
