import { StyleSheet, View } from 'react-native';
import type { IndustryPack, IndustryPackPreview } from '../../../../host/services';
import { InlineLoading } from '../../../../../core/components/LoadingView.tsx';
import { AppText as Text } from '../../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../../core/components/BottomSheet.tsx';
import { EmptyState } from '../../../../../core/components/EmptyState.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../../core/theme/tokens';
import { useTheme } from '../../../../../core/theme/useTheme';

interface IndustryPackPreviewSheetProps {
  visible: boolean;
  pack?: IndustryPack | null;
  preview?: IndustryPackPreview | null;
  loading: boolean;
  onClose: () => void;
}

export function IndustryPackPreviewSheet({
  visible,
  pack,
  preview,
  loading,
  onClose,
}: IndustryPackPreviewSheetProps) {
  const { colors } = useTheme();

  const subtitle = preview
    ? `共 ${preview.dictCount} 类字典，${preview.itemCount} 条预置项`
    : (pack?.description ?? '查看行业包内预置字典与条目字段值');

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={pack ? `${pack.packName}预览` : '行业包预览'}
      subtitle={subtitle}
      maxHeightRatio={0.86}
    >
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <InlineLoading color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              正在加载行业包预览
            </Text>
          </View>
        ) : !preview ? (
          <EmptyState compact icon="document-text-outline" title="暂无可预览内容" />
        ) : (
          <>
            <View style={[styles.summaryCard, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>{preview.packName}</Text>
              <Text style={[styles.summaryCode, { color: colors.textSecondary }]}>
                {preview.packCode}
              </Text>
              <Text style={[styles.summaryDesc, { color: colors.textSecondary }]}>
                {preview.description}
              </Text>
              <View style={styles.summaryMetaRow}>
                <View style={[styles.metaPill, { backgroundColor: `${colors.primary}12` }]}>
                  <Text style={[styles.metaPillText, { color: colors.primary }]}>
                    字典类型 {preview.dictCount}
                  </Text>
                </View>
                <View style={[styles.metaPill, { backgroundColor: `${colors.success}12` }]}>
                  <Text style={[styles.metaPillText, { color: colors.success }]}>
                    预置条目 {preview.itemCount}
                  </Text>
                </View>
              </View>
            </View>

            {preview.dicts.map((dict) => (
              <View
                key={dict.typeCode}
                style={[styles.dictCard, { backgroundColor: colors.surface }]}
              >
                <View style={styles.dictHeader}>
                  <View style={styles.dictHeaderMain}>
                    <Text style={[styles.dictTitle, { color: colors.text }]}>{dict.typeName}</Text>
                    <Text style={[styles.dictCode, { color: colors.textSecondary }]}>
                      {dict.typeCode}
                    </Text>
                    {dict.remark ? (
                      <Text style={[styles.dictRemark, { color: colors.textSecondary }]}>
                        {dict.remark}
                      </Text>
                    ) : null}
                  </View>
                  <View style={[styles.countPill, { backgroundColor: `${colors.primary}10` }]}>
                    <Text style={[styles.countPillText, { color: colors.primary }]}>
                      {dict.itemCount} 项
                    </Text>
                  </View>
                </View>

                <View style={styles.itemsWrap}>
                  {dict.items.map((item) => (
                    <View
                      key={`${dict.typeCode}-${item.itemValue}`}
                      style={[styles.itemCard, { borderColor: colors.border }]}
                    >
                      <View style={styles.itemHeader}>
                        <Text style={[styles.itemLabel, { color: colors.text }]}>
                          {item.itemLabel}
                        </Text>
                        <View
                          style={[styles.sortPill, { backgroundColor: colors.surfaceSecondary }]}
                        >
                          <Text style={[styles.sortPillText, { color: colors.textSecondary }]}>
                            排序 {item.sort}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.itemField, { color: colors.textSecondary }]}>
                        条目值：{item.itemValue}
                      </Text>
                      {item.parentValue ? (
                        <Text style={[styles.itemField, { color: colors.textSecondary }]}>
                          父级值：{item.parentValue}
                        </Text>
                      ) : null}
                      {item.color ? (
                        <Text style={[styles.itemField, { color: colors.textSecondary }]}>
                          标签颜色：{item.color}
                        </Text>
                      ) : null}
                      {item.bg ? (
                        <Text style={[styles.itemField, { color: colors.textSecondary }]}>
                          背景色：{item.bg}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
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
    gap: Spacing.md,
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
  summaryCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  summaryTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  summaryCode: {
    fontSize: FontSize.sm,
  },
  summaryDesc: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  metaPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  metaPillText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  dictCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  dictHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  dictHeaderMain: {
    flex: 1,
    gap: 2,
  },
  dictTitle: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  dictCode: {
    fontSize: FontSize.sm,
  },
  dictRemark: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  countPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  countPillText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  itemsWrap: {
    gap: Spacing.sm,
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  itemLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  sortPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
  },
  sortPillText: {
    fontSize: FontSize.sm,
  },
  itemField: {
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
});
