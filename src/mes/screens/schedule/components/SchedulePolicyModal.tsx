import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { type SchedulePolicyDto, scheduleService } from '../../../host/services';
import { AppText as Text } from '../../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { ChipSelectField } from '../../../../core/components/ChipSelectField.tsx';
import { FormSwitch } from '../../../../core/components/FormField.tsx';
import { FontSize, Radius, Spacing } from '../../../../core/theme/tokens';
import { useTheme } from '../../../../core/theme/useTheme';
import { toast } from '../../../../core/toast';
import { BUFFER_RATIO_OPTIONS, formatBufferRatio } from '../buffer-policy';

interface SchedulePolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SchedulePolicyModal({ visible, onClose }: SchedulePolicyModalProps) {
  const { colors } = useTheme();
  const [policy, setPolicy] = useState<SchedulePolicyDto | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [defaultBufferRatioDraft, setDefaultBufferRatioDraft] = useState<string>('0');
  const [allowBufferRatioOverrideDraft, setAllowBufferRatioOverrideDraft] = useState(false);

  const resetDraft = React.useCallback((nextPolicy: SchedulePolicyDto | null) => {
    if (!nextPolicy) return;
    setDefaultBufferRatioDraft(String(nextPolicy.defaultBufferRatio));
    setAllowBufferRatioOverrideDraft(nextPolicy.allowBufferRatioOverride);
  }, []);

  useEffect(() => {
    if (!visible) return;

    void (async () => {
      setPolicyLoading(true);
      try {
        const res = await scheduleService.getPolicy();
        setPolicy(res);
        resetDraft(res);
      } catch (e: unknown) {
        toast.error((e as Error)?.message ?? '加载排产缓冲策略失败');
      } finally {
        setPolicyLoading(false);
      }
    })();
  }, [resetDraft, visible]);

  const isPolicyDirty = useMemo(
    () =>
      !!policy &&
      (Math.abs(Number(defaultBufferRatioDraft) - policy.defaultBufferRatio) > 0.0001 ||
        allowBufferRatioOverrideDraft !== policy.allowBufferRatioOverride),
    [allowBufferRatioOverrideDraft, defaultBufferRatioDraft, policy],
  );
  const confirmDisabledHint = policyLoading
    ? '正在加载排产缓冲策略，请稍候'
    : !policy
      ? '排产缓冲策略未加载，请关闭后重试'
      : !isPolicyDirty
        ? '请先修改策略后保存'
        : undefined;

  const handleClose = () => {
    resetDraft(policy);
    onClose();
  };

  const handleSave = async () => {
    setSavingPolicy(true);
    try {
      const res = await scheduleService.updatePolicy({
        defaultBufferRatio: Number(defaultBufferRatioDraft),
        allowBufferRatioOverride: allowBufferRatioOverrideDraft,
      });
      setPolicy(res);
      resetDraft(res);
      toast.success('已更新公司默认缓冲策略');
      onClose();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? '更新公司默认缓冲策略失败');
    } finally {
      setSavingPolicy(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title="缓冲策略"
      subtitle="保存后会影响后续预览与排产的默认缓冲策略。"
      confirmText="保存"
      onConfirm={handleSave}
      loading={savingPolicy}
      disabled={!policy || policyLoading || !isPolicyDirty}
      confirmDisabledHint={confirmDisabledHint}
      dynamicHeight
    >
      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.summaryTitle, { color: colors.text }]}>
          当前默认：
          {policyLoading || !policy ? '加载中...' : formatBufferRatio(policy.defaultBufferRatio)}
        </Text>
        <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
          {policyLoading
            ? '正在加载公司排产缓冲策略...'
            : policy
              ? `当前策略${policy.allowBufferRatioOverride ? '允许' : '不允许'}排产时临时覆盖默认比例。`
              : '排产缓冲策略未加载'}
        </Text>
      </View>

      <FormSwitch
        label="允许排产时临时覆盖默认比例"
        value={allowBufferRatioOverrideDraft}
        onValueChange={setAllowBufferRatioOverrideDraft}
      />

      <ChipSelectField
        label="公司默认缓冲比例"
        help={{
          title: '排产缓冲策略',
          purpose: '公司默认缓冲用于后续排产预览和排产。',
          usage: [
            '启用临时覆盖后，排产员可在单次排产中改用其他比例。',
            '缓冲时间追加在排产总工时末尾，用于吸收生产波动。',
          ],
        }}
        options={BUFFER_RATIO_OPTIONS}
        value={defaultBufferRatioDraft}
        onChange={(v) => v && setDefaultBufferRatioDraft(v)}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  summaryTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  summaryText: {
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
});
