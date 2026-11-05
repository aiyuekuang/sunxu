import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { FontSize, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { toast, toastConfig } from '../toast';
import { AppText as Text } from './AppText';

interface ScanCameraModalProps {
  visible: boolean;
  onClose: () => void;
  /** 扫码结果回调；抛出的错误会以 toast 提示 */
  onScanned: (code: string) => void | Promise<void>;
  title?: string;
  /** 连续扫码模式：识别后不关闭弹窗，可连续扫描多个条码，由用户手动关闭 */
  continuous?: boolean;
}

const CORNER_SIZE = 20;
const CORNER_WIDTH = 3;

export function ScanCameraModal({
  visible,
  onClose,
  onScanned,
  title = '对准条码扫描',
  continuous = false,
}: ScanCameraModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const requestedRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      setScanned(false);
      requestedRef.current = false;
      return;
    }
    if (!permission || permission.granted || !permission.canAskAgain) return;
    if (requestedRef.current) return;
    requestedRef.current = true;
    void requestPermission();
  }, [visible, permission, requestPermission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    if (!continuous) onClose();
    void (async () => {
      try {
        await onScanned(data);
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : '扫码识别失败');
      } finally {
        // 连续扫码：稍作防抖后重新允许识别下一个条码
        if (continuous) {
          setTimeout(() => setScanned(false), 800);
        }
      }
    })();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.cameraContainer}>
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'code128', 'code39', 'ean13', 'ean8', 'pdf417'],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
        ) : (
          <View style={styles.permissionBox}>
            <Text style={[styles.permissionTitle, { color: colors.textOnPrimary }]}>
              需要相机权限
            </Text>
            <Text style={[styles.permissionDesc, { color: colors.textOnPrimary }]}>
              {permission?.canAskAgain === false
                ? '相机权限已被拒绝，请在系统设置中允许后重试'
                : '请授权相机权限以扫描条码'}
            </Text>
            {permission?.canAskAgain !== false ? (
              <TouchableOpacity
                style={[styles.permissionBtn, { backgroundColor: colors.primary }]}
                onPress={requestPermission}
              >
                <Text style={[styles.permissionBtnText, { color: colors.textOnPrimary }]}>
                  授权相机
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        <View style={[styles.cameraHeader, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="关闭扫码"
          >
            <Ionicons name="close" size={24} color={colors.textOnPrimary} />
          </TouchableOpacity>
          <Text style={[styles.cameraTitle, { color: colors.textOnPrimary }]}>{title}</Text>
          <View style={styles.closeBtn} />
        </View>

        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.cornerTL, { borderColor: colors.primary }]} />
          <View style={[styles.corner, styles.cornerTR, { borderColor: colors.primary }]} />
          <View style={[styles.corner, styles.cornerBL, { borderColor: colors.primary }]} />
          <View style={[styles.corner, styles.cornerBR, { borderColor: colors.primary }]} />
        </View>

        <Toast config={toastConfig} topOffset={Math.max(insets.top, Spacing.base) + Spacing.sm} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraTitle: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  scanFrame: {
    position: 'absolute',
    top: '35%',
    left: '15%',
    right: '15%',
    aspectRatio: 1.5,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
  },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  permissionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  permissionDesc: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm + Spacing.xs,
    textAlign: 'center',
    opacity: 0.8,
  },
  permissionBtn: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 6,
  },
  permissionBtnText: {
    fontSize: FontSize.base,
    fontWeight: '500',
  },
});
