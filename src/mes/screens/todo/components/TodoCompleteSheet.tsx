import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { TodoListItem } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

interface TodoCompleteSheetProps {
  visible: boolean;
  todo: TodoListItem | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (result: string) => void;
}

export function TodoCompleteSheet({
  visible,
  todo,
  loading,
  onClose,
  onSubmit,
}: TodoCompleteSheetProps) {
  const { colors } = useTheme();
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!visible) {
      setResult('');
      setError(undefined);
    }
  }, [visible]);

  const handleConfirm = () => {
    const normalized = result.trim();
    if (!normalized) {
      setError('请填写处理结果');
      return;
    }
    onSubmit(normalized);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="完成待办"
      subtitle={todo?.title}
      confirmText="完成"
      loading={loading}
      disabled={loading}
      onConfirm={handleConfirm}
      avoidKeyboard
      dynamicHeight
    >
      <View style={styles.content}>
        {todo?.content ? (
          <View style={[styles.summary, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>工作内容</Text>
            <Text style={[styles.summaryText, { color: colors.text }]}>{todo.content}</Text>
          </View>
        ) : null}
        <FormField
          label="处理结果"
          value={result}
          onChangeText={(text) => {
            setResult(text);
            if (error) setError(undefined);
          }}
          placeholder="说明最后做了什么、结论是什么"
          multiline
          numberOfLines={4}
          required
          error={error}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.base,
  },
  summary: {
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: 8,
  },
  summaryLabel: {
    fontSize: FontSize.xs,
  },
  summaryText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
