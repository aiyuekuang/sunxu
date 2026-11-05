import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { BusinessBatchItemStatus } from '../../types/models/BusinessBatchItemStatus';
import type { BusinessBatchPreviewResponseDto } from '../../types/models/BusinessBatchPreviewResponseDto';
import type { BusinessBatchResponseDto } from '../../types/models/BusinessBatchResponseDto';
import { BusinessBatchStatus } from '../../types/models/BusinessBatchStatus';
import { FontSize, Radius, Spacing } from '../../../core/theme/tokens';
import { useTheme } from '../../../core/theme/useTheme';
import { formatDateTime } from '../../../core/utils/date';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../core/components/BottomSheet.tsx';

interface BusinessBatchResultSheetProps {
  visible: boolean;
  title: string;
  preview?: BusinessBatchPreviewResponseDto | null;
  result?: BusinessBatchResponseDto | null;
  loading?: boolean;
  onClose: () => void;
  onExecute?: () => void;
  onRetryFailed?: () => void;
  previewConfirmText?: string;
}

function CountCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <View style={styles.countItem}>
      <Text style={[styles.countValue, { color: tone }]}>{value}</Text>
      <Text style={styles.countLabel}>{label}</Text>
    </View>
  );
}

/**
 * 移动端统一批量预检/结果展示。它只展示服务端契约，不在端侧推断状态资格。
 */
export function BusinessBatchResultSheet({
  visible,
  title,
  preview,
  result,
  loading = false,
  onClose,
  onExecute,
  onRetryFailed,
  previewConfirmText = '确认',
}: BusinessBatchResultSheetProps) {
  const { colors } = useTheme();
  const blocked = preview?.blocked ?? 0;
  const previewItems = preview?.items ?? [];
  const resultItems = result?.results ?? [];
  const failedItems = useMemo(
    () => resultItems.filter((item) => item.status === BusinessBatchItemStatus.FAILED),
    [resultItems],
  );
  const confirmText = result
    ? result.status === BusinessBatchStatus.PROCESSING
      ? '查询执行结果'
      : failedItems.length > 0
        ? '重新预检失败项'
        : undefined
    : preview
      ? previewConfirmText
      : undefined;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={result ? `${title}结果` : `${title}预检`}
      subtitle={
        result?.batchId
          ? `批次 ${result.batchId}`
          : preview?.expiresAt
            ? `本次校验将在 ${formatDateTime(preview.expiresAt)} 失效`
            : undefined
      }
      confirmText={confirmText}
      onConfirm={result ? onRetryFailed : onExecute}
      disabled={!result && (!preview || blocked > 0 || preview.eligible === 0)}
      confirmDisabledHint={
        !result
          ? !preview
            ? '正在服务端预检，请稍候'
            : blocked > 0
              ? '请先取消勾选阻断项，再重新预检'
              : '暂无可执行项'
          : undefined
      }
      loading={loading}
      maxHeightRatio={0.86}
    >
      {!preview && !result ? (
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>正在服务端预检...</Text>
      ) : null}

      {preview ? (
        <>
          <View style={[styles.countCard, { backgroundColor: colors.surfaceSecondary }]}>
            <CountCard label="选中" value={preview.total} tone={colors.text} />
            <CountCard label="可执行" value={preview.eligible} tone={colors.success} />
            <CountCard label="阻断" value={preview.blocked} tone={colors.error} />
          </View>
          {blocked > 0 ? (
            <Text style={[styles.hint, { color: colors.error }]}>
              请先取消勾选阻断项，再重新预检。
            </Text>
          ) : null}
          {previewItems.map((item) => {
            const reasons = [...item.blockingReasons, ...item.warnings];
            return (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  { backgroundColor: item.eligible ? colors.successSurface : colors.errorSurface },
                ]}
              >
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {item.documentNo ?? item.id}
                </Text>
                <Text style={[styles.itemStatus, { color: colors.textSecondary }]}>
                  {item.eligible ? '可执行' : '已阻断'}
                </Text>
                {reasons.map((message) => (
                  <Text
                    key={`${item.id}:${message}`}
                    style={[
                      styles.itemMessage,
                      { color: item.eligible ? colors.warning : colors.error },
                    ]}
                  >
                    • {message}
                  </Text>
                ))}
              </View>
            );
          })}
        </>
      ) : null}

      {result ? (
        <>
          <View style={[styles.countCard, { backgroundColor: colors.surfaceSecondary }]}>
            <CountCard label="成功" value={result.succeeded} tone={colors.success} />
            <CountCard label="失败" value={result.failed} tone={colors.error} />
            <CountCard label="跳过" value={result.skipped} tone={colors.warning} />
          </View>
          {result.warnings.map((warning) => (
            <Text key={warning} style={[styles.hint, { color: colors.warning }]}>
              • {warning}
            </Text>
          ))}
          {result.status === BusinessBatchStatus.PROCESSING ? (
            <Text style={[styles.hint, { color: colors.warning }]}>
              服务端仍在处理。请使用同一请求键查询，不能创建新批次重复执行。
            </Text>
          ) : null}
          {resultItems.map((item) => {
            const tone = item.success
              ? colors.success
              : item.status === BusinessBatchItemStatus.SKIPPED
                ? colors.warning
                : colors.error;
            return (
              <View
                key={item.id}
                style={[styles.itemCard, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {item.documentNo ?? item.id}
                </Text>
                <Text style={[styles.itemStatus, { color: tone }]}>
                  {item.success
                    ? '成功'
                    : item.status === BusinessBatchItemStatus.SKIPPED
                      ? '跳过'
                      : '失败'}
                </Text>
                <Text style={[styles.itemMessage, { color: colors.textSecondary }]}>
                  {item.message}
                </Text>
              </View>
            );
          })}
        </>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  loadingText: { fontSize: FontSize.sm, paddingVertical: Spacing.md },
  countCard: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  countItem: { flex: 1, alignItems: 'center', gap: 2 },
  countValue: { fontSize: FontSize.xl, fontWeight: '700' },
  countLabel: { fontSize: FontSize.xs },
  hint: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.xs },
  itemCard: { borderRadius: Radius.sm, padding: Spacing.md, gap: 3, marginBottom: Spacing.sm },
  itemTitle: { fontSize: FontSize.base, fontWeight: '600' },
  itemStatus: { fontSize: FontSize.xs },
  itemMessage: { fontSize: FontSize.sm, lineHeight: 19 },
});
