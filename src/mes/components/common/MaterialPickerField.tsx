import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { Material } from '../../host/services';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { FontSize, Radius, Spacing } from '../../../core/theme/tokens';
import { useTheme } from '../../../core/theme/useTheme';
import { materialCategoryService } from '../../host/services';
import { EntityPickerField, type EntityPickerFieldProps } from '../../../core/components/EntityPickerField.tsx';
import {
  EntityFilterChip,
  type EntityFilterChipProps,
  ManagedEntityFilterChip,
  type ManagedEntityFilterChipProps,
} from '../../../core/components/EntityFilterChip.tsx';

export type MaterialPickerEntity = Partial<
  Pick<Material, 'code' | 'name' | 'spec' | 'thumbnailUrl' | 'primaryImageUrl'>
>;

export type MaterialPickerFieldProps<T> = Omit<
  EntityPickerFieldProps<T>,
  'categoryFetchFn' | 'renderLeading' | 'renderDetails'
> & {
  /** 业务选项包装了物料时，指定物料对象的提取方式。默认兼容 item.material 和物料本身。 */
  materialExtractor?: (item: T) => MaterialPickerEntity | null | undefined;
  renderLeading?: (item: T) => React.ReactNode;
  renderDetails?: (item: T) => React.ReactNode;
};

function asMaterialPickerEntity(value: unknown): MaterialPickerEntity | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const hasMaterialFields = ['code', 'name', 'spec', 'thumbnailUrl', 'primaryImageUrl'].some(
    (key) => typeof record[key] === 'string',
  );
  if (!hasMaterialFields) return null;
  return {
    code: typeof record.code === 'string' ? record.code : undefined,
    name: typeof record.name === 'string' ? record.name : undefined,
    spec: typeof record.spec === 'string' ? record.spec : undefined,
    thumbnailUrl: typeof record.thumbnailUrl === 'string' ? record.thumbnailUrl : undefined,
    primaryImageUrl:
      typeof record.primaryImageUrl === 'string' ? record.primaryImageUrl : undefined,
  };
}

export function resolveMaterialPickerEntity<T>(
  item: T,
  extractor?: (item: T) => MaterialPickerEntity | null | undefined,
): MaterialPickerEntity | null {
  if (extractor) return extractor(item) ?? null;
  const record = item && typeof item === 'object' ? (item as Record<string, unknown>) : null;
  return asMaterialPickerEntity(record?.material) ?? asMaterialPickerEntity(item);
}

function getDistinctContext(context: string | undefined, material: MaterialPickerEntity): string[] {
  const code = material.code?.trim();
  const spec = material.spec?.trim();
  return (context ?? '')
    .split(/\s*(?:\/|·|｜)\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const normalized = part
        .replace(/^(?:(?:物料)?(?:编码|规格|code|spec)|物料)\s*[:：]\s*/i, '')
        .trim();
      return normalized !== code && normalized !== spec;
    });
}

export function MaterialPickerDetails({
  material,
  context,
}: {
  material: MaterialPickerEntity;
  context?: string;
}) {
  const { colors } = useTheme();
  const code = material.code?.trim();
  const spec = material.spec?.trim();
  const extra = getDistinctContext(context, material).join(' · ');

  return (
    <View style={styles.details}>
      {code ? (
        <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
          {code}
        </Text>
      ) : null}
      {spec ? (
        <Text style={[styles.detailText, { color: colors.textTertiary }]} numberOfLines={1}>
          规格：{spec}
        </Text>
      ) : null}
      {extra ? (
        <Text style={[styles.detailText, { color: colors.textTertiary }]} numberOfLines={1}>
          {extra}
        </Text>
      ) : null}
    </View>
  );
}

export function MaterialPickerThumbnail({ material }: { material: MaterialPickerEntity }) {
  const { colors } = useTheme();
  const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageUrl = material.thumbnailUrl?.trim() || material.primaryImageUrl?.trim() || null;
  const showPlaceholder = !imageUrl || loadedImageUrl !== imageUrl || failedImageUrl === imageUrl;

  return (
    <View style={[styles.thumbnail, { backgroundColor: colors.background }]}>
      {showPlaceholder ? (
        <Ionicons name="image-outline" size={FontSize.xl} color={colors.textMuted} />
      ) : null}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.thumbnailImage}
          resizeMode="contain"
          onLoad={() => setLoadedImageUrl(imageUrl)}
          onError={() => setFailedImageUrl(imageUrl)}
          accessible={false}
        />
      ) : null}
    </View>
  );
}

/** 物料档案选择器：统一图片、编码、规格展示，并将分类作为搜索旁的快捷筛选。 */
export function MaterialPickerField<T>({
  materialExtractor,
  renderLeading,
  renderDetails,
  sublabelExtractor,
  ...props
}: MaterialPickerFieldProps<T>) {
  const resolveEntity = (item: T) => resolveMaterialPickerEntity(item, materialExtractor);

  return (
    <EntityPickerField<T>
      {...props}
      sublabelExtractor={sublabelExtractor}
      renderLeading={
        renderLeading ??
        ((item) => {
          const material = resolveEntity(item);
          return material ? <MaterialPickerThumbnail material={material} /> : null;
        })
      }
      renderDetails={
        renderDetails ??
        ((item) => {
          const material = resolveEntity(item);
          return material ? (
            <MaterialPickerDetails material={material} context={sublabelExtractor?.(item)} />
          ) : null;
        })
      }
      categoryFetchFn={materialCategoryService.selectable}
    />
  );
}

export type ManagedMaterialFilterChipProps = Omit<
  ManagedEntityFilterChipProps<Material>,
  'categoryFetchFn' | 'renderLeading' | 'renderDetails'
>;

/** 物料列表筛选器：与表单物料选择共用图片、规格和分类快捷筛选。 */
export function ManagedMaterialFilterChip(props: ManagedMaterialFilterChipProps) {
  return (
    <ManagedEntityFilterChip<Material>
      {...props}
      categoryFetchFn={materialCategoryService.selectable}
      renderLeading={(material) => <MaterialPickerThumbnail material={material} />}
      renderDetails={(material) => (
        <MaterialPickerDetails material={material} context={props.sublabelExtractor?.(material)} />
      )}
    />
  );
}

export type MaterialFilterChipProps = Omit<
  EntityFilterChipProps<Material>,
  'categoryFetchFn' | 'renderLeading' | 'renderDetails'
>;

/** 受控物料筛选器：与表单物料选择共用图片、规格和分类快捷筛选。 */
export function MaterialFilterChip(props: MaterialFilterChipProps) {
  return (
    <EntityFilterChip<Material>
      {...props}
      categoryFetchFn={materialCategoryService.selectable}
      renderLeading={(material) => <MaterialPickerThumbnail material={material} />}
      renderDetails={(material) => (
        <MaterialPickerDetails material={material} context={props.sublabelExtractor?.(material)} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  details: { gap: 2 },
  detailText: { fontSize: FontSize.xs, lineHeight: FontSize.xs + 4 },
  thumbnail: {
    width: Spacing['4xl'] + Spacing.sm,
    height: Spacing['4xl'] + Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    ...StyleSheet.absoluteFillObject,
  },
});
