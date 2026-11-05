import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, View } from 'react-native';
import type { TraceNode } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { TRACE_NODE_TYPE_CONFIG } from '../../../constants/status-configs';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useUnitDisplay } from '../../../host/hooks/useUnitDisplay';
import { useTheme } from '../../../../core/theme/useTheme';
import type { RootStackParamList } from '../../../host/navigation';
import { formatQtyWithUnit } from '../../../utils/qty-unit';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TraceTreeNodeProps {
  node: TraceNode & { children?: Array<TraceNode & { children?: TraceNode[] }> };
  depth?: number;
}

function contextSummary(node: TraceNode): string | null {
  const parts = [
    node.context?.man?.[0]?.label ? `人：${node.context.man[0].label}` : null,
    node.context?.machine?.[0]?.label ? `机：${node.context.machine[0].label}` : null,
    node.context?.method?.[0]?.label ? `法：${node.context.method[0].label}` : null,
    node.context?.measurement?.[0]?.label ? `测：${node.context.measurement[0].label}` : null,
    node.context?.environment?.[0]?.dataType ? `环：${node.context.environment[0].dataType}` : null,
  ].filter((item): item is string => Boolean(item));
  return parts.length > 0 ? parts.join('  ') : null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TraceTreeNode({ node, depth = 0 }: TraceTreeNodeProps) {
  const { colors } = useTheme();
  const { labelMap: unitLabelMap } = useUnitDisplay('material');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const summary = contextSummary(node);

  const handlePressBatch = () => {
    if (node.type === 'batch') {
      navigation.navigate('Batch', { screen: 'BatchDetail', params: { id: node.refId } });
    }
  };

  const handlePressWorkOrder = () => {
    if (node.type === 'work_order') {
      navigation.navigate('WorkOrders', {
        screen: 'WorkOrderDetail',
        params: { id: node.refId },
      });
    }
  };

  const handlePress = () => {
    if (node.type === 'batch') {
      handlePressBatch();
      return;
    }
    if (node.type === 'work_order') {
      handlePressWorkOrder();
    }
  };

  return (
    <View style={[styles.wrapper, { marginLeft: depth * 20 }]}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.node,
          { borderLeftColor: colors.primary, backgroundColor: colors.surface },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={styles.titleRow}>
          <Text style={[styles.type, { color: colors.textSecondary }]}>
            {TRACE_NODE_TYPE_CONFIG[node.type] ?? node.type}
          </Text>
          <Text style={[styles.batchNo, { color: colors.primary }]}>{node.title}</Text>
        </View>
        <Text style={[styles.material, { color: colors.text }]}>{node.subtitle ?? '-'}</Text>
        <Text style={[styles.qty, { color: colors.textSecondary }]}>
          数量: {formatQtyWithUnit(node.qty, node.unit, unitLabelMap, { fallback: '-' })}
        </Text>
        {summary && (
          <Text style={[styles.summary, { color: colors.textSecondary }]}>{summary}</Text>
        )}
        {node.missingContext?.[0] && (
          <Text style={[styles.missing, { color: colors.warning }]}>{node.missingContext[0]}</Text>
        )}
      </Pressable>
      {node.children?.map((child, i) => (
        <TraceTreeNode key={child.id ?? i} node={child} depth={depth + 1} />
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {},
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  type: { fontSize: FontSize.xs },
  node: {
    borderLeftWidth: 3,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.sm,
    marginBottom: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  batchNo: { fontSize: FontSize.sm, fontWeight: '600' },
  material: { fontSize: FontSize.sm },
  qty: { fontSize: FontSize.xs },
  summary: { fontSize: FontSize.xs, marginTop: Spacing.xs },
  missing: { fontSize: FontSize.xs, marginTop: Spacing.xs },
});
