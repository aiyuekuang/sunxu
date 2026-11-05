import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { ProductionReceiptReportSummary } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatNumber } from '../../../../core/utils/format';

interface ReportReceiptSummarySheetProps {
  /** 报工返回的入库摘要；为 null 时不显示 */
  summary: ProductionReceiptReportSummary | null;
  onClose: () => void;
}

/**
 * 报工成功后的"待确认生产入库单"摘要弹窗（仅 pending_confirmation 模式）。
 * 展示本次生成的待确认入库单、暂存未处理数量、暂存位置和后端 warnings。
 */
export function ReportReceiptSummarySheet({ summary, onClose }: ReportReceiptSummarySheetProps) {
  const { colors } = useTheme();

  const generatedLine = summary
    ? summary.generatedReceiptCount > 0
      ? `本次已生成待确认生产入库单 ${
          summary.generatedPackageCount > 0 ? `${summary.generatedPackageCount} 箱 / ` : ''
        }${formatNumber(summary.generatedReceiptQty)} 件${
          summary.generatedReceiptNo ? `（生产入库单编号 ${summary.generatedReceiptNo}）` : ''
        }`
      : summary.packageSpecMissing
        ? '本次未生成生产入库单：物料缺少包装规格，已生成维护待办'
        : '本次未生成新的待确认生产入库单'
    : '';

  return (
    <BottomSheet
      visible={!!summary}
      onClose={onClose}
      title="报工成功 · 待确认生产入库单"
      dynamicHeight
      renderFooter={() => (
        <TouchableOpacity
          style={[styles.okBtn, { backgroundColor: colors.primary }]}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={[styles.okBtnText, { color: colors.textOnPrimary }]}>知道了</Text>
        </TouchableOpacity>
      )}
    >
      {summary ? (
        <>
          <View style={[styles.mainCard, { backgroundColor: colors.primarySurface }]}>
            <Ionicons name="cube-outline" size={18} color={colors.primary} />
            <Text style={[styles.mainText, { color: colors.primary }]}>{generatedLine}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>暂存未处理</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {formatNumber(summary.outputBufferOpenQty)} 件
              {summary.packageRemainderQty ? '（未达到完整包装）' : ''}
            </Text>
          </View>
          {summary.outputBufferLocation ? (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>暂存位置</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {summary.outputBufferLocation}
              </Text>
            </View>
          ) : null}

          {Array.from(new Set(summary.warnings)).map((warning) => (
            <View key={warning} style={[styles.notice, { backgroundColor: colors.warningSurface }]}>
              <Ionicons name="warning-outline" size={14} color={colors.warning} />
              <Text style={[styles.noticeText, { color: colors.warning }]}>{warning}</Text>
            </View>
          ))}
          {Array.from(new Set(summary.blockers)).map((blocker) => (
            <View key={blocker} style={[styles.notice, { backgroundColor: colors.errorSurface }]}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
              <Text style={[styles.noticeText, { color: colors.error }]}>{blocker}</Text>
            </View>
          ))}
        </>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.sm,
  },
  mainText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '600',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoLabel: {
    fontSize: FontSize.sm,
  },
  infoValue: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '600',
    textAlign: 'right',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
  },
  noticeText: {
    flex: 1,
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  okBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okBtnText: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
});
