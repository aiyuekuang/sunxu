import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from './AppText';
import { FontSize, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export interface OfflineIndicatorProps {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  onSync: () => void;
}

export function OfflineIndicator({ isOnline, pendingCount, isSyncing, onSync }: OfflineIndicatorProps) {
  const { colors } = useTheme();

  if (isOnline && pendingCount === 0) return null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isOnline ? colors.warningLight : colors.errorLight },
      ]}
    >
      <Ionicons
        name={isOnline ? 'cloud-upload-outline' : 'cloud-offline-outline'}
        size={16}
        color={isOnline ? colors.warning : colors.error}
      />
      <Text style={[styles.text, { color: isOnline ? colors.warning : colors.error }]}>
        {!isOnline ? '离线模式 — 操作将在恢复网络后同步' : `${pendingCount} 条待同步数据`}
      </Text>
      {isOnline && pendingCount > 0 && (
        <TouchableOpacity onPress={onSync} disabled={isSyncing}>
          <Text style={[styles.syncBtn, { color: colors.primary }]}>
            {isSyncing ? '同步中...' : '立即同步'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  text: { fontSize: FontSize.sm, flex: 1 },
  syncBtn: { fontSize: FontSize.sm, fontWeight: '600' },
});
