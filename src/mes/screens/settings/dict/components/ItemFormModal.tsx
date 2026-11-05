import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { type DictItem, dictService } from '../../../../host/services';
import { AppText as Text } from '../../../../../core/components/AppText.tsx';
import { FormField } from '../../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../../core/components/FullScreenModal.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../../core/theme/tokens';
import { clearDictCache } from '../../../../host/hooks/useDict';
import { useTheme } from '../../../../../core/theme/useTheme';
import { toast } from '../../../../../core/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ItemFormModalProps {
  visible: boolean;
  typeCode: string;
  item?: DictItem;
  onClose: () => void;
  onSave: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;
const CHINESE_VALUE_REGEX = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u;

function ColorPreview({ hex }: { hex: string }) {
  const { colors } = useTheme();
  const valid = HEX_REGEX.test(hex);
  return (
    <View
      style={[
        styles.colorDot,
        { backgroundColor: valid ? hex : colors.border, borderColor: colors.border },
      ]}
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ItemFormModal({ visible, typeCode, item, onClose, onSave }: ItemFormModalProps) {
  const { colors } = useTheme();
  const [value, setValue] = useState('');
  const [label, setLabel] = useState('');
  const [sort, setSort] = useState('0');
  const [color, setColor] = useState('');
  const [bg, setBg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setValue(item?.itemValue ?? '');
      setLabel(item?.itemLabel ?? '');
      setSort(String(item?.sort ?? 0));
      setColor(item?.color ?? '');
      setBg(item?.bg ?? '');
    }
  }, [visible, item]);

  const handleSave = async () => {
    if (!value.trim() || !label.trim()) {
      toast.info('条目值和显示名称不能为空');
      return;
    }
    if (!item && CHINESE_VALUE_REGEX.test(value.trim())) {
      toast.info('条目值不允许包含中文，请使用英文、数字或约定符号');
      return;
    }
    if (color.trim() && !HEX_REGEX.test(color.trim())) {
      toast.info('颜色格式不正确，请使用 #RRGGBB 格式');
      return;
    }
    if (bg.trim() && !HEX_REGEX.test(bg.trim())) {
      toast.info('背景色格式不正确，请使用 #RRGGBB 格式');
      return;
    }
    setSaving(true);
    try {
      if (item) {
        await dictService.updateItem({
          id: item.id,
          itemLabel: label,
          color: color.trim() || undefined,
          bg: bg.trim() || undefined,
          sort: parseInt(sort, 10) || 0,
        });
      } else {
        await dictService.createItem({
          typeCode,
          itemValue: value,
          itemLabel: label,
          color: color.trim() || undefined,
          bg: bg.trim() || undefined,
          sort: parseInt(sort, 10) || 0,
        });
      }
      clearDictCache(typeCode);
      toast.success(item ? '条目已更新' : '条目已创建');
      onSave();
      onClose();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? `字典条目${item ? '更新' : '创建'}失败`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      title={item ? '编辑' : '新增'}
      confirmText="保存"
      onConfirm={handleSave}
      loading={saving}
      avoidKeyboard
    >
      <View style={styles.modalBody}>
        <FormField
          label="条目值（存储值）"
          value={value}
          onChangeText={setValue}
          placeholder={item ? '创建后不可修改' : '如: kg、production_line'}
          editable={!item}
        />
        <FormField
          label="显示名称（标签）"
          value={label}
          onChangeText={setLabel}
          placeholder="如: 千克(kg)"
        />

        <View style={styles.colorRow}>
          <View style={styles.colorField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>标签颜色</Text>
            <View style={styles.colorInputRow}>
              <ColorPreview hex={color} />
              <FormField
                label=""
                value={color}
                onChangeText={setColor}
                placeholder="#1677FF"
                autoCapitalize="characters"
                maxLength={7}
                containerStyle={styles.colorInput}
              />
            </View>
          </View>
          <View style={styles.colorField}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>标签背景色</Text>
            <View style={styles.colorInputRow}>
              <ColorPreview hex={bg} />
              <FormField
                label=""
                value={bg}
                onChangeText={setBg}
                placeholder="#E8F3FF"
                autoCapitalize="characters"
                maxLength={7}
                containerStyle={styles.colorInput}
              />
            </View>
          </View>
        </View>

        <FormField
          label="排序（越小越靠前）"
          value={sort}
          onChangeText={setSort}
          keyboardType="numeric"
          placeholder="0"
        />
      </View>
    </FullScreenModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  modalBody: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.md },
  fieldLabel: { fontSize: FontSize.sm },
  fieldInput: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.base,
    borderColor: 'transparent',
    ...Shadow.sm,
  },
  colorRow: { flexDirection: 'row', gap: Spacing.md },
  colorField: { flex: 1, gap: Spacing.xs },
  colorInputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  colorInput: { flex: 1 },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
});
