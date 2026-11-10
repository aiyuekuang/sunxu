import type React from 'react';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { BorderWidth, ContentWidth, FontSize, FontWeight, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText as Text } from './AppText';
import { ActionButton } from './ActionButton';
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
            <ActionButton
              variant="primary"
              size="sm"
              style={styles.saveBtn}
              onPress={handleSubmit}
              disabled={loading}
              loading={loading}
              accessibilityLabel={loading ? '保存中' : submitText}
              textColor={colors.textOnPrimary}
            >
              {submitText}
            </ActionButton>
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

export interface FormSectionProps {
  /** Visible section name that helps users find the fields they need. */
  title?: string;
  children: React.ReactNode;
  testID?: string;
}

/** Themed, space-efficient group for related form fields and actions. */
export function FormSection({ title, children, testID }: FormSectionProps) {
  const { colors } = useTheme();
  return (
    <View
      testID={testID}
      style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      {title ? <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text> : null}
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
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
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
    alignSelf: 'center',
    width: '100%',
    maxWidth: ContentWidth.form,
    padding: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: 32,
  },
  section: {
    borderWidth: BorderWidth.hairline,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    lineHeight: 22,
    fontWeight: FontWeight.semibold,
  },
  fieldWrap: { gap: 4 },
  fieldLabel: { fontSize: FontSize.xs, fontWeight: '500' },
  requiredMark: { fontSize: FontSize.xs, fontWeight: '700' },
});
