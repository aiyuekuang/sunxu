import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText as Text } from './AppText.tsx';
import { FontSize, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import {
  type EntityPickerCategoryOption,
  type EntityPickerFetchFn,
  type EntityPickerQuickFilter,
  EntityPickerModal,
} from './EntityPickerModal.tsx';
import { type FieldHelpContent, FormLabel } from './FormLabel.tsx';

export interface EntityPickerFieldProps<T> {
  label: string;
  value?: T | null;
  onChange: (item: T | null) => void;
  fetchFn: EntityPickerFetchFn<T>;
  keyExtractor: (item: T) => string;
  labelExtractor: (item: T) => string;
  sublabelExtractor?: (item: T) => string;
  title?: string;
  placeholder?: string;
  required?: boolean;
  help?: FieldHelpContent;
  error?: string;
  clearable?: boolean;
  containerStyle?: ViewStyle;
  disabled?: boolean;
  /** 禁用时展示给用户的原因，并作为无障碍提示 */
  disabledReason?: string;
  /** 启用扫码按钮，点击后打开摄像头扫描条码 */
  scannable?: boolean;
  /** 扫码结果回调，配合 scannable 使用 */
  onScanResult?: (code: string) => void;
  /** 分类筛选项；传入后在搜索框下方显示分类快捷筛选 */
  categoryFetchFn?: () => Promise<EntityPickerCategoryOption[]>;
  categoryLayout?: 'quick-filter' | 'sidebar';
  searchPlaceholder?: string;
  /** 列表项左侧内容，如物料图片 */
  renderLeading?: (item: T) => React.ReactNode;
  /** 列表项补充信息；传入后替代默认副标签 */
  renderDetails?: (item: T) => React.ReactNode;
  /** 可扩展的快捷筛选 */
  quickFilters?: EntityPickerQuickFilter[];
}

export function EntityPickerField<T>({
  label,
  value,
  onChange,
  fetchFn,
  keyExtractor,
  labelExtractor,
  sublabelExtractor,
  title,
  placeholder,
  required,
  help,
  error,
  clearable = true,
  containerStyle,
  disabled,
  disabledReason,
  scannable,
  onScanResult,
  categoryFetchFn,
  categoryLayout,
  searchPlaceholder,
  renderLeading,
  renderDetails,
  quickFilters,
}: EntityPickerFieldProps<T>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const displayText = value ? labelExtractor(value) : '';
  const resolvedDisabledReason = disabled ? (disabledReason ?? '当前字段不可修改') : undefined;

  const handleOpenScanner = async () => {
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
    onScanResult?.(data);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <FormLabel label={label} required={required} help={help} />

      <View style={styles.inputRow}>
        <TouchableOpacity
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: error ? colors.error : disabled ? colors.border : 'transparent',
              opacity: disabled ? 0.72 : 1,
            },
          ]}
          disabled={disabled}
          onPress={() => setModalVisible(true)}
          activeOpacity={disabled ? 1 : 0.7}
          accessibilityState={{ disabled: Boolean(disabled) }}
          accessibilityHint={resolvedDisabledReason}
        >
          <Text
            style={[styles.valueText, { color: displayText ? colors.text : colors.textTertiary }]}
            numberOfLines={1}
          >
            {displayText || placeholder || '请选择'}
          </Text>
          {clearable && value && !disabled ? (
            <TouchableOpacity
              onPress={() => onChange(null)}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="chevron-down" size={16} color={colors.textTertiary} />
          )}
        </TouchableOpacity>

        {scannable && (
          <TouchableOpacity
            style={[
              styles.scanBtn,
              {
                backgroundColor: disabled ? colors.surfaceSecondary : `${colors.primary}12`,
                borderColor: disabled ? colors.border : 'transparent',
                opacity: disabled ? 0.72 : 1,
              },
              disabled && styles.scanBtnDisabled,
            ]}
            onPress={handleOpenScanner}
            activeOpacity={disabled ? 1 : 0.7}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`扫描${label}`}
            accessibilityState={{ disabled: Boolean(disabled) }}
            accessibilityHint={disabled ? resolvedDisabledReason : '打开相机扫描条码'}
          >
            <Ionicons
              name="scan-outline"
              size={18}
              color={disabled ? colors.textMuted : colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
      {resolvedDisabledReason ? (
        <Text style={[styles.disabledHint, { color: colors.warning }]}>
          {resolvedDisabledReason}
        </Text>
      ) : null}

      <EntityPickerModal
        visible={modalVisible}
        title={title ?? label}
        fetchFn={fetchFn}
        keyExtractor={keyExtractor}
        labelExtractor={labelExtractor}
        sublabelExtractor={sublabelExtractor}
        initialSelected={value ? [value] : []}
        multi={false}
        renderLeading={renderLeading}
        renderDetails={renderDetails}
        onClose={() => setModalVisible(false)}
        onConfirm={([item]) => {
          onChange(item ?? null);
          setModalVisible(false);
        }}
        categoryFetchFn={categoryFetchFn}
        categoryLayout={categoryLayout}
        searchPlaceholder={searchPlaceholder}
        quickFilters={quickFilters}
      />

      {scannable && (
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
            <View style={[styles.cameraHeader, { paddingTop: insets.top + Spacing.sm }]}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setScanning(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.cameraTitle}>对准条码扫描</Text>
              <View style={styles.closeBtn} />
            </View>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTL, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.cornerTR, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.cornerBL, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.cornerBR, { borderColor: colors.primary }]} />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const CORNER_SIZE = 20;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    height: 42,
    gap: Spacing.sm,
  },
  valueText: { flex: 1, fontSize: FontSize.base },
  error: { fontSize: FontSize.xs },
  disabledHint: { fontSize: FontSize.xs, lineHeight: FontSize.xs + Spacing.xs },
  scanBtn: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBtnDisabled: {
    borderWidth: 1,
  },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  cameraTitle: { fontSize: FontSize.base, fontWeight: '600', color: '#fff' },
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
});
