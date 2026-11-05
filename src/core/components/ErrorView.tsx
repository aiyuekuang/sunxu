import { StyleSheet, View } from 'react-native';
import { EmptyState } from './EmptyState.tsx';
import { PageHeader } from './PageHeader.tsx';
import { useTheme } from '../theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ErrorViewProps {
  /** 页面标题 */
  title?: string;
  /** 返回回调 */
  onBack?: () => void;
  /** 重试回调 */
  onRetry?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * 详情页加载失败的全屏错误视图 — 显示 PageHeader + 错误提示 + 重试按钮。
 *
 * 替代详情页中 `if (!data) return null` 导致的白屏问题。
 */
export function ErrorView({ title = '详情', onBack, onRetry }: ErrorViewProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader title={title} onBack={onBack} />
      <EmptyState
        icon="alert-circle-outline"
        title="加载失败"
        description="请检查网络后重试"
        action={onRetry ? { label: '重试', onPress: onRetry } : undefined}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
});
