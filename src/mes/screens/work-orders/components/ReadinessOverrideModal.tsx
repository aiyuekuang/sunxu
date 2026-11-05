import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

interface ReadinessOverrideModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  reasonRequired: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export function ReadinessOverrideModal({
  visible,
  title,
  message,
  confirmText,
  reasonRequired,
  loading = false,
  onClose,
  onSubmit,
}: ReadinessOverrideModalProps) {
  const { colors } = useTheme();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (visible) {
      setReason('');
      setError(undefined);
    }
  }, [visible]);

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (reasonRequired && !trimmed) {
      setError('请输入放行原因');
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <FullScreenModal
      visible={visible}
      title={title}
      confirmText={confirmText}
      loading={loading}
      disabled={loading}
      avoidKeyboard
      onClose={onClose}
      onConfirm={handleConfirm}
    >
      <View
        style={[
          styles.messageBox,
          {
            backgroundColor: colors.warningLight,
            borderColor: colors.warning,
          },
        ]}
      >
        <Text style={[styles.messageText, { color: colors.text }]}>{message}</Text>
      </View>

      <FormField
        label="放行原因"
        required={reasonRequired}
        value={reason}
        error={error}
        multiline
        numberOfLines={4}
        placeholder="填写缺料放行的业务原因"
        onChangeText={(value) => {
          setReason(value);
          if (error && value.trim()) {
            setError(undefined);
          }
        }}
      />
    </FullScreenModal>
  );
}

const styles = StyleSheet.create({
  messageBox: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xs,
    padding: Spacing.md,
  },
  messageText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
