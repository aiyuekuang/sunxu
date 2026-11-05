import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { ProcessRoute } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { ROUTE_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProcessRouteSectionProps {
  routes: ProcessRoute[];
  onPressRoute: (id: string) => void;
  onViewAll: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProcessRouteSection({ routes, onPressRoute, onViewAll }: ProcessRouteSectionProps) {
  const { colors } = useTheme();
  const activeRoutes = routes.filter((r) => r.status === 'active');

  return (
    <DetailCard
      title={`工艺路线 (${activeRoutes.length})`}
      right={
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: `${colors.textMuted}15` }]}
          onPress={onViewAll}
        >
          <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>管理工艺路线</Text>
          <Ionicons name="chevron-forward" size={12} color={colors.textSecondary} />
        </TouchableOpacity>
      }
    >
      {activeRoutes.length === 0 ? (
        <EmptyState compact icon="git-branch-outline" title="暂无激活的工艺路线" />
      ) : (
        activeRoutes.map((rt, i, arr) => (
          <TouchableOpacity
            key={rt.id}
            style={[
              styles.row,
              i < arr.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
            onPress={() => onPressRoute(rt.id)}
          >
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                  {rt.name}
                </Text>
                <Text style={[styles.version, { color: colors.textSecondary }]}>{rt.version}</Text>
              </View>
              <Text style={[styles.sub, { color: colors.textSecondary }]}>
                {rt.code} · {rt.operations?.length ?? 0} 道工序
              </Text>
            </View>
            <View style={styles.right}>
              <ConfigBadge value={rt.status} config={ROUTE_STATUS_CONFIG} size="sm" />
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        ))
      )}
    </DetailCard>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  title: { fontSize: FontSize.sm, fontWeight: '500' },
  version: { fontSize: FontSize.xs },
  sub: { fontSize: FontSize.xs },
  right: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  actionBtnText: { fontSize: FontSize.xs, fontWeight: '600' },
});
