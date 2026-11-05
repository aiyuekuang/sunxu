import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { QualityTemplateListDto } from '../../../types/models/QualityTemplateListDto';
import { type Material, materialService } from '../../../host/services';
import {
  type QualityTemplate,
  qualityTemplateService,
} from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EntityPickerField } from '../../../../core/components/EntityPickerField.tsx';
import { MaterialPickerField } from '../../../components/common/MaterialPickerField.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';

export type InspectionTemplateBinding = {
  materialId?: string | null;
  /** 仅用于读取旧路线条件规则；新交互不会写入。 */
  routeApplicabilityId?: string;
  templateId: string;
};

type PendingBinding = {
  key: number;
  material?: Material;
  template?: QualityTemplate;
};

interface ProcessOperationInspectionTemplateBindingsFieldProps {
  value: InspectionTemplateBinding[];
  onChange: (value: InspectionTemplateBinding[]) => void;
  disabled?: boolean;
}

function isInspectionTemplateBinding(value: unknown): value is InspectionTemplateBinding {
  if (!value || typeof value !== 'object') return false;
  const binding = value as Record<string, unknown>;
  return typeof binding.templateId === 'string';
}

/**
 * 历史条件规则不在新界面编辑，但编辑默认模板或物料专属模板时必须原样带回，
 * 否则一次普通保存会错误删除原先按客户、订单等条件匹配的 IPQC 模板。
 */
export function preserveInspectionTemplateBindings(
  bindings: readonly unknown[] | undefined,
): InspectionTemplateBinding[] {
  const preserved: InspectionTemplateBinding[] = [];
  for (const binding of bindings ?? []) {
    if (!isInspectionTemplateBinding(binding)) continue;
    if (binding.routeApplicabilityId) {
      preserved.push({
        routeApplicabilityId: binding.routeApplicabilityId,
        templateId: binding.templateId,
      });
      continue;
    }
    preserved.push({
      materialId: binding.materialId ?? null,
      templateId: binding.templateId,
    });
  }
  return preserved;
}

/**
 * 新界面只编辑默认模板和单物料专属模板。后端会保留未迁移的路线条件规则，
 * 因此客户端不能把它们当作可编辑的默认规则重新提交。
 */
export function normalizeInspectionTemplateBindings(
  bindings: readonly unknown[] | undefined,
): InspectionTemplateBinding[] {
  const normalizedBindings = new Map<string, InspectionTemplateBinding>();
  for (const binding of preserveInspectionTemplateBindings(bindings)) {
    if (binding.routeApplicabilityId) continue;
    const materialId = typeof binding.materialId === 'string' ? binding.materialId : null;
    const key = materialId ?? '__default__';
    if (!normalizedBindings.has(key)) {
      normalizedBindings.set(key, {
        materialId,
        templateId: binding.templateId,
      });
    }
  }
  return [...normalizedBindings.values()];
}

export function hasDefaultInspectionTemplateBinding(
  bindings: readonly InspectionTemplateBinding[] | undefined,
): boolean {
  return (bindings ?? []).some(
    (binding) => !binding.materialId && !binding.routeApplicabilityId && !!binding.templateId,
  );
}

function formatTemplateLabel(template: QualityTemplate): string {
  return `${template.code} - ${template.name}`;
}

export function ProcessOperationInspectionTemplateBindingsField({
  value,
  onChange,
  disabled = false,
}: ProcessOperationInspectionTemplateBindingsFieldProps) {
  const { colors } = useTheme();
  const [templatesById, setTemplatesById] = useState<Map<string, QualityTemplate>>(new Map());
  const [materialsById, setMaterialsById] = useState<Map<string, Material>>(new Map());
  const [pendingBindings, setPendingBindings] = useState<PendingBinding[]>([]);
  const [nextPendingKey, setNextPendingKey] = useState(1);
  const bindings = useMemo(() => normalizeInspectionTemplateBindings(value), [value]);
  const legacyBindings = useMemo(
    () =>
      preserveInspectionTemplateBindings(value).filter((binding) => !!binding.routeApplicabilityId),
    [value],
  );
  const defaultBinding = bindings.find((binding) => !binding.materialId);
  const materialBindings = bindings.filter(
    (
      binding,
    ): binding is InspectionTemplateBinding & {
      materialId: string;
    } => !!binding.materialId,
  );
  const hasLegacyBindings = value.some((binding) => !!binding.routeApplicabilityId);

  const emitBindings = (next: InspectionTemplateBinding[]): void => {
    onChange([...legacyBindings, ...next]);
  };

  useEffect(() => {
    const missingTemplateIds = Array.from(
      new Set(
        bindings
          .map((binding) => binding.templateId)
          .filter((templateId) => !templatesById.has(templateId)),
      ),
    );
    if (missingTemplateIds.length === 0) return;

    let cancelled = false;
    void Promise.all(
      missingTemplateIds.map((templateId) => qualityTemplateService.detail(templateId)),
    ).then((templates) => {
      if (cancelled) return;
      setTemplatesById((current) => {
        const next = new Map(current);
        templates.forEach((template) => {
          next.set(template.id, template);
        });
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [bindings, templatesById]);

  useEffect(() => {
    const missingMaterialIds = Array.from(
      new Set(
        materialBindings
          .map((binding) => binding.materialId)
          .filter((materialId) => !materialsById.has(materialId)),
      ),
    );
    if (missingMaterialIds.length === 0) return;

    let cancelled = false;
    void Promise.all(
      missingMaterialIds.map((materialId) => materialService.detail(materialId)),
    ).then((materials) => {
      if (cancelled) return;
      setMaterialsById((current) => {
        const next = new Map(current);
        materials.forEach((material) => {
          next.set(material.id, material);
        });
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [materialBindings, materialsById]);

  const updateDefaultTemplate = (template: QualityTemplate | null): void => {
    const next: InspectionTemplateBinding[] = materialBindings.map(
      ({ materialId, templateId }) => ({ materialId, templateId }),
    );
    if (template) {
      next.unshift({ templateId: template.id });
      setTemplatesById((current) => new Map(current).set(template.id, template));
    }
    emitBindings(next);
  };

  const updateMaterialBinding = (currentMaterialId: string, material: Material | null): void => {
    if (!material || material.id === currentMaterialId) return;
    if (materialBindings.some((binding) => binding.materialId === material.id)) {
      toast.error('该物料已经配置了 IPQC 专属模板');
      return;
    }
    setMaterialsById((current) => new Map(current).set(material.id, material));
    emitBindings(
      bindings.map((binding) =>
        binding.materialId === currentMaterialId
          ? { materialId: material.id, templateId: binding.templateId }
          : binding,
      ),
    );
  };

  const updateMaterialTemplate = (materialId: string, template: QualityTemplate | null): void => {
    const next = bindings.filter((binding) => binding.materialId !== materialId);
    if (template) {
      next.push({ materialId, templateId: template.id });
      setTemplatesById((current) => new Map(current).set(template.id, template));
    }
    emitBindings(next);
  };

  const updatePendingBinding = (
    key: number,
    patch: Pick<PendingBinding, 'material' | 'template'>,
  ): void => {
    const next = pendingBindings.map((binding) =>
      binding.key === key ? { ...binding, ...patch } : binding,
    );
    const candidate = next.find((binding) => binding.key === key);
    if (!candidate?.material || !candidate.template) {
      setPendingBindings(next);
      return;
    }
    const selectedMaterial = candidate.material;
    const selectedTemplate = candidate.template;
    if (
      materialBindings.some((binding) => binding.materialId === selectedMaterial.id) ||
      next.some((binding) => binding.key !== key && binding.material?.id === selectedMaterial.id)
    ) {
      toast.error('该物料已经配置了 IPQC 专属模板');
      setPendingBindings(
        next.map((binding) =>
          binding.key === key ? { ...binding, material: undefined } : binding,
        ),
      );
      return;
    }
    setMaterialsById((current) => new Map(current).set(selectedMaterial.id, selectedMaterial));
    setTemplatesById((current) => new Map(current).set(selectedTemplate.id, selectedTemplate));
    emitBindings([
      ...bindings,
      { materialId: selectedMaterial.id, templateId: selectedTemplate.id },
    ]);
    setPendingBindings(next.filter((binding) => binding.key !== key));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>IPQC 模板</Text>
      <Text style={[styles.hint, { color: colors.textTertiary }]}>
        先选择默认模板；可为单个物料增加专属模板。工单创建时优先匹配物料专属模板，未命中时冻结默认模板。
      </Text>
      {disabled ? (
        <Text style={[styles.hint, { color: colors.warning }]}>
          当前工艺路线不可编辑，模板配置已锁定。
        </Text>
      ) : null}
      {hasLegacyBindings ? (
        <Text style={[styles.hint, { color: colors.warning }]}>
          检测到历史条件模板规则；系统会继续兼容，本次保存的默认模板和物料专属模板不会修改它们。
        </Text>
      ) : null}
      <EntityPickerField<QualityTemplate>
        label="默认 IPQC 模板"
        value={defaultBinding ? (templatesById.get(defaultBinding.templateId) ?? null) : null}
        onChange={updateDefaultTemplate}
        fetchFn={(params) =>
          qualityTemplateService.list({
            ...params,
            type: QualityTemplateListDto.type.IPQC,
            isActive: true,
          })
        }
        keyExtractor={(template) => template.id}
        labelExtractor={formatTemplateLabel}
        title="选择默认 IPQC 模板"
        placeholder="请选择默认 IPQC 模板"
        required
        clearable={false}
        disabled={disabled}
      />

      {materialBindings.map((binding) => (
        <View
          key={binding.materialId}
          style={[styles.materialRule, { borderColor: colors.border }]}
        >
          <MaterialPickerField<Material>
            label="适配物料"
            value={materialsById.get(binding.materialId) ?? null}
            onChange={(material) => updateMaterialBinding(binding.materialId, material)}
            fetchFn={(params) => materialService.list({ ...params, isActive: true })}
            keyExtractor={(material) => material.id}
            labelExtractor={(material) => material.name}
            title="选择适配物料"
            placeholder="请选择适配物料"
            clearable={false}
            disabled={disabled}
          />
          <EntityPickerField<QualityTemplate>
            label="IPQC 模板"
            value={templatesById.get(binding.templateId) ?? null}
            onChange={(template) => updateMaterialTemplate(binding.materialId, template)}
            fetchFn={(params) =>
              qualityTemplateService.list({
                ...params,
                type: QualityTemplateListDto.type.IPQC,
                isActive: true,
              })
            }
            keyExtractor={(template) => template.id}
            labelExtractor={formatTemplateLabel}
            title="选择 IPQC 模板"
            placeholder="请选择 IPQC 模板"
            disabled={disabled}
          />
          <TouchableOpacity
            disabled={disabled}
            style={[
              styles.removeButton,
              { borderColor: colors.error, opacity: disabled ? 0.5 : 1 },
            ]}
            onPress={() =>
              emitBindings(bindings.filter((item) => item.materialId !== binding.materialId))
            }
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <Text style={[styles.removeText, { color: colors.error }]}>删除该物料规则</Text>
          </TouchableOpacity>
        </View>
      ))}

      {pendingBindings.map((binding) => (
        <View key={binding.key} style={[styles.materialRule, { borderColor: colors.border }]}>
          <MaterialPickerField<Material>
            label="适配物料"
            value={binding.material ?? null}
            onChange={(material) =>
              updatePendingBinding(binding.key, { material: material ?? undefined })
            }
            fetchFn={(params) => materialService.list({ ...params, isActive: true })}
            keyExtractor={(material) => material.id}
            labelExtractor={(material) => material.name}
            title="选择适配物料"
            placeholder="请选择适配物料"
            disabled={disabled}
          />
          <EntityPickerField<QualityTemplate>
            label="IPQC 模板"
            value={binding.template ?? null}
            onChange={(template) =>
              updatePendingBinding(binding.key, { template: template ?? undefined })
            }
            fetchFn={(params) =>
              qualityTemplateService.list({
                ...params,
                type: QualityTemplateListDto.type.IPQC,
                isActive: true,
              })
            }
            keyExtractor={(template) => template.id}
            labelExtractor={formatTemplateLabel}
            title="选择 IPQC 模板"
            placeholder="请选择 IPQC 模板"
            disabled={disabled}
          />
          <TouchableOpacity
            disabled={disabled}
            style={[
              styles.removeButton,
              { borderColor: colors.error, opacity: disabled ? 0.5 : 1 },
            ]}
            onPress={() =>
              setPendingBindings((current) => current.filter((item) => item.key !== binding.key))
            }
          >
            <Ionicons name="close-outline" size={16} color={colors.error} />
            <Text style={[styles.removeText, { color: colors.error }]}>取消新增</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        disabled={disabled}
        style={[styles.addButton, { borderColor: colors.primary, opacity: disabled ? 0.5 : 1 }]}
        onPress={() => {
          setPendingBindings((current) => [...current, { key: nextPendingKey }]);
          setNextPendingKey((current) => current + 1);
        }}
      >
        <Ionicons name="add" size={18} color={colors.primary} />
        <Text style={[styles.addText, { color: colors.primary }]}>新增物料专属模板</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  title: { fontSize: FontSize.base, fontWeight: '600' },
  hint: { fontSize: FontSize.sm, lineHeight: 20 },
  materialRule: {
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: Radius.sm,
  },
  addText: { fontSize: FontSize.sm, fontWeight: '600' },
  removeButton: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  removeText: { fontSize: FontSize.sm },
});
