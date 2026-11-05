import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import type { WarehouseCandidateOption } from '../../warehouse/components/WarehouseCandidateField.tsx';
import { type CompleteIssueItemDraft, CompleteIssueItemForm } from './CompleteIssueItemForm.tsx';

interface CompleteIssueSheetProps {
  visible: boolean;
  issueNo: string;
  items: CompleteIssueItemDraft[];
  loading: boolean;
  submitting: boolean;
  itemErrors: Record<string, string | undefined>;
  getCandidates: (item: CompleteIssueItemDraft) => WarehouseCandidateOption[];
  isStockLoading: (item: CompleteIssueItemDraft) => boolean;
  getStockError: (item: CompleteIssueItemDraft) => string | undefined;
  getUnitFactors: (item: CompleteIssueItemDraft) => Record<string, number> | undefined;
  isUnitFactorLoading: (item: CompleteIssueItemDraft) => boolean;
  getUnitFactorError: (item: CompleteIssueItemDraft) => string | undefined;
  onChangeItem: (index: number, patch: Partial<CompleteIssueItemDraft>) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function CompleteIssueSheet({
  visible,
  issueNo,
  items,
  loading,
  submitting,
  itemErrors,
  getCandidates,
  isStockLoading,
  getStockError,
  getUnitFactors,
  isUnitFactorLoading,
  getUnitFactorError,
  onChangeItem,
  onClose,
  onSubmit,
}: CompleteIssueSheetProps) {
  const { colors } = useTheme();
  const hasItemErrors = Object.values(itemErrors).some(Boolean);
  const blockingReasons = Object.entries(itemErrors).flatMap(([itemId, error]) => {
    if (!error) return [];
    const item = items.find((candidate) => candidate.id === itemId);
    const itemLabel = item ? `${item.materialCode} · ${item.materialName}` : `明细 ${itemId}`;
    return [{ key: itemId, text: `${itemLabel}：${error}` }];
  });
  const visibleBlockingReasons = blockingReasons.slice(0, 4);
  const remainingBlockingCount = blockingReasons.length - visibleBlockingReasons.length;
  const blockingNotice = loading
    ? {
        title: '正在检查库存',
        detail: '请稍候，库存检查完成后才能确认发料。',
        reasons: [],
      }
    : items.length === 0
      ? {
          title: '暂无可发料明细',
          detail: '请返回检查生产领料单明细后再确认发料。',
          reasons: [],
        }
      : hasItemErrors
        ? {
            title: `当前无法确认发料（${blockingReasons.length} 项）`,
            detail: '请先处理以下问题：',
            reasons: visibleBlockingReasons,
          }
        : null;
  const disabledHint = loading
    ? '库存正在检查，请稍候'
    : items.length === 0
      ? '暂无可发料明细'
      : hasItemErrors
        ? '请先处理上方提示的问题'
        : undefined;
  const blockingNoticeColor = loading ? colors.warning : colors.error;
  const blockingNoticeBackground = loading ? colors.warningSurface : colors.errorSurface;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="确认发料"
      subtitle="填写本次实际出库信息；提交时系统仍按当前库存、批号和仓位实时校验。"
      confirmText="确认发料"
      onConfirm={onSubmit}
      loading={submitting}
      disabled={loading || submitting || items.length === 0 || hasItemErrors}
      confirmDisabledHint={disabledHint}
      avoidKeyboard
      maxHeightRatio={0.92}
    >
      <View style={styles.content}>
        <Text style={[styles.summary, { color: colors.textSecondary }]}>
          生产领料单 {issueNo}，共 {items.length} 行。确认后将生成生产领料单出库流水并更新单据状态。
        </Text>
        {blockingNotice ? (
          <View
            accessible
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={[
              styles.blockingNotice,
              { backgroundColor: blockingNoticeBackground, borderColor: blockingNoticeColor },
            ]}
          >
            <View style={styles.blockingHeader}>
              <Ionicons
                name={loading ? 'time-outline' : 'alert-circle-outline'}
                size={18}
                color={blockingNoticeColor}
              />
              <Text style={[styles.blockingTitle, { color: blockingNoticeColor }]}>
                {blockingNotice.title}
              </Text>
            </View>
            <Text style={[styles.blockingDetail, { color: colors.text }]}>
              {blockingNotice.detail}
            </Text>
            {blockingNotice.reasons.map((reason) => (
              <Text
                key={reason.key}
                style={[styles.blockingReason, { color: colors.textSecondary }]}
              >
                • {reason.text}
              </Text>
            ))}
            {blockingNotice.reasons.length > 0 && remainingBlockingCount > 0 ? (
              <Text style={[styles.blockingMore, { color: colors.textMuted }]}>
                还有 {remainingBlockingCount} 项，请查看下方明细。
              </Text>
            ) : null}
          </View>
        ) : null}
        {items.map((item, index) => (
          <CompleteIssueItemForm
            key={item.id}
            item={item}
            index={index}
            candidates={getCandidates(item)}
            loadingStock={isStockLoading(item)}
            stockError={getStockError(item)}
            unitFactors={getUnitFactors(item)}
            loadingUnitFactors={isUnitFactorLoading(item)}
            unitFactorError={getUnitFactorError(item)}
            error={itemErrors[item.id]}
            onChange={onChangeItem}
          />
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.md },
  summary: { fontSize: FontSize.sm, lineHeight: 20 },
  blockingNotice: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  blockingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  blockingTitle: { fontSize: FontSize.sm, fontWeight: '700', flex: 1 },
  blockingDetail: { fontSize: FontSize.sm, lineHeight: 20 },
  blockingReason: { fontSize: FontSize.xs, lineHeight: 18 },
  blockingMore: { fontSize: FontSize.xs, lineHeight: 18 },
});
