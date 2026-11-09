import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { FontSize, Spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { AppText } from './AppText';
import { Avatar } from './Avatar';

export interface ProfileIdentityProps {
  /** Display name shown as the primary identity. */
  displayName: string;
  avatarUri?: string | null;
  /** Host-owned supporting identity, such as a username, seat number, or extension. */
  metadata?: ReactNode;
  onAvatarPress?: () => void;
  avatarAccessibilityLabel?: string;
  avatarAccessibilityHint?: string;
  avatarDisabled?: boolean;
  avatarLoading?: boolean;
  avatarSize?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** A compact, presentational identity header. Navigation and profile data stay with the host. */
export function ProfileIdentity({
  displayName,
  avatarUri,
  metadata,
  onAvatarPress,
  avatarAccessibilityLabel,
  avatarAccessibilityHint,
  avatarDisabled = false,
  avatarLoading = false,
  avatarSize = 64,
  style,
  testID,
}: ProfileIdentityProps) {
  const { colors } = useTheme();

  return (
    <View testID={testID} style={[styles.container, style]}>
      <Avatar
        uri={avatarUri}
        name={displayName}
        size={avatarSize}
        onPress={onAvatarPress}
        accessibilityLabel={avatarAccessibilityLabel}
        accessibilityHint={avatarAccessibilityHint}
        disabled={avatarDisabled}
        isLoading={avatarLoading}
      />
      <View style={styles.identity}>
        <AppText style={[styles.displayName, { color: colors.text }]}>
          {displayName}
        </AppText>
        {metadata != null ? (
          <View style={styles.metadata}>{metadata}</View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  identity: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.xs,
  },
  displayName: {
    fontSize: FontSize.xl,
    lineHeight: 28,
    fontWeight: '700',
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
