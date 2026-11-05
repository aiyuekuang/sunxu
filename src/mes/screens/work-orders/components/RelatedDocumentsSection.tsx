import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { WorkOrderReceiptSummaryResponseDto } from '../../../types/models/WorkOrderReceiptSummaryResponseDto';
import { materialIssueService } from '../../../host/services';
import { productionReceiptService } from '../../../host/services';
import { qualityService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { InlineLoading } from '../../../../core/components/LoadingView.tsx';
import { INSPECTION_PERMS, PRODUCTION_RECEIPT_PERMS } from '../../../host/authorization';
import { P } from '../../../host/authorization';
import { INSPECTION_STATUS_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useModulePermissions } from '../../../host/hooks/useModulePermissions';
import { useAnyPermission, usePermission } from '../../../host/hooks/usePermission';
import { useTheme } from '../../../../core/theme/useTheme';
import type { WorkOrdersStackParamList } from '../../../host/navigation';
import { toast } from '../../../../core/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RelatedDocumentsSectionProps {
  workOrderId: string;
  parentWorkOrderId?: string | null;
  parentOrderNo?: string | null;
}

interface DocGroup {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  count: number;
  color: string;
  onPress: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RelatedDocumentsSection({
  workOrderId,
  parentWorkOrderId,
  parentOrderNo,
}: RelatedDocumentsSectionProps) {
  const { colors } = useTheme();
  const inspectionPerms = useModulePermissions(INSPECTION_PERMS);
  const productionReceiptPerms = useModulePermissions(PRODUCTION_RECEIPT_PERMS);
  const canViewMaterialIssue = useAnyPermission(P.MATERIAL_REQ_LIST, P.MATERIAL_REQ_VIEW);
  const canViewMaterialIssueDetail = usePermission(P.MATERIAL_REQ_VIEW);
  const canViewParentWorkOrder = usePermission(P.WORK_ORDER_VIEW);
  const navigation = useNavigation<NativeStackNavigationProp<WorkOrdersStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [issueCount, setIssueCount] = useState(0);
  const [firstIssueId, setFirstIssueId] = useState<string | null>(null);
  const [inspectionCount, setInspectionCount] = useState(0);
  const [firstInspectionId, setFirstInspectionId] = useState<string | null>(null);
  const [firstInspectionStatus, setFirstInspectionStatus] = useState<string | null>(null);
  const [receiptSummary, setReceiptSummary] = useState<WorkOrderReceiptSummaryResponseDto | null>(
    null,
  );

  useEffect(() => {
    setLoading(true);

    if (!inspectionPerms.list) {
      setInspectionCount(0);
      setFirstInspectionId(null);
      setFirstInspectionStatus(null);
    }
    if (!productionReceiptPerms.list) setReceiptSummary(null);
    if (!canViewMaterialIssue) {
      setIssueCount(0);
      setFirstIssueId(null);
    }

    Promise.all([
      canViewMaterialIssue
        ? materialIssueService
            .list({ workOrderId, page: 1, pageSize: 2 })
            .then((r) => {
              setFirstIssueId(r.list[0]?.id ?? null);
              return r.total;
            })
            .catch((e: unknown) => {
              toast.error(e instanceof Error ? e.message : '加载出库记录数失败');
              return 0;
            })
        : Promise.resolve(0),
      inspectionPerms.list
        ? qualityService
            .list({ workOrderId, page: 1, pageSize: 2 })
            .then((r) => {
              setFirstInspectionId(r.list[0]?.id ?? null);
              setFirstInspectionStatus(r.list[0]?.status ?? null);
              return r.total;
            })
            .catch((e: unknown) => {
              toast.error(e instanceof Error ? e.message : '加载质检记录数失败');
              return 0;
            })
        : Promise.resolve(0),
      productionReceiptPerms.list
        ? productionReceiptService.workOrderSummary({ workOrderId }).catch((e: unknown) => {
            toast.error(e instanceof Error ? e.message : '加载生产入库单摘要失败');
            return null;
          })
        : Promise.resolve(null),
    ])
      .then(([issues, inspections, summary]) => {
        setIssueCount(issues);
        setInspectionCount(inspections);
        setReceiptSummary(summary);
      })
      .finally(() => setLoading(false));
  }, [
    canViewMaterialIssue,
    inspectionPerms.list,
    productionReceiptPerms.list,
    workOrderId,
  ]);

  const handleIssuePress = () => {
    if (canViewMaterialIssueDetail && issueCount === 1 && firstIssueId) {
      navigation.getParent?.()?.navigate('MaterialIssue', {
        screen: 'MaterialIssueDetail',
        params: { id: firstIssueId },
      });
    } else {
      navigation.getParent?.()?.navigate('MaterialIssue', {
        screen: 'MaterialIssueList',
        params: { workOrderId },
      });
    }
  };

  const handleInspectionPress = () => {
    if (inspectionCount === 1 && firstInspectionId) {
      navigation.getParent?.()?.navigate('QualityDetail', { id: firstInspectionId });
    } else {
      navigation.getParent?.()?.navigate('Quality', {
        screen: 'QualityList',
        params: { workOrderId },
      });
    }
  };

  // 质检单颜色按最高优先级状态决定
  const inspectionColor =
    INSPECTION_STATUS_CONFIG[firstInspectionStatus ?? '']?.color ?? colors.success;

  const docs: DocGroup[] = [
    ...(issueCount > 0
      ? [
          {
            icon: 'cube-outline' as const,
            label: '生产领料单',
            count: issueCount,
            color: colors.primary,
            onPress: handleIssuePress,
          },
        ]
      : []),
    ...(inspectionCount > 0
      ? [
          {
            icon: 'shield-checkmark-outline' as const,
            label: '质检单',
            count: inspectionCount,
            color: inspectionColor,
            onPress: handleInspectionPress,
          },
        ]
      : []),
    ...(receiptSummary && receiptSummary.pendingReceiptCount > 0
      ? [
          {
            icon: 'archive-outline' as const,
            label: '生产入库单',
            count: receiptSummary.pendingReceiptCount,
            color: colors.primary,
            onPress: () =>
              navigation.getParent?.()?.navigate('Warehouse', {
                screen: 'ProductionReceiptList',
                params: { workOrderId },
              }),
          },
        ]
      : []),
  ];

  const hasAny =
    issueCount > 0 ||
    inspectionCount > 0 ||
    (receiptSummary?.pendingReceiptCount ?? 0) > 0 ||
    canViewParentWorkOrder && !!parentWorkOrderId;
  if (!hasAny && !loading) return null;

  return (
    <DetailCard title="关联单据" noPadding>
      {loading ? (
        <InlineLoading />
      ) : (
        <View style={styles.grid}>
          {docs.map((doc) => (
            <TouchableOpacity
              key={doc.label}
              style={[styles.docItem, { backgroundColor: `${doc.color}08` }]}
              onPress={doc.onPress}
              activeOpacity={0.6}
            >
              <Ionicons name={doc.icon} size={22} color={doc.color} />
              <Text style={[styles.docLabel, { color: colors.text }]}>{doc.label}</Text>
              <Text style={[styles.docCount, { color: doc.color }]}>{doc.count} 单</Text>
            </TouchableOpacity>
          ))}
          {canViewParentWorkOrder && parentWorkOrderId && (
            <TouchableOpacity
              style={[styles.docItem, { backgroundColor: '#722ED108' }]}
              onPress={() => navigation.push('WorkOrderDetail', { id: parentWorkOrderId })}
              activeOpacity={0.6}
            >
              <Ionicons name="git-branch-outline" size={22} color="#722ED1" />
              <Text style={[styles.docLabel, { color: colors.text }]}>来源工单</Text>
              <Text style={[styles.docCount, { color: '#722ED1' }]}>{parentOrderNo ?? '查看'}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </DetailCard>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.sm, gap: Spacing.sm },
  docItem: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  docLabel: { fontSize: FontSize.xs, fontWeight: '500' },
  docCount: { fontSize: FontSize.sm, fontWeight: '700' },
});
