import { StyleSheet, View } from 'react-native';
import type { WorkOrderDemandAllocationTraceDto } from '../../../types/models/WorkOrderDemandAllocationTraceDto';
import type { WorkOrderOperation } from '../../../types/models/WorkOrderOperation';
import { AttachmentFilesField } from '../../../components/common/AttachmentFilesField.tsx';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

interface WorkOrderDrawingsSectionProps {
  drawingUrls?: string[] | null;
  customSnapshot?: Record<string, unknown> | null;
  operations?: WorkOrderOperation[];
  demandAllocations?: WorkOrderDemandAllocationTraceDto[];
}

interface DrawingGroup {
  key: string;
  title: string;
  description?: string;
  urls: string[];
  showWhenEmpty?: boolean;
}

function normalizeDrawingUrls(urls?: string[] | null): string[] {
  return Array.from(
    new Set((urls ?? []).map((url) => (typeof url === 'string' ? url.trim() : '')).filter(Boolean)),
  );
}

function buildDemandDrawingGroups(
  allocations: WorkOrderDemandAllocationTraceDto[],
): DrawingGroup[] {
  const groups = new Map<string, DrawingGroup>();

  allocations.forEach((allocation) => {
    const urls = normalizeDrawingUrls(allocation.drawingUrls);
    if (urls.length === 0 && !allocation.saleOrderItemId) return;

    const key = allocation.saleOrderItemId || allocation.demandLineId || allocation.allocationId;
    const description = [
      allocation.sourceOrderNo,
      allocation.saleOrderItemLineNo != null
        ? `订单行 #${allocation.saleOrderItemLineNo}`
        : allocation.saleOrderItemId
          ? '订单行'
          : `需求行 #${allocation.demandLineNo}`,
      allocation.customerMaterialCode || allocation.materialCode,
      allocation.customerMaterialName || allocation.materialName,
      allocation.customerMaterialSpec,
    ]
      .filter(Boolean)
      .join(' · ');
    const existing = groups.get(key);

    if (existing) {
      existing.urls = normalizeDrawingUrls([...existing.urls, ...urls]);
      existing.showWhenEmpty ||= Boolean(allocation.saleOrderItemId);
      return;
    }

    groups.set(key, {
      key: `demand-${key}`,
      title: allocation.saleOrderItemId ? '订单行图纸' : '来源需求图纸',
      description,
      urls,
      showWhenEmpty: Boolean(allocation.saleOrderItemId),
    });
  });

  return [...groups.values()];
}

function getRequirement(customSnapshot?: Record<string, unknown> | null): string {
  const requirement = customSnapshot?.requirement;
  return typeof requirement === 'string' ? requirement : '';
}

export function WorkOrderDrawingsSection({
  drawingUrls,
  customSnapshot,
  operations = [],
  demandAllocations = [],
}: WorkOrderDrawingsSectionProps) {
  const { colors } = useTheme();
  const drawings = normalizeDrawingUrls(drawingUrls);
  const groups: DrawingGroup[] = [
    { key: 'work-order', title: '工单级图纸', urls: drawings },
    ...buildDemandDrawingGroups(demandAllocations),
    ...operations
      .filter((operation) => (operation.drawingUrls?.length ?? 0) > 0)
      .map((operation) => ({
        key: `operation-${operation.id}`,
        title: `工序 ${operation.sequence}. ${operation.operationName}`,
        urls: normalizeDrawingUrls(operation.drawingUrls),
      })),
  ].filter((group) => group.urls.length > 0 || group.showWhenEmpty);
  const allDrawingUrls = normalizeDrawingUrls(groups.flatMap((group) => group.urls));
  const requirement = getRequirement(customSnapshot);

  return (
    <DetailCard title={`订单与工艺图纸 (${allDrawingUrls.length})`}>
      {groups.length === 0 ? (
        <EmptyState compact icon="document-outline" title="暂无可查看图纸" />
      ) : (
        <View style={styles.groups}>
          {groups.map((group) => (
            <View key={group.key} style={styles.group}>
              <AttachmentFilesField
                label={group.description ? `${group.title} · ${group.description}` : group.title}
                files={group.urls}
                editable={false}
                emptyText={group.showWhenEmpty ? '未关联订单图纸' : '暂无图纸资料'}
              />
            </View>
          ))}
        </View>
      )}

      {requirement ? (
        <View style={[styles.requirementBox, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[styles.requirementLabel, { color: colors.textSecondary }]}>执行要求</Text>
          <Text style={[styles.requirementText, { color: colors.text }]}>{requirement}</Text>
        </View>
      ) : null}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  groups: {
    gap: Spacing.md,
  },
  group: {
    gap: Spacing.xs,
  },
  requirementBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    gap: 4,
  },
  requirementLabel: {
    fontSize: FontSize.xs,
  },
  requirementText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
