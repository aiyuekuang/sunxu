import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { EquipmentMaintenance } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { EQUIPMENT_MAINTENANCE_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useDict } from '../../../host/hooks/useDict';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDate } from '../../../../core/utils/date';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MaintenanceHistorySectionProps {
  maintenances: EquipmentMaintenance[];
  canCreate: boolean;
  onCreatePress: () => void;
  onItemPress: (item: EquipmentMaintenance) => void;
  onViewAll: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MaintenanceHistorySection({
  maintenances,
  canCreate,
  onCreatePress,
  onItemPress,
  onViewAll,
}: MaintenanceHistorySectionProps) {
  const { colors } = useTheme();
  const { labelMap: maintenanceTypeLabelMap } = useDict('maintenance_type');

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>
          维保记录（最近5条）
        </Text>
        {canCreate && (
          <TouchableOpacity
            onPress={onCreatePress}
            style={[styles.miniBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.miniBtnText, { color: colors.textOnPrimary }]}>+ 新增</Text>
          </TouchableOpacity>
        )}
      </View>
      {maintenances.length === 0 ? (
        <EmptyState compact icon="construct-outline" title="暂无维保记录" />
      ) : (
        maintenances.map((m, idx) => {
          const mc = EQUIPMENT_MAINTENANCE_STATUS_CONFIG[m.status] ?? {
            label: '未知状态',
            color: '#999999',
          };
          return (
            <TouchableOpacity
              key={m.id}
              activeOpacity={0.6}
              onPress={() => onItemPress(m)}
              style={[
                styles.maintRow,
                { borderTopColor: colors.borderLight },
                idx === 0 && { borderTopWidth: 0 },
              ]}
            >
              <View style={styles.maintLeft}>
                <Text style={[styles.maintNo, { color: colors.text }]}>{m.maintenanceNo}</Text>
                <Text style={[styles.maintDate, { color: colors.textSecondary }]}>
                  {m.type ? `${maintenanceTypeLabelMap[m.type] ?? m.type}  ·  ` : ''}
                  计划: {formatDate(m.plannedDate)}
                  {m.assignee?.realName ? `  ·  ${m.assignee.realName}` : ''}
                </Text>
                {m.description && (
                  <Text
                    style={[styles.maintDesc, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {m.description}
                  </Text>
                )}
              </View>
              <View style={[styles.maintBadge, { backgroundColor: `${mc.color}20` }]}>
                <Text style={[styles.maintBadgeText, { color: mc.color }]}>{mc.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
      {maintenances.length > 0 && (
        <TouchableOpacity
          onPress={onViewAll}
          style={[styles.viewAllBtn, { borderTopColor: colors.borderLight }]}
        >
          <Text style={[styles.viewAllText, { color: colors.primary }]}>查看全部保养记录</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '600' },
  miniBtn: {
    paddingHorizontal: Spacing.md - 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  miniBtnText: { fontSize: FontSize.xs, fontWeight: '600' },
  maintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderTopWidth: 0.5,
    gap: Spacing.sm,
  },
  maintLeft: { flex: 1, gap: 2 },
  maintNo: { fontSize: FontSize.sm, fontWeight: '500' },
  maintDate: { fontSize: FontSize.xs },
  maintDesc: { fontSize: FontSize.xs },
  maintBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    flexShrink: 0,
  },
  maintBadgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 0.5,
  },
  viewAllText: { fontSize: FontSize.xs, fontWeight: '500' },
});
