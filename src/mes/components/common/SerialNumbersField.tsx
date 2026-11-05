import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import type { FinishedProductSerialDto } from '../../types/models/FinishedProductSerialDto';
import { productSerialService } from '../../host/services';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { FormField } from '../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../core/components/FullScreenModal.tsx';
import { ScanCameraModal } from '../../../core/components/ScanCameraModal.tsx';
import { SearchBar } from '../../../core/components/SearchBar.tsx';
import { FontSize, Radius, Spacing } from '../../../core/theme/tokens';
import { useTheme } from '../../../core/theme/useTheme';
import { useScaledFontSize } from '../../../core/theme/font-scale';
import { toast } from '../../../core/toast';

const SERIAL_PICK_PAGE_SIZE = 50;

export function parseSerialNumbersText(value?: string): string[] {
  return (value ?? '')
    .split(/[\n,，;；\t ]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export interface AvailableSerialPickerConfig {
  materialId: string;
  batchNo: string;
  warehouseId: string;
  /** 编辑出库单时排除本单已选序列号（由后端排除本单及其他草稿/待审单占用） */
  deliveryOrderId?: string;
}

interface SerialNumbersFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  numberOfLines?: number;
  /** 出库场景：传入后展示“从在库序列号选择”入口；不传则仅支持扫码/手动输入 */
  availablePicker?: AvailableSerialPickerConfig | null;
  containerStyle?: ViewStyle;
}

/**
 * 成品序列号多行录入字段：每件一行，支持相机连续扫码与手动输入；
 * 出库场景可传入 availablePicker，从批号在库可出库序列号中分页勾选。
 */
export function SerialNumbersField({
  label,
  value,
  onChangeText,
  required,
  error,
  placeholder,
  numberOfLines = 4,
  availablePicker,
  containerStyle,
}: SerialNumbersFieldProps) {
  const { colors } = useTheme();
  const inputFontSize = useScaledFontSize(FontSize.base);
  const [scanning, setScanning] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [availableSerials, setAvailableSerials] = useState<FinishedProductSerialDto[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);

  const currentSerials = useMemo(() => parseSerialNumbersText(value), [value]);

  const handleAppendSerial = (code: string) => {
    if (currentSerials.includes(code)) {
      toast.info('该序列号已录入');
      return;
    }
    onChangeText([...currentSerials, code].join('\n'));
    toast.success(`已录入 ${code}`);
  };

  const handleOpenPicker = async () => {
    if (!availablePicker) return;
    setPickerVisible(true);
    setLoading(true);
    setLoadError(null);
    try {
      const list = await productSerialService.listAvailableForShipment({
        materialId: availablePicker.materialId,
        batchNo: availablePicker.batchNo,
        warehouseId: availablePicker.warehouseId,
        deliveryOrderId: availablePicker.deliveryOrderId,
      });
      setAvailableSerials(list);
      const availableSet = new Set(list.map((item) => item.serialNo));
      setSelected(new Set(parseSerialNumbersText(value).filter((no) => availableSet.has(no))));
      setKeyword('');
      setPage(1);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : '在库序列号加载失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredSerials = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return availableSerials;
    return availableSerials.filter((item) => item.serialNo.toLowerCase().includes(kw));
  }, [availableSerials, keyword]);

  const totalPages = Math.max(1, Math.ceil(filteredSerials.length / SERIAL_PICK_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredSerials.slice(
    (safePage - 1) * SERIAL_PICK_PAGE_SIZE,
    safePage * SERIAL_PICK_PAGE_SIZE,
  );

  const toggleSerial = (serialNo: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(serialNo)) {
        next.delete(serialNo);
      } else {
        next.add(serialNo);
      }
      return next;
    });
  };

  const handleConfirmPick = () => {
    const availableSet = new Set(availableSerials.map((item) => item.serialNo));
    // 不在在库清单中的手动录入号码原样保留，避免误删
    const kept = currentSerials.filter((no) => !availableSet.has(no));
    const picked = availableSerials
      .filter((item) => selected.has(item.serialNo))
      .map((item) => item.serialNo);
    onChangeText([...kept, ...picked].join('\n'));
    setPickerVisible(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <FormField
        label={label}
        required={required}
        error={error}
        multiline
        numberOfLines={numberOfLines}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        rightElement={
          <View style={styles.actions}>
            {availablePicker ? (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: `${colors.primary}12` }]}
                onPress={handleOpenPicker}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`从在库序列号选择${label}`}
                accessibilityHint="打开在库序列号分页列表进行勾选"
              >
                <Ionicons name="list-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: `${colors.primary}12` }]}
              onPress={() => setScanning(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`扫描${label}`}
              accessibilityHint="打开相机连续扫描条码"
            >
              <Ionicons name="scan-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScanCameraModal
        visible={scanning}
        onClose={() => setScanning(false)}
        onScanned={handleAppendSerial}
        title="连续扫描成品序列号"
        continuous
      />

      <FullScreenModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        title="选择在库成品序列号"
        subtitle={availablePicker ? `批号 ${availablePicker.batchNo}` : undefined}
        confirmText={`录入所选（${selected.size}）`}
        onConfirm={handleConfirmPick}
        disabled={selected.size === 0}
        confirmDisabledHint="请至少勾选一个序列号"
      >
        {loading ? (
          <ActivityIndicator style={styles.center} color={colors.primary} />
        ) : loadError ? (
          <Text style={[styles.loadError, { color: colors.error }]}>{loadError}</Text>
        ) : (
          <>
            <View style={styles.searchRow}>
              <SearchBar
                value={keyword}
                onChangeText={(next) => {
                  setKeyword(next);
                  setPage(1);
                }}
                placeholder="按序列号筛选"
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>

            <Text style={[styles.summary, { color: colors.textSecondary }]}>
              {availableSerials.length > 0
                ? `共 ${availableSerials.length} 个在库可出库，已选 ${selected.size} 个`
                : '该批号在当前出库仓库暂无可出库序列号'}
            </Text>

            {filteredSerials.length > 0 ? (
              <View style={[styles.listCard, { borderColor: colors.border }]}>
                {pageItems.map((item) => {
                  const checked = selected.has(item.serialNo);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.row, { borderBottomColor: colors.border }]}
                      onPress={() => toggleSerial(item.serialNo)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked }}
                    >
                      <Ionicons
                        name={checked ? 'checkbox' : 'checkbox-outline'}
                        size={20}
                        color={checked ? colors.primary : colors.textTertiary}
                      />
                      <Text
                        style={[styles.rowText, { color: colors.text, fontSize: inputFontSize }]}
                      >
                        {item.serialNo}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={[styles.empty, { color: colors.textTertiary }]}>
                {availableSerials.length > 0 ? '无匹配序列号' : '暂无可选序列号'}
              </Text>
            )}

            {totalPages > 1 ? (
              <View style={styles.pagerRow}>
                <TouchableOpacity
                  disabled={safePage <= 1}
                  onPress={() => setPage(safePage - 1)}
                  accessibilityRole="button"
                  accessibilityLabel="上一页"
                >
                  <Text style={{ color: safePage <= 1 ? colors.textMuted : colors.primary }}>
                    上一页
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.pagerLabel, { color: colors.textSecondary }]}>
                  第 {safePage} / {totalPages} 页
                </Text>
                <TouchableOpacity
                  disabled={safePage >= totalPages}
                  onPress={() => setPage(safePage + 1)}
                  accessibilityRole="button"
                  accessibilityLabel="下一页"
                >
                  <Text
                    style={{ color: safePage >= totalPages ? colors.textMuted : colors.primary }}
                  >
                    下一页
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </>
        )}
      </FullScreenModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    marginVertical: Spacing.xl,
  },
  loadError: {
    fontSize: FontSize.sm,
    paddingVertical: Spacing.md,
  },
  searchRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  summary: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
  listCard: {
    marginTop: Spacing.xs,
    borderWidth: 0.5,
    borderRadius: Radius.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: {
    flex: 1,
  },
  empty: {
    fontSize: FontSize.sm,
    paddingVertical: Spacing.lg,
    textAlign: 'center',
  },
  pagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  pagerLabel: {
    fontSize: FontSize.sm,
  },
});
