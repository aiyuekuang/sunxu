import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { useCallback, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { FontSize, MIN_TOUCH_TARGET, MIN_TOUCH_TARGET_ANDROID, Radius, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { toast } from '../toast';
import { AppText as Text } from './AppText';
import { DrillDownTreePicker, type TreePickerNode } from './DrillDownTreePicker';
import { ScanCameraModal } from './ScanCameraModal';

const TREE_PICKER_TARGET = Platform.OS === 'android' ? MIN_TOUCH_TARGET_ANDROID : MIN_TOUCH_TARGET;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TreePickerFieldProps {
  /** Field label text */
  label: string;
  /** Currently selected node ID */
  value?: string;
  /** Display text for the selected node */
  displayValue?: string;
  /** Fetches tree data when picker opens (lazy load) */
  fetchFn: () => Promise<TreePickerNode[]>;
  /** Selection callback */
  onSelect: (id: string, name: string) => void;
  /** Clear selection callback — if provided, shows clear button */
  onClear?: () => void;
  /** Node ID to exclude from picker (e.g., self when editing) */
  excludeId?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Disable selection and scan actions while the field is read-only or unavailable. */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Picker modal title */
  title?: string;
  /** Error message */
  error?: string;
  /** Render extra info per picker item */
  renderExtra?: (item: TreePickerNode) => React.ReactNode;
  /** Whether to show a scan button on the right */
  scannable?: boolean;
  /** Scan result callback; thrown errors are toasted */
  onScanResult?: (code: string) => void | Promise<void>;
  /** Layout customization */
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TreePickerField({
  label,
  value,
  displayValue,
  fetchFn,
  onSelect,
  onClear,
  excludeId,
  required,
  disabled = false,
  placeholder = '请选择',
  title = '选择',
  error,
  renderExtra,
  scannable,
  onScanResult,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: TreePickerFieldProps) {
  const { colors } = useTheme();

  const [pickerVisible, setPickerVisible] = useState(false);
  const [treeData, setTreeData] = useState<TreePickerNode[]>([]);
  const [loadingTree, setLoadingTree] = useState(false);
  const [scanning, setScanning] = useState(false);

  const openPicker = useCallback(async () => {
    if (disabled || loadingTree) return;
    setPickerVisible(true);
    setLoadingTree(true);
    try {
      const data = await fetchFn();
      setTreeData(data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '加载数据失败');
    } finally {
      setLoadingTree(false);
    }
  }, [disabled, fetchFn, loadingTree]);

  const handleSelect = useCallback(
    (id: string, name: string) => {
      onSelect(id, name);
      setPickerVisible(false);
    },
    [onSelect],
  );

  const hasValue = !!value;

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}
        {required && <Text style={{ color: colors.error, fontSize: FontSize.sm }}> *</Text>}
      </Text>

      <View
        style={[
          styles.triggerRow,
          {
            backgroundColor: colors.surfaceSecondary,
            borderColor: error ? colors.error : 'transparent',
            paddingRight: scannable && onScanResult ? 0 : Spacing.md,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.triggerMain}
          onPress={openPicker}
          activeOpacity={disabled || loadingTree ? 1 : 0.7}
          disabled={disabled || loadingTree}
          accessibilityRole="button"
          accessibilityLabel={`${accessibilityLabel ?? label}，${displayValue || placeholder}`}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled: disabled || loadingTree, busy: loadingTree }}
          testID={testID ? `${testID}-open` : undefined}
        >
          <Text
            style={[styles.triggerText, { color: hasValue ? colors.text : colors.textTertiary }]}
            numberOfLines={1}
          >
            {displayValue || placeholder}
          </Text>

          {!hasValue || !onClear ? (
            <Ionicons name="chevron-down" size={16} color={colors.textTertiary} />
          ) : null}
        </TouchableOpacity>

        {hasValue && onClear ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`清除${label}`}
            accessibilityState={{ disabled }}
            testID={testID ? `${testID}-clear` : undefined}
          >
            <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        ) : null}

        {scannable && onScanResult ? (
          <TouchableOpacity
            style={[styles.scanBtn, { backgroundColor: `${colors.primary}12` }]}
            onPress={() => setScanning(true)}
            activeOpacity={disabled || scanning ? 1 : 0.7}
            disabled={disabled || scanning}
            accessibilityRole="button"
            accessibilityLabel={`扫描${label}`}
            accessibilityHint="打开相机扫描条码"
            accessibilityState={{ disabled: disabled || scanning, busy: scanning }}
            testID={testID ? `${testID}-scan` : undefined}
          >
            <Ionicons name="scan-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

      <DrillDownTreePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        title={title}
        data={treeData}
        selectedId={value}
        excludeId={excludeId}
        onSelect={handleSelect}
        loading={loadingTree}
        renderExtra={renderExtra}
        testID={testID ? `${testID}-picker` : undefined}
      />

      {scannable && onScanResult ? (
        <ScanCameraModal
          visible={scanning}
          onClose={() => setScanning(false)}
          onScanned={(code) => onScanResult(code)}
        />
      ) : null}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingLeft: Spacing.md,
    minHeight: TREE_PICKER_TARGET,
  },
  triggerMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TREE_PICKER_TARGET,
    gap: Spacing.sm,
  },
  clearButton: {
    minWidth: TREE_PICKER_TARGET,
    minHeight: TREE_PICKER_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBtn: {
    width: TREE_PICKER_TARGET,
    height: TREE_PICKER_TARGET,
    borderTopRightRadius: Radius.sm,
    borderBottomRightRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerText: {
    fontSize: FontSize.base,
    flex: 1,
  },
  error: {
    fontSize: FontSize.xs,
  },
});
