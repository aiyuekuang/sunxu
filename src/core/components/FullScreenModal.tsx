import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import type React from 'react';
import { ActivityIndicator, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller';
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
  avoidKeyboard?: boolean;
  /** scroll 保持表单滚动；fill 将内容区交给子组件管理滚动和全高布局。 */
  bodyMode?: 'scroll' | 'fill';
  /** 沉浸式内容隐藏页头/副标题/页脚并占满弹窗内容区，供地图或媒体查看使用。 */
  immersive?: boolean;
  subtitle?: string;
  headerRight?: React.ReactNode;
  confirmButtonColor?: string;
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleRequestClose}
    >
      <ModalRequestCloseContext.Provider value={requestCloseRegistry}>
        <BottomSheetModalProvider>
          {/* Native Modal 会创建独立视图层级；在这里重新提供 provider，
              确保 PickerField / BottomSheetModal 渲染在当前全屏弹窗之上。 */}
          <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.surface }]}
            behavior={avoidKeyboard ? 'padding' : undefined}
            keyboardVerticalOffset={0}
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
