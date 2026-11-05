import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { FontSize, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText as Text } from './AppText.tsx';
import { BottomSheet } from './BottomSheet.tsx';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FieldHelpContent {
  /** 弹层标题，默认使用字段标签 */
  title?: string;
  /** 字段作用 */
  purpose: string;
  /** 填写方式 */
  usage?: string[];
  /** 适用场景 */
  scenarios?: string[];
  /** 示例 */
  example?: string;
  /** 注意事项 */
  note?: string;
}

export interface FormLabelProps {
  /** 字段标签 */
  label: string;
  /** 是否必填 */
  required?: boolean;
  /** 字段帮助说明 */
  help?: FieldHelpContent;
  /** 仅展示帮助图标，用于页面标题或非字段说明。 */
  iconOnly?: boolean;
  /** 帮助按钮的无障碍名称。 */
  accessibilityLabel?: string;
  /** 字段旁的单步快捷操作；只表达界面动作，不承载业务默认规则。 */
  trailingAction?: {
    label: string;
    accessibilityLabel?: string;
    onPress: () => void;
    disabled?: boolean;
  };
  /** 布局自定义 */
  style?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FormLabel({
  label,
  required,
  help,
  iconOnly = false,
  accessibilityLabel,
  trailingAction,
  style,
}: FormLabelProps) {
  const { colors } = useTheme();
  const [helpVisible, setHelpVisible] = useState(false);

  return (
    <>
      <View style={[styles.row, style]}>
        {!iconOnly ? (
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {label}
            {required && <Text style={{ color: colors.error, fontSize: FontSize.sm }}> *</Text>}
          </Text>
        ) : null}
        {trailingAction ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={trailingAction.onPress}
            disabled={trailingAction.disabled}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={trailingAction.accessibilityLabel ?? trailingAction.label}
            accessibilityState={{ disabled: Boolean(trailingAction.disabled) }}
          >
            <Text
              style={[
                styles.actionText,
                { color: trailingAction.disabled ? colors.textTertiary : colors.primary },
              ]}
            >
              {trailingAction.label}
            </Text>
          </TouchableOpacity>
        ) : null}
        {help ? (
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => setHelpVisible(true)}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? `查看${help.title ?? label}说明`}
          >
            <Ionicons name="help-circle-outline" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {help && helpVisible ? (
        <BottomSheet
          visible={helpVisible}
          onClose={() => setHelpVisible(false)}
          title={help.title ?? label}
          dynamicHeight
          maxHeightRatio={0.72}
        >
          <View style={styles.sheetContent}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>作用</Text>
              <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
                {help.purpose}
              </Text>
            </View>

            {help.usage?.length ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>怎么用</Text>
                <View style={styles.list}>
                  {help.usage.map((item) => (
                    <Text key={item} style={[styles.listItem, { color: colors.textSecondary }]}>
                      {`- ${item}`}
                    </Text>
                  ))}
                </View>
              </View>
            ) : null}

            {help.scenarios?.length ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>适用场景</Text>
                <View style={styles.list}>
                  {help.scenarios.map((item) => (
                    <Text key={item} style={[styles.listItem, { color: colors.textSecondary }]}>
                      {`- ${item}`}
                    </Text>
                  ))}
                </View>
              </View>
            ) : null}

            {help.example ? (
              <View
                style={[
                  styles.callout,
                  { backgroundColor: colors.surfaceSecondary, borderColor: colors.borderLight },
                ]}
              >
                <Text style={[styles.calloutTitle, { color: colors.text }]}>示例</Text>
                <Text style={[styles.calloutBody, { color: colors.textSecondary }]}>
                  {help.example}
                </Text>
              </View>
            ) : null}

            {help.note ? (
              <View
                style={[
                  styles.callout,
                  { backgroundColor: colors.primarySurface, borderColor: `${colors.primary}26` },
                ]}
              >
                <Text style={[styles.calloutTitle, { color: colors.primary }]}>注意事项</Text>
                <Text style={[styles.calloutBody, { color: colors.textSecondary }]}>
                  {help.note}
                </Text>
              </View>
            ) : null}
          </View>
        </BottomSheet>
      ) : null}
    </>
  );
}

/** Icon-only help for a page or section explanation that has no field label. */
export function ContextualHelpButton({
  help,
  accessibilityLabel,
}: {
  help: FieldHelpContent;
  accessibilityLabel?: string;
}) {
  return <FormLabel label="" help={help} iconOnly accessibilityLabel={accessibilityLabel} />;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  label: {
    flexShrink: 1,
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  actionButton: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  actionText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  helpButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetContent: {
    gap: Spacing.md,
  },
  section: {
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  sectionBody: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  list: {
    gap: Spacing.xs,
  },
  listItem: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  callout: {
    gap: Spacing.xs,
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  calloutTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  calloutBody: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
