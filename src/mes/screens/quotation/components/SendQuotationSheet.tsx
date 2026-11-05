import {
  QuotationSendChannel,
  type QuotationSendOptionDto,
  type QuotationSendOptionsResponseDto,
  quotationService,
} from '../../../host/services';
import { SendActionSheet } from '../../../components/common/SendActionSheet.tsx';
import { useTheme } from '../../../../core/theme/useTheme';

interface SendQuotationSheetProps {
  visible: boolean;
  quotationId: string;
  quotationNo: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CHANNEL_ORDER: QuotationSendChannel[] = [
  QuotationSendChannel.EMAIL,
  QuotationSendChannel.SHARE,
  QuotationSendChannel.COPY,
  QuotationSendChannel.MANUAL,
  QuotationSendChannel.WECHAT,
  QuotationSendChannel.WECOM,
  QuotationSendChannel.FEISHU,
];

const NATIVE_SHARE_CHANNELS: ReadonlyArray<QuotationSendChannel> = [
  QuotationSendChannel.SHARE,
  QuotationSendChannel.WECHAT,
  QuotationSendChannel.WECOM,
  QuotationSendChannel.FEISHU,
];

const AUTO_COPY_CHANNELS: ReadonlyArray<QuotationSendChannel> = [
  ...NATIVE_SHARE_CHANNELS,
  QuotationSendChannel.COPY,
];

function getTagText(option: QuotationSendOptionDto): string {
  if (option.channel === QuotationSendChannel.COPY) return '复制全文';
  if (option.channel === QuotationSendChannel.MANUAL) return '仅标记';
  if (option.channel === QuotationSendChannel.EMAIL) return '系统直发';
  return '系统分享';
}

export function SendQuotationSheet({
  visible,
  quotationId,
  quotationNo,
  onClose,
  onSuccess,
}: SendQuotationSheetProps) {
  const { colors } = useTheme();

  return (
    <SendActionSheet<
      string,
      QuotationSendChannel,
      QuotationSendOptionDto,
      QuotationSendOptionsResponseDto
    >
      visible={visible}
      payload={quotationId}
      title={`发送报价 · ${quotationNo}`}
      subtitle="支持邮件直发、复制并系统分享、复制全部报价文本"
      onClose={onClose}
      onSuccess={onSuccess}
      channelOrder={CHANNEL_ORDER}
      autoCopyChannels={AUTO_COPY_CHANNELS}
      nativeShareChannels={NATIVE_SHARE_CHANNELS}
      fetchOptions={(id) => quotationService.sendOptions(id)}
      sendAction={(id, channel) => quotationService.send({ id, channel })}
      getChannelIcon={(channel) => {
        if (channel === QuotationSendChannel.EMAIL)
          return { name: 'mail-outline', color: colors.primary };
        if (channel === QuotationSendChannel.SHARE)
          return { name: 'share-social-outline', color: colors.primary };
        if (channel === QuotationSendChannel.WECHAT)
          return { name: 'logo-wechat', color: colors.success };
        if (channel === QuotationSendChannel.WECOM)
          return { name: 'chatbubble-ellipses-outline', color: colors.primary };
        if (channel === QuotationSendChannel.FEISHU)
          return { name: 'paper-plane-outline', color: colors.success };
        if (channel === QuotationSendChannel.COPY)
          return { name: 'copy-outline', color: colors.textSecondary };
        return { name: 'send-outline', color: colors.textSecondary };
      }}
      getTagText={getTagText}
      getShareTitle={(optionsData) => optionsData?.emailSubject ?? `报价单 ${quotationNo}`}
      getSuccessMessage={(channel) => {
        if (channel === QuotationSendChannel.EMAIL) return '邮件已发送';
        if (channel === QuotationSendChannel.COPY) return '已复制全部报价文本并标记发送';
        if (channel === QuotationSendChannel.MANUAL) return '已标记为已发送';
        return '已复制文案并调起系统分享';
      }}
    />
  );
}
