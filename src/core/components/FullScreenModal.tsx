import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
  KeyboardEvents,
} from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { FontSize, MIN_TOUCH_TARGET_ANDROID, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { toastConfig } from '../toast';
import { ActionButton } from './ActionButton';
import { AppText as Text } from './AppText';
import { ModalRequestCloseContext, useModalRequestCloseRegistry } from './ModalRequestCloseContext';
import { ModalHeader } from './ModalHeader';

interface FullScreenModalBaseProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  /** Prevents header and system-back dismissal while the host requires an explicit action. */
  closeDisabled?: boolean;
  closeAccessibilityLabel?: string;
  /** 表单启用键盘避让；Android 会扣除系统窗口已产生的位移。 */
  avoidKeyboard?: boolean;
  /** scroll 由弹窗管理表单滚动；fill 将内容区交给子组件管理滚动和全高布局，底部操作区仍独立固定。 */
  bodyMode?: 'scroll' | 'fill';
  subtitle?: string;
  /** 非表单确认类的页头辅助操作；提交/应用/保存等流程操作应使用固定 footer。 */
  headerRight?: React.ReactNode;
}

type FullScreenModalFooterProps =
  | {
      /** 提供时，Sunxu 在固定底栏渲染取消与确认按钮。 */
      confirmText?: string;
      cancelText?: string;
      onConfirm?: () => void;
      confirmDisabledHint?: string;
      confirmButtonColor?: string;
      footer?: never;
      renderFooter?: never;
    }
  | {
      /** 自定义操作区；弹窗会拉伸到可用内容宽度，并固定在内容滚动区之外、处理底部安全区。 */
      footer: React.ReactNode;
      confirmText?: never;
      cancelText?: never;
      onConfirm?: never;
      confirmDisabledHint?: never;
      confirmButtonColor?: never;
      renderFooter?: never;
    }
  | {
      /** @deprecated 使用 footer。 */
      renderFooter: () => React.ReactNode;
      confirmText?: never;
      cancelText?: never;
      onConfirm?: never;
      confirmDisabledHint?: never;
      confirmButtonColor?: never;
      footer?: never;
    }
  | {
      confirmText?: never;
      cancelText?: never;
      onConfirm?: never;
      confirmDisabledHint?: never;
      confirmButtonColor?: never;
      footer?: never;
      renderFooter?: never;
    };

type FullScreenModalImmersiveProps = {
  /** 沉浸式内容隐藏页头/副标题/页脚并占满弹窗内容区，供地图或媒体查看使用。 */
  immersive: true;
  confirmText?: never;
  cancelText?: never;
  onConfirm?: never;
  confirmDisabledHint?: never;
  confirmButtonColor?: never;
  footer?: never;
  renderFooter?: never;
};

export type FullScreenModalProps = FullScreenModalBaseProps &
  (
    | ({ immersive?: false } & FullScreenModalFooterProps)
    | FullScreenModalImmersiveProps
  );

export function FullScreenModal({
  visible,
  onClose,
  title,
  children,
  confirmText,
  cancelText = '取消',
  onConfirm,
  loading = false,
  disabled = false,
  closeDisabled = false,
  closeAccessibilityLabel = '关闭弹窗',
  confirmDisabledHint,
  avoidKeyboard = false,
  bodyMode = 'scroll',
  immersive = false,
  subtitle,
  headerRight,
  confirmButtonColor,
  footer,
  renderFooter,
}: FullScreenModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const footerContent = footer ?? renderFooter?.();
  const footerVisible = !immersive && (!!confirmText || footerContent != null);
  const confirmButtonDisabled = disabled && !loading;
  const visibleDisabledHint = confirmButtonDisabled
    ? (confirmDisabledHint ?? '请先完善必填项或处理页面提示后再提交')
    : undefined;
  const requestCloseRegistry = useModalRequestCloseRegistry();
  const handleRequestClose = () => {
    if (requestCloseRegistry.requestClose()) return;
    if (!closeDisabled) onClose();
  };
  const modalFrameRef = useRef<View>(null);
  const baselineModalBottomRef = useRef<number | null>(null);
  const keyboardHeightRef = useRef<number | null>(null);
  const [systemKeyboardMovement, setSystemKeyboardMovement] = useState(0);

  const measureModalBottom = useCallback((callback: (bottom: number) => void) => {
    modalFrameRef.current?.measureInWindow((_x, y, _width, height) => {
      if (!Number.isFinite(y) || !Number.isFinite(height) || height <= 0) {
        return;
      }
      callback(y + height);
    });
  }, []);

  const captureModalBaseline = useCallback(() => {
    if (keyboardHeightRef.current != null) {
      return;
    }
    measureModalBottom((bottom) => {
      if (keyboardHeightRef.current != null) {
        return;
      }
      baselineModalBottomRef.current = bottom;
    });
  }, [measureModalBottom]);

  const updateSystemKeyboardMovement = useCallback(() => {
    const keyboardHeight = keyboardHeightRef.current;
    const baselineBottom = baselineModalBottomRef.current;
    if (keyboardHeight == null || baselineBottom == null) {
      return;
    }

    measureModalBottom((currentBottom) => {
      if (keyboardHeightRef.current !== keyboardHeight) {
        return;
      }
      const movement = Math.min(
        Math.max(baselineBottom - currentBottom, 0),
        Math.max(keyboardHeight, 0),
      );
      setSystemKeyboardMovement((current) =>
        Math.abs(current - movement) < 1 ? current : movement,
      );
    });
  }, [measureModalBottom]);

  const handleModalLayout = useCallback(
    (_event: LayoutChangeEvent) => {
      if (keyboardHeightRef.current == null) {
        captureModalBaseline();
      } else {
        updateSystemKeyboardMovement();
      }
    },
    [captureModalBaseline, updateSystemKeyboardMovement],
  );

  useEffect(() => {
    if (!visible || Platform.OS !== 'android' || !avoidKeyboard) {
      keyboardHeightRef.current = null;
      baselineModalBottomRef.current = null;
      setSystemKeyboardMovement(0);
      return;
    }

    const willShowSubscription = KeyboardEvents.addListener('keyboardWillShow', (event) => {
      keyboardHeightRef.current = event.height;
      updateSystemKeyboardMovement();
    });
    const didShowSubscription = KeyboardEvents.addListener('keyboardDidShow', (event) => {
      keyboardHeightRef.current = event.height;
      updateSystemKeyboardMovement();
    });
    const didHideSubscription = KeyboardEvents.addListener('keyboardDidHide', () => {
      keyboardHeightRef.current = null;
      setSystemKeyboardMovement(0);
      captureModalBaseline();
    });

    return () => {
      willShowSubscription.remove();
      didShowSubscription.remove();
      didHideSubscription.remove();
    };
  }, [avoidKeyboard, captureModalBaseline, updateSystemKeyboardMovement, visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={Platform.OS === 'android'}
      navigationBarTranslucent={Platform.OS === 'android'}
      onRequestClose={handleRequestClose}
      onShow={captureModalBaseline}
    >
      <ModalRequestCloseContext.Provider value={requestCloseRegistry}>
        <BottomSheetModalProvider>
          {/* Native Modal 会创建独立视图层级；在这里重新提供 provider，
              确保 PickerField / BottomSheetModal 渲染在当前全屏弹窗之上。 */}
          <View
            ref={modalFrameRef}
            onLayout={handleModalLayout}
            style={[styles.container, { backgroundColor: colors.surface }]}
          >
            <StatusBar
              barStyle={
                colors.statusBar === 'light-content' || colors.statusBar === 'dark-content'
                  ? colors.statusBar
                  : 'default'
              }
              hidden={false}
            />
            <KeyboardAvoidingView
              style={styles.keyboardAvoiding}
              behavior={
                avoidKeyboard
                  ? Platform.OS === 'android'
                    ? 'height'
                    : 'padding'
                  : undefined
              }
              // The measured parent excludes this view's own keyboard animation.
              keyboardVerticalOffset={
                Platform.OS === 'android' ? -systemKeyboardMovement : 0
              }
            >
              {!immersive ? (
                <ModalHeader
                  title={title}
                  subtitle={subtitle}
                  right={headerRight}
                  onClose={onClose}
                  closeDisabled={closeDisabled}
                  closeAccessibilityLabel={closeAccessibilityLabel}
                  topPadding={Spacing.xs}
                  topInset={
                    Platform.OS === 'android'
                      // OEM status-bar insets can include extra blank space; reserve the
                      // standard content band here, with the native window owning the rest.
                      ? Math.min(
                          StatusBar.currentHeight ?? Spacing.xl,
                          Spacing.xl + Spacing.xs,
                        )
                      : insets.top
                  }
                  bordered
                  testID="full-screen-modal-header"
                />
              ) : null}

              {bodyMode === 'fill' || immersive ? (
                <View
                  style={[
                    styles.fillContent,
                    immersive && styles.immersiveFillContent,
                    !footerVisible &&
                      !immersive && {
                        paddingBottom: (insets.bottom || Spacing.md) + Spacing.md,
                      },
                  ]}
                >
                  {children}
                </View>
              ) : (
                <KeyboardAwareScrollView
                  style={styles.contentScroll}
                  contentContainerStyle={[
                    styles.content,
                    {
                      paddingBottom: footerVisible
                        ? Spacing.md
                        : (insets.bottom || Spacing.md) + Spacing.md,
                    },
                  ]}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator
                  bottomOffset={20}
                >
                  {children}
                </KeyboardAwareScrollView>
              )}

              {!immersive && confirmText ? (
                <View
                  style={[
                    styles.confirmFooter,
                    {
                      backgroundColor: colors.surface,
                      borderTopColor: colors.border,
                      paddingBottom: (insets.bottom || Spacing.sm) + Spacing.xs,
                    },
                  ]}
                >
                  {visibleDisabledHint ? (
                    <Text style={[styles.disabledHint, { color: colors.error }]}>
                      {visibleDisabledHint}
                    </Text>
                  ) : null}
                  <View style={styles.footerButtons}>
                    <ActionButton
                      variant="outlined"
                      size="md"
                      style={styles.btn}
                      buttonColor={colors.border}
                      textColor={colors.textSecondary}
                      onPress={onClose}
                      accessibilityLabel={cancelText}
                    >
                      {cancelText}
                    </ActionButton>
                    <ActionButton
                      variant="primary"
                      size="md"
                      style={styles.btn}
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
                </View>
              ) : null}

              {!immersive && !confirmText && footerContent != null ? (
                <View
                  style={[
                    styles.footer,
                    {
                      backgroundColor: colors.surface,
                      borderTopColor: colors.border,
                      paddingBottom: (insets.bottom || Spacing.sm) + Spacing.xs,
                    },
                  ]}
                >
                  {footerContent}
                </View>
              ) : null}

              {/* Native Modal 会盖住根级 Toast，这里补一层局部 Toast 容器供表单校验/提交反馈使用 */}
              <Toast
                config={toastConfig}
                topOffset={Math.max(insets.top, Spacing.base) + Spacing.sm}
              />
            </KeyboardAvoidingView>
          </View>
        </BottomSheetModalProvider>
      </ModalRequestCloseContext.Provider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  contentScroll: {
    flex: 1,
  },
  fillContent: {
    flex: 1,
  },
  immersiveFillContent: {
    padding: 0,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  footer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  confirmFooter: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  btn: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET_ANDROID,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
  },
  disabledHint: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
});
