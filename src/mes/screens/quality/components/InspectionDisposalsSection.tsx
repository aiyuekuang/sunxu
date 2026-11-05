import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { DisposalOrder } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { DISPOSAL_STATUS_CONFIG, disposalTypeLabel } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import type { RootStackParamList } from '../../../host/navigation';

interface InspectionDisposalsSectionProps {
  disposals: DisposalOrder[];
  inspectionId: string;
  availableActions: string[];
  canCreateDisposal: boolean;
  canOpenDisposal: boolean;
}

export function InspectionDisposalsSection({
  disposals,
  inspectionId,
  availableActions,
  canCreateDisposal,
  canOpenDisposal,
}: InspectionDisposalsSectionProps) {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const canShowCreate = canCreateDisposal && availableActions.includes('createDisposal');

  if (disposals.length === 0 && !canShowCreate) {
    return null;
  }

  return (
    <DetailCard title={`关联处置单（${disposals.length}）`}>
      {canShowCreate && (
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: colors.warning }]}
          onPress={() =>
            navigation.navigate('Disposal', {
              screen: 'DisposalForm',
              params: { inspectionId },
            })
          }
        >
          <Ionicons name="construct-outline" size={14} color={colors.textOnPrimary} />
          <Text style={[styles.createBtnText, { color: colors.textOnPrimary }]}>进入处置</Text>
        </TouchableOpacity>
      )}

      {disposals.length === 0 ? (
        <EmptyState compact icon="construct-outline" title="暂无关联处置单" />
      ) : (
        <>
          {!canOpenDisposal ? (
            <View
              style={[
                styles.permissionHint,
                { backgroundColor: colors.warningSurface, borderColor: colors.warning },
              ]}
            >
              <Ionicons name="lock-closed-outline" size={14} color={colors.warning} />
              <Text style={[styles.permissionHintText, { color: colors.warning }]}>
                当前账号没有查看处置单详情权限，请联系管理员
              </Text>
            </View>
          ) : null}
          {disposals.map((disposal, index) => {
            const status = DISPOSAL_STATUS_CONFIG[disposal.status];
            const statusColor = status?.color ?? colors.textMuted;
            return (
              <TouchableOpacity
                key={disposal.id}
                style={[
                  styles.row,
                  !canOpenDisposal && styles.disabledRow,
                  index > 0 && { borderTopWidth: 0.5, borderTopColor: colors.border },
                ]}
                disabled={!canOpenDisposal}
                onPress={
                  canOpenDisposal
                    ? () =>
                        navigation.navigate('Disposal', {
                          screen: 'DisposalDetail',
                          params: { id: disposal.id },
                        })
                    : undefined
                }
                accessibilityState={{ disabled: !canOpenDisposal }}
              >
                <View style={styles.main}>
                  <Text style={[styles.no, { color: colors.text }]} numberOfLines={1}>
                    {disposal.disposalNo}
                  </Text>
                  <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={1}>
                    {disposalTypeLabel(disposal.type)} · 数量 {disposal.qty}
                  </Text>
                </View>
                <View
                  style={[
                    styles.status,
                    { backgroundColor: `${statusColor}20`, borderColor: `${statusColor}30` },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {status?.label ?? '未知状态'}
                  </Text>
                </View>
                {canOpenDisposal && (
                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            );
          })}
        </>
      )}
    </DetailCard>
  );
}

const styles = StyleSheet.create({
  createBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  },
  createBtnText: { fontSize: FontSize.xs, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: 6 },
  disabledRow: { opacity: 0.65 },
  main: { flex: 1, gap: 2 },
  no: { fontSize: FontSize.sm, fontWeight: '600' },
  desc: { fontSize: FontSize.xs },
  status: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  statusText: { fontSize: FontSize.xs, fontWeight: '600' },
  permissionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  permissionHintText: { flex: 1, fontSize: FontSize.xs },
});
