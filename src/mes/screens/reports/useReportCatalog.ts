import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { type ReportCatalogItem, reportService } from '../../host/services';
import { hasOperationFeatureAccess, hasPermission } from '../../host/authorization';
import { REPORT_CATALOG_PERMISSIONS } from '../../constants/report-detail-configs';
import { useActionRunner } from '../../host/hooks/useActionRunner';
import { useAuthStore } from '../../host/state/auth.store';

export function useReportCatalog() {
  const user = useAuthStore((state) => state.user);
  const operationConfig = useAuthStore((state) => state.operationConfig);
  const [items, setItems] = useState<ReportCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const requestId = useRef(0);
  const { running, run } = useActionRunner();

  const reload = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setFailed(false);
    try {
      const response = await reportService.getCatalog();
      if (currentRequest === requestId.current) setItems(response.items);
    } catch {
      if (currentRequest === requestId.current) {
        setItems([]);
        setFailed(true);
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setItems([]);
      if (!user?.id || !user?.companyId) {
        setLoading(false);
        return;
      }
      void reload();
      return () => {
        requestId.current += 1;
      };
    }, [reload, user?.id, user?.companyId]),
  );

  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        const permission = REPORT_CATALOG_PERMISSIONS[item.reportCode];
        return (
          permission &&
          hasPermission(permission) &&
          hasOperationFeatureAccess(operationConfig, [permission])
        );
      }),
    [items, user, operationConfig],
  );

  const toggleFavorite = useCallback(
    (item: ReportCatalogItem) => {
      const currentRequest = requestId.current;
      return run(
        async () => {
          const result = await reportService.setFavorite(item.reportCode, !item.isFavorite);
          if (currentRequest !== requestId.current) return;
          setItems((current) =>
            current.map((entry) =>
              entry.reportCode === item.reportCode ? { ...entry, isFavorite: result } : entry,
            ),
          );
        },
        item.isFavorite ? '已取消收藏' : '已收藏',
      );
    },
    [run],
  );

  return { items: visibleItems, loading, failed, running, reload, toggleFavorite };
}
