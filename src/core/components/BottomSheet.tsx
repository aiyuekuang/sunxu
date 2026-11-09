import { Ionicons } from '@expo/vector-icons';
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
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { FontSize, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText as Text } from './AppText';
import { BottomSheetInternalContext } from './BottomSheetContext';
import { useModalRequestCloseContext } from './ModalRequestCloseContext';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  /** 弹层动画完成并从 portal 移除后的回调 */
  onDismiss?: () => void;
  title: string;
  children: React.ReactNode;
  /** 底部确认按钮文字，不传则不显示底部按钮 */
  confirmText?: string;
  /** 底部取消按钮文字，默认"取消" */
  cancelText?: string;
  onConfirm?: () => void;
  /** 确认按钮 loading */
  loading?: boolean;
  /** 确认按钮禁用 */
  disabled?: boolean;
  /** 确认按钮禁用时给读屏用户的原因提示 */
  confirmDisabledHint?: string;
  /** 是否暂时禁止关闭弹层（例如提交中的业务动作） */
  closeDisabled?: boolean;
  /** 是否启用 KeyboardAvoidingView，有输入框时传 true */
  avoidKeyboard?: boolean;
  /** 最大高度比例，默认 0.8 */
  maxHeightRatio?: number;
  /** 确认按钮颜色，默认 colors.primary */
  confirmButtonColor?: string;
  /** 副标题，显示在标题下方 */
  subtitle?: string;
  /** 启用动态高度，适用于短内容选择/说明弹层；带滚动表单时使用默认固定高度布局。 */
  dynamicHeight?: boolean;
  /** 自定义底部操作栏，固定在弹层底部并位于内容滚动区之外。与 confirmText 互斥。 */
  renderFooter?: () => React.ReactNode;
  /** 是否允许从内容区域直接拖动 BottomSheet。默认滚动型表单关闭，动态高度弹窗开启。 */
  enableContentPanningGesture?: boolean;
}

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
    <View style={styles.header}>
      <View style={styles.headerTextWrap}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
      <TouchableOpacity
        onPress={handleClose}
        disabled={closeDisabled}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      >
        <Ionicons name="close" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  const bodyPadBottom = confirmText || renderFooter ? Spacing.base : insets.bottom || 16;
  const confirmButtonDisabled = disabled && !loading;
  const visibleDisabledHint = confirmButtonDisabled
    ? (confirmDisabledHint ?? '请先完善必填项或处理页面提示后再提交')
    : undefined;

  const footerEl = (
    <>
      {confirmText && (
        <View style={[styles.confirmFooter, { paddingBottom: insets.bottom || 16 }]}>
          {visibleDisabledHint ? (
            <Text style={[styles.disabledHint, { color: colors.error }]}>
              {visibleDisabledHint}
            </Text>
          ) : null}
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={[styles.btn, styles.cancelBtn, { borderColor: colors.border }]}
              onPress={handleClose}
              disabled={closeDisabled}
            >
              <Text style={[styles.btnText, { color: colors.textSecondary }]}>{cancelText}</Text>
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
                    { color: confirmButtonDisabled ? colors.textMuted : colors.textOnPrimary },
                  ]}
                >
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
      {!confirmText && renderFooter && (
        <View style={[styles.footer, { paddingBottom: insets.bottom || 16 }]}>
          {renderFooter()}
        </View>
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
            <Toast />
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
            <Toast />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  headerTextWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  body: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    flexShrink: 0,
  },
  confirmFooter: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    flexShrink: 0,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  confirmBtn: {},
  disabledConfirmBtn: {
    borderWidth: 1,
  },
  disabledHint: {
    fontSize: FontSize.xs,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  btnText: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
});
