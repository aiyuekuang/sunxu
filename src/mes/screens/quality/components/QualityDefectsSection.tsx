import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity } from 'react-native';
import type { QualityDefect } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { QualityDefectList } from './QualityDefectList.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QualityDefectsSectionProps {
  defects: QualityDefect[];
  canAdd?: boolean;
  onAdd?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QualityDefectsSection({
  defects,
  canAdd = false,
  onAdd,
}: QualityDefectsSectionProps) {
  const { colors } = useTheme();

  if ((!defects || defects.length === 0) && !canAdd) return null;

  return (
    <DetailCard
      title={`缺陷记录（${defects.length} 条）`}
      right={
        canAdd ? (
          <TouchableOpacity onPress={onAdd} style={styles.addBtn}>
            <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
            <Text style={[styles.addBtnText, { color: colors.primary }]}>添加</Text>
          </TouchableOpacity>
        ) : undefined
      }
    >
      <QualityDefectList
        defects={defects}
        emptyDescription={canAdd ? '点击右上角添加缺陷记录' : undefined}
      />
    </DetailCard>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
