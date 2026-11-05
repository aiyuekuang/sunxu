import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { QualityInvestigation } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { CAPA_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import type { RootStackParamList } from '../../../host/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CapaSectionProps {
  capas: QualityInvestigation[];
  inspectionId: string;
  availableActions: string[];
  canViewList: boolean;
  canCreateCapa: boolean;
  canCreateDisposal: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CapaSection({
  capas,
  inspectionId,
  availableActions,
  canViewList,
  canCreateCapa,
  canCreateDisposal,
}: CapaSectionProps) {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const canShowActions =
    (canCreateCapa && availableActions.includes('createCapa')) ||
    (canCreateDisposal && availableActions.includes('createDisposal'));

  return (
    <DetailCard title={canViewList ? `关联 CAPA（${capas.length}）` : '关联 CAPA'}>
      {canShowActions && (
        <View style={styles.capaHeader}>
          {canCreateCapa && availableActions.includes('createCapa') && (
            <TouchableOpacity
              style={[styles.createCapaBtn, { backgroundColor: colors.primary }]}
              onPress={() =>
                navigation.navigate('Capa', {
                  screen: 'CapaForm',
                  params: { inspectionId },
                })
              }
            >
              <Ionicons name="add" size={14} color={colors.textOnPrimary} />
              <Text style={[styles.createCapaBtnText, { color: colors.textOnPrimary }]}>新增</Text>
            </TouchableOpacity>
          )}
          {canCreateDisposal && availableActions.includes('createDisposal') && (
            <TouchableOpacity
              style={[styles.createCapaBtn, { backgroundColor: colors.warning }]}
              onPress={() =>
                navigation.navigate('Disposal', {
                  screen: 'DisposalForm',
                  params: { inspectionId },
                })
              }
            >
              <Ionicons name="construct-outline" size={14} color={colors.textOnPrimary} />
              <Text style={[styles.createCapaBtnText, { color: colors.textOnPrimary }]}>
                进入处置
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {!canViewList ? (
        <EmptyState
          compact
          icon="search-outline"
          title="无权限查看 CAPA 列表"
          description={canShowActions ? '当前角色可直接发起 CAPA 或进入处置。' : undefined}
        />
      ) : capas.length === 0 ? (
        <EmptyState
          compact
          icon="search-outline"
          title="暂无关联 CAPA"
          description={
            availableActions.includes('createCapa')
              ? '质检拒绝时如需专项整改，可升级创建 CAPA'
              : availableActions.includes('createDisposal')
                ? '有条件通过如需进一步追踪，也可补建 CAPA'
                : undefined
          }
        />
      ) : (
        capas.map((c, idx) => (
          <TouchableOpacity
            key={c.id}
            style={[
              styles.capaRow,
              idx > 0 && { borderTopWidth: 0.5, borderTopColor: colors.border },
            ]}
            onPress={() =>
              navigation.navigate('Capa', { screen: 'CapaDetail', params: { id: c.id } })
            }
          >
            <View style={styles.capaMain}>
              <Text style={[styles.capaNo, { color: colors.text }]} numberOfLines={1}>
                {c.investigationNo}
              </Text>
              <Text style={[styles.capaDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {c.problemDescription}
              </Text>
            </View>
            <View
              style={[
                styles.capaStatus,
                {
                  backgroundColor: `${CAPA_STATUS_CONFIG[c.status]?.color ?? colors.textMuted}20`,
                },
              ]}
            >
              <Text
                style={[
                  styles.capaStatusText,
                  { color: CAPA_STATUS_CONFIG[c.status]?.color ?? colors.textMuted },
                ]}
              >
                {CAPA_STATUS_CONFIG[c.status]?.label ?? '未知状态'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        ))
      )}
    </DetailCard>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  capaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  createCapaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  createCapaBtnText: { fontSize: FontSize.xs, fontWeight: '600' },
  capaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: 6 },
  capaMain: { flex: 1, gap: 2 },
  capaNo: { fontSize: FontSize.sm, fontWeight: '600' },
  capaDesc: { fontSize: FontSize.xs },
  capaStatus: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.sm },
  capaStatusText: { fontSize: FontSize.xs, fontWeight: '600' },
});
