import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { ScanParseResult } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import type { ScanEntityRoute } from '../scan-result-config';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EntityResultCardProps {
  result: ScanParseResult;
  route: ScanEntityRoute;
  onNavigate: () => void;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const EntityResultCard = React.memo(function EntityResultCard({
  result,
  route,
  onNavigate,
  onClose,
}: EntityResultCardProps) {
  const { colors } = useTheme();
  const entity = result.entity;
  if (!entity) return null;

  const infoItems = entity.infoItems.filter((item) => item.value);

  return (
    <BottomSheet visible onClose={onClose} title={route.title} dynamicHeight>
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.surfaceSecondary }]}>
          <View style={styles.cardHeader}>
            <Ionicons name={route.icon} size={20} color={colors.primary} />
            <Text style={[styles.entityLabel, { color: colors.primary }]}>{route.entityLabel}</Text>
          </View>
          <Text style={[styles.entityTitle, { color: colors.text }]}>{entity.title}</Text>
          {entity.subtitle ? (
            <Text style={[styles.entitySubtitle, { color: colors.textSecondary }]}>
              {entity.subtitle}
            </Text>
          ) : null}
          {entity.statusLabel ? (
            <Text style={[styles.entityStatus, { color: colors.primary }]}>
              {entity.statusLabel}
            </Text>
          ) : null}
          {infoItems.map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{item.label}</Text>
              <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: colors.border }]}
            onPress={onClose}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>继续扫码</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={onNavigate}
          >
            <Ionicons name="arrow-forward" size={16} color={colors.textOnPrimary} />
            <Text style={[styles.primaryBtnText, { color: colors.textOnPrimary }]}>
              {route.detailButtonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: { padding: Spacing.md, gap: Spacing.sm },
  card: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  entityLabel: { fontSize: FontSize.sm, fontWeight: '600' },
  entityTitle: { fontSize: FontSize.base, fontWeight: '700', marginTop: Spacing.xs },
  entitySubtitle: { fontSize: FontSize.sm },
  entityStatus: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.xs },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  infoLabel: { fontSize: FontSize.sm, width: 70 },
  infoValue: { fontSize: FontSize.sm, fontWeight: '500', flex: 1, textAlign: 'right' },
  actions: { flexDirection: 'row', gap: Spacing.xs },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  secondaryBtnText: { fontSize: FontSize.sm, fontWeight: '600' },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  primaryBtnText: { fontSize: FontSize.sm, fontWeight: '600' },
});
