import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import type { ReportCatalogItem } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { REPORT_CATEGORY_CONFIG } from '../../../constants/report-detail-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

interface ReportCatalogCardProps {
  item: ReportCatalogItem;
  onPress: () => void;
  onToggleFavorite?: () => void;
  mode?: 'open' | 'manage';
  favoritePending?: boolean;
}

function ReportCatalogCardInner({
  item,
  onPress,
  onToggleFavorite,
  mode = 'open',
  favoritePending = false,
}: ReportCatalogCardProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const category = REPORT_CATEGORY_CONFIG[item.category as keyof typeof REPORT_CATEGORY_CONFIG];
  const managing = mode === 'manage';
  const disabled = managing && (favoritePending || !onToggleFavorite);

  return (
    <Pressable
      testID={`report-tile-${item.reportCode}`}
      {...(Platform.OS === 'web' && managing
        ? {
            // RN Web 0.21 的 Pressable 仅为 button 角色处理空格键。
            onKeyDown: (event: React.KeyboardEvent) => {
              if (event.key !== ' ') return;
              event.preventDefault();
              if (!event.repeat && !disabled) onToggleFavorite?.();
            },
          }
        : {})}
      onPress={managing ? onToggleFavorite : onPress}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole={managing ? 'checkbox' : 'button'}
      accessibilityLabel={managing ? `${item.title}常用设置` : `打开${item.title}`}
      accessibilityHint={managing ? '勾选后显示在报表首页常用区' : item.description}
      aria-checked={managing ? item.isFavorite : undefined}
      aria-disabled={disabled}
      aria-busy={managing ? favoritePending : undefined}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: colors.surface,
          borderColor: focused ? colors.primary : 'transparent',
          opacity: disabled ? 0.5 : pressed ? 0.72 : 1,
        },
      ]}
    >
      {managing && (
        <View style={styles.selection} pointerEvents="none" accessible={false}>
          <Ionicons
            name={item.isFavorite ? 'checkmark-circle' : 'ellipse-outline'}
            size={Spacing.lg}
            color={item.isFavorite ? colors.primary : colors.textSecondary}
          />
        </View>
      )}
      <View style={[styles.iconWrap, { backgroundColor: colors.primarySurface }]}>
        <Ionicons
          name={category?.icon ?? 'document-text-outline'}
          size={Spacing.xl}
          color={colors.primary}
        />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
    </Pressable>
  );
}

export const ReportCatalogCard = React.memo(ReportCatalogCardInner);

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Spacing['4xl'] * 2,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  iconWrap: {
    width: Spacing['3xl'],
    height: Spacing['3xl'],
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: FontSize.sm, fontWeight: '500', textAlign: 'center', alignSelf: 'stretch' },
  selection: { position: 'absolute', top: Spacing.xs, right: Spacing.xs },
});
