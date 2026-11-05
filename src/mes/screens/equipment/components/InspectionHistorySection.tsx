import { useState } from 'react';
import { Image, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { EquipmentInspection, InspectionItem } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { ImagePreviewModal } from '../../../../core/components/ImagePreviewModal.tsx';
import { FontSize, Radius, Shadow, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { formatDateTime } from '../../../../core/utils/date';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InspectionHistorySectionProps {
  inspections: EquipmentInspection[];
  canViewHistory: boolean;
  canCreate: boolean;
  onCreatePress: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InspectionHistorySection({
  inspections,
  canViewHistory,
  canCreate,
  onCreatePress,
}: InspectionHistorySectionProps) {
  const { colors } = useTheme();
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text, flex: 1 }]} numberOfLines={1}>
          {canViewHistory ? '近期点检记录（最近5条）' : '设备点检'}
        </Text>
        {canCreate && (
          <TouchableOpacity
            onPress={onCreatePress}
            style={[styles.miniBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.miniBtnText, { color: colors.textOnPrimary }]}>+ 新增</Text>
          </TouchableOpacity>
        )}
      </View>
      {!canViewHistory ? (
        <EmptyState
          compact
          icon="clipboard-outline"
          title="无权限查看点检历史"
          description={canCreate ? '当前角色可直接新建点检。' : undefined}
        />
      ) : inspections.length === 0 ? (
        <EmptyState compact icon="clipboard-outline" title="暂无点检记录" />
      ) : (
        inspections.map((ins, idx) => {
          const isAbnormal = ins.conclusion === 'abnormal';
          const inspectionItems = (ins.items ?? []) as unknown as InspectionItem[];
          return (
            <View
              key={ins.id}
              style={[
                styles.insRow,
                { borderTopColor: colors.borderLight },
                idx === 0 && { borderTopWidth: 0 },
              ]}
            >
              <View style={styles.insRowHeader}>
                <View style={styles.insLeft}>
                  <Text style={[styles.insDate, { color: colors.text }]}>{ins.inspectionDate}</Text>
                  <Text style={[styles.insInspector, { color: colors.textSecondary }]}>
                    {ins.inspector?.realName ?? ins.inspector?.username ?? '未知'}
                    {ins.inspectionTemplateName
                      ? ` · ${ins.inspectionTemplateName}${ins.inspectionTemplateVersion ? ` v${ins.inspectionTemplateVersion}` : ''}`
                      : ''}
                  </Text>
                </View>
                <View
                  style={[
                    styles.insBadge,
                    { backgroundColor: isAbnormal ? colors.errorLight : colors.successLight },
                  ]}
                >
                  <Text
                    style={[
                      styles.insBadgeText,
                      { color: isAbnormal ? colors.error : colors.success },
                    ]}
                  >
                    {isAbnormal ? '异常' : '正常'}
                  </Text>
                </View>
              </View>
              {inspectionItems.map((item) => (
                <View key={item.id} style={styles.abnormalRow}>
                  <Text
                    style={[
                      styles.abnormalArrow,
                      { color: item.result === 'abnormal' ? colors.error : colors.textTertiary },
                    ]}
                  >
                    ↳{' '}
                  </Text>
                  <View style={styles.itemDetail}>
                    <Text style={[styles.abnormalText, { color: colors.textSecondary }]}>
                      {item.name}
                      {item.standard ? `｜标准：${item.standard}` : ''}
                      {item.actualValue !== undefined
                        ? `｜实测：${item.actualValue}${item.unit ?? ''}`
                        : ''}
                      {item.actualText ? `｜实录：${item.actualText}` : ''}
                      {item.result ? `｜${item.result === 'abnormal' ? '异常' : '正常'}` : ''}
                      {item.remark ? `｜说明：${item.remark}` : ''}
                    </Text>
                    {item.photoEvidence?.map((photo) => (
                      <View key={photo.id} style={styles.photoEvidence}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`查看${photo.locationLabel}现场照片`}
                          accessibilityHint="打开图片预览"
                          onPress={() => setPreviewPhotoUrl(photo.url)}
                        >
                          <Image
                            source={{ uri: photo.url }}
                            style={styles.photoThumbnail}
                            accessible={false}
                          />
                        </Pressable>
                        <Text style={[styles.photoCaption, { color: colors.textTertiary }]}>
                          {photo.locationLabel} · {formatDateTime(photo.capturedAt)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
              {ins.remarks && (
                <Text
                  style={[styles.insRemarks, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  备注：{ins.remarks}
                </Text>
              )}
            </View>
          );
        })
      )}
      <ImagePreviewModal
        visible={!!previewPhotoUrl}
        uri={previewPhotoUrl}
        onClose={() => setPreviewPhotoUrl(null)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '600' },
  miniBtn: {
    paddingHorizontal: Spacing.md - 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  miniBtnText: { fontSize: FontSize.xs, fontWeight: '600' },
  insRow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingVertical: Spacing.md,
    borderTopWidth: 0.5,
  },
  insRowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  insLeft: { flex: 1, gap: 2 },
  insDate: { fontSize: FontSize.sm, fontWeight: '500' },
  insInspector: { fontSize: FontSize.xs },
  insBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.sm },
  insBadgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  abnormalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.xs,
    paddingLeft: Spacing.sm,
  },
  abnormalArrow: { fontSize: FontSize.xs },
  abnormalText: { fontSize: FontSize.xs, flex: 1 },
  itemDetail: { flex: 1, gap: Spacing.xs },
  photoEvidence: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  photoThumbnail: { width: 56, height: 44, borderRadius: Radius.sm },
  photoCaption: { flex: 1, fontSize: FontSize.xs, lineHeight: 16 },
  insRemarks: { fontSize: FontSize.xs, marginTop: Spacing.xs, paddingLeft: Spacing.sm },
});
