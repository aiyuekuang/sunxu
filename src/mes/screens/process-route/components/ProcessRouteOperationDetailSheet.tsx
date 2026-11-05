import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { PostGapTimeMode } from '../../../types/models/PostGapTimeMode';
import type { ProcessOperation } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { InfoRow } from '../../../../core/components/DetailCard.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useAmountDisplay } from '../../../host/hooks/useAmountDisplay';
import { useDict } from '../../../host/hooks/useDict';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDuration } from '../../../../core/utils/date';

interface ProcessRouteOperationDetailSheetProps {
  operation: ProcessOperation | null;
  operationIndex: number;
  operationCount: number;
  predecessorSummary?: string;
  canEditStructure: boolean;
  onClose: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onEdit: () => void;
  onRemove: () => void;
}

const formatSequence = (operation: ProcessOperation, index: number) =>
  String(operation.sequence ?? index + 1).padStart(2, '0');

export function ProcessRouteOperationDetailSheet({
  operation,
  operationIndex,
  operationCount,
  predecessorSummary,
  canEditStructure,
  onClose,
  onMove,
  onEdit,
  onRemove,
}: ProcessRouteOperationDetailSheetProps) {
  const { colors } = useTheme();
  const { labelMap: equipmentTypeLabelMap } = useDict('equipment_type');
  const { labelMap: toolingTypeLabelMap } = useDict('tooling_type');
  const { permitted: canViewPrices } = useAmountDisplay();

  return (
    <BottomSheet
      visible={!!operation}
      onClose={onClose}
      title={operation?.name ?? '工序详情'}
      subtitle={
        operation
          ? `${formatSequence(operation, operationIndex)} · ${predecessorSummary ?? '起点工序'}`
          : undefined
      }
      dynamicHeight
      renderFooter={
        canEditStructure && operation
          ? () => (
              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={[
                    styles.detailActionBtn,
                    {
                      borderColor: colors.border,
                      backgroundColor:
                        operationIndex <= 0 ? colors.surfaceSecondary : 'transparent',
                      opacity: operationIndex <= 0 ? 0.7 : 1,
                    },
                  ]}
                  disabled={operationIndex <= 0}
                  onPress={() => onMove('up')}
                  accessibilityState={{ disabled: operationIndex <= 0 }}
                  accessibilityHint={operationIndex <= 0 ? '当前已是第一道工序' : undefined}
                >
                  <Ionicons
                    name="arrow-up"
                    size={16}
                    color={operationIndex <= 0 ? colors.textMuted : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.detailActionText,
                      { color: operationIndex <= 0 ? colors.textMuted : colors.textSecondary },
                    ]}
                  >
                    {operationIndex <= 0 ? '上移（已是首项）' : '上移'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.detailActionBtn,
                    {
                      borderColor: colors.border,
                      backgroundColor:
                        operationIndex >= operationCount - 1
                          ? colors.surfaceSecondary
                          : 'transparent',
                      opacity: operationIndex >= operationCount - 1 ? 0.7 : 1,
                    },
                  ]}
                  disabled={operationIndex >= operationCount - 1}
                  onPress={() => onMove('down')}
                  accessibilityState={{ disabled: operationIndex >= operationCount - 1 }}
                  accessibilityHint={
                    operationIndex >= operationCount - 1 ? '当前已是最后一道工序' : undefined
                  }
                >
                  <Ionicons
                    name="arrow-down"
                    size={16}
                    color={
                      operationIndex >= operationCount - 1 ? colors.textMuted : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.detailActionText,
                      {
                        color:
                          operationIndex >= operationCount - 1
                            ? colors.textMuted
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {operationIndex >= operationCount - 1 ? '下移（已是末项）' : '下移'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.detailActionBtn,
                    styles.detailActionPrimary,
                    { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={onEdit}
                >
                  <Ionicons name="create-outline" size={16} color={colors.textOnPrimary} />
                  <Text style={[styles.detailActionText, { color: colors.textOnPrimary }]}>
                    编辑
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.detailActionBtn,
                    { borderColor: colors.error, backgroundColor: `${colors.error}10` },
                  ]}
                  onPress={onRemove}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.error} />
                  <Text style={[styles.detailActionText, { color: colors.error }]}>删除</Text>
                </TouchableOpacity>
              </View>
            )
          : undefined
      }
    >
      {operation ? (
        <View style={styles.detailContent}>
          <InfoRow
            label="单件工时"
            value={
              operation.standardTime != null ? `${formatDuration(operation.standardTime)}/件` : '-'
            }
          />
          <InfoRow
            label="准备时间"
            value={operation.setupTime != null ? formatDuration(operation.setupTime) : '-'}
          />
          <InfoRow label="准备组编码" value={operation.setupGroupCode || '-'} />
          <InfoRow
            label="后置等待时长"
            value={
              operation.postGapMinutes != null
                ? `${formatDuration(operation.postGapMinutes)} · ${operation.postGapTimeMode === PostGapTimeMode.WORK_SCHEDULE ? '按排班累计' : '自然时间'}`
                : `系统默认间隔（10分钟） · ${operation.postGapTimeMode === PostGapTimeMode.WORK_SCHEDULE ? '按排班累计' : '自然时间'}`
            }
          />
          <InfoRow label="前置工序" value={predecessorSummary ?? '起点工序'} />
          <InfoRow
            label="转移批量"
            value={
              operation.transferBatchQty != null && Number(operation.transferBatchQty) > 0
                ? operation.transferBatchQty
                : '-'
            }
          />
          <InfoRow
            label="设备类型"
            value={
              operation.equipmentType
                ? (equipmentTypeLabelMap[operation.equipmentType] ?? operation.equipmentType)
                : '-'
            }
          />
          <InfoRow
            label="工装类型"
            value={
              operation.requiredToolingType
                ? (toolingTypeLabelMap[operation.requiredToolingType] ??
                  operation.requiredToolingType)
                : '-'
            }
          />
          <InfoRow
            label="工装候选范围"
            value={
              operation.allowedToolingIds?.length ? `${operation.allowedToolingIds.length} 件` : '-'
            }
          />
          {canViewPrices && (
            <>
              <InfoRow
                label="计件单价"
                value={operation.pieceRate != null ? `¥${operation.pieceRate}/件` : '-'}
              />
              <InfoRow
                label="辅操比例"
                value={
                  operation.auxiliaryPriceRatio != null
                    ? `${Math.round(Number(operation.auxiliaryPriceRatio) * 100)}%`
                    : '-'
                }
              />
            </>
          )}
          <InfoRow
            label="默认人员"
            value={
              operation.defaultAssignee?.realName ?? operation.defaultAssignee?.username ?? '-'
            }
          />
          <InfoRow
            label="作业资料"
            value={operation.drawingUrls?.length ? `${operation.drawingUrls.length} 个资料` : '-'}
          />
          <InfoRow
            label="工序标记"
            value={
              [
                operation.isQualityCheck ? '过程检（IPQC）' : null,
                operation.isOutsourced ? '委外' : null,
              ]
                .filter((item): item is string => !!item)
                .join('、') || '-'
            }
          />
          <InfoRow label="工序说明" value={operation.description || '-'} last />
        </View>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  detailContent: { gap: 0 },
  detailActions: { flex: 1, flexDirection: 'row', gap: Spacing.xs },
  detailActionBtn: {
    flex: 1,
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  detailActionPrimary: { borderWidth: 0 },
  detailActionText: { fontSize: FontSize.xs, fontWeight: '600' },
});
