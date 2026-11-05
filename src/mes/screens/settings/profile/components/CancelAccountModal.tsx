import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../../../../core/components/AppText.tsx';
import { FontSize, Radius, Spacing } from '../../../../../core/theme/tokens';
import { useTheme } from '../../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CancelAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const COUNTDOWN = 10;

export function CancelAccountModal({ visible, onClose, onConfirm }: CancelAccountModalProps) {
  const { colors } = useTheme();
  const [seconds, setSeconds] = useState(COUNTDOWN);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (visible) {
      setSeconds(COUNTDOWN);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setSeconds(COUNTDOWN);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible]);

  const canConfirm = seconds === 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onClose} />
      <View style={styles.centeredView} pointerEvents="box-none">
        <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.error }]}>注销账号</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            注销后账号将被永久删除，无法恢复。{'\n'}
            如果您是公司唯一管理员，公司下所有用户也将一同注销。
          </Text>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: canConfirm ? colors.error : colors.errorLight },
              ]}
              onPress={canConfirm ? onConfirm : undefined}
              activeOpacity={canConfirm ? 0.75 : 1}
              disabled={!canConfirm}
            >
              <Text
                style={[
                  styles.confirmBtnText,
                  { color: canConfirm ? colors.textOnPrimary : colors.error },
                ]}
              >
                {canConfirm ? '确认注销' : `确认注销 (${seconds})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  centeredView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  dialog: {
    width: '100%',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: FontSize.sm,
    lineHeight: 22,
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  confirmBtn: {
    flex: 2,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
});
