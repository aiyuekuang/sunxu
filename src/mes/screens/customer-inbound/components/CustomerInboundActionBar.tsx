import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { CustomerExternalItem } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomActionBar } from '../../../../core/components/BottomActionBar.tsx';
import { Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

export type CustomerInboundAction = 'edit' | 'convert' | 'return' | 'loss';

interface CustomerInboundActionBarProps {
  item: CustomerExternalItem;
  canEdit: boolean;
  canConvert: boolean;
  canReturn: boolean;
  canLoss: boolean;
  onAction: (action: CustomerInboundAction) => void;
}

export function CustomerInboundActionBar({
  item,
  canEdit,
  canConvert,
  canReturn,
  canLoss,
  onAction,
}: CustomerInboundActionBarProps) {
  const { colors } = useTheme();
  const backendActions = Array.isArray(item.availableActions) ? item.availableActions : null;
  const canRunAction = (action: 'update' | 'convertToStock' | 'return' | 'loss') =>
    backendActions?.includes(action) === true;
  const actions = [
    {
      key: 'edit' as const,
      label: '编辑',
      visible: canEdit && canRunAction('update'),
      color: colors.primary,
    },
    {
      key: 'convert' as const,
      label: '转库存',
      visible: canConvert && canRunAction('convertToStock'),
      color: colors.success,
    },
    {
      key: 'return' as const,
      label: '归还',
      visible: canReturn && canRunAction('return'),
      color: colors.warning,
    },
    {
      key: 'loss' as const,
      label: '损耗',
      visible: canLoss && canRunAction('loss'),
      color: colors.error,
    },
  ].filter((action) => action.visible);

  if (actions.length === 0) return null;

  return (
    <BottomActionBar>
      <View style={styles.row}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.key}
            style={[styles.button, { backgroundColor: `${action.color}14` }]}
            onPress={() => onAction(action.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.buttonText, { color: action.color }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </BottomActionBar>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.sm },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  buttonText: { fontWeight: '600' },
});
