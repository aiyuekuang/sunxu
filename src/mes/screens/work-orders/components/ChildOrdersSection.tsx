import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { ChildOrderSummary } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { ProgressBar } from '../../../../core/components/ProgressBar.tsx';
import {
  CHILD_ORDER_TYPE_CONFIG,
  WORK_ORDER_DISPLAY_STATUS_CONFIG,
} from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatNumber } from '../../../../core/utils/format';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChildOrdersSectionProps {
  childOrders: ChildOrderSummary[];
  onPressChild: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChildOrdersSection({ childOrders, onPressChild }: ChildOrdersSectionProps) {
  const { colors } = useTheme();

  if (childOrders.length === 0) return null;

  return (
    <DetailCard title={`子工单 (${childOrders.length})`} noPadding>
      <View style={styles.list}>
        {childOrders.map((child) => {
          const typeInfo =
            CHILD_ORDER_TYPE_CONFIG[child.workOrderType] ?? CHILD_ORDER_TYPE_CONFIG.normal;
          const childStatusDisplay = child.statusDisplay ?? child.status;

          return (
            <TouchableOpacity
              key={child.id}
              style={[styles.item, { backgroundColor: colors.background }]}
              onPress={() => onPressChild(child.id)}
              activeOpacity={0.6}
            >
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Text style={[styles.orderNo, { color: colors.text }]}>{child.orderNo}</Text>
                  <View style={[styles.typeBadge, { backgroundColor: typeInfo.bg }]}>
                    <Text style={[styles.typeText, { color: typeInfo.color }]}>
                      {typeInfo.label}
                    </Text>
                  </View>
                </View>
                <View style={styles.headerRight}>
                  <ConfigBadge
                    value={childStatusDisplay}
                    config={WORK_ORDER_DISPLAY_STATUS_CONFIG}
                    size="sm"
                  />
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </View>
              </View>
              {/* 子装配工单显示物料名称 */}
              {child.materialName && (
                <Text
                  style={[styles.materialName, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {child.materialCode ? `[${child.materialCode}] ` : ''}
                  {child.materialName}
                </Text>
              )}
              <View style={styles.progressRow}>
                <View style={styles.progressBarWrap}>
                  <ProgressBar
                    current={Number(child.completedQty)}
                    target={Number(child.plannedQty)}
                    height={4}
                  />
                </View>
                <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                  良{formatNumber(child.completedQty, { maximumFractionDigits: 4 })}/投
                  {formatNumber(child.plannedQty, { maximumFractionDigits: 4 })}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </DetailCard>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  list: { padding: Spacing.md, gap: Spacing.sm },
  item: { padding: Spacing.sm, gap: Spacing.xs, borderRadius: Radius.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  orderNo: { fontSize: FontSize.sm, fontWeight: '600' },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm },
  typeText: { fontSize: FontSize.xs, fontWeight: '600' },
  materialName: { fontSize: FontSize.xs },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progressBarWrap: { flex: 1 },
  progressText: { fontSize: FontSize.xs, minWidth: 50, textAlign: 'right' },
});
