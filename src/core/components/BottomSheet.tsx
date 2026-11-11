import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  BackHandler,
  Dimensions,
  Keyboard,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { FontSize, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { toastConfig } from '../toast';
import { ActionButton } from './ActionButton';
import { AppText as Text } from './AppText';
import { ModalHeader } from './ModalHeader';
import { BottomSheetInternalContext } from './BottomSheetContext';
import { useModalRequestCloseContext } from './ModalRequestCloseContext';

interface BottomSheetBaseProps {
  visible: boolean;
  onClose: () => void;
  /** 弹层动画完成并从 portal 移除后的回调 */
  onDismiss?: () => void;
  title: string;
  children: React.ReactNode;
  /** 确认按钮 loading */
  loading?: boolean;
  /** 确认按钮禁用 */
  disabled?: boolean;
  /** 是否暂时禁止关闭弹层（例如提交中的业务动作） */
  closeDisabled?: boolean;
  /** 是否启用 KeyboardAvoidingView，有输入框时传 true */
  avoidKeyboard?: boolean;
  /** 最大高度比例，默认 0.8 */
  maxHeightRatio?: number;
  /** 副标题，显示在标题下方 */
  subtitle?: string;
  /** 启用动态高度，适用于短内容选择/说明弹层；带滚动表单时使用默认固定高度布局。 */
  dynamicHeight?: boolean;
  /** 是否允许从内容区域直接拖动 BottomSheet。默认滚动型表单关闭，动态高度弹窗开启。 */
  enableContentPanningGesture?: boolean;
}

type BottomSheetFooterProps =
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
      /** 自定义操作区；BottomSheet 会拉伸到可用内容宽度，并固定在滚动区之外、处理底部安全区。 */
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

export type BottomSheetProps = BottomSheetBaseProps & BottomSheetFooterProps;

/**
 * Modal sheet backed by Gorhom's portal. The app root must mount one
 * BottomSheetModalProvider; do not nest another PortalProvider inside it or
 * the modal host is shadowed and the sheet will not render.
 */
export function BottomSheet({
  visible,
  onClose,
  onDismiss,
  title,
  children,
  confirmText,
  cancelText = '取消',
  onConfirm,
  loading = false,
  disabled = false,
  confirmDisabledHint,
  closeDisabled = false,
  avoidKeyboard = false,
  maxHeightRatio = 0.8,
  confirmButtonColor,
  subtitle,
  dynamicHeight = false,
  footer,
  renderFooter,
  enableContentPanningGesture = dynamicHeight,
}: BottomSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  // 区分"由 visible prop 触发的关闭"和"用户手势触发的关闭"
  const closedByPropRef = useRef(false);
  const modalRequestClose = useModalRequestCloseContext();

  const snapPoints = useMemo(() => [`${Math.round(maxHeightRatio * 100)}%`], [maxHeightRatio]);
  const maxDynamicContentSize = useMemo(
    () => Dimensions.get('window').height * maxHeightRatio,
    [maxHeightRatio],
  );

  useEffect(() => {
    if (visible) {
      closedByPropRef.current = false;
      sheetRef.current?.present();
    } else {
      closedByPropRef.current = true;
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  useEffect(
    () => () => {
      // BottomSheetModal 通过 portal 渲染，父组件直接卸载时需要主动 dismiss，
      // 否则弹层可能残留在当前页面上方。
      closedByPropRef.current = true;
      sheetRef.current?.dismiss();
    },
    [],
  );

  // Android 返回键关闭弹窗（gorhom 不内置此行为）
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (closeDisabled) return true;
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [closeDisabled, visible, onClose]);

  useEffect(() => {
    if (!visible || !modalRequestClose) return;
    return modalRequestClose.registerRequestCloseHandler(() => {
      if (!closeDisabled) onClose();
    });
  }, [closeDisabled, visible, modalRequestClose, onClose]);

  useEffect(() => {
    if (!visible || !avoidKeyboard || Platform.OS !== 'android') return;
    const sub = Keyboard.addListener('keyboardDidHide', () => {
      // Android 某些 ROM 下键盘收起后会停留在临时高度，手动回到初始 snap 点兜底。
      requestAnimationFrame(() => {
        sheetRef.current?.snapToIndex(0);
      });
    });
    return () => sub.remove();
  }, [visible, avoidKeyboard]);

  const handleDismiss = useCallback(() => {
    // 手势下滑关闭时同步 visible 状态；prop 触发的关闭不重复调用
    if (!closedByPropRef.current) {
      onClose();
    }
    onDismiss?.();
  }, [onClose, onDismiss]);

  const handleClose = useCallback(() => {
    if (closeDisabled) return;
    onClose();
  }, [closeDisabled, onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.45}
        pressBehavior={closeDisabled ? 'none' : 'close'}
      />
    ),
    [closeDisabled],
  );

  const headerEl = (
    <ModalHeader
      title={title}
      subtitle={subtitle}
      onClose={handleClose}
      closeDisabled={closeDisabled}
      testID="bottom-sheet-header"
    />
  );

  const footerContent = footer ?? renderFooter?.();
  const bodyPadBottom = confirmText || footerContent != null ? Spacing.base : insets.bottom || 16;
  // 手势导航区/底部横条不能压住操作按钮：系统 inset 之外再保底一段间距，
  // 并在有 inset 时追加一层留白，避免部分 ROM 只返回导航条高度时的贴边。
  const footerInset = Math.max(insets.bottom, Spacing.xl) + Spacing.xs;
  const footerSurface = {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    paddingBottom: footerInset,
  };
  const confirmButtonDisabled = disabled && !loading;
  const visibleDisabledHint = confirmButtonDisabled
    ? (confirmDisabledHint ?? '请先完善必填项或处理页面提示后再提交')
    : undefined;

  const footerEl = (
    <>
      {confirmText && (
        <View style={[styles.confirmFooter, footerSurface]}>
          {visibleDisabledHint ? (
            <Text style={[styles.disabledHint, { color: colors.error }]}>
              {visibleDisabledHint}
            </Text>
          ) : null}
          <View style={styles.footerButtons}>
            <ActionButton
              variant="outlined"
              style={styles.footerButtonFlex}
              onPress={handleClose}
              disabled={closeDisabled}
            >
              {cancelText}
            </ActionButton>
            <ActionButton
              variant={confirmButtonDisabled ? 'secondary' : 'primary'}
              buttonColor={confirmButtonDisabled ? undefined : confirmButtonColor}
              style={styles.footerButtonFlex}
              onPress={onConfirm}
              disabled={disabled || loading}
              loading={loading}
              accessibilityHint={visibleDisabledHint}
            >
              {confirmText}
            </ActionButton>
          </View>
        </View>
      )}
      {!confirmText && footerContent != null && (
        <View style={[styles.footer, footerSurface]}>{footerContent}</View>
      )}
    </>
  );

  // NOTE:
  // Android 需要用 interactive + adjustPan 才会在输入时抬升弹窗；
  // 再配合 keyboardDidHide 时 snapToIndex(0) 兜底，修复收起后不回落的问题。
  const keyboardBehavior = avoidKeyboard
    ? Platform.OS === 'ios'
      ? 'extend'
      : 'interactive'
    : undefined;
  const androidKeyboardInputMode =
    avoidKeyboard && Platform.OS === 'android' ? 'adjustPan' : undefined;

  return (
    <BottomSheetModal
      ref={sheetRef}
      {...(dynamicHeight
        ? { enableDynamicSizing: true, maxDynamicContentSize }
        : { snapPoints, enableDynamicSizing: false })}
      enablePanDownToClose={!closeDisabled}
      enableContentPanningGesture={enableContentPanningGesture}
      stackBehavior="push"
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.sheet, { backgroundColor: colors.surface }]}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
      keyboardBehavior={keyboardBehavior}
      keyboardBlurBehavior={avoidKeyboard ? 'restore' : 'none'}
      enableBlurKeyboardOnGesture={avoidKeyboard}
      android_keyboardInputMode={androidKeyboardInputMode}
    >
      <BottomSheetInternalContext.Provider value={true}>
        {dynamicHeight ? (
          /* dynamicHeight 模式：header/body/footer 全部放入 BottomSheetView，
             避免普通 View 与 BottomSheetView 同级导致布局重叠 */
          <BottomSheetView>
            {headerEl}
            <View style={[styles.body, { paddingBottom: bodyPadBottom }]}>{children}</View>
            {footerEl}
            <Toast
              config={toastConfig}
              topOffset={Math.max(insets.top, Spacing.base) + Spacing.sm}
            />
          </BottomSheetView>
        ) : (
          <>
            {headerEl}
            <BottomSheetScrollView
              style={styles.bodyScroll}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.body, { paddingBottom: bodyPadBottom }]}
            >
              {children}
            </BottomSheetScrollView>
            {footerEl}
            {/* Toast 必须在 gorhom portal 内渲染，否则 iOS FullWindowOverlay 遮挡根级 Toast */}
            <Toast
              config={toastConfig}
              topOffset={Math.max(insets.top, Spacing.base) + Spacing.sm}
            />
          </>
        )}
      </BottomSheetInternalContext.Provider>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  bodyScroll: { flexShrink: 1 },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  body: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  footer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
  },
  confirmFooter: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  footerButtonFlex: {
    flex: 1,
  },
  disabledHint: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
});
