import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
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
import { FontSize, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { toastConfig } from '../toast';
import { AppText as Text } from './AppText';
import { ModalRequestCloseContext, useModalRequestCloseRegistry } from './ModalRequestCloseContext';
import { PageHeader } from './PageHeader';

export interface FullScreenModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** 确认按钮禁用时给读屏用户的原因提示 */
  confirmDisabledHint?: string;
  /** 表单启用键盘避让；Android 会扣除系统窗口已产生的位移。 */
  avoidKeyboard?: boolean;
  /** scroll 由弹窗管理表单滚动；fill 将内容区交给子组件管理滚动和全高布局，底部操作区仍独立固定。 */
  bodyMode?: 'scroll' | 'fill';
  /** 沉浸式内容隐藏页头/副标题/页脚并占满弹窗内容区，供地图或媒体查看使用。 */
  immersive?: boolean;
  subtitle?: string;
  /** 非表单确认类的页头辅助操作；提交/应用/保存等流程操作应使用固定 footer。 */
  headerRight?: React.ReactNode;
  confirmButtonColor?: string;
  /** 自定义底部操作区，固定在弹窗底部并位于内容滚动区之外；与 confirmText 互斥。 */
  renderFooter?: () => React.ReactNode;
}

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
  confirmDisabledHint,
  avoidKeyboard = false,
  bodyMode = 'scroll',
  immersive = false,
  subtitle,
  headerRight,
  confirmButtonColor,
  renderFooter,
}: FullScreenModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const footerVisible = !immersive && (!!confirmText || !!renderFooter);
  const confirmButtonDisabled = disabled && !loading;
  const visibleDisabledHint = confirmButtonDisabled
    ? (confirmDisabledHint ?? '请先完善必填项或处理页面提示后再提交')
    : undefined;
  const requestCloseRegistry = useModalRequestCloseRegistry();
  const handleRequestClose = () => {
    if (requestCloseRegistry.requestClose()) return;
    onClose();
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
      onRequestClose={handleRequestClose}
      onShow={captureModalBaseline}
    >
      <ModalRequestCloseContext.Provider value={requestCloseRegistry}>
        <BottomSheetModalProvider>
          {/* Native Modal 会创建独立视图层级；在这里重新提供 provider，
              确保 PickerField / BottomSheetModal 渲染在当前全屏弹窗之上。 */}
          <KeyboardAvoidingView
            ref={modalFrameRef}
            onLayout={handleModalLayout}
            style={[styles.container, { backgroundColor: colors.surface }]}
            behavior={avoidKeyboard ? 'padding' : undefined}
            // On Android, subtract movement already applied by the system window.
            keyboardVerticalOffset={
              Platform.OS === 'android' ? -systemKeyboardMovement : 0
            }
          >
            {!immersive ? (
              <PageHeader title={title} onBack={onClose} right={headerRight} />
            ) : null}

            {!immersive && subtitle ? (
              <View
                style={[
                  styles.subtitleWrap,
                  {
                    backgroundColor: colors.surface,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
              </View>
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
                  <TouchableOpacity
                    style={[styles.btn, styles.cancelBtn, { borderColor: colors.border }]}
                    onPress={onClose}
                  >
                    <Text style={[styles.btnText, { color: colors.textSecondary }]}>
                      {cancelText}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.btn,
                      styles.confirmBtn,
                      {
                        backgroundColor: confirmButtonDisabled
                          ? colors.surfaceSecondary
                          : (confirmButtonColor ?? colors.primary),
                        borderColor: confirmButtonDisabled ? colors.border : 'transparent',
                        opacity: loading ? 0.6 : 1,
                      },
                      confirmButtonDisabled && styles.disabledConfirmBtn,
                    ]}
                    onPress={onConfirm}
                    disabled={disabled || loading}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: disabled || loading }}
                    accessibilityHint={visibleDisabledHint}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={colors.textOnPrimary} />
                    ) : (
                      <Text
                        style={[
                          styles.btnText,
                          {
                            color: confirmButtonDisabled ? colors.textMuted : colors.textOnPrimary,
                          },
                        ]}
                      >
                        {confirmText}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {!immersive && !confirmText && renderFooter ? (
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
                {renderFooter()}
              </View>
            ) : null}

            {/* Native Modal 会盖住根级 Toast，这里补一层局部 Toast 容器供表单校验/提交反馈使用 */}
            <Toast
              config={toastConfig}
              topOffset={Math.max(insets.top, Spacing.base) + Spacing.sm}
            />
          </KeyboardAvoidingView>
        </BottomSheetModalProvider>
      </ModalRequestCloseContext.Provider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitleWrap: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  subtitle: {
    fontSize: FontSize.xs,
    lineHeight: 18,
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
    flexDirection: 'row',
    alignItems: 'center',
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
    minHeight: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  cancelBtn: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  confirmBtn: {
    borderWidth: 0,
  },
  disabledConfirmBtn: {
    borderWidth: 1,
  },
  disabledHint: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  btnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
