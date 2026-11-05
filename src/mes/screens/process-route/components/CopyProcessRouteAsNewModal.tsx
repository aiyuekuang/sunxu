import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { type ProcessRoute, processRouteService } from '../../../host/services';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { Spacing } from '../../../../core/theme/tokens';
import { toast } from '../../../../core/toast';

interface CopyProcessRouteAsNewModalProps {
  visible: boolean;
  route: ProcessRoute | null;
  onClose: () => void;
  onSuccess: (routeId: string) => void;
}

interface FormState {
  name: string;
  description: string;
}

export function CopyProcessRouteAsNewModal({
  visible,
  route,
  onClose,
  onSuccess,
}: CopyProcessRouteAsNewModalProps) {
  const [form, setForm] = useState<FormState>({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible || !route) return;
    setForm({
      name: `${route.name} 副本`,
      description: route.description ?? '',
    });
  }, [visible, route]);

  const handleSubmit = async () => {
    if (!route) return;
    const name = form.name.trim();
    if (!name) {
      toast.error('请输入路线名称');
      return;
    }
    setSaving(true);
    try {
      const copied = await processRouteService.copyAsNew({
        sourceId: route.id,
        name,
        description: form.description.trim() || null,
      });
      toast.success('已复制为新路线，请确认适用规则');
      onSuccess(copied.id);
      onClose();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '复制失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      title="复制为新路线"
      confirmText="复制"
      onConfirm={handleSubmit}
      loading={saving}
      avoidKeyboard
    >
      <View style={styles.form}>
        <FormField
          label="路线名称"
          required
          value={form.name}
          onChangeText={(name) => setForm((prev) => ({ ...prev, name }))}
          placeholder="请输入路线名称"
        />
        <FormField
          label="描述"
          value={form.description}
          onChangeText={(description) => setForm((prev) => ({ ...prev, description }))}
          placeholder="可选"
          multiline
          numberOfLines={3}
        />
      </View>
    </FullScreenModal>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.md,
  },
});
