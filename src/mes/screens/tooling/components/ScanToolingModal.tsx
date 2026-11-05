import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useCallback, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { toolingService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast, toastConfig } from '../../../../core/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScanToolingModalProps {
  visible: boolean;
  onClose: () => void;
  /** 扫码成功后返回工装 id，由父组件负责导航 */
  onSuccess: (toolingId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ScanToolingModal({ visible, onClose, onSuccess }: ScanToolingModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [processing, setProcessing] = useState(false);

  const handleBarCodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (processing) return;
      setProcessing(true);
      try {
        const tooling = await toolingService.findByCode(data.trim());
        onClose();
        onSuccess(tooling.id);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : `未找到编码为「${data}」的工装`);
      } finally {
        setProcessing(false);
      }
    },
    [processing, onClose, onSuccess],
  );

  const handleOpen = useCallback(async () => {
    if (!permission?.granted) {
      await requestPermission();
    }
  }, [permission, requestPermission]);

  // 打开时自动请求权限
  React.useEffect(() => {
    if (visible) handleOpen();
  }, [visible, handleOpen]);

  if (!visible) return null;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.cameraContainer}>
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'code128', 'code39', 'ean13', 'ean8', 'pdf417'],
            }}
            onBarcodeScanned={processing ? undefined : handleBarCodeScanned}
          />
        ) : (
          <View style={styles.permissionHint}>
            <Ionicons name="camera-outline" size={48} color={colors.textOnPrimary} />
            <Text style={styles.permissionText}>请授权相机权限以使用扫码功能</Text>
          </View>
        )}

        {/* 顶部关闭按钮 */}
        <View style={[styles.cameraHeader, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={24} color={colors.textOnPrimary} />
          </TouchableOpacity>
          <Text style={styles.cameraTitle}>扫描工装编码</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* 扫描框 */}
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.cornerTL, { borderColor: colors.primary }]} />
          <View style={[styles.corner, styles.cornerTR, { borderColor: colors.primary }]} />
          <View style={[styles.corner, styles.cornerBL, { borderColor: colors.primary }]} />
          <View style={[styles.corner, styles.cornerBR, { borderColor: colors.primary }]} />
        </View>

        {processing && (
          <View style={styles.processingOverlay}>
            <Text style={styles.processingText}>查询中...</Text>
          </View>
        )}

        <Toast config={toastConfig} topOffset={Math.max(insets.top, Spacing.base) + Spacing.sm} />
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CORNER_SIZE = 20;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingTop 由内联 insets.top 提供，适配刘海/灵动岛安全区
    paddingHorizontal: Spacing.base,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  cameraTitle: { fontSize: FontSize.base, fontWeight: '600', color: '#FFFFFF' },
  scanFrame: { position: 'absolute', top: '35%', left: '15%', right: '15%', aspectRatio: 1.5 },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: { fontSize: FontSize.lg, fontWeight: '600', color: '#FFFFFF' },
  permissionHint: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  permissionText: { fontSize: FontSize.base, color: '#FFFFFF' },
});
