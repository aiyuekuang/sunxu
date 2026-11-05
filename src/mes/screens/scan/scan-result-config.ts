import type { Ionicons } from '@expo/vector-icons';
import type { ScanEntityInfo } from '../../host/services';
import { ENTITY_DETAIL_ROUTE } from '../../constants/entity-routes';

type ScanEntityType = ScanEntityInfo['entityType'];

export interface ScanEntityRoute {
  title: string;
  entityLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** 继承 ENTITY_DETAIL_ROUTE（screen/navigator 可能缺省，由调用方兜底提示） */
  navigator?: string;
  screen?: string;
  detailButtonText: string;
}

function getDetailRoute(entityType: string) {
  const route = ENTITY_DETAIL_ROUTE[entityType];
  if (!route) {
    throw new Error(`未配置 entityType=${entityType} 的详情路由`);
  }
  return route;
}

export const SCAN_ENTITY_ROUTES: Record<ScanEntityType, ScanEntityRoute> = {
  material: {
    title: '物料识别',
    entityLabel: '物料',
    icon: 'cube-outline',
    navigator: 'Material',
    screen: 'MaterialDetail',
    detailButtonText: '物料详情',
  },
  tooling: {
    title: '工装识别',
    entityLabel: '工装',
    icon: 'construct-outline',
    navigator: 'Tooling',
    screen: 'ToolingDetail',
    detailButtonText: '工装详情',
  },
  batch: {
    title: '批号识别',
    entityLabel: '批号',
    icon: 'layers-outline',
    navigator: 'Batch',
    screen: 'BatchDetail',
    detailButtonText: '批号详情',
  },
  equipment: {
    title: '设备识别',
    entityLabel: '设备',
    icon: 'hardware-chip-outline',
    navigator: 'Equipment',
    screen: 'EquipmentDetail',
    detailButtonText: '设备详情',
  },
  sale_delivery: {
    title: '销售出库单识别',
    entityLabel: '销售出库单',
    icon: 'car-outline',
    ...getDetailRoute('sale_delivery'),
    detailButtonText: '查看详情',
  },
  purchase_receipt: {
    title: '采购入库单识别',
    entityLabel: '采购入库单',
    icon: 'archive-outline',
    ...getDetailRoute('purchase_receipt'),
    detailButtonText: '查看详情',
  },
  material_issue: {
    title: '生产领料单识别',
    entityLabel: '生产领料单',
    icon: 'basket-outline',
    ...getDetailRoute('material_issue'),
    detailButtonText: '单据详情',
  },
  quality_inspection: {
    title: '质检单识别',
    entityLabel: '质检单',
    icon: 'shield-checkmark-outline',
    ...getDetailRoute('quality_inspection'),
    detailButtonText: '单据详情',
  },
  purchase_order: {
    title: '采购订单识别',
    entityLabel: '采购订单',
    icon: 'document-text-outline',
    ...getDetailRoute('purchase_order'),
    detailButtonText: '单据详情',
  },
  warehouse_location: {
    title: '仓位识别',
    entityLabel: '仓位',
    icon: 'location-outline',
    navigator: 'Warehouse',
    screen: 'WarehousesList',
    detailButtonText: '查看库存',
  },
};
