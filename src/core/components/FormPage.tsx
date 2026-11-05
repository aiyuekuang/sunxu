import { useNavigation } from '@react-navigation/native';
import type React from 'react';
import { useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { FontSize, Radius, Shadow, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText as Text } from './AppText.tsx';
import { LoadingView } from './LoadingView.tsx';
import { PageHeader } from './PageHeader.tsx';

interface FormPageProps {
  /** 页面标题 */
  title: string;
  /** 提交按钮文字，默认"保存" */
  submitText?: string;
  /** 提交中 */
  loading?: boolean;
  /** 提交回调，不传则隐藏保存按钮（只读模式） */
  onSubmit?: () => void;
  /** 自定义返回 */
  onBack?: () => void;
  /** 初始加载中（编辑时加载详情） */
  initLoading?: boolean;
  /** 表单验证错误数量（>0 时在保存按钮旁显示红点） */
  errorCount?: number;
  children: React.ReactNode;
}

export function FormPage({
  title,
  submitText = '保存',
  loading = false,
  onSubmit,
  onBack,
  initLoading = false,
  errorCount = 0,
  children,
}: FormPageProps) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const goBack = onBack ?? (() => navigation.goBack());
  // 时间戳防抖：防止双击重复提交，且永远不会卡死
  const lastPressRef = useRef(0);

  const handleSubmit = () => {
    const now = Date.now();
    if (loading || now - lastPressRef.current < 500) return;
    lastPressRef.current = now;
    onSubmit?.();
  };

  if (initLoading) return <LoadingView />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader
        title={title}
        onBack={goBack}
        right={
          onSubmit ? (
            <View>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 },
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={[styles.saveBtnText, { color: colors.textOnPrimary }]}>
                  {loading ? '保存中...' : submitText}
                </Text>
              </TouchableOpacity>
              {errorCount > 0 && (
                <View style={[styles.errorBadge, { backgroundColor: colors.error }]}>
                  <Text style={[styles.errorBadgeText, { color: colors.textOnPrimary }]}>
                    {errorCount}
                  </Text>
                </View>
              )}
            </View>
          ) : undefined
        }
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        {children}
      </KeyboardAwareScrollView>
    </View>
  );
}

/** 表单分区容器 */
export function FormSection({ title, children }: { title?: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      {title && <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>}
      {children}
    </View>
  );
}

/** 表单字段 label + children 包装 */
export function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
        {required && <Text style={[styles.requiredMark, { color: colors.error }]}>* </Text>}
        {label}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  saveBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.md,
  },
  saveBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  errorBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  errorBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    lineHeight: 13,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: 32,
  },
  section: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  fieldWrap: { gap: 4 },
  fieldLabel: { fontSize: FontSize.xs, fontWeight: '500' },
  requiredMark: { fontSize: FontSize.xs, fontWeight: '700' },
});
