import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { IndustryPack } from '../../../../host/services';
import { InlineLoading } from '../../../../../core/components/LoadingView.tsx';
import { AppText as Text } from '../../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../../core/components/BottomSheet.tsx';
import { EmptyState } from '../../../../../core/components/EmptyState.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../../core/theme/tokens';
import { useTheme } from '../../../../../core/theme/useTheme';

interface IndustryPackSheetProps {
  visible: boolean;
  packs: IndustryPack[];
  loading: boolean;
  applyingPackCode?: string | null;
  onClose: () => void;
  onPreview: (pack: IndustryPack) => void;
  onApply: (pack: IndustryPack) => void;
}

export function IndustryPackSheet({
  visible,
  packs,
  loading,
  applyingPackCode,
  onClose,
  onPreview,
  onApply,
}: IndustryPackSheetProps) {
  const { colors } = useTheme();

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="行业包"
      subtitle="选择预置行业包，一次性导入推荐字典项"
      maxHeightRatio={0.72}
    >
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <InlineLoading color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              正在加载行业包
            </Text>
          </View>
        ) : packs.length === 0 ? (
          <EmptyState compact icon="cube-outline" title="暂无可用行业包" />
        ) : (
          packs.map((pack) => {
            const applying = applyingPackCode === pack.packCode;
            return (
              <View
                key={pack.packCode}
                style={[styles.card, { backgroundColor: colors.surfaceSecondary }]}
              >
                <View style={styles.cardMain}>
                  <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}12` }]}>
                    <Ionicons name="cube-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.name, { color: colors.text }]}>{pack.packName}</Text>
                    <Text style={[styles.code, { color: colors.textSecondary }]}>
                      {pack.packCode}
                    </Text>
                    <Text style={[styles.desc, { color: colors.textSecondary }]}>
                      {pack.description}
                    </Text>
                  </View>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.secondaryBtn, { borderColor: colors.border }]}
                    onPress={() => onPreview(pack)}
                    activeOpacity={0.75}
                    disabled={applying}
                  >
                    <Ionicons name="eye-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>
                      预览
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                    onPress={() => onApply(pack)}
                    activeOpacity={0.75}
                    disabled={applying}
                  >
                    {applying ? (
                      <InlineLoading color={colors.textOnPrimary} />
                    ) : (
                      <>
                        <Ionicons name="download-outline" size={16} color={colors.textOnPrimary} />
                        <Text style={[styles.primaryBtnText, { color: colors.textOnPrimary }]}>
                          应用
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  loadingWrap: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSize.sm,
  },
  card: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  code: {
    fontSize: FontSize.sm,
  },
  desc: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  primaryBtn: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
