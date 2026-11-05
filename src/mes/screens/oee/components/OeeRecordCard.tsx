import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { OeeRecord } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDate } from '../../../../core/utils/date';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OeeRecordCardProps {
  item: OeeRecord;
  onPress?: (item: OeeRecord) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const OeeRecordCard = React.memo(function OeeRecordCard({
  item,
  onPress,
}: OeeRecordCardProps) {
  const { colors } = useTheme();
  const oeeColor =
    item.oee >= 0.85 ? colors.success : item.oee >= 0.7 ? colors.warning : colors.error;
  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={() => onPress?.(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.equipmentName, { color: colors.text }]} numberOfLines={1}>
          {item.equipment?.name ?? '-'}
        </Text>
        <Text style={[styles.oeeValue, { color: oeeColor }]}>{(item.oee * 100).toFixed(1)}%</Text>
      </View>
      <Text style={[styles.recordDate, { color: colors.textSecondary }]}>
        {formatDate(item.recordDate)}
        {item.workCenter ? ` · ${item.workCenter.name}` : ''}
      </Text>
      <View style={styles.ratioRow}>
        {[
          { label: '开动率', value: item.availability * 100 },
          { label: '性能率', value: item.performance * 100 },
          { label: '合格率', value: item.qualityRate * 100 },
        ].map((r) => (
          <View key={r.label} style={styles.ratioItem}>
            <Text style={[styles.ratioLabel, { color: colors.textMuted }]}>{r.label}</Text>
            <Text style={[styles.ratioValue, { color: colors.textSecondary }]}>
              {r.value.toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: { borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs, ...Shadow.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  equipmentName: { fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
  oeeValue: { fontSize: FontSize.lg, fontWeight: '700' },
  recordDate: { fontSize: FontSize.xs },
  ratioRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  ratioItem: { alignItems: 'center' },
  ratioLabel: { fontSize: FontSize.xs },
  ratioValue: { fontSize: FontSize.xs, fontWeight: '500' },
});
