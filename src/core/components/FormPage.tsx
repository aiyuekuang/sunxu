import type React from 'react';
import { useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontSize, Radius, Shadow, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText as Text } from './AppText';
import { LoadingView } from './LoadingView';
import { FormScreenContainer } from './ScreenContainer';

interface FormPageProps {
  /** Page title */
  title: string;
  /** Submit button label */
  submitText?: string;
  loading?: boolean;
  /** Omit to make the form read-only. */
  onSubmit?: () => void;
  /** Supply navigation behavior from the host app. */
  onBack?: () => void;
  initLoading?: boolean;
  errorCount?: number;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** Standard keyboard-aware form page. Navigation and submission stay host-owned. */
export function FormPage({
  title,
  submitText = '保存',
  loading = false,
  onSubmit,
  onBack,
  initLoading = false,
  errorCount = 0,
  footer,
  children,
}: FormPageProps) {
  const { colors } = useTheme();
  const lastPressRef = useRef(0);

  const handleSubmit = () => {
    const now = Date.now();
    if (loading || now - lastPressRef.current < 500) return;
    lastPressRef.current = now;
    onSubmit?.();
  };

  if (initLoading) return <LoadingView />;

  return (
    <FormScreenContainer
      title={title}
      onBack={onBack}
      footer={footer}
      contentContainerStyle={styles.content}
      headerRight={
        onSubmit ? (
          <View>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
              onPress={handleSubmit}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={loading ? '保存中' : submitText}
              accessibilityState={{ disabled: loading, busy: loading }}
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
    >
      {children}
    </FormScreenContainer>
  );
}

/** Card-like section for grouping related fields. */
export function FormSection({ title, children }: { title?: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      {title && <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>}
      {children}
    </View>
  );
}

/** Label and content wrapper for a single form field. */
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
  saveBtn: {
    minHeight: 44,
    justifyContent: 'center',
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
