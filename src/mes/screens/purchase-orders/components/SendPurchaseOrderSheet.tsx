import {
  PurchaseOrderSendChannel,
  type PurchaseOrderSendOptionDto,
  type PurchaseOrderSendOptionsResponseDto,
  purchaseOrderService,
} from '../../../host/services';
import { SendActionSheet } from '../../../components/common/SendActionSheet.tsx';
import { useTheme } from '../../../../core/theme/useTheme';

interface SendPurchaseOrderSheetProps {
  visible: boolean;
  purchaseOrderId: string;
  orderNo: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CHANNEL_ORDER: PurchaseOrderSendChannel[] = [
  PurchaseOrderSendChannel.EMAIL,
  PurchaseOrderSendChannel.SHARE,
  PurchaseOrderSendChannel.COPY,
  PurchaseOrderSendChannel.MANUAL,
];

const NATIVE_SHARE_CHANNELS: ReadonlyArray<PurchaseOrderSendChannel> = [
  PurchaseOrderSendChannel.SHARE,
];

const AUTO_COPY_CHANNELS: ReadonlyArray<PurchaseOrderSendChannel> = [
  PurchaseOrderSendChannel.SHARE,
  PurchaseOrderSendChannel.COPY,
];

function getTagText(option: PurchaseOrderSendOptionDto): string {
  if (option.channel === PurchaseOrderSendChannel.COPY) return '复制全文';
  if (option.channel === PurchaseOrderSendChannel.MANUAL) return '仅标记';
  if (option.channel === PurchaseOrderSendChannel.EMAIL) return '系统直发';
  return '系统分享';
}

export function SendPurchaseOrderSheet({
  visible,
  purchaseOrderId,
  orderNo,
  onClose,
  onSuccess,
}: SendPurchaseOrderSheetProps) {
  const { colors } = useTheme();

  return (
    <SendActionSheet<
      string,
      PurchaseOrderSendChannel,
      PurchaseOrderSendOptionDto,
      PurchaseOrderSendOptionsResponseDto
    >
      visible={visible}
      payload={purchaseOrderId}
      title={`发送采购单 · ${orderNo}`}
      subtitle="支持邮件直发、复制并系统分享、复制全部采购文本"
      onClose={onClose}
      onSuccess={onSuccess}
      channelOrder={CHANNEL_ORDER}
      autoCopyChannels={AUTO_COPY_CHANNELS}
      nativeShareChannels={NATIVE_SHARE_CHANNELS}
      fetchOptions={(id) => purchaseOrderService.sendOptions(id)}
      sendAction={(id, channel) => purchaseOrderService.send({ id, channel })}
      getChannelIcon={(channel) => {
        if (channel === PurchaseOrderSendChannel.EMAIL)
          return { name: 'mail-outline', color: colors.primary };
        if (channel === PurchaseOrderSendChannel.SHARE)
          return { name: 'share-social-outline', color: colors.primary };
        if (channel === PurchaseOrderSendChannel.COPY)
          return { name: 'copy-outline', color: colors.textSecondary };
        return { name: 'send-outline', color: colors.textSecondary };
      }}
      getTagText={getTagText}
      getShareTitle={(optionsData) => optionsData?.emailSubject ?? `采购订单 ${orderNo}`}
      getSuccessMessage={(channel) => {
        if (channel === PurchaseOrderSendChannel.EMAIL) return '邮件已发送';
        if (channel === PurchaseOrderSendChannel.COPY) return '已复制全部采购文本并标记发送';
        if (channel === PurchaseOrderSendChannel.MANUAL) return '已标记为已发送';
        return '已复制文案并调起系统分享';
      }}
    />
  );
}
