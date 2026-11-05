import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontSize, Radius, Spacing } from '../../../core/theme/tokens';
import { useTheme } from '../../../core/theme/useTheme';
import { toast } from '../../../core/toast';
import { AppText as Text } from '../../../core/components/AppText.tsx';
import { BottomSheet } from '../../../core/components/BottomSheet.tsx';

export type SendChannelOption<TChannel extends string> = {
  channel: TChannel;
  label: string;
  target?: string | null;
  canDirectSend: boolean;
};

export type SendOptionsResponse<
  TChannel extends string,
  TOption extends SendChannelOption<TChannel> = SendChannelOption<TChannel>,
> = {
  options: TOption[];
  messageContent?: string | null;
  emailSubject?: string | null;
};

type ChannelIconConfig = {
  name: keyof typeof Ionicons.glyphMap;
  color?: string;
};

interface SendActionSheetProps<
  TPayload,
  TChannel extends string,
  TOption extends SendChannelOption<TChannel>,
  TResponse extends SendOptionsResponse<TChannel, TOption>,
> {
  visible: boolean;
  payload?: TPayload;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSuccess?: () => void;
  confirmText?: string;
  loadingText?: string;
  emptyText?: string;
  messageBoxTitle?: string;
  channelOrder?: ReadonlyArray<TChannel>;
  autoCopyChannels?: ReadonlyArray<TChannel>;
  nativeShareChannels?: ReadonlyArray<TChannel>;
  fetchOptions: (payload: TPayload) => Promise<TResponse>;
  sendAction: (payload: TPayload, channel: TChannel) => Promise<unknown>;
  getChannelIcon: (channel: TChannel) => ChannelIconConfig;
  getTagText: (option: TOption) => string;
  getShareTitle: (optionsData: TResponse | null) => string;
  getSuccessMessage: (channel: TChannel) => string;
}

function sortOptions<TChannel extends string, TOption extends { channel: TChannel }>(
  options: TOption[],
  channelOrder?: ReadonlyArray<TChannel>,
): TOption[] {
  if (!channelOrder?.length) return [...options];
  const rank = new Map(channelOrder.map((channel, index) => [channel, index]));
  return [...options].sort(
    (left, right) => (rank.get(left.channel) ?? 999) - (rank.get(right.channel) ?? 999),
  );
}

function pickDefaultChannel<TChannel extends string, TOption extends { channel: TChannel }>(
  options: TOption[],
): TChannel | null {
  return options[0]?.channel ?? null;
}

export function SendActionSheet<
  TPayload,
  TChannel extends string,
  TOption extends SendChannelOption<TChannel>,
  TResponse extends SendOptionsResponse<TChannel, TOption>,
>({
  visible,
  payload,
  title,
  subtitle,
  onClose,
  onSuccess,
  confirmText = '确认发送',
  loadingText = '正在加载发送方式...',
  emptyText = '暂无可用发送方式',
  messageBoxTitle = '发送文案（将自动复制）',
  channelOrder,
  autoCopyChannels = [],
  nativeShareChannels = [],
  fetchOptions,
  sendAction,
  getChannelIcon,
  getTagText,
  getShareTitle,
  getSuccessMessage,
}: SendActionSheetProps<TPayload, TChannel, TOption, TResponse>) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<TResponse | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<TChannel | null>(null);

  useEffect(() => {
    if (!visible || !payload) return;
    let alive = true;
    setLoading(true);
    setData(null);
    setSelectedChannel(null);

    fetchOptions(payload)
      .then((result) => {
        if (!alive) return;
        const sorted = sortOptions(result.options ?? [], channelOrder);
        const nextData = { ...result, options: sorted } as TResponse;
        setData(nextData);
        setSelectedChannel(pickDefaultChannel<TChannel, TOption>(sorted));
      })
      .catch((error: unknown) => {
        if (!alive) return;
        toast.error(error instanceof Error ? error.message : '加载发送方式失败');
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [visible, payload, fetchOptions, channelOrder]);

  const openNativeShare = async (messageContent: string): Promise<void> => {
    if (!messageContent) return;
    try {
      await Share.share({
        title: getShareTitle(data),
        message: messageContent,
      });
    } catch {
      toast.info('未能调起系统分享，请手动粘贴发送');
    }
  };

  const handleSubmit = async () => {
    if (!payload || !selectedChannel) {
      toast.info('请选择发送方式');
      return;
    }
    setSubmitting(true);
    try {
      await sendAction(payload, selectedChannel);
      const content = (data?.messageContent ?? '').trim();

      if (autoCopyChannels.includes(selectedChannel) && content) {
        await Clipboard.setStringAsync(content);
        toast.success('发送文案已复制');
      }
      if (nativeShareChannels.includes(selectedChannel) && content) {
        await openNativeShare(content);
      }

      toast.success(getSuccessMessage(selectedChannel));
      onClose();
      onSuccess?.();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '发送失败');
    } finally {
      setSubmitting(false);
    }
  };

  const shouldShowMessageBox =
    !!data?.messageContent && !!selectedChannel && autoCopyChannels.includes(selectedChannel);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      confirmText={confirmText}
      onConfirm={handleSubmit}
      loading={submitting}
      disabled={loading || !selectedChannel}
      confirmDisabledHint={loading ? loadingText : '请选择发送方式'}
    >
      {loading ? (
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{loadingText}</Text>
      ) : (
        <>
          <View style={styles.optionList}>
            {(data?.options ?? []).length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{emptyText}</Text>
            ) : (
              (data?.options ?? []).map((option) => {
                const selected = option.channel === selectedChannel;
                const icon = getChannelIcon(option.channel);
                return (
                  <TouchableOpacity
                    key={option.channel}
                    style={[
                      styles.optionRow,
                      {
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected ? `${colors.primary}12` : colors.surface,
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedChannel(option.channel)}
                  >
                    <Ionicons
                      name={icon.name}
                      size={18}
                      color={icon.color ?? colors.textSecondary}
                    />
                    <View style={styles.optionInfo}>
                      <Text style={[styles.optionTitle, { color: colors.text }]}>
                        {option.label}
                      </Text>
                      {option.target ? (
                        <Text style={[styles.optionTarget, { color: colors.textSecondary }]}>
                          {option.target}
                        </Text>
                      ) : null}
                    </View>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: option.canDirectSend
                            ? `${colors.success}20`
                            : `${colors.warning}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color: option.canDirectSend ? colors.success : colors.warning,
                          },
                        ]}
                      >
                        {getTagText(option)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {shouldShowMessageBox && (
            <View
              style={[
                styles.messageBox,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
            >
              <Text style={[styles.messageTitle, { color: colors.text }]}>{messageBoxTitle}</Text>
              <Text style={[styles.messageText, { color: colors.textSecondary }]}>
                {data?.messageContent}
              </Text>
            </View>
          )}
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingVertical: Spacing.base,
  },
  emptyText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingVertical: Spacing.base,
  },
  optionList: {
    gap: Spacing.sm,
  },
  optionRow: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  optionInfo: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  optionTarget: {
    fontSize: FontSize.xs,
  },
  badge: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  messageBox: {
    marginTop: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  messageTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  messageText: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
