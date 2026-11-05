import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useBottomSheetTextInput } from './BottomSheetContext';
import { FontSize, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { useScaledFontSize } from '../theme/font-scale';
import { toast, toastConfig } from '../toast';
import { AppText as Text } from './AppText';

interface ScanInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  containerStyle?: ViewStyle;
  /** 禁止手动输入（仅支持扫码） */
  scanOnly?: boolean;
  /** 限制录入长度；手动输入与扫码共用同一上限。 */
  maxLength?: number;
  /** 自定义扫码结果处理（如根据条码查找物料） */
  onScanResult?: (code: string) => void | Promise<void>;
}

export function ScanInput({
  label,
  value,
  onChangeText,
  placeholder = '扫码或手动输入',
  required,
  error,
  containerStyle,
  scanOnly,
  maxLength,
  onScanResult,
}: ScanInputProps) {
  const { colors } = useTheme();
  const inputFontSize = useScaledFontSize(FontSize.base);
  const insets = useSafeAreaInsets();
  const { InputComponent, inputKey, inputProps } = useBottomSheetTextInput({ value, onChangeText });
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setScanned(false);
    setScanning(true);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setScanning(false);
    if (maxLength && data.length > maxLength) {
      toast.info(`扫码内容不能超过 ${maxLength} 个字符`);
      return;
    }
    if (onScanResult) {
      void Promise.resolve(onScanResult(data)).catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : '扫码识别失败');
      });
    } else {
      // 通过 hook 的 onChangeText 同步 internalValueRef，避免重挂载
      inputProps.onChangeText(data);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}
        {required && <Text style={{ color: colors.error, fontSize: FontSize.sm }}> *</Text>}
      </Text>

      <View
        style={[
          styles.inputRow,
          {
            borderColor: error ? colors.error : 'transparent',
            backgroundColor: colors.surfaceSecondary,
          },
        ]}
      >
        {scanOnly ? (
          <Text
            style={[styles.valueText, { color: value ? colors.text : colors.textTertiary }]}
            numberOfLines={1}
          >
            {value || placeholder}
          </Text>
        ) : (
          <InputComponent
            key={inputKey}
            style={[styles.input, { color: colors.text, fontSize: inputFontSize }]}
            {...inputProps}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            numberOfLines={1}
            maxLength={maxLength}
            autoCorrect={false}
          />
        )}

        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => inputProps.onChangeText('')}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        )}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity
          style={[styles.scanBtn, { backgroundColor: `${colors.primary}12` }]}
          onPress={handleScan}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`扫描${label}`}
          accessibilityHint="打开相机扫描条码"
        >
          <Ionicons name="scan-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

      {/* 内嵌扫码弹窗 */}
      <Modal visible={scanning} animationType="slide" onRequestClose={() => setScanning(false)}>
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'code128', 'code39', 'ean13', 'ean8', 'pdf417'],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />

          {/* 顶部关闭按钮 */}
          <View style={[styles.cameraHeader, { paddingTop: insets.top + Spacing.sm }]}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setScanning(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={24} color={colors.textOnPrimary} />
            </TouchableOpacity>
            <Text style={[styles.cameraTitle, { color: colors.textOnPrimary }]}>对准条码扫描</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* 扫描框 */}
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerTR, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerBL, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.cornerBR, { borderColor: colors.primary }]} />
          </View>

          <Toast config={toastConfig} topOffset={Math.max(insets.top, Spacing.base) + Spacing.sm} />
        </View>
      </Modal>
    </View>
  );
}

const CORNER_SIZE = 20;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingLeft: Spacing.md,
    height: 42,
    gap: 6,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    padding: 0,
  },
  valueText: {
    flex: 1,
    fontSize: FontSize.base,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 20,
  },
  scanBtn: {
    width: 40,
    height: 40,
    borderTopRightRadius: Radius.sm,
    borderBottomRightRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    fontSize: FontSize.xs,
  },

  // Camera
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingTop 由内联 insets.top 提供，适配刘海/灵动岛安全区
    paddingHorizontal: 16,
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
});
