import type { WorkOrderOperation } from '../../host/services';

/**
 * 允许报工冲正的工单状态：生产中/暂停/已完工（未关闭）。
 * 完工未关闭是"可修正窗口"（后端 revokeOperationReport 已放开到 completed，
 * closed/cancelled 仍拦），三处冲正入口共用此常量避免状态门控漂移。
 */
export const REVOCABLE_WORK_ORDER_STATUSES = ['in_progress', 'paused', 'completed'] as const;

export function isWorkOrderRevocable(status?: string | null): boolean {
  return REVOCABLE_WORK_ORDER_STATUSES.includes(
    status as (typeof REVOCABLE_WORK_ORDER_STATUSES)[number],
  );
}

export interface OperationReportConstraint {
  maxQty: number;
  upstreamGoodQty: number | null;
  upstreamOp: WorkOrderOperation | null;
  transferBatchQty: number;
  transferGateOpen: boolean;
}

interface OperationDependencyEdge {
  predecessorOperationId: string;
  transferBatchQty?: number | null;
  minGoodQty?: number | null;
}

interface WorkOrderOperationDependencyMeta {
  predecessorDependencies?: OperationDependencyEdge[];
  qualityBlockReason?: string | null;
}

interface ConstraintEdge {
  operation: WorkOrderOperation;
  transferBatchQty: number;
  minGoodQty: number;
}

export function getOperationRemainingQty(op: WorkOrderOperation): number {
  return Number(op.remainingQty ?? 0);
}

export interface BatchReportCandidateOperation {
  status?: string | null;
  canReport?: boolean | null;
  remainingQty?: number | null;
  isOutsourced?: boolean | null;
  qualityBlockReason?: string | null;
  readyState?: string | null;
}

/**
 * 批量向导的候选范围不能复用单道工序的即时 canReport 快照。
 *
 * 串行工序的后道在前道尚未落库报工时通常 canReport=false，但批量向导会先保存
 * 前道草稿，再用草稿数量计算并解锁后道，后端也会按依赖拓扑顺序执行整批数据。
 * 真正的产出口径、计时模式等静态限制由调用方先过滤，动态约束进入向导后逐道校验。
 */
export function isBatchReportCandidateOperation(op: BatchReportCandidateOperation): boolean {
  return (
    op.isOutsourced !== true &&
    op.status !== 'skipped' &&
    Number(op.remainingQty ?? 0) > 0 &&
    !op.qualityBlockReason &&
    op.readyState !== 'blocked_by_quality'
  );
}

export function getPrevConstraintOp(
  operations: WorkOrderOperation[],
  currentOp: WorkOrderOperation,
): WorkOrderOperation | null {
  return getConstraintEdges(operations, currentOp)[0]?.operation ?? null;
}

export function sortOperationsForReporting(operations: WorkOrderOperation[]): WorkOrderOperation[] {
  const indexedOperations = operations.map((operation, index) => ({
    operation,
    index,
  }));
  const operationById = new Map(
    indexedOperations.map((item) => [item.operation.id, item.operation] as const),
  );
  const originalIndexById = new Map(
    indexedOperations.map((item) => [item.operation.id, item.index] as const),
  );
  const inDegree = new Map<string, number>();
  const successorsById = new Map<string, string[]>();

  for (const { operation } of indexedOperations) {
    inDegree.set(operation.id, 0);
    successorsById.set(operation.id, []);
  }

  const edgeSet = new Set<string>();
  for (const operation of operations) {
    if (!Array.isArray(operation.predecessorOperationIds)) continue;
    for (const predecessorId of operation.predecessorOperationIds) {
      if (!operationById.has(predecessorId)) continue;
      const edgeKey = `${predecessorId}:${operation.id}`;
      if (edgeSet.has(edgeKey)) continue;
      edgeSet.add(edgeKey);
      successorsById.get(predecessorId)?.push(operation.id);
      inDegree.set(operation.id, (inDegree.get(operation.id) ?? 0) + 1);
    }
  }

  const compareBySequence = (leftId: string, rightId: string) => {
    const left = operationById.get(leftId);
    const right = operationById.get(rightId);
    if (!left || !right) return 0;
    if (left.sequence !== right.sequence) return left.sequence - right.sequence;
    return (originalIndexById.get(leftId) ?? 0) - (originalIndexById.get(rightId) ?? 0);
  };

  const queue = [...inDegree.entries()]
    .filter(([, degree]) => degree === 0)
    .map(([id]) => id)
    .sort(compareBySequence);
  const sortedIds: string[] = [];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId) continue;
    sortedIds.push(currentId);

    for (const successorId of successorsById.get(currentId) ?? []) {
      const nextDegree = (inDegree.get(successorId) ?? 0) - 1;
      inDegree.set(successorId, nextDegree);
      if (nextDegree === 0) {
        queue.push(successorId);
        queue.sort(compareBySequence);
      }
    }
  }

  if (sortedIds.length !== operations.length) {
    const sortedSet = new Set(sortedIds);
    const unresolvedIds = operations
      .map((operation) => operation.id)
      .filter((id) => !sortedSet.has(id))
      .sort(compareBySequence);
    sortedIds.push(...unresolvedIds);
  }

  return sortedIds
    .map((id) => operationById.get(id))
    .filter((operation): operation is WorkOrderOperation => operation !== undefined);
}

function getLegacyPrevConstraintOp(
  operations: WorkOrderOperation[],
  currentOp: WorkOrderOperation,
): WorkOrderOperation | null {
  let prevOp: WorkOrderOperation | null = null;

  for (const candidate of operations) {
    if (candidate.id === currentOp.id) continue;
    if (candidate.status === 'skipped') continue;
    if (candidate.sequence >= currentOp.sequence) continue;
    if (currentOp.parallelGroup && candidate.parallelGroup === currentOp.parallelGroup) continue;
    if (!prevOp || candidate.sequence > prevOp.sequence) {
      prevOp = candidate;
    }
  }

  return prevOp;
}

function getPredecessorDependencies(
  currentOp: WorkOrderOperation,
): OperationDependencyEdge[] | null {
  const meta = currentOp as WorkOrderOperation & WorkOrderOperationDependencyMeta;
  if (Array.isArray(meta.predecessorDependencies)) {
    return meta.predecessorDependencies;
  }
  if (Array.isArray(currentOp.predecessorOperationIds)) {
    return currentOp.predecessorOperationIds.map((predecessorOperationId) => ({
      predecessorOperationId,
      transferBatchQty: currentOp.transferBatchQty ?? null,
      minGoodQty: null,
    }));
  }
  return null;
}

function getConstraintEdges(
  operations: WorkOrderOperation[],
  currentOp: WorkOrderOperation,
): ConstraintEdge[] {
  const predecessorDependencies = getPredecessorDependencies(currentOp);
  if (predecessorDependencies) {
    return predecessorDependencies
      .map((dependency) => {
        const operation = operations.find(
          (candidate) =>
            candidate.id === dependency.predecessorOperationId && candidate.status !== 'skipped',
        );
        if (!operation) return null;
        return {
          operation,
          transferBatchQty:
            Number(dependency.transferBatchQty ?? 0) ||
            Number(currentOp.transferBatchQty ?? 0) ||
            0,
          minGoodQty: Number(dependency.minGoodQty ?? 0) || 0,
        };
      })
      .filter((edge): edge is ConstraintEdge => edge !== null);
  }

  const legacyPrevOp = getLegacyPrevConstraintOp(operations, currentOp);
  return legacyPrevOp
    ? [
        {
          operation: legacyPrevOp,
          transferBatchQty: Number(currentOp.transferBatchQty ?? 0) || 0,
          minGoodQty: 0,
        },
      ]
    : [];
}

// 前道工序有效可完成量：优先 inputQty，异常为空/0 时回退 plannedQty（与后端 getOperationEffectiveQty 一致）
function getOperationEffectiveQty(operation: WorkOrderOperation): number {
  const inputQty =
    operation.inputQty !== null && operation.inputQty !== undefined
      ? Number(operation.inputQty)
      : null;
  const plannedQty =
    operation.plannedQty !== null && operation.plannedQty !== undefined
      ? Number(operation.plannedQty)
      : 0;
  if (inputQty !== null && inputQty > 0) return inputQty;
  if (plannedQty > 0) return plannedQty;
  return inputQty ?? plannedQty;
}

// 转移批量/最小良品门槛按前道可完成总量封顶，避免工单总数 < 转移批量时下道被永久卡死
function resolveEdgeStartThreshold(edge: ConstraintEdge): number {
  const configured = Math.max(edge.transferBatchQty, edge.minGoodQty);
  if (configured <= 0) return 0;
  const prevEffectiveQty = getOperationEffectiveQty(edge.operation);
  return prevEffectiveQty > 0 ? Math.min(configured, prevEffectiveQty) : configured;
}

export function getOperationReportConstraint(
  operations: WorkOrderOperation[],
  currentOp: WorkOrderOperation,
  draftCompletedQtyByOperationId?: Map<string, number>,
): OperationReportConstraint {
  const constraintEdges = getConstraintEdges(operations, currentOp);
  const intrinsicRemaining = getOperationRemainingQty(currentOp);
  const backendMaxQty =
    currentOp.maxReportQty !== undefined && currentOp.maxReportQty !== null
      ? Math.max(0, Number(currentOp.maxReportQty) || 0)
      : null;
  const hasDraftQty =
    draftCompletedQtyByOperationId !== undefined && draftCompletedQtyByOperationId.size > 0;
  const operationMeta = currentOp as WorkOrderOperation & WorkOrderOperationDependencyMeta;

  if (operationMeta.qualityBlockReason) {
    const edge = constraintEdges[0] ?? null;
    return {
      maxQty: 0,
      upstreamGoodQty: edge ? Number(edge.operation.completedQty ?? 0) : null,
      upstreamOp: edge?.operation ?? null,
      transferBatchQty: edge ? resolveEdgeStartThreshold(edge) : 0,
      transferGateOpen: false,
    };
  }

  if (currentOp.reportBlockReason && !hasDraftQty) {
    const edge = constraintEdges[0] ?? null;
    return {
      maxQty: 0,
      upstreamGoodQty: edge ? Number(edge.operation.completedQty ?? 0) : null,
      upstreamOp: edge?.operation ?? null,
      transferBatchQty: edge ? resolveEdgeStartThreshold(edge) : 0,
      transferGateOpen: false,
    };
  }

  if (backendMaxQty !== null && !hasDraftQty) {
    const edge = constraintEdges[0] ?? null;
    return {
      maxQty: backendMaxQty,
      upstreamGoodQty: edge ? Number(edge.operation.completedQty ?? 0) : null,
      upstreamOp: edge?.operation ?? null,
      transferBatchQty: edge ? resolveEdgeStartThreshold(edge) : 0,
      transferGateOpen: true,
    };
  }

  const edgeStates = constraintEdges.map((edge) => {
    const upstreamGoodQty =
      Number(edge.operation.completedQty ?? 0) +
      Number(draftCompletedQtyByOperationId?.get(edge.operation.id) ?? 0);
    return {
      ...edge,
      upstreamGoodQty,
      startThreshold: resolveEdgeStartThreshold(edge),
      upstreamRemaining: Math.max(0, upstreamGoodQty - Number(currentOp.reportedQty ?? 0)),
    };
  });
  // 前道已完工（含报废致良品不足）即视为无更多可下转，直接放行
  const blockedEdge = edgeStates.find(
    (edge) =>
      edge.startThreshold > 0 &&
      edge.operation.status !== 'completed' &&
      edge.upstreamGoodQty < edge.startThreshold,
  );
  if (blockedEdge) {
    return {
      maxQty: 0,
      upstreamGoodQty: blockedEdge.upstreamGoodQty,
      upstreamOp: blockedEdge.operation,
      transferBatchQty: blockedEdge.startThreshold,
      transferGateOpen: false,
    };
  }

  const upstreamGoodQty =
    edgeStates.length > 0 ? Math.min(...edgeStates.map((edge) => edge.upstreamGoodQty)) : null;
  const upstreamOp =
    upstreamGoodQty === null
      ? null
      : (edgeStates.find((edge) => edge.upstreamGoodQty === upstreamGoodQty)?.operation ?? null);

  if (!upstreamOp) {
    return {
      maxQty: backendMaxQty ?? intrinsicRemaining,
      upstreamGoodQty: null,
      upstreamOp: null,
      transferBatchQty: 0,
      transferGateOpen: true,
    };
  }

  const upstreamRemaining = Math.min(...edgeStates.map((edge) => edge.upstreamRemaining));

  return {
    maxQty: Math.min(intrinsicRemaining, upstreamRemaining),
    upstreamGoodQty,
    upstreamOp,
    transferBatchQty: Math.max(...edgeStates.map((edge) => edge.startThreshold)),
    transferGateOpen: true,
  };
}
