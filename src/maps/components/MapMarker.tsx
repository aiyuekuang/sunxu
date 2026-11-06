import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from '../../core/components/AppText';
import { FontSize, Radius, Shadow, Spacing } from '../../core/theme/tokens';
import { useTheme } from '../../core/theme/useTheme';

export type MapMarkerVariant = 'default' | 'selected' | 'start' | 'end';

export interface MapMarkerProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: MapMarkerVariant;
  style?: StyleProp<ViewStyle>;
}

const markerIcons: Record<MapMarkerVariant, keyof typeof Ionicons.glyphMap> = {
  default: 'location',
  selected: 'location',
  start: 'play',
  end: 'flag',
};

/** Provider-neutral marker artwork. Render inside the provider's marker/annotation slot. */
export function MapMarker({ label, icon, variant = 'default', style }: MapMarkerProps) {
  const { colors } = useTheme();
  const color = variant === 'end' ? colors.error : variant === 'start' ? colors.success : colors.primary;

  return (
    <View style={[styles.wrap, style]} accessible accessibilityRole="image" accessibilityLabel={label ?? '地图标记'}>
      {label ? (
        <View style={[styles.label, { backgroundColor: colors.surface }]}>
          <AppText style={[styles.labelText, { color: colors.text }]} numberOfLines={1}>{label}</AppText>
        </View>
      ) : null}
      <View style={[styles.pinSpace, variant === 'selected' ? styles.selectedPinSpace : null]}>
        <View style={[styles.tail, { backgroundColor: color }]} />
        <View
          style={[
            styles.pin,
            variant === 'selected' ? styles.selectedPin : null,
            Shadow.md,
            { backgroundColor: color, borderColor: colors.surface },
          ]}
        >
          <Ionicons name={icon ?? markerIcons[variant]} size={17} color={colors.textOnPrimary} />
        </View>
      </View>
    </View>
  );
}

/** Blue position dot for the device's live location. Place it inside a provider annotation. */
export function MapCurrentLocationMarker({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.currentWrap, style]} accessible accessibilityRole="image" accessibilityLabel="当前位置">
      <View style={[styles.currentHalo, { backgroundColor: `${colors.info}24` }]} />
      <View style={[styles.currentRing, { borderColor: colors.surface }]}>
        <View style={[styles.currentDot, { backgroundColor: colors.info }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', minWidth: 28 },
  label: {
    maxWidth: 180,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
    borderRadius: Radius.md,
    ...Shadow.md,
  },
  labelText: { fontSize: FontSize.xs, fontWeight: '600' },
  pinSpace: { width: 38, height: 43, alignItems: 'center' },
  selectedPinSpace: { width: 42, height: 47 },
  tail: { position: 'absolute', width: 10, height: 10, bottom: 1, transform: [{ rotate: '45deg' }] },
  pin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedPin: { width: 38, height: 38, borderRadius: 19, borderWidth: 3 },
  currentWrap: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  currentHalo: { ...StyleSheet.absoluteFillObject, borderRadius: 21 },
  currentRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  currentDot: { width: 12, height: 12, borderRadius: 6 },
});
