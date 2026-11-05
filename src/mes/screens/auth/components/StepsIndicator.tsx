import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StepsIndicatorProps {
  /** Current active step (1 or 2) */
  currentStep: 1 | 2;
  /** Called when user taps a previous step */
  onStepPress: (step: 1 | 2) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StepsIndicator({ currentStep, onStepPress }: StepsIndicatorProps) {
  return (
    <View style={styles.stepsRow}>
      {([1, 2] as const).map((s) => (
        <TouchableOpacity
          key={s}
          style={styles.stepItem}
          onPress={() => {
            if (s < currentStep) onStepPress(s);
          }}
          disabled={s >= currentStep}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.stepDot,
              currentStep >= s ? styles.stepDotActive : styles.stepDotInactive,
            ]}
          >
            <Text
              style={[
                styles.stepDotText,
                { color: currentStep >= s ? '#1677FF' : 'rgba(255,255,255,0.6)' },
              ]}
            >
              {s}
            </Text>
          </View>
          <Text
            style={[
              styles.stepLabel,
              { color: currentStep >= s ? '#fff' : 'rgba(255,255,255,0.5)' },
            ]}
          >
            {s === 1 ? '账号信息' : '选择公司'}
          </Text>
        </TouchableOpacity>
      ))}
      <View
        style={[
          styles.stepLine,
          { backgroundColor: currentStep >= 2 ? '#fff' : 'rgba(255,255,255,0.3)' },
        ]}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    position: 'relative',
    paddingHorizontal: Spacing.xl,
  },
  stepItem: {
    alignItems: 'center',
    gap: Spacing.xs,
    zIndex: 1,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: '#fff',
  },
  stepDotInactive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  stepDotText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: FontSize.xs,
  },
  stepLine: {
    position: 'absolute',
    height: 2,
    top: 14,
    left: '30%',
    right: '30%',
  },
});
