import type { TraceGraphDto } from '../../../host/contracts/generated/models/TraceGraphDto.d.ts';
import type { TraceGraphNodeDto } from '../../../host/contracts/generated/models/TraceGraphNodeDto.d.ts';
import type { FinishedProductSerialTraceDto } from '../../../types/models/FinishedProductSerialTraceDto';
import type { TraceBatchLookup } from '../../../host/services';
import {
  SERIAL_MOVEMENT_TYPE_CONFIG,
  SERIAL_REFERENCE_TYPE_CONFIG,
  SERIAL_STATUS_LABELS,
} from '../../../constants/status-configs';

export interface TraceTimelineEvent {
  id: string;
  scope: 'serial' | 'batch';
  type: string;
  title: string;
  subtitle?: string;
  occurredAt?: string | null;
  status?: string;
  quantity?: number;
  unit?: string;
  context?: TraceGraphNodeDto['context'];
  remarks?: string[];
  photoUrls?: string[];
  missingContext?: string[];
  relationships?: string[];
}

export interface TraceTimelineResult {
  identifierType: 'batch' | 'serial';
  identifier: string;
  subject: {
    identifier: string;
    materialName?: string | null;
    materialCode?: string | null;
    materialSpec?: string | null;
    unit?: string | null;
    status?: string | null;
    quantity?: number | null;
    workOrderNo?: string | null;
    sourceOrderNo?: string | null;
    demandLineNo?: number | null;
    batchNo?: string | null;
    warehouseName?: string | null;
  };
  events: TraceTimelineEvent[];
  warnings: string[];
  summary?: TraceGraphDto['summary'];
}

const BATCH_EVENT_TYPES = new Set([
  'batch',
  'work_order',
  'operation',
  'report_log',
  'stock_transaction',
  'purchase_receipt',
  'material_issue',
  'quality_inspection',
  'disposal_order',
  'production_scrap',
  'package_unit',
  'sale_delivery',
]);

function sortEvents(events: TraceTimelineEvent[]): TraceTimelineEvent[] {
  return events.sort((left, right) => {
    if (!left.occurredAt) return right.occurredAt ? 1 : 0;
    if (!right.occurredAt) return -1;
    return Date.parse(left.occurredAt) - Date.parse(right.occurredAt);
  });
}

function eventRelationships(node: TraceGraphNodeDto, graph: TraceGraphDto): string[] {
  if (node.type === 'batch') return [];
  const nodesById = new Map<string, TraceGraphNodeDto>(
    graph.nodes.map((graphNode): [string, TraceGraphNodeDto] => [graphNode.id, graphNode]),
  );
  const relationships = graph.edges
    .filter((edge) => edge.from === node.id || edge.to === node.id)
    .map((edge) => {
      const from = nodesById.get(edge.from);
      const to = nodesById.get(edge.to);
      if (!from || !to) return undefined;
      const fromTitle = from.type === 'batch' ? `批号 ${from.title}` : from.title;
      const toTitle = to.type === 'batch' ? `批号 ${to.title}` : to.title;
      return `${fromTitle} —${edge.label ?? edge.type}→ ${toTitle}`;
    })
    .filter((relationship): relationship is string => Boolean(relationship));
  const uniqueRelationships = [...new Set(relationships)];
  return uniqueRelationships.length > 3
    ? [...uniqueRelationships.slice(0, 3), `另有 ${uniqueRelationships.length - 3} 条关联`]
    : uniqueRelationships;
}

function batchEvent(node: TraceGraphNodeDto, graph: TraceGraphDto): TraceTimelineEvent {
  return {
    id: node.id,
    scope: 'batch',
    type: node.type,
    title: node.title,
    subtitle: node.subtitle,
    occurredAt: node.occurredAt,
    status: node.status,
    quantity: node.qty,
    unit: node.unit,
    context: node.context,
    remarks: node.remarks ? [node.remarks] : undefined,
    photoUrls: node.photoUrls,
    missingContext: node.missingContext,
    relationships: eventRelationships(node, graph),
  };
}

function batchEvents(graph: TraceGraphDto): TraceTimelineEvent[] {
  return graph.nodes
    .filter((node) => BATCH_EVENT_TYPES.has(node.type))
    .map((node) => batchEvent(node, graph));
}

export function buildBatchTimelineResult(
  identifier: string,
  batch: Pick<TraceBatchLookup, 'id' | 'batchNo' | 'qty'> & {
    status: string;
    material?: {
      name?: string | null;
      code?: string | null;
      spec?: string | null;
      unit?: string | null;
    } | null;
    warehouse?: { name?: string | null } | null;
  },
  graph: TraceGraphDto,
): TraceTimelineResult {
  return {
    identifierType: 'batch',
    identifier,
    subject: {
      identifier: batch.batchNo,
      materialName: batch.material?.name,
      materialCode: batch.material?.code,
      materialSpec: batch.material?.spec,
      unit: batch.material?.unit,
      status: batch.status,
      quantity: Number(batch.qty ?? 0),
      warehouseName: batch.warehouse?.name,
    },
    events: sortEvents(batchEvents(graph)),
    warnings: graph.warnings.map((warning) => warning.message),
    summary: graph.summary,
  };
}

function serialEvents(serial: FinishedProductSerialTraceDto): TraceTimelineEvent[] {
  const shipments = new Map(
    serial.shipments.map((shipment) => [shipment.deliveryItemId, shipment]),
  );

  return serial.movements.map((movement) => {
    const shipment = movement.referenceId ? shipments.get(movement.referenceId) : undefined;
    const referenceType = movement.referenceType ?? (shipment ? 'sale_delivery_item' : null);
    const referenceLabel = referenceType
      ? (SERIAL_REFERENCE_TYPE_CONFIG[referenceType] ?? referenceType)
      : null;
    const referenceDescription = shipment?.deliveryNo
      ? `${shipment.deliveryNo}${shipment.customerName ? ` / ${shipment.customerName}` : ''}`
      : referenceType === 'work_order_report_log' && serial.productionReport
        ? `工序 ${serial.productionReport.operationName}`
        : referenceType === 'production_receipt_order' && serial.productionReceipt
          ? serial.productionReceipt.receiptNo
          : referenceType === 'work_order'
            ? serial.workOrder?.orderNo
            : movement.referenceId;
    const detail = [
      movement.fromStatus
        ? `${SERIAL_STATUS_LABELS[movement.fromStatus] ?? movement.fromStatus} → ${SERIAL_STATUS_LABELS[movement.toStatus] ?? movement.toStatus}`
        : (SERIAL_STATUS_LABELS[movement.toStatus] ?? movement.toStatus),
      movement.batchNo ? `批号 ${movement.batchNo}` : null,
      movement.movementType === 'produced' && serial.productionReport
        ? [
            serial.productionReport.equipmentName
              ? `设备 ${serial.productionReport.equipmentName}`
              : null,
            serial.productionReport.scrappedQty > 0
              ? `报废 ${serial.productionReport.scrappedQty}`
              : null,
          ]
            .filter(Boolean)
            .join(' / ')
        : null,
      referenceLabel
        ? `来源 ${referenceLabel}${referenceDescription ? ` ${referenceDescription}` : ''}`
        : null,
    ].filter((item): item is string => Boolean(item));
    const remarks = [
      movement.remarks,
      movement.movementType === 'produced' || movement.movementType === 'scrapped'
        ? serial.productionReport?.remarks
        : null,
      movement.movementType === 'received' ? serial.productionReceipt?.remarks : null,
      movement.movementType === 'shipped' ? shipment?.remarks : null,
    ]
      .map((item) => item?.trim())
      .filter((item): item is string => Boolean(item));

    return {
      id: `serial-movement:${movement.id}`,
      scope: 'serial',
      type: movement.movementType,
      title: SERIAL_MOVEMENT_TYPE_CONFIG[movement.movementType] ?? movement.movementType,
      subtitle: detail.join(' · '),
      remarks: [...new Set(remarks)],
      photoUrls:
        movement.movementType === 'produced' || movement.movementType === 'scrapped'
          ? serial.productionReport?.photoUrls
          : undefined,
      occurredAt:
        movement.movementType === 'produced'
          ? (serial.productionReport?.occurredAt ?? movement.createdAt)
          : movement.movementType === 'received'
            ? (serial.productionReceipt?.confirmedAt ?? movement.createdAt)
            : movement.movementType === 'shipped'
              ? (shipment?.shipmentRecordedAt ?? movement.createdAt)
              : movement.createdAt,
      status: movement.toStatus,
      quantity: 1,
      unit: serial.material?.unit,
    };
  });
}

export function buildSerialTimelineResult(
  serial: FinishedProductSerialTraceDto,
  graph?: TraceGraphDto,
  graphWarning?: string,
): TraceTimelineResult {
  const relatedBatchEvents = graph
    ? batchEvents(graph).filter(
        (event) =>
          event.id !== graph.root.id &&
          !(
            event.type === 'report_log' &&
            event.id === `report_log:${serial.productionReport?.reportLogId}`
          ),
      )
    : [];
  return {
    identifierType: 'serial',
    identifier: serial.serialNo,
    subject: {
      identifier: serial.serialNo,
      materialName: serial.material?.name,
      materialCode: serial.material?.code,
      materialSpec: serial.material?.spec,
      unit: serial.material?.unit,
      status: serial.status,
      quantity: 1,
      workOrderNo: serial.workOrder?.orderNo,
      sourceOrderNo: serial.sourceDemand?.sourceOrderNo,
      demandLineNo: serial.sourceDemand?.demandLineNo,
      batchNo: serial.batchNo,
      warehouseName: serial.warehouse?.name,
    },
    events: sortEvents([...serialEvents(serial), ...relatedBatchEvents]),
    warnings: [
      ...(graph?.warnings.map((warning) => warning.message) ?? []),
      ...(graphWarning ? [graphWarning] : []),
      ...(!graph && serial.batchNo && !graphWarning
        ? ['该序列号未关联批号记录；以下仅展示成品序列号自身的流转记录']
        : []),
    ],
    summary: graph?.summary,
  };
}
