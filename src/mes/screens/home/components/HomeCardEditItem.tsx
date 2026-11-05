import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

export interface HomeCardEditItemProps {
  label: string;
  description: string;
  visible: boolean;
  isFirst: boolean;
  isLast: boolean;
  sortable?: boolean;
  hidable?: boolean;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function HomeCardEditItem({
  label,
  description,
  visible,
  isFirst,
  isLast,
  sortable = true,
  hidable = true,
  onToggle,
  onMoveUp,
  onMoveDown,
}: HomeCardEditItemProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
    >
      <View style={styles.left}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.desc, { color: colors.textMuted }]}>{description}</Text>
      </View>

      <View style={styles.controls}>
        {sortable ? (
          <>
            <TouchableOpacity
              style={[
                styles.orderBtn,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: isFirst ? colors.borderLight : `${colors.primary}24`,
                },
              ]}
              onPress={onMoveUp}
              disabled={isFirst}
              activeOpacity={0.65}
            >
              <Ionicons
                name="arrow-up"
                size={14}
                color={isFirst ? colors.textMuted : colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.orderBtn,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: isLast ? colors.borderLight : `${colors.primary}24`,
                },
              ]}
              onPress={onMoveDown}
              disabled={isLast}
              activeOpacity={0.65}
            >
              <Ionicons
                name="arrow-down"
                size={14}
                color={isLast ? colors.textMuted : colors.primary}
              />
            </TouchableOpacity>
          </>
        ) : null}
        {hidable ? (
          <Switch
            value={visible}
            onValueChange={onToggle}
            trackColor={{ false: colors.borderLight, true: colors.primary }}
            thumbColor={colors.textOnPrimary}
            style={styles.switch}
          />
        ) : (
          <View
            style={[
              styles.fixedBadge,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.borderLight,
              },
            ]}
          >
            <Ionicons name="lock-closed-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.fixedBadgeText, { color: colors.textMuted }]}>固定</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  left: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  desc: {
    fontSize: FontSize.xs,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  orderBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switch: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },
  fixedBadge: {
    minHeight: 28,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  fixedBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
});
