import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText as Text } from '../../core/components/AppText.tsx';
import { FontSize, Radius, Spacing } from '../../core/theme/tokens';
import { useTheme } from '../../core/theme/useTheme';
import { useOnboardingStore } from '../../mes/host/state/onboarding.store';

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  {
    title: '欢迎使用 MES',
    description: '这是您的生产管理控制中心。让我们快速了解核心功能。',
    icon: 'rocket-outline',
  },
  {
    title: '扫码报工',
    description: '点击底部"扫码"按钮，扫描系统生成的内部工单二维码或工序二维码即可快速报工。',
    icon: 'scan-outline',
  },
  {
    title: '工单管理',
    description: '在"工单"页面查看和管理所有生产任务，支持筛选、搜索。',
    icon: 'clipboard-outline',
  },
  {
    title: '实时通知',
    description: '质量异常、设备预警将实时推送到您的手机，不错过任何重要信息。',
    icon: 'notifications-outline',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingGuide() {
  const { colors } = useTheme();
  const { hasCompleted, currentStep, nextStep, skip } = useOnboardingStore();

  if (hasCompleted) return null;

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  return (
    <View style={styles.overlay}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}1A` }]}>
          <Ionicons
            name={step.icon as keyof typeof Ionicons.glyphMap}
            size={48}
            color={colors.primary}
          />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{step.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {step.description}
        </Text>

        {/* Progress dots */}
        <View style={styles.dots}>
          {STEPS.map((s, i) => (
            <View
              key={s.title}
              style={[
                styles.dot,
                { backgroundColor: colors.border },
                i === currentStep && [styles.dotActive, { backgroundColor: colors.primary }],
              ]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={skip} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: colors.textMuted }]}>跳过</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={nextStep}
            style={[styles.nextBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.nextText, { color: colors.textOnPrimary }]}>
              {isLast ? '开始使用' : '下一步'}
            </Text>
            <Ionicons name="arrow-forward" size={16} color={colors.textOnPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    width: '85%',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  description: {
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: Spacing.sm,
  },
  skipBtn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  skipText: {
    fontSize: FontSize.base,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.sm,
  },
  nextText: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
});
