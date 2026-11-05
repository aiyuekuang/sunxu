import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../core/components/BottomSheet.tsx';
import { FontSize, HIT_SLOP, MIN_TOUCH_TARGET, Radius, Spacing } from '../../../core/theme/tokens';
import { useTheme } from '../../../core/theme/useTheme';

export interface PolicyDisclosureProps {
  items: string[];
  warnings?: string[];
  title?: string;
  subtitle?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function PolicyDisclosure({
  items,
  warnings = [],
  title = '口径说明',
  subtitle = '用于解释当前数据的范围和计算方式',
  accessibilityLabel = '查看口径说明',
  accessibilityHint = '打开当前数据的范围和计算方式说明',
}: PolicyDisclosureProps) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const uniqueItems = [...new Set(items.filter(Boolean))];
  const visibleWarnings = [...new Set(warnings.filter(Boolean))];

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          { backgroundColor: colors.surfaceSecondary },
          pressed && styles.pressed,
        ]}
        onPress={() => setVisible(true)}
        hitSlop={HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
      </Pressable>

      <BottomSheet
        visible={visible}
        onClose={() => setVisible(false)}
        title={title}
        subtitle={subtitle}
        dynamicHeight
        maxHeightRatio={0.72}
      >
        <View style={styles.content}>
          {visibleWarnings.length > 0 ? (
            <View
              style={[
                styles.warningBox,
                { backgroundColor: colors.warningSurface, borderColor: `${colors.warning}40` },
              ]}
            >
              <View style={styles.warningTitleRow}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.warning} />
                <Text style={[styles.warningTitle, { color: colors.warning }]}>当前范围提醒</Text>
              </View>
              {visibleWarnings.map((warning) => (
                <Text key={warning} style={[styles.warningText, { color: colors.textSecondary }]}>
                  {warning}
                </Text>
              ))}
            </View>
          ) : null}

          <View style={styles.list}>
            {uniqueItems.map((item) => (
              <View key={item} style={styles.itemRow}>
                <View style={[styles.itemDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.itemText, { color: colors.text }]}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { gap: Spacing.md },
  warningBox: {
    gap: Spacing.xs,
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  warningTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  warningTitle: { fontSize: FontSize.sm, fontWeight: '600' },
  warningText: { fontSize: FontSize.sm, lineHeight: 20 },
  list: { gap: Spacing.md },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  itemDot: {
    width: Spacing.xs,
    height: Spacing.xs,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
  itemText: { flex: 1, fontSize: FontSize.sm, lineHeight: 21 },
  pressed: { opacity: 0.72 },
});
