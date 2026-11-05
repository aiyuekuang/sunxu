import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { CreateWarehouseDto } from '../../../types/models/CreateWarehouseDto';
import { UpdateWarehouseDto } from '../../../types/models/UpdateWarehouseDto';
import { WarehouseLocationControlMode } from '../../../types/models/WarehouseLocationControlMode';
import { WarehouseType } from '../../../types/models/WarehouseType';
import { warehouseLocationService } from '../../../host/services';
import { type Warehouse, warehouseService } from '../../../host/services';
import { userService } from '../../../host/services';
import type { SimpleUser } from '../../../host/api-types';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { confirmAlert } from '../../../../core/components/ConfirmAlert.ts';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { FormField } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { PickerField } from '../../../../core/components/PickerField.tsx';
import { modalConfirmText } from '../../../constants/button-labels';
import { hasVisibleFeature, OPERATION_FEATURE as F } from '../../../host/authorization';
import {
  WAREHOUSE_LOCATION_CONTROL_MODE_OPTIONS,
  WAREHOUSE_TYPE_OPTIONS,
} from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useActionRunner } from '../../../host/hooks/useActionRunner';
import { useTheme } from '../../../../core/theme/useTheme';
import { useAuthStore } from '../../../host/state/auth.store';
import { resolveWarehouseTypeOptionValue } from '../../../utils/warehouse-type';
import { toast } from '../../../../core/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WarehouseFormModalProps {
  visible: boolean;
  /** 编辑时传入已有仓库数据，新建时为 null */
  warehouse: Warehouse | null;
  onClose: () => void;
  onSuccess: () => void;
  /** 删除成功后的回调（与 onSuccess 分开，方便父组件做不同处理） */
  onDelete?: () => void;
}

interface FormState {
  name: string;
  type: WarehouseType;
  locationControlMode: WarehouseLocationControlMode;
  location: string;
  allowNegative: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WarehouseFormModal({
  visible,
  warehouse,
  onClose,
  onSuccess,
  onDelete,
}: WarehouseFormModalProps) {
  const { colors } = useTheme();
  const operationConfig = useAuthStore((state) => state.operationConfig);
  const locationFeatureEnabled = hasVisibleFeature(operationConfig, F.INVENTORY_LOCATION_CONTROL);
  const { running: deleting, run } = useActionRunner();
  const isEdit = warehouse !== null;
  const typeOptions = WAREHOUSE_TYPE_OPTIONS;

  const [form, setForm] = useState<FormState>({
    name: '',
    type: WarehouseType.GENERAL,
    locationControlMode: WarehouseLocationControlMode.NONE,
    location: '',
    allowNegative: false,
  });
  const [selectedManager, setSelectedManager] = useState<SimpleUser | null>(null);
  const [saving, setSaving] = useState(false);

  const parseWarehouseType = useCallback((value?: string | null): WarehouseType => {
    const normalized = value?.trim();
    if (!normalized) return WarehouseType.GENERAL;
    return Object.values(WarehouseType).includes(normalized as WarehouseType)
      ? (normalized as WarehouseType)
      : WarehouseType.GENERAL;
  }, []);

  const parseLocationControlMode = useCallback(
    (value?: string | null): WarehouseLocationControlMode => {
      const normalized = value?.trim();
      if (!normalized) return WarehouseLocationControlMode.NONE;
      return Object.values(WarehouseLocationControlMode).includes(
        normalized as WarehouseLocationControlMode,
      )
        ? (normalized as WarehouseLocationControlMode)
        : WarehouseLocationControlMode.NONE;
    },
    [],
  );

  const toCreateLocationControlMode = (
    value: WarehouseLocationControlMode,
  ): CreateWarehouseDto.locationControlMode => {
    switch (value) {
      case WarehouseLocationControlMode.OPTIONAL:
        return CreateWarehouseDto.locationControlMode.OPTIONAL;
      case WarehouseLocationControlMode.REQUIRED:
        return CreateWarehouseDto.locationControlMode.REQUIRED;
      default:
        return CreateWarehouseDto.locationControlMode.NONE;
    }
  };

  const toUpdateLocationControlMode = (
    value: WarehouseLocationControlMode,
  ): UpdateWarehouseDto.locationControlMode => {
    switch (value) {
      case WarehouseLocationControlMode.OPTIONAL:
        return UpdateWarehouseDto.locationControlMode.OPTIONAL;
      case WarehouseLocationControlMode.REQUIRED:
        return UpdateWarehouseDto.locationControlMode.REQUIRED;
      default:
        return UpdateWarehouseDto.locationControlMode.NONE;
    }
  };

  const fetchManagers = useCallback(
    async (params: { keyword?: string; page?: number; pageSize?: number }) => {
      const result = await userService.listForPicker(params);
      return {
        list: result.list.map((item) => ({
          id: item.id,
          username: item.username,
          realName: item.realName ?? null,
        })),
        total: result.total,
      };
    },
    [],
  );

  useEffect(() => {
    if (!visible) return;
    if (isEdit && warehouse) {
      setForm({
        name: warehouse.name,
        type: parseWarehouseType(
          resolveWarehouseTypeOptionValue(warehouse.type, typeOptions, WarehouseType.GENERAL),
        ),
        locationControlMode: parseLocationControlMode(warehouse.locationControlMode),
        location: warehouse.location ?? '',
        allowNegative: warehouse.allowNegative,
      });
      setSelectedManager(
        warehouse.manager
          ? {
              id: warehouse.manager.id,
              username: warehouse.manager.username,
              realName: warehouse.manager.realName ?? null,
            }
          : null,
      );
    } else {
      setForm({
        name: '',
        type: WarehouseType.GENERAL,
        locationControlMode: WarehouseLocationControlMode.NONE,
        location: '',
        allowNegative: false,
      });
      setSelectedManager(null);
    }
  }, [visible, warehouse, isEdit, parseLocationControlMode, parseWarehouseType]);

  const handleDelete = () => {
    if (!warehouse) return;
    confirmAlert(
      '确认删除',
      `确定要删除仓库「${warehouse.name}」吗？有非零库存的仓库无法删除。`,
      () =>
        run(
          () => warehouseService.deleteWarehouse(warehouse.id),
          '已删除',
          () => {
            onClose();
            onDelete ? onDelete() : onSuccess();
          },
        ),
      '删除',
      true,
    );
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('请输入仓库名称');
      return;
    }
    if (!form.type) {
      toast.error('请选择仓库类型');
      return;
    }
    if (
      locationFeatureEnabled &&
      !isEdit &&
      form.locationControlMode === WarehouseLocationControlMode.REQUIRED
    ) {
      toast.info('新建仓库不能直接启用必须仓位，请先维护仓位和库存分布后再切换');
      return;
    }
    setSaving(true);
    try {
      if (isEdit && warehouse) {
        if (
          locationFeatureEnabled &&
          form.locationControlMode === WarehouseLocationControlMode.REQUIRED &&
          warehouse.locationControlMode !== WarehouseLocationControlMode.REQUIRED
        ) {
          const check = await warehouseLocationService.enableRequiredCheck({
            warehouseId: warehouse.id,
          });
          if (check.blockers.length > 0) {
            toast.error(check.blockers.join('；'));
            return;
          }
          if (check.warnings.length > 0) {
            toast.info(check.warnings.join('；'));
          }
        }
        const payload: UpdateWarehouseDto = {
          id: warehouse.id,
          name: form.name,
          type: form.type,
          managerId: selectedManager?.id || undefined,
          location: form.location || undefined,
          allowNegative: form.allowNegative,
        };
        if (locationFeatureEnabled) {
          payload.locationControlMode = toUpdateLocationControlMode(form.locationControlMode);
        }
        await warehouseService.updateWarehouse(payload);
      } else {
        const payload: CreateWarehouseDto = {
          name: form.name,
          type: form.type,
          managerId: selectedManager?.id || undefined,
          location: form.location || undefined,
          allowNegative: form.allowNegative,
        };
        if (locationFeatureEnabled) {
          payload.locationControlMode = toCreateLocationControlMode(form.locationControlMode);
        }
        await warehouseService.createWarehouse(payload);
      }
      onSuccess();
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '保存仓库失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      title={isEdit ? '编辑' : '新增'}
      confirmText={modalConfirmText('仓库', isEdit)}
      onConfirm={handleSubmit}
      loading={saving}
      avoidKeyboard
    >
      <View style={styles.form}>
        <FormField
          label="仓库名称"
          required
          value={form.name}
          onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
          placeholder="请输入仓库名称"
        />

        <PickerField
          label="仓库类型"
          value={form.type}
          options={typeOptions}
          onChange={(v) => setForm((f) => ({ ...f, type: parseWarehouseType(v) }))}
          placeholder="请选择仓库类型"
          required
        />

        {locationFeatureEnabled ? (
          <PickerField
            label="仓位管控模式"
            value={form.locationControlMode}
            options={WAREHOUSE_LOCATION_CONTROL_MODE_OPTIONS}
            onChange={(v) =>
              setForm((f) => ({ ...f, locationControlMode: parseLocationControlMode(v) }))
            }
            placeholder="请选择仓位管控模式"
            required
          />
        ) : null}

        <EntityPickerField<SimpleUser>
          label="负责人"
          value={selectedManager}
          onChange={setSelectedManager}
          fetchFn={fetchManagers}
          keyExtractor={(u) => u.id}
          labelExtractor={(u) => u.realName || u.username}
          sublabelExtractor={(u) => (u.realName ? `@${u.username}` : '')}
          title="选择负责人"
          placeholder="选择负责人（可选）"
          clearable
          disabled={saving}
        />

        <FormField
          label="仓仓位置"
          value={form.location}
          onChangeText={(t) => setForm((f) => ({ ...f, location: t }))}
          placeholder="厂区/楼层/区域（可选）"
        />

        <View style={styles.switchRow}>
          <View>
            <Text style={[styles.switchLabel, { color: colors.text }]}>允许负库存</Text>
            <Text style={[styles.switchDesc, { color: colors.textSecondary }]}>
              开启后库存可低于零
            </Text>
          </View>
          <Switch
            value={form.allowNegative}
            onValueChange={(v) => setForm((f) => ({ ...f, allowNegative: v }))}
            trackColor={{ true: colors.primary }}
          />
        </View>

        {isEdit && (
          <TouchableOpacity
            style={[styles.deleteBtn, { borderColor: colors.error }]}
            onPress={handleDelete}
            disabled={deleting}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <Text style={[styles.deleteBtnText, { color: colors.error }]}>
              {deleting ? '删除中...' : '删除仓库'}
            </Text>
          </TouchableOpacity>
        )}
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  switchDesc: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.sm,
    marginTop: Spacing.sm,
  },
  deleteBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
});
