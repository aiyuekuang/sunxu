import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { type ProcessRoute, processRouteService } from '../../../host/services';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { modalConfirmText } from '../../../constants/button-labels';
import { Spacing } from '../../../../core/theme/tokens';
import { toast } from '../../../../core/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProcessRouteFormModalProps {
  visible: boolean;
  /** 编辑时传入已有数据，新建时为 null */
  route: ProcessRoute | null;
  /** 兼容物料详情页旧跳转参数；物料关联统一在路线详情中维护 */
  initialMaterial?: { id: string; code: string; name: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormState {
  name: string;
  description: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProcessRouteFormModal({
  visible,
  route,
  onClose,
  onSuccess,
}: ProcessRouteFormModalProps) {
  const isEdit = route !== null;
  const [canEditRouteIdentity, setCanEditRouteIdentity] = useState(false);
  const [isEditableDraft, setIsEditableDraft] = useState(!isEdit);

  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setCanEditRouteIdentity(false);
    setIsEditableDraft(!isEdit);
    if (isEdit && route) {
      setForm({
        name: route.name,
        description: route.description ?? '',
      });
      void (async () => {
        try {
          const versions = await processRouteService.versions({
            routeId: route.id,
            page: 1,
            pageSize: 100,
          });
          const currentVersion = versions.list.find((item) => item.routeId === route.id);
          const editableDraft = currentVersion?.status === 'draft';
          setIsEditableDraft(editableDraft);
          if (!editableDraft) {
            toast.error('当前版本不可直接编辑，请先从详情进入草稿版本');
            onClose();
            return;
          }
          setCanEditRouteIdentity(
            editableDraft &&
              route.version === 'V1' &&
              (!currentVersion ||
                (currentVersion.status === 'draft' &&
                  !currentVersion.sourceVersionId &&
                  !currentVersion.effectiveFrom &&
                  !currentVersion.activatedAt &&
                  !currentVersion.isCurrent)),
          );
        } catch {
          setIsEditableDraft(false);
          setCanEditRouteIdentity(false);
          toast.error('版本信息加载失败，路线名称暂不可编辑');
        }
      })();
    } else {
      setForm({ name: '', description: '' });
    }
  }, [visible, route, isEdit, onClose]);

  const handleSubmit = async () => {
    if (isEdit && !isEditableDraft) {
      toast.error('当前版本不可直接编辑，请先从详情进入草稿版本');
      return;
    }
    if ((!isEdit || canEditRouteIdentity) && !form.name.trim()) {
      toast.error('请输入路线名称');
      return;
    }
    setSaving(true);
    try {
      if (isEdit && route) {
        await processRouteService.update({
          id: route.id,
          ...(canEditRouteIdentity ? { name: form.name.trim() } : {}),
          description: form.description,
        });
      } else {
        await processRouteService.create({
          name: form.name,
          description: form.description || undefined,
        });
      }
      onSuccess();
      onClose();
    } catch (e: unknown) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      title={isEdit ? '编辑' : '新增'}
      confirmText={!isEdit || isEditableDraft ? modalConfirmText('工艺路线', isEdit) : undefined}
      onConfirm={handleSubmit}
      loading={saving}
      avoidKeyboard
    >
      <View style={styles.form}>
        {isEdit && canEditRouteIdentity && (
          <>
            <FormField
              label="路线名称"
              required
              value={form.name}
              onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
              placeholder="请输入路线名称"
            />
            <FormField label="版本号" value={route.version || '-'} editable={false} />
          </>
        )}

        {isEdit && !canEditRouteIdentity && (
          <>
            <FormField label="路线名称" value={form.name} editable={false} />
            <FormField label="版本号" value={route.version || '-'} editable={false} />
          </>
        )}

        {!isEdit && (
          <FormField
            label="路线名称"
            required
            value={form.name}
            onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
            placeholder="请输入路线名称"
          />
        )}

        <FormField
          label="描述"
          value={form.description}
          onChangeText={(t) => setForm((f) => ({ ...f, description: t }))}
          placeholder="可选"
          editable={!isEdit || isEditableDraft}
          multiline
          numberOfLines={3}
        />
      </View>
    </FullScreenModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  form: {
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
