import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Announcement } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UrgentAnnouncementModalProps {
  announcements: Announcement[];
  onConfirm: (id: string) => Promise<void>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function UrgentAnnouncementModal({
  announcements,
  onConfirm,
}: UrgentAnnouncementModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [confirming, setConfirming] = useState(false);

  if (announcements.length === 0) return null;

  const current = announcements[0];
  if (!current) return null;

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm(current.id);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Modal visible animationType="fade" transparent>
      <View
        style={[
          styles.overlay,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            // 遮罩用主题 token，暗色主题下加深
            backgroundColor: colors.overlay,
          },
        ]}
      >
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={[styles.urgentBadge, { backgroundColor: colors.errorLight }]}>
              <Text style={[styles.urgentBadgeText, { color: colors.error }]}>紧急公告</Text>
            </View>
            {announcements.length > 1 && (
              <Text style={[styles.counter, { color: colors.textTertiary }]}>
                待确认 {announcements.length} 条
              </Text>
            )}
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{current.title}</Text>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            <Text style={[styles.content, { color: colors.textSecondary }]}>{current.content}</Text>
          </ScrollView>

          <Pressable
            style={[
              styles.confirmBtn,
              { backgroundColor: colors.primary, opacity: confirming ? 0.6 : 1 },
            ]}
            onPress={handleConfirm}
            disabled={confirming}
          >
            <Text style={styles.confirmBtnText}>{confirming ? '确认中...' : '已阅'}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    borderRadius: Radius.lg,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  urgentBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  urgentBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  counter: {
    fontSize: FontSize.xs,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  body: {
    maxHeight: 300,
  },
  bodyContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  content: {
    fontSize: FontSize.base,
    lineHeight: 24,
  },
  confirmBtn: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.base,
    fontWeight: '600',
  },
});
