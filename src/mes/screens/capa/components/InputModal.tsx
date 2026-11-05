import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { Spacing } from '../../../../core/theme/tokens';
import { toast } from '../../../../core/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InputModalProps {
  visible: boolean;
  title: string;
  /** 字段标签，默认"内容" */
  label?: string;
  placeholder: string;
  required: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: (text: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InputModal({
  visible,
  title,
  label = '内容',
  placeholder,
  required,
  loading,
  onClose,
  onConfirm,
}: InputModalProps) {
  const [text, setText] = useState('');

  const handleConfirm = () => {
    if (required && !text.trim()) {
      toast.info('请填写内容');
      return;
    }
    onConfirm(text);
    setText('');
  };

  const handleClose = () => {
    setText('');
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title={title}
      confirmText="确认"
      cancelText="取消"
      onConfirm={handleConfirm}
      loading={loading}
      avoidKeyboard
      dynamicHeight
    >
      <View style={styles.content}>
        <FormField
          label={label}
          required={required}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          multiline
          numberOfLines={3}
          autoFocus
        />
      </View>
    </BottomSheet>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: { paddingBottom: Spacing.sm },
});
