import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  equipmentMaintenanceTemplateService,
  type EquipmentMaintenanceTemplate,
} from '../../../host/services';
import type { MaintenanceGenerationMode } from '../../../types/models/MaintenanceGenerationMode';
import { equipmentService } from '../../../host/services';
import { userService } from '../../../host/services';
import type { SimpleUser } from '../../../host/api-types';
import { DatePickerField } from '../../../../core/components/DatePickerField.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { PickerField } from '../../../../core/components/PickerField.tsx';
import { Spacing } from '../../../../core/theme/tokens';
import { toast } from '../../../../core/toast';
import { MAINTENANCE_GENERATION_MODE_OPTIONS } from '../maintenance.constants';
import { useDict } from '../../../host/hooks/useDict';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreateMaintenanceSheetProps {
  visible: boolean;
  equipmentId: string;
  equipmentType?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateMaintenanceSheet({
  visible,
  equipmentId,
  equipmentType,
  onClose,
  onSuccess,
}: CreateMaintenanceSheetProps) {
  const { options: maintTypeOptions } = useDict('maintenance_type');
  const [saving, setSaving] = useState(false);
  const [maintDate, setMaintDate] = useState('');
  const [maintType, setMaintType] = useState('');
  const [maintDesc, setMaintDesc] = useState('');
  const [maintTemplate, setMaintTemplate] = useState<EquipmentMaintenanceTemplate | null>(null);
  const [maintAssignee, setMaintAssignee] = useState<SimpleUser | null>(null);
  const [maintGenerationMode, setMaintGenerationMode] = useState<MaintenanceGenerationMode | ''>(
    '',
  );
  const [maintIntervalDays, setMaintIntervalDays] = useState('');

  const fetchUsers = useCallback(
    async (p: { page: number; pageSize: number; keyword?: string }) => {
      const list = await userService.simpleList(p.keyword || undefined);
      return { list: list as SimpleUser[], total: list.length };
    },
    [],
  );

  const resetForm = () => {
    setMaintDate('');
    setMaintType('');
    setMaintDesc('');
    setMaintTemplate(null);
    setMaintAssignee(null);
    setMaintGenerationMode('');
    setMaintIntervalDays('');
  };

  const handleSubmit = async () => {
    if (!maintDate) {
      toast.error('请填写计划日期');
      return;
    }
    if (maintGenerationMode && !maintIntervalDays) {
      toast.error('请选择重复方式后需填写间隔天数');
      return;
    }
    setSaving(true);
    try {
      const intervalNum = parseInt(maintIntervalDays, 10);
      await equipmentService.createMaintenance({
        equipmentId,
        plannedDate: maintDate,
        maintenanceTemplateId: maintTemplate?.id || undefined,
        type: maintType || undefined,
        description: maintDesc || undefined,
        assigneeId: maintAssignee?.id || undefined,
        generationMode: maintGenerationMode || undefined,
        intervalDays:
          maintGenerationMode && !Number.isNaN(intervalNum) && maintIntervalDays
            ? intervalNum
            : undefined,
      });
      resetForm();
      onSuccess();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '创建保养失败');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <FullScreenModal
      visible={visible}
      onClose={handleClose}
      title="新增"
      confirmText="提交"
      onConfirm={handleSubmit}
      loading={saving}
      avoidKeyboard
    >
      <View style={styles.body}>
        <DatePickerField label="计划日期" value={maintDate} onChange={setMaintDate} required />
        <EntityPickerField<EquipmentMaintenanceTemplate>
          label="保养模板（可选）"
          value={maintTemplate}
          onChange={(item) => {
            setMaintTemplate(item);
            if (!item) return;
            if (!maintType && item.type) {
              setMaintType(item.type);
            }
            if (!maintDesc && item.description) {
              setMaintDesc(item.description);
            }
          }}
          fetchFn={(p) =>
            equipmentMaintenanceTemplateService.list({
              page: p.page,
              pageSize: p.pageSize,
              keyword: p.keyword,
              isActive: true,
              equipmentTypes: equipmentType ? [equipmentType] : undefined,
            })
          }
          keyExtractor={(item) => item.id}
          labelExtractor={(item) => item.name}
          sublabelExtractor={(item) => `${item.code} · ${item.steps?.length ?? 0} 步`}
          placeholder={equipmentType ? '选择当前设备类型可用的标准保养模板' : '选择标准保养模板'}
          clearable
        />
        <PickerField
          label="维保类型"
          value={maintType}
          options={maintTypeOptions}
          onChange={setMaintType}
          placeholder="请选择维保类型"
        />
        <EntityPickerField<SimpleUser>
          label="执行人（可选）"
          value={maintAssignee}
          onChange={setMaintAssignee}
          fetchFn={fetchUsers}
          keyExtractor={(u) => u.id}
          labelExtractor={(u) => u.realName || u.username}
          sublabelExtractor={(u) => (u.realName ? `@${u.username}` : '')}
          placeholder="选择执行人"
          clearable
        />
        <PickerField
          label="重复方式（可选）"
          value={maintGenerationMode}
          options={MAINTENANCE_GENERATION_MODE_OPTIONS}
          onChange={(value) => setMaintGenerationMode(value as MaintenanceGenerationMode | '')}
          placeholder="请选择重复方式"
          clearable
        />
        {maintGenerationMode ? (
          <FormField
            label="间隔天数"
            value={maintIntervalDays}
            onChangeText={setMaintIntervalDays}
            placeholder="如：7 / 30 / 90"
            keyboardType="numeric"
          />
        ) : null}
        <FormField
          label="保养内容说明（可选）"
          value={maintDesc}
          onChangeText={setMaintDesc}
          placeholder="例：定期更换润滑油..."
          multiline
          numberOfLines={3}
        />
      </View>
    </FullScreenModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  body: { gap: Spacing.sm },
});
