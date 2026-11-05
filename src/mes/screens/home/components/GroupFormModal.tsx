import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { modalConfirmText } from '../../../constants/button-labels';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GroupFormModalProps {
  /** 是否显示 */
  visible: boolean;
  /** 编辑模式下传入已有名称；不传为新建模式 */
  initialTitle?: string;
  /** 已存在的模块名称（用于去重校验） */
  existingTitles: string[];
  onClose: () => void;
  /** 提交新名称 */
  onSubmit: (title: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GroupFormModal({
  visible,
  initialTitle,
  existingTitles,
  onClose,
  onSubmit,
}: GroupFormModalProps) {
  const { colors } = useTheme();
  const isEdit = !!initialTitle;
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setValue(initialTitle ?? '');
      setError('');
    }
  }, [visible, initialTitle]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('分组名称不能为空');
      return;
    }
    if (trimmed !== initialTitle && existingTitles.includes(trimmed)) {
      setError('该名称已存在，请换一个');
      return;
    }
    onSubmit(trimmed);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={isEdit ? '重命名分组' : '新增'}
      confirmText={modalConfirmText('分组', isEdit)}
      onConfirm={handleSubmit}
      disabled={!value.trim()}
      confirmDisabledHint={!value.trim() ? '请输入分组名称' : undefined}
      avoidKeyboard
      dynamicHeight
    >
      <View style={styles.container}>
        <FormField
          label="分组名称"
          required
          value={value}
          onChangeText={(v) => {
            setValue(v);
            setError('');
          }}
          placeholder="请输入分组名称"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          maxLength={20}
          error={error}
          autoFocus
        />
        {!error && <Text style={[styles.hint, { color: colors.textMuted }]}>最多 20 个字符</Text>}
      </View>
    </BottomSheet>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  hint: {
    fontSize: FontSize.xs,
  },
});
