import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import type { CustomerExternalItem } from '../../../host/services';
import { AttachmentFilesField } from '../../../components/common/AttachmentFilesField.tsx';
import { ConfigBadge } from '../../../../core/components/Badge.tsx';
import { DetailCard, InfoRow } from '../../../../core/components/DetailCard.tsx';
import { ImagePreviewModal } from '../../../../core/components/ImagePreviewModal.tsx';
import {
  CUSTOMER_INBOUND_STATUS_CONFIG,
  CUSTOMER_INBOUND_USAGE_TYPE_CONFIG,
} from '../../../constants/status-configs';
import { Radius, Spacing } from '../../../../core/theme/tokens';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { formatDateTime } from '../../../../core/utils/date';
import { formatQtyWithUnit } from '../../../utils/qty-unit';

interface CustomerInboundInfoSectionProps {
  item: CustomerExternalItem;
}

export function CustomerInboundInfoSection({ item }: CustomerInboundInfoSectionProps) {
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  return (
    <>
      <DetailCard
        title="登记信息"
        right={
          <ConfigBadge value={item.status} config={CUSTOMER_INBOUND_STATUS_CONFIG} size="sm" />
        }
      >
        <InfoRow label="登记单号" value={item.registerNo} />
        <InfoRow label="客户" value={item.customer?.name ?? item.customerId} />
        <InfoRow
          label="用途"
          right={
            <ConfigBadge
              value={item.usageType}
              config={CUSTOMER_INBOUND_USAGE_TYPE_CONFIG}
              size="sm"
            />
          }
        />
        <InfoRow label="到厂时间" value={formatDateTime(item.receivedAt)} />
        <InfoRow label="项目号" value={item.projectCode} last />
      </DetailCard>

      <DetailCard title="物品信息">
        <InfoRow label="物品名称" value={item.itemName} />
        <InfoRow label="规格型号" value={item.itemSpec} />
        <InfoRow label="物品类型" value={item.itemType} />
        <InfoRow label="数量" value={formatQtyWithUnit(item.qty, item.unit, unitLabelMap)} last />
      </DetailCard>

      <DetailCard title="保管与库存">
        <InfoRow label="保管仓库" value={item.custodyWarehouse?.name ?? item.custodyWarehouseId} />
        <InfoRow label="具体存放位置" value={item.storageLocation} />
        <InfoRow label="保管责任人" value={item.keeperUser?.realName ?? item.keeperUserId} />
        <InfoRow label="正式物料" value={item.linkedMaterial?.name ?? item.linkedMaterialId} />
        <InfoRow label="入库仓库" value={item.warehouse?.name ?? item.warehouseId} />
        <InfoRow
          label="库存仓位"
          value={item.location?.pathName || item.location?.name || item.locationId}
        />
        <InfoRow label="批号" value={item.batchNo} />
        <InfoRow label="库存事实" value={item.stockManaged ? '已形成' : '未形成'} />
        <InfoRow
          label="库存流水"
          value={item.linkedStockTransaction?.transactionNo ?? item.linkedStockTransactionId}
        />
        <InfoRow
          label="可处理数量"
          value={
            item.processableQty !== undefined && item.processableQty !== null
              ? formatQtyWithUnit(item.processableQty, item.unit, unitLabelMap)
              : undefined
          }
          last
        />
      </DetailCard>

      <DetailCard title="关联来源">
        <InfoRow label="销售订单" value={item.saleOrder?.orderNo ?? item.saleOrderId} />
        <InfoRow
          label="销售订单行"
          value={
            [
              item.saleOrderItem?.customerMaterialCode,
              item.saleOrderItem?.customerMaterialName,
              item.saleOrderItem?.material?.name,
            ]
              .filter(Boolean)
              .join(' / ') || item.saleOrderItemId
          }
        />
        <InfoRow label="生产计划" value={item.productionPlan?.planNo ?? item.productionPlanId} />
        <InfoRow label="工单" value={item.workOrder?.orderNo ?? item.workOrderId} />
        <InfoRow
          label="BOM 行"
          value={
            [
              item.bomItem?.customerPartCode,
              item.bomItem?.customerPartName,
              typeof item.bomItem?.material === 'object' && item.bomItem?.material
                ? (item.bomItem.material as { name?: string }).name
                : undefined,
            ]
              .filter(Boolean)
              .join(' / ') || item.bomItemId
          }
        />
        <InfoRow label="备注" value={item.remark} last />
      </DetailCard>

      {item.photoUrls?.length ? (
        <DetailCard title={`现场照片（${item.photoUrls.length}）`}>
          <View style={styles.photoGrid}>
            {item.photoUrls.map((url) => (
              <Pressable key={url} onPress={() => setPreviewPhotoUrl(url)}>
                <Image source={{ uri: url }} style={styles.photo} />
              </Pressable>
            ))}
          </View>
        </DetailCard>
      ) : null}

      {item.attachmentUrls?.length ? (
        <DetailCard title="附件资料">
          <AttachmentFilesField label="附件" files={item.attachmentUrls} />
        </DetailCard>
      ) : null}

      <ImagePreviewModal
        visible={!!previewPhotoUrl}
        uri={previewPhotoUrl}
        onClose={() => setPreviewPhotoUrl(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  photo: {
    width: 76,
    height: 76,
    borderRadius: Radius.md,
  },
});
