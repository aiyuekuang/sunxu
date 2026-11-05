import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { RouteTopologyDependencyDto } from '../../../types/models/RouteTopologyDependencyDto';
import type { ProcessOperation } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { DetailCard } from '../../../../core/components/DetailCard.tsx';
import { EmptyState } from '../../../../core/components/EmptyState.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { ProcessRouteOperationDetailSheet } from './ProcessRouteOperationDetailSheet.tsx';

export type ProcessRouteDependency = {
  predecessorOperationId?: string | null;
  successorOperationId?: string | null;
  dependencyType?: RouteTopologyDependencyDto.dependencyType | 'finish_to_start' | null;
  transferBatchQty?: number | null;
  minGoodQty?: number | null;
  remark?: string | null;
  sort?: number | null;
};

type OperationFlowNode = {
  operation: ProcessOperation;
  index: number;
};

type OperationFlow = {
  rows: OperationFlowNode[][];
  predecessorIdsByOperationId: Map<string, string[]>;
};

interface ProcessRouteOperationFlowSectionProps {
  operations: ProcessOperation[];
  dependencies: ProcessRouteDependency[];
  canEditStructure: boolean;
  onAddOperation: () => void;
  onCopyFromRoute: () => void;
  onEditOperation: (operation: ProcessOperation) => void;
  onRemoveOperation: (operationId: string) => void;
  onMoveOperation: (operationId: string, direction: 'up' | 'down') => void;
}

const buildDefaultDependencies = (operations: ProcessOperation[]): ProcessRouteDependency[] => {
  const stages = new Map<string, { order: number; indexes: number[] }>();

  operations.forEach((operation, index) => {
    const key =
      operation.stageNo != null
        ? `stage:${operation.stageNo}`
        : operation.parallelGroup
          ? `parallel:${operation.parallelGroup}`
          : `sequence:${index + 1}`;
    const order = operation.sequence ?? index + 1;
    const current = stages.get(key);
    if (current) {
      current.indexes.push(index);
      current.order = Math.min(current.order, order);
      return;
    }
    stages.set(key, { order, indexes: [index] });
  });

  const orderedStages = [...stages.values()].sort((left, right) => left.order - right.order);
  const dependencies: ProcessRouteDependency[] = [];
  for (let stageIndex = 1; stageIndex < orderedStages.length; stageIndex += 1) {
    const previousStage = orderedStages[stageIndex - 1];
    const currentStage = orderedStages[stageIndex];
    previousStage.indexes.forEach((predecessorIndex) => {
      currentStage.indexes.forEach((successorIndex) => {
        dependencies.push({
          predecessorOperationId: operations[predecessorIndex]?.id,
          successorOperationId: operations[successorIndex]?.id,
          dependencyType: RouteTopologyDependencyDto.dependencyType.FINISH_TO_START,
          transferBatchQty: operations[predecessorIndex]?.transferBatchQty ?? null,
          minGoodQty: null,
        });
      });
    });
  }
  return dependencies;
};

const buildOperationFlow = (
  operations: ProcessOperation[],
  dependencies: ProcessRouteDependency[],
): OperationFlow => {
  if (operations.length === 0) {
    return { rows: [], predecessorIdsByOperationId: new Map() };
  }

  const effectiveDependencies =
    dependencies.length > 0 ? dependencies : buildDefaultDependencies(operations);
  const indexById = new Map(operations.map((operation, index) => [operation.id, index]));
  const predecessorsBySuccessorIndex = new Map<number, number[]>();
  const predecessorIdsByOperationId = new Map<string, string[]>();

  effectiveDependencies.forEach((dependency) => {
    if (!dependency.predecessorOperationId || !dependency.successorOperationId) return;
    const predecessorIndex = indexById.get(dependency.predecessorOperationId);
    const successorIndex = indexById.get(dependency.successorOperationId);
    if (predecessorIndex === undefined || successorIndex === undefined) return;

    const predecessors = predecessorsBySuccessorIndex.get(successorIndex) ?? [];
    if (!predecessors.includes(predecessorIndex)) {
      predecessors.push(predecessorIndex);
      predecessorsBySuccessorIndex.set(successorIndex, predecessors);
    }

    const predecessorIds = predecessorIdsByOperationId.get(dependency.successorOperationId) ?? [];
    if (!predecessorIds.includes(dependency.predecessorOperationId)) {
      predecessorIds.push(dependency.predecessorOperationId);
      predecessorIdsByOperationId.set(dependency.successorOperationId, predecessorIds);
    }
  });

  const levelByIndex = new Map<number, number>();
  const resolving = new Set<number>();
  const resolveLevel = (index: number): number => {
    const cached = levelByIndex.get(index);
    if (cached !== undefined) return cached;
    if (resolving.has(index)) return 0;
    resolving.add(index);
    const predecessors = predecessorsBySuccessorIndex.get(index) ?? [];
    const level =
      predecessors.length > 0
        ? Math.max(...predecessors.map((predecessorIndex) => resolveLevel(predecessorIndex))) + 1
        : 0;
    resolving.delete(index);
    levelByIndex.set(index, level);
    return level;
  };

  const rows = new Map<number, OperationFlowNode[]>();
  operations.forEach((operation, index) => {
    const level = resolveLevel(index);
    const row = rows.get(level) ?? [];
    row.push({ operation, index });
    rows.set(level, row);
  });

  return {
    rows: [...rows.entries()]
      .sort(([left], [right]) => left - right)
      .map(([, row]) =>
        row.sort(
          (left, right) =>
            (left.operation.sequence ?? left.index) - (right.operation.sequence ?? right.index),
        ),
      ),
    predecessorIdsByOperationId,
  };
};

const formatSequence = (operation: ProcessOperation, index: number) =>
  String(operation.sequence ?? index + 1).padStart(2, '0');

export function ProcessRouteOperationFlowSection({
  operations,
  dependencies,
  canEditStructure,
  onAddOperation,
  onCopyFromRoute,
  onEditOperation,
  onRemoveOperation,
  onMoveOperation,
}: ProcessRouteOperationFlowSectionProps) {
  const { colors } = useTheme();
  const [selectedNode, setSelectedNode] = useState<OperationFlowNode | null>(null);
  const flow = useMemo(
    () => buildOperationFlow(operations, dependencies),
    [operations, dependencies],
  );
  const operationById = useMemo(
    () => new Map(operations.map((operation) => [operation.id, operation])),
    [operations],
  );

  const selectedOperation = selectedNode
    ? (operationById.get(selectedNode.operation.id) ?? selectedNode.operation)
    : null;
  const selectedIndex = selectedOperation
    ? operations.findIndex((operation) => operation.id === selectedOperation.id)
    : -1;

  const getOperationNameById = (operationId: string) => {
    const operation = operationById.get(operationId);
    if (!operation) return operationId;
    const index = operations.findIndex((item) => item.id === operation.id);
    return `${operation.sequence ?? index + 1}. ${operation.name}`;
  };

  const getPredecessorSummary = (operationId: string) => {
    const predecessorIds = flow.predecessorIdsByOperationId.get(operationId) ?? [];
    if (predecessorIds.length === 0) return '起点工序';
    return `前置 ${predecessorIds.map(getOperationNameById).join('、')}`;
  };
  const selectedPredecessorSummary = selectedOperation
    ? getPredecessorSummary(selectedOperation.id)
    : undefined;

  const handleMoveSelected = (direction: 'up' | 'down') => {
    if (!selectedOperation) return;
    setSelectedNode(null);
    onMoveOperation(selectedOperation.id, direction);
  };

  const handleEditSelected = () => {
    if (!selectedOperation) return;
    setSelectedNode(null);
    onEditOperation(selectedOperation);
  };

  const handleRemoveSelected = () => {
    if (!selectedOperation) return;
    setSelectedNode(null);
    onRemoveOperation(selectedOperation.id);
  };

  return (
    <>
      <DetailCard
        title={`工序列表 (${operations.length})`}
        right={
          canEditStructure ? (
            <View style={styles.opActions}>
              <TouchableOpacity
                style={[styles.addOpBtn, { backgroundColor: `${colors.textMuted}15` }]}
                onPress={onCopyFromRoute}
              >
                <Ionicons name="copy-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.addOpBtnText, { color: colors.textSecondary }]}>
                  从路线复制
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addOpBtn, { backgroundColor: `${colors.primary}15` }]}
                onPress={onAddOperation}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={[styles.addOpBtnText, { color: colors.primary }]}>添加</Text>
              </TouchableOpacity>
            </View>
          ) : undefined
        }
      >
        {operations.length === 0 ? (
          <EmptyState
            compact
            icon="layers-outline"
            title="暂无工序"
            description={canEditStructure ? '点击"添加"配置工序' : '当前路线还没有配置工序'}
          />
        ) : (
          <View style={styles.flow}>
            {flow.rows.map((row, rowIndex) => (
              <View key={row.map((node) => node.operation.id).join(':')}>
                {rowIndex > 0 && (
                  <View style={[styles.flowArrow, { borderColor: colors.border }]}>
                    <Ionicons name="arrow-down" size={14} color={colors.textSecondary} />
                  </View>
                )}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[
                    styles.flowRowContent,
                    row.length === 1 ? styles.flowRowSingleContent : null,
                  ]}
                >
                  {row.map((node) => {
                    const { operation, index } = node;
                    const isParallel = row.length > 1;
                    return (
                      <TouchableOpacity
                        key={operation.id}
                        activeOpacity={0.82}
                        style={[
                          styles.flowNode,
                          isParallel ? styles.flowNodeCompact : styles.flowNodeWide,
                          {
                            backgroundColor: operation.isQualityCheck
                              ? `${colors.primary}08`
                              : colors.background,
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() => setSelectedNode(node)}
                      >
                        <View style={styles.flowNodeHeader}>
                          <View style={[styles.seqBadge, { backgroundColor: colors.primary }]}>
                            <Text style={[styles.seqText, { color: colors.textOnPrimary }]}>
                              {formatSequence(operation, index)}
                            </Text>
                          </View>
                          <Text style={[styles.opName, { color: colors.text }]} numberOfLines={1}>
                            {operation.name}
                          </Text>
                        </View>
                        <Text
                          style={[styles.flowNodeMeta, { color: colors.textSecondary }]}
                          numberOfLines={1}
                        >
                          {getPredecessorSummary(operation.id)}
                        </Text>
                        <View style={styles.flowNodeFooter}>
                          {operation.isEnabled === false && (
                            <View
                              style={[
                                styles.tagBadge,
                                { backgroundColor: `${colors.textMuted}18` },
                              ]}
                            >
                              <Text style={[styles.tagBadgeText, { color: colors.textMuted }]}>
                                停用
                              </Text>
                            </View>
                          )}
                          {operation.isQualityCheck && (
                            <View
                              style={[styles.tagBadge, { backgroundColor: `${colors.primary}18` }]}
                            >
                              <Text style={[styles.tagBadgeText, { color: colors.primary }]}>
                                IPQC
                              </Text>
                            </View>
                          )}
                          {operation.isOutsourced && (
                            <View
                              style={[styles.tagBadge, { backgroundColor: `${colors.warning}18` }]}
                            >
                              <Text style={[styles.tagBadgeText, { color: colors.warning }]}>
                                委外
                              </Text>
                            </View>
                          )}
                          {!operation.isQualityCheck && !operation.isOutsourced && (
                            <Text style={[styles.flowNodeHint, { color: colors.textTertiary }]}>
                              查看详情
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ))}
          </View>
        )}
      </DetailCard>

      <ProcessRouteOperationDetailSheet
        operation={selectedOperation}
        operationIndex={selectedIndex}
        operationCount={operations.length}
        predecessorSummary={selectedPredecessorSummary}
        canEditStructure={canEditStructure}
        onClose={() => setSelectedNode(null)}
        onMove={handleMoveSelected}
        onEdit={handleEditSelected}
        onRemove={handleRemoveSelected}
      />
    </>
  );
}

const styles = StyleSheet.create({
  opActions: { flexDirection: 'row', gap: Spacing.xs },
  addOpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    minHeight: 32,
  },
  addOpBtnText: { fontSize: FontSize.xs, fontWeight: '600' },
  flow: { gap: Spacing.xs },
  flowArrow: { alignItems: 'center', paddingVertical: Spacing.xs },
  flowRowContent: { gap: Spacing.sm, paddingVertical: 2 },
  flowRowSingleContent: { width: '100%' },
  flowNode: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  flowNodeCompact: { width: 136 },
  flowNodeWide: { flex: 1, minWidth: 260 },
  flowNodeHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  seqBadge: {
    width: 24,
    height: 24,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  seqText: { fontSize: FontSize.xs, fontWeight: '700' },
  opName: { flex: 1, fontSize: FontSize.sm, fontWeight: '600' },
  flowNodeMeta: { fontSize: FontSize.xs },
  flowNodeFooter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, minHeight: 20 },
  flowNodeHint: { fontSize: FontSize.xs },
  tagBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm },
  tagBadgeText: { fontSize: FontSize.xs, fontWeight: '600' },
});
