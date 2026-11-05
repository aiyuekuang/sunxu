import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import type { CustomFieldDefinition } from '../../../host/services';
import type { Material } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { ListCard } from '../../../../core/components/ListCard.tsx';
import {
  CUSTOM_FIELD_COMPUTE_ERROR_TEXT,
  formatCustomFieldDisplay,
  readCustomFieldValueCarrier,
  resolveCustomFieldValue,
} from '../../../components/custom-fields/formatCustomFieldValue.ts';
import { MATERIAL_BASE_TYPE_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatUnitLabel, type UnitLabelMap } from '../../../utils/qty-unit';

interface MaterialListCardProps {
  item: Material;
  customFields: CustomFieldDefinition[];
  unitLabelMap: UnitLabelMap;
  onPress: (id: string) => void;
  onImagePress: (url: string) => void;
}

const MATERIAL_THUMBNAIL_SIZE = Spacing['4xl'] + Spacing.sm;

function hasBusinessCategory(
  material: Pick<Material, 'baseType' | 'type' | 'categoryId' | 'materialCategory'>,
): boolean {
  if (material.materialCategory) {
    return material.materialCategory.isSystem === false;
  }
  return Boolean(
    material.baseType &&
    material.categoryId &&
    material.type &&
    material.type !== material.baseType,
  );
}

function getBusinessCategoryName(
  material: Pick<Material, 'baseType' | 'type' | 'categoryId' | 'category' | 'materialCategory'>,
): string {
  if (material.materialCategory?.isSystem === false) {
    return material.materialCategory.name;
  }
  return material.category ?? '未配置业务分类';
}

function buildCustomFieldsLine(material: Material, fields: CustomFieldDefinition[]): string {
  const carrier = readCustomFieldValueCarrier(material);
  return fields
    .map((field) => {
      if (carrier.customComputedErrors?.[field.fieldKey]) {
        return `${field.label}: ${CUSTOM_FIELD_COMPUTE_ERROR_TEXT}`;
      }
      const value = formatCustomFieldDisplay(resolveCustomFieldValue(carrier, field), field);
      return value ? `${field.label}: ${value}` : null;
    })
    .filter((value): value is string => value !== null)
    .join(' · ');
}

export const MaterialListCard = React.memo(function MaterialListCard({
  item,
  customFields,
  unitLabelMap,
  onPress,
  onImagePress,
}: MaterialListCardProps) {
  const { colors } = useTheme();
  const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null);

  const imageUrl = item.thumbnailUrl?.trim() || item.primaryImageUrl?.trim() || null;
  const spec = item.spec?.trim() || null;
  const categoryName = hasBusinessCategory(item) ? getBusinessCategoryName(item) : null;
  const unit = formatUnitLabel(item.unit, unitLabelMap) || '-';
  const customFieldsLine = customFields.length > 0 ? buildCustomFieldsLine(item, customFields) : '';
  const accessibilityLabel = [
    item.name,
    `编码 ${item.code}`,
    `规格 ${spec ?? '无规格'}`,
    categoryName ? `分类 ${categoryName}` : null,
    `单位 ${unit}`,
  ]
    .filter((value): value is string => Boolean(value))
    .join('，');

  return (
    <ListCard
      onPress={() => onPress(item.id)}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="查看物料档案"
    >
      <View style={styles.row}>
        <View style={[styles.thumbnail, { backgroundColor: colors.background }]}>
          {(!imageUrl || loadedImageUrl !== imageUrl) && (
            <Ionicons name="image-outline" size={FontSize.xl} color={colors.textMuted} />
          )}
          {imageUrl ? (
            <Pressable
              style={styles.thumbnailImageButton}
              onPress={(event) => {
                event.stopPropagation();
                onImagePress(imageUrl);
              }}
              accessibilityRole="button"
              accessibilityLabel={`查看物料图片：${item.name}`}
              accessibilityHint="打开图片预览，不进入物料详情"
            >
              <Image
                source={{ uri: imageUrl }}
                style={styles.thumbnailImage}
                resizeMode="contain"
                onLoad={() => setLoadedImageUrl(imageUrl)}
                accessible={false}
              />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.details}>
          <ListCard.Header>
            <Text style={[styles.code, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.code}
            </Text>
            {item.baseType ? (
              <ConfigBadge value={item.baseType} config={MATERIAL_BASE_TYPE_CONFIG} />
            ) : null}
          </ListCard.Header>
          <ListCard.Title>{item.name}</ListCard.Title>
          <ListCard.Subtitle numberOfLines={2}>规格：{spec ?? '无规格'}</ListCard.Subtitle>
          <ListCard.Meta style={styles.meta}>
            {categoryName ? <ListCard.MetaText>分类：{categoryName}</ListCard.MetaText> : null}
            <ListCard.MetaText>单位：{unit}</ListCard.MetaText>
          </ListCard.Meta>
          {customFieldsLine ? (
            <Text style={[styles.customFieldsLine, { color: colors.textMuted }]} numberOfLines={1}>
              {customFieldsLine}
            </Text>
          ) : null}
        </View>
      </View>
    </ListCard>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  thumbnail: {
    width: MATERIAL_THUMBNAIL_SIZE,
    height: MATERIAL_THUMBNAIL_SIZE,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    ...StyleSheet.absoluteFillObject,
  },
  thumbnailImageButton: {
    ...StyleSheet.absoluteFillObject,
  },
  details: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.xs,
  },
  code: {
    flexShrink: 1,
    fontSize: FontSize.xs,
  },
  meta: {
    justifyContent: 'flex-start',
  },
  customFieldsLine: {
    fontSize: FontSize.xs,
    lineHeight: Spacing.base,
  },
});
