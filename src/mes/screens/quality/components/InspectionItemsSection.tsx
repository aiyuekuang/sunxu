import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { useScaledFontSize } from '../../../../core/theme/font-scale';
import { type ItemResult, hasNumericLimits, specLabel } from './inspection-utils.ts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InspectionItemsSectionProps {
  itemResults: ItemResult[];
  onItemValueChange: (index: number, value: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InspectionItemsSection({
  itemResults,
  onItemValueChange,
}: InspectionItemsSectionProps) {
  const { colors } = useTheme();
  const itemInputFontSize = useScaledFontSize(FontSize.sm);

  if (itemResults.length === 0) return null;

  const passCount = itemResults.filter((r) => r.pass === true).length;
  const failCount = itemResults.filter((r) => r.pass === false).length;
  const pendingCount = itemResults.filter((r) => r.pass === null).length;

  return (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>检验项明细</Text>
        <View style={styles.summaryBadges}>
          <View style={[styles.summaryBadge, { backgroundColor: colors.successSurface }]}>
            <Text style={[styles.summaryBadgeText, { color: colors.success }]}>
              合格 {passCount}
            </Text>
          </View>
          <View style={[styles.summaryBadge, { backgroundColor: colors.errorSurface }]}>
            <Text style={[styles.summaryBadgeText, { color: colors.error }]}>
              不合格 {failCount}
            </Text>
          </View>
          {pendingCount > 0 && (
            <View style={[styles.summaryBadge, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.summaryBadgeText, { color: colors.textSecondary }]}>
                待填 {pendingCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {itemResults.map((r, index) => (
        <View
          key={r.item.code ?? r.item.name}
          style={[styles.itemRow, { borderColor: colors.border }]}
        >
          <View style={styles.itemInfo}>
            <View style={styles.itemNameRow}>
              <Text style={[styles.itemName, { color: colors.text }]}>{r.item.name}</Text>
              {r.item.isRequired && (
                <Text style={[styles.requiredMark, { color: colors.error }]}>*</Text>
              )}
            </View>
            {specLabel(r.item) ? (
              <Text style={[styles.itemSpec, { color: colors.textSecondary }]}>
                规格: {specLabel(r.item)}
              </Text>
            ) : null}
          </View>
          <View style={styles.itemInputWrap}>
            <TextInput
              style={[
                styles.itemInput,
                {
                  color: colors.text,
                  fontSize: itemInputFontSize,
                  borderColor:
                    r.pass === null ? colors.border : r.pass ? colors.success : colors.error,
                },
              ]}
              keyboardType={hasNumericLimits(r.item) ? 'numeric' : 'default'}
              placeholder={`输入${r.item.unit ? `(${r.item.unit})` : '...'}`}
              placeholderTextColor={colors.textSecondary}
              numberOfLines={1}
              value={r.value}
              onChangeText={(v) => onItemValueChange(index, v)}
            />
            {r.pass !== null && (
              <Ionicons
                name={r.pass ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={r.pass ? colors.success : colors.error}
                style={styles.itemPassIcon}
              />
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: FontSize.base, fontWeight: '600' },
  summaryBadges: { flexDirection: 'row', gap: 6 },
  summaryBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: 100 },
  summaryBadgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemInfo: { flex: 1 },
  itemNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  itemName: { fontSize: FontSize.sm, fontWeight: '500' },
  requiredMark: { fontSize: FontSize.sm, fontWeight: '700' },
  itemSpec: { fontSize: FontSize.xs, marginTop: 2 },
  itemInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemInput: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    padding: 6,
    fontSize: FontSize.sm,
    width: 100,
    textAlign: 'right',
  },
  itemPassIcon: { marginLeft: 2 },
});
