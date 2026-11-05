import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { BomHeader } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { BOM_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BomSectionProps {
  boms: BomHeader[];
  onPressBom: (id: string) => void;
  onViewAll: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BomSection({ boms, onPressBom, onViewAll }: BomSectionProps) {
  const { colors } = useTheme();
  const activeBoms = boms.filter((b) => b.status === 'active');

  return (
    <DetailCard
      title={`BOM 清单 (${activeBoms.length})`}
      right={
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: `${colors.textMuted}15` }]}
          onPress={onViewAll}
        >
          <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>管理 BOM</Text>
          <Ionicons name="chevron-forward" size={12} color={colors.textSecondary} />
        </TouchableOpacity>
      }
    >
      {activeBoms.length === 0 ? (
        <EmptyState compact icon="list-outline" title="暂无激活的 BOM" />
      ) : (
        activeBoms.map((bom, i, arr) => (
          <TouchableOpacity
            key={bom.id}
            style={[
              styles.row,
              i < arr.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
            onPress={() => onPressBom(bom.id)}
          >
            <View>
              <Text style={[styles.title, { color: colors.text }]}>{`版本 ${bom.version}`}</Text>
            </View>
            <ConfigBadge value={bom.status} config={BOM_STATUS_CONFIG} size="sm" />
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
  title: { fontSize: FontSize.sm, fontWeight: '500' },
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
