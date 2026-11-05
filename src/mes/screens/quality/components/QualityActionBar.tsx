import { StyleSheet, TouchableOpacity } from 'react-native';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomActionBar } from '../../../../core/components/BottomActionBar.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QualityActionBarProps {
  canEdit: boolean;
  canInspect: boolean;
  canComplete: boolean;
  canDelete: boolean;
  canCancelAmend: boolean;
  canSeal: boolean;
  onEdit: () => void;
  onInspect: () => void;
  onComplete: () => void;
  onDelete: () => void;
  onCancelAmend: () => void;
  onSeal: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QualityActionBar({
  canEdit,
  canInspect,
  canComplete,
  canDelete,
  canCancelAmend,
  canSeal,
  onEdit,
  onInspect,
  onComplete,
  onDelete,
  onCancelAmend,
  onSeal,
}: QualityActionBarProps) {
  const { colors } = useTheme();

  return (
    <BottomActionBar style={styles.footer}>
      {canSeal && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={onSeal}
        >
          <Text style={[styles.actionBtnText, { color: colors.textOnPrimary }]}>封闭检验批</Text>
        </TouchableOpacity>
      )}
      {canEdit && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={onEdit}
        >
          <Text style={[styles.actionBtnText, { color: colors.textOnPrimary }]}>编辑</Text>
        </TouchableOpacity>
      )}
      {canInspect && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.success }]}
          onPress={onInspect}
        >
          <Text style={[styles.actionBtnText, { color: colors.textOnPrimary }]}>新增记录</Text>
        </TouchableOpacity>
      )}
      {canComplete && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.success }]}
          onPress={onComplete}
        >
          <Text style={[styles.actionBtnText, { color: colors.textOnPrimary }]}>完成质检</Text>
        </TouchableOpacity>
      )}
      {canDelete && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.error }]}
          onPress={onDelete}
        >
          <Text style={[styles.actionBtnText, { color: colors.textOnPrimary }]}>删除</Text>
        </TouchableOpacity>
      )}
      {canCancelAmend && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.warning }]}
          onPress={onCancelAmend}
        >
          <Text style={[styles.actionBtnText, { color: colors.textOnPrimary }]}>取消并修正</Text>
        </TouchableOpacity>
      )}
    </BottomActionBar>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  actionBtnText: { fontSize: FontSize.sm, fontWeight: '600' },
});
