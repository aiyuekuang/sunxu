import { StyleSheet, View } from 'react-native';
import type { WorkCenter } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard, InfoRow } from '../../../../core/components/DetailCard.tsx';
import { ISSUE_MODE_CONFIG } from '../../../constants/status-configs';
import { FontSize, FontWeight, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDateTime } from '../../../../core/utils/date';

interface WorkCenterArchiveSectionsProps {
  workCenter: WorkCenter;
  workCenterTypeLabelMap: Record<string, string | undefined>;
  equipmentCount: number;
}

function formatWarehouse(workCenter: WorkCenter): string {
  const warehouse = workCenter.lineSideWarehouse;
  if (!warehouse) return '-';
  return `${warehouse.name}${warehouse.code ? ` (${warehouse.code})` : ''}`;
}

function formatType(workCenter: WorkCenter, labelMap: Record<string, string | undefined>): string {
  if (!workCenter.type) return '-';
  return labelMap[workCenter.type] ?? workCenter.type;
}

export function WorkCenterArchiveSections({
  workCenter,
  workCenterTypeLabelMap,
  equipmentCount,
}: WorkCenterArchiveSectionsProps) {
  const { colors } = useTheme();
  const typeLabel = formatType(workCenter, workCenterTypeLabelMap);

  return (
    <>
      <DetailCard noPadding style={styles.summaryCard}>
        <View style={styles.summaryBody}>
          <Text style={[styles.summaryCode, { color: colors.textSecondary }]}>
            {workCenter.code}
          </Text>
          <Text style={[styles.summaryTitle, { color: colors.text }]} numberOfLines={2}>
            {workCenter.name}
          </Text>
          <Text style={[styles.summaryMeta, { color: colors.textSecondary }]} numberOfLines={1}>
            {typeLabel}
          </Text>
        </View>
      </DetailCard>

      <DetailCard title="组织与供料">
        <InfoRow label="上级" value={workCenter.parent?.name ?? '-'} />
        <InfoRow label="部门" value={workCenter.department?.name ?? '-'} />
        <InfoRow label="线边仓" value={formatWarehouse(workCenter)} />
        <InfoRow
          label="供料策略"
          value={ISSUE_MODE_CONFIG[workCenter.issueMode ?? 'direct']?.label ?? '直接供料'}
          last
        />
      </DetailCard>

      <DetailCard title="结构信息">
        <InfoRow label="设备数量" value={`${equipmentCount}`} />
        <InfoRow label="下级数量" value={`${workCenter.children?.length ?? 0}`} last />
      </DetailCard>

      <DetailCard title="备注与审计">
        <InfoRow label="描述" value={workCenter.description ?? '-'} />
        <InfoRow label="创建时间" value={formatDateTime(workCenter.createdAt)} last />
      </DetailCard>
    </>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: Radius.md,
  },
  summaryBody: {
    padding: Spacing.base,
    gap: Spacing.xs,
  },
  summaryCode: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  summaryTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    lineHeight: 24,
  },
  summaryMeta: {
    fontSize: FontSize.sm,
  },
});
