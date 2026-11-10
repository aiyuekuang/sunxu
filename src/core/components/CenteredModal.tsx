import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import type React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type ModalProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { FontSize, Radius, Shadow, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { toastConfig } from '../toast';
import { ActionButton } from './ActionButton';
import { AppText as Text } from './AppText';
import { ModalHeader } from './ModalHeader';
import { ModalRequestCloseContext, useModalRequestCloseRegistry } from './ModalRequestCloseContext';

interface CenteredModalBaseProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  subtitle?: string;
  closeDisabled?: boolean;
  closeAccessibilityLabel?: string;
  closeOnBackdropPress?: boolean;
  maxWidth?: number;
  maxHeightRatio?: number;
  animationType?: ModalProps['animationType'];
  dialogStyle?: StyleProp<ViewStyle>;
  headerRight?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  confirmDisabledHint?: string;
  confirmButtonColor?: string;
}

type CenteredModalFooterProps =
  | {
      /** 提供时，Sunxu 在固定底栏渲染取消与确认按钮。 */
      confirmText?: string;
      cancelText?: string;
      onConfirm?: () => void;
      footer?: never;
    }
  | {
      /** 自定义操作区；固定在滚动内容之外并使用弹窗内边距。 */
      footer: React.ReactNode;
      confirmText?: never;
      cancelText?: never;
      onConfirm?: never;
    }
  | {
      confirmText?: never;
      cancelText?: never;
      onConfirm?: never;
      footer?: never;
    };

export type CenteredModalProps = CenteredModalBaseProps & CenteredModalFooterProps;

/** @sunxu-component shared */
/** Centered, theme-aware modal for short notices and confirmation flows. */
export function CenteredModal({
  visible,
  onClose,
  title,
  children,
  subtitle,
  closeDisabled = false,
  closeAccessibilityLabel = '关闭弹窗',
  closeOnBackdropPress = true,
  maxWidth = 480,
  maxHeightRatio = 0.88,
  animationType = 'fade',
  dialogStyle,
  headerRight,
  loading = false,
  disabled = false,
  confirmDisabledHint,
  confirmButtonColor,
  confirmText,
  cancelText = '取消',
  onConfirm,
  footer,
}: CenteredModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const requestCloseRegistry = useModalRequestCloseRegistry();
  const footerVisible = !!confirmText || footer != null;
  const horizontalInset = Math.max(insets.left, insets.right, Spacing.base);
  const availableHeight = Math.max(
    0,
    height - insets.top - insets.bottom - Spacing.xl * 2,
  );
  const panelWidth = Math.min(maxWidth, Math.max(0, width - horizontalInset * 2));
  const panelHeight = Math.max(0, availableHeight * maxHeightRatio);
  const confirmButtonDisabled = disabled && !loading;
  const visibleDisabledHint = confirmButtonDisabled
    ? (confirmDisabledHint ?? '请先完善必填项或处理页面提示后再提交')
    : undefined;

  const handleClose = () => {
    if (!closeDisabled) onClose();
  };

  const handleRequestClose = () => {
    if (requestCloseRegistry.requestClose()) return;
    handleClose();
  };

  const footerContent = footer ?? (confirmText ? (
    <>
      {visibleDisabledHint ? (
        <Text style={[styles.disabledHint, { color: colors.error }]}>
          {visibleDisabledHint}
        </Text>
      ) : null}
      <View style={styles.footerButtons}>
        <ActionButton
          variant="secondary"
          style={styles.footerButton}
          onPress={handleClose}
          disabled={closeDisabled}
          accessibilityLabel={cancelText}
        >
          {cancelText}
        </ActionButton>
        <ActionButton
          variant="primary"
          style={styles.footerButton}
          buttonColor={confirmButtonDisabled ? colors.surfaceSecondary : (confirmButtonColor ?? colors.primary)}
          textColor={confirmButtonDisabled ? colors.textMuted : colors.textOnPrimary}
          onPress={onConfirm}
          disabled={disabled}
          loading={loading}
          accessibilityLabel={loading ? '正在提交' : confirmText}
          accessibilityHint={visibleDisabledHint}
        >
          {confirmText}
        </ActionButton>
      </View>
    </>
  ) : null);

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      presentationStyle="overFullScreen"
      statusBarTranslucent={Platform.OS === 'android'}
      navigationBarTranslucent={Platform.OS === 'android'}
      onRequestClose={handleRequestClose}
    >
      <ModalRequestCloseContext.Provider value={requestCloseRegistry}>
        <BottomSheetModalProvider>
          <View
            style={[
              styles.overlay,
              {
                paddingTop: insets.top + Spacing.md,
                paddingBottom: insets.bottom + Spacing.md,
                paddingHorizontal: horizontalInset,
              },
            ]}
          >
            <Pressable
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
              onPress={closeOnBackdropPress && !closeDisabled ? handleClose : undefined}
              accessibilityRole={closeOnBackdropPress && !closeDisabled ? 'button' : undefined}
              accessibilityLabel={closeOnBackdropPress && !closeDisabled ? closeAccessibilityLabel : undefined}
              testID="centered-modal-backdrop"
            />
            <View
              accessibilityViewIsModal
              importantForAccessibility="yes"
              style={[
                styles.dialog,
                {
                  width: panelWidth,
                  maxHeight: panelHeight,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
                dialogStyle,
              ]}
              testID="centered-modal-dialog"
            >
              <ModalHeader
                title={title}
                subtitle={subtitle}
                right={headerRight}
                onClose={handleClose}
                closeDisabled={closeDisabled}
                closeAccessibilityLabel={closeAccessibilityLabel}
                bordered
                testID="centered-modal-header"
              />
              <ScrollView
                style={styles.bodyScroll}
                contentContainerStyle={[
                  styles.body,
                  !footerVisible && styles.bodyWithoutFooter,
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
              {footerVisible ? (
                <View
                  style={[
                    styles.footer,
                    { backgroundColor: colors.surface, borderTopColor: colors.border },
                  ]}
                  testID="centered-modal-footer"
                >
                  {footerContent}
                </View>
              ) : null}
            </View>
            <Toast config={toastConfig} topOffset={Math.max(insets.top, Spacing.base) + Spacing.sm} />
          </View>
        </BottomSheetModalProvider>
      </ModalRequestCloseContext.Provider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    flexShrink: 1,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.xl,
    ...Shadow.lg,
    elevation: 18,
  },
  bodyScroll: {
    flexShrink: 1,
  },
  body: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  bodyWithoutFooter: {
    paddingBottom: Spacing.base,
  },
  footer: {
    flexShrink: 0,
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.base,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  footerButton: {
    flex: 1,
  },
  disabledHint: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
});
