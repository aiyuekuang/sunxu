import { useState } from 'react';
import { Image, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { QualityInspectionRecord } from '../../../types/models/QualityInspectionRecord';
import type { QualityInspection } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { Badge } from '../../../../core/components/Badge.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { InlineCustomFieldValueRows } from '../../../components/custom-fields/InlineCustomFieldValueRows.tsx';
import { useCustomFieldSchema } from '../../../components/custom-fields/useCustomFieldSchema.ts';
import { ImagePreviewModal } from '../../../../core/components/ImagePreviewModal.tsx';
import { INSPECTION_RECORD_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDateTime } from '../../../../core/utils/date';
import { getInspectionRecordTypeLabel } from './inspection-utils.ts';

interface InspectionRecordsSectionProps {
  inspectionType: QualityInspection['type'];
  records: QualityInspectionRecord[];
  effectiveCount: number;
  requiredCount: number;
  canVoid: boolean;
  canRecheck: boolean;
  onVoid: (record: QualityInspectionRecord) => void;
  onRecheck: (record: QualityInspectionRecord) => void;
}

export function InspectionRecordsSection({
  inspectionType,
  records,
  effectiveCount,
  requiredCount,
  canVoid,
  canRecheck,
  onVoid,
  onRecheck,
}: InspectionRecordsSectionProps) {
  const { colors } = useTheme();
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const recordItemCustomFields = useCustomFieldSchema('quality_inspection_record_item');

  return (
    <>
      <DetailCard title={`检查记录（${effectiveCount} / ${requiredCount} 次）`}>
        {records.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textMuted }]}>暂无检查记录</Text>
        ) : (
          records.map((record, index) => {
            const statusConfig = INSPECTION_RECORD_STATUS_CONFIG[record.status];
            return (
              <View
                key={record.id}
                style={[
                  styles.record,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  index > 0 && styles.recordSpacing,
                ]}
              >
                <View style={styles.recordHeader}>
                  <View style={styles.recordTitle}>
                    <Text style={[styles.sequence, { color: colors.text }]}>
                      第 {record.sequenceNo} 次
                    </Text>
                    <Badge
                      label={getInspectionRecordTypeLabel(inspectionType, record.recordType)}
                      variant="info"
                      size="sm"
                    />
                    <Badge
                      label={statusConfig?.label ?? '未知状态'}
                      variant={record.status === 'submitted' ? 'success' : 'default'}
                      size="sm"
                    />
                  </View>
                  {record.status === 'submitted' && (canRecheck || canVoid) ? (
                    <View style={styles.recordActions}>
                      {canRecheck && record.conclusion === 'rejected' ? (
                        <TouchableOpacity onPress={() => onRecheck(record)}>
                          <Text style={[styles.recheckText, { color: colors.primary }]}>
                            发起复检
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                      {canVoid ? (
                        <TouchableOpacity onPress={() => onVoid(record)}>
                          <Text style={[styles.voidText, { color: colors.error }]}>作废</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ) : null}
                </View>

                <Text style={[styles.meta, { color: colors.textSecondary }]}>
                  抽样 {record.sampleQty} / 合格 {record.passQty} / 不合格 {record.failQty}
                </Text>
                <Text style={[styles.meta, { color: colors.textSecondary }]}>
                  {record.inspector?.realName ?? record.inspector?.username ?? '-'} ·{' '}
                  {formatDateTime(record.inspectedAt)}
                </Text>
                {record.operator ? (
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>
                    作业人：{record.operator.realName ?? record.operator.username ?? '-'}
                  </Text>
                ) : null}
                {record.recheckOfRecord ? (
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>
                    复检来源：第 {record.recheckOfRecord.sequenceNo} 次检查
                  </Text>
                ) : null}
                {record.status === 'voided' && record.voidReason ? (
                  <Text style={[styles.voidReason, { color: colors.error }]}>
                    作废原因：{record.voidReason}
                  </Text>
                ) : null}

                {(record.items ?? []).map((item, itemIndex) => (
                  <View key={item.id} style={[styles.item, { borderTopColor: colors.border }]}>
                    <View style={styles.itemContent}>
                      <View style={styles.itemMain}>
                        <Text style={[styles.itemName, { color: colors.text }]}>
                          {item.inspectionItem?.itemName ?? '检验项目'}
                        </Text>
                        <Text style={[styles.itemValue, { color: colors.textSecondary }]}>
                          {item.measurements?.length
                            ? [...item.measurements]
                                .sort((left, right) => left.sequenceNo - right.sequenceNo)
                                .map((measurement) => measurement.measuredValue)
                                .join('、')
                            : item.measuredValue || '无实测值'}
                        </Text>
                      </View>
                      {(item.photoUrls ?? []).length > 0 ? (
                        <View style={styles.photoList}>
                          {(item.photoUrls ?? []).map((url) => (
                            <Pressable key={url} onPress={() => setPreviewPhotoUrl(url)}>
                              <Image source={{ uri: url }} style={styles.photo} />
                            </Pressable>
                          ))}
                        </View>
                      ) : null}
                    </View>
                    <Badge
                      label={item.isPassed ? '合格' : '不合格'}
                      variant={item.isPassed ? 'success' : 'error'}
                      size="sm"
                    />
                    <InlineCustomFieldValueRows
                      fields={recordItemCustomFields.fields}
                      values={item}
                      loadError={
                        index === 0 && itemIndex === 0 ? recordItemCustomFields.loadError : null
                      }
                    />
                  </View>
                ))}
              </View>
            );
          })
        )}
      </DetailCard>
      <ImagePreviewModal
        visible={!!previewPhotoUrl}
        uri={previewPhotoUrl}
        onClose={() => setPreviewPhotoUrl(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  empty: { fontSize: FontSize.sm, textAlign: 'center', paddingVertical: Spacing.md },
  record: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: 4,
  },
  recordSpacing: { marginTop: Spacing.sm },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  recordTitle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  recordActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sequence: { fontSize: FontSize.sm, fontWeight: '700' },
  recheckText: { fontSize: FontSize.sm, fontWeight: '600' },
  voidText: { fontSize: FontSize.sm, fontWeight: '600' },
  meta: { fontSize: FontSize.xs },
  voidReason: { fontSize: FontSize.xs, marginTop: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.xs,
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  itemContent: { flex: 1, gap: Spacing.xs },
  itemMain: { flex: 1 },
  itemName: { fontSize: FontSize.sm, fontWeight: '500' },
  itemValue: { fontSize: FontSize.xs },
  photoList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  photo: { width: 56, height: 56, borderRadius: Radius.sm },
});
