import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  type CreateMaterialCategoryDto,
  type MaterialCategoryTreeNode,
  materialCategoryService,
} from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FormField, FormSwitch } from '../../../../core/components/FormField.tsx';
import { FullScreenModal } from '../../../../core/components/FullScreenModal.tsx';
import { type PickerOption, PickerField } from '../../../../core/components/PickerField.tsx';
import { QuickNumInput } from '../../../../core/components/QuickNumInput.tsx';
import { modalConfirmText, modalTitle } from '../../../constants/button-labels';
import { FontSize, Spacing } from '../../../../core/theme/tokens';
import { clearDictCache } from '../../../host/hooks/useDict';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';

interface MaterialCategoryFormSheetProps {
  visible: boolean;
  item?: MaterialCategoryTreeNode;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORY_CODE_REGEX = /^[a-z0-9_]+$/;

function findNodeById(
  nodes: MaterialCategoryTreeNode[],
  targetId?: string | null,
): MaterialCategoryTreeNode | undefined {
  if (!targetId) return undefined;
  for (const node of nodes) {
    if (node.id === targetId) {
      return node;
    }
    const nested = findNodeById(node.children, targetId);
    if (nested) {
      return nested;
    }
  }
  return undefined;
}

function findSystemRootByBaseType(
  nodes: MaterialCategoryTreeNode[],
  baseType?: MaterialCategoryTreeNode['baseType'],
): MaterialCategoryTreeNode | undefined {
  if (!baseType) return undefined;
  return nodes.find((node) => node.isSystem && node.baseType === baseType);
}

export function MaterialCategoryFormSheet({
  visible,
  item,
  onClose,
  onSuccess,
}: MaterialCategoryFormSheetProps) {
  const { colors } = useTheme();
  const isEdit = !!item;
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [parentId, setParentId] = useState('');
  const [sort, setSort] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parentTree, setParentTree] = useState<MaterialCategoryTreeNode[]>([]);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    setName(item?.name ?? '');
    setCode(item?.code ?? '');
    setParentId(item?.parentId ?? '');
    setSort(String(item?.sort ?? 0));
    setIsActive(item?.isActive ?? true);

    materialCategoryService
      .tree({ includeInactive: true })
      .then((tree) => {
        if (cancelled) return;
        setParentTree(tree);
        const currentParent = findNodeById(tree, item?.parentId);
        const fallbackRoot =
          currentParent?.isSystem === true
            ? currentParent
            : findSystemRootByBaseType(tree, item?.baseType);
        setParentId(fallbackRoot?.id ?? item?.parentId ?? '');
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : '加载分类树失败');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [visible, item]);

  const systemRootOptions = useMemo<PickerOption[]>(
    () =>
      parentTree
        .filter((node) => node.isSystem)
        .map((node) => ({
          label: node.name,
          value: node.id,
        })),
    [parentTree],
  );

  const handleSave = async () => {
    const normalizedName = name.trim();
    const normalizedCode = code.trim();
    const normalizedSort = sort.trim();
    const parsedSort = normalizedSort ? Number(normalizedSort) : 0;

    if (!normalizedName) {
      toast.info('请输入分类名称');
      return;
    }
    if (!normalizedCode) {
      toast.info('请输入分类编码');
      return;
    }
    if (!CATEGORY_CODE_REGEX.test(normalizedCode)) {
      toast.info('分类编码仅支持小写字母、数字和下划线');
      return;
    }
    if (!parentId) {
      toast.info('请选择系统根分类');
      return;
    }
    if (Number.isNaN(parsedSort) || parsedSort < 0 || !Number.isInteger(parsedSort)) {
      toast.info('排序必须是大于等于 0 的整数');
      return;
    }

    const payload: CreateMaterialCategoryDto = {
      name: normalizedName,
      code: normalizedCode,
      parentId,
      sort: parsedSort,
      isActive,
    };

    setSaving(true);
    try {
      if (item) {
        await materialCategoryService.update({
          id: item.id,
          ...payload,
        });
      } else {
        await materialCategoryService.create(payload);
      }

      clearDictCache('material_type');
      clearDictCache('material_category');
      toast.success(isEdit ? '物料分类已更新' : '物料分类已创建');
      onSuccess();
      onClose();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FullScreenModal
      visible={visible}
      onClose={onClose}
      title={modalTitle('物料分类', isEdit)}
      confirmText={modalConfirmText('物料分类', isEdit)}
      onConfirm={handleSave}
      loading={saving}
      avoidKeyboard
    >
      <View style={styles.form}>
        <FormField
          label="分类名称"
          required
          value={name}
          onChangeText={setName}
          placeholder="如：白卡纸、UV油墨"
        />

        <FormField
          label="分类编码"
          required
          value={code}
          onChangeText={setCode}
          placeholder="如：paper_board、uv_ink"
          autoCapitalize="none"
          help={{
            purpose: '编码必须使用小写英文字母、数字和下划线。',
            example: 'paper_board、uv_ink、package_box',
          }}
        />

        <PickerField
          label="所属系统分类"
          required
          value={parentId || undefined}
          options={systemRootOptions}
          onChange={setParentId}
          placeholder="请选择系统根分类"
          searchable={false}
          help={{
            purpose: '业务分类只能直接归属系统根分类，不支持继续挂在其他业务分类下。',
          }}
        />
        {isEdit ? (
          <Text style={[styles.impactHint, { color: colors.warning }]}>
            修改分类名称、编码、层级或启用状态，会影响该分类下物料的展示。
          </Text>
        ) : null}

        <QuickNumInput
          label="排序"
          value={sort}
          onChangeText={setSort}
          placeholder="0"
          min={0}
          step={1}
        />

        <FormSwitch label="启用状态" value={isActive} onValueChange={setIsActive} />
      </View>
    </FullScreenModal>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.sm,
  },
  impactHint: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
});
