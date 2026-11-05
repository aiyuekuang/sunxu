import {
  type StatementParams,
  StatementSendChannel,
  type StatementSendOptionDto,
  type StatementSendOptionsResponseDto,
  financeService,
} from '../../../host/services';
import { SendActionSheet } from '../../../components/common/SendActionSheet.tsx';
import { useTheme } from '../../../../core/theme/useTheme';

interface SendStatementSheetProps {
  visible: boolean;
  query?: StatementParams | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const CHANNEL_ORDER: StatementSendChannel[] = [
  StatementSendChannel.EMAIL,
  StatementSendChannel.COPY,
];

const AUTO_COPY_CHANNELS: ReadonlyArray<StatementSendChannel> = [StatementSendChannel.COPY];
const NATIVE_SHARE_CHANNELS: ReadonlyArray<StatementSendChannel> = [StatementSendChannel.COPY];

function getTagText(option: StatementSendOptionDto): string {
  if (option.channel === StatementSendChannel.COPY) return '复制并分享';
  return '系统直发';
}

export function SendStatementSheet({
  visible,
  query,
  onClose,
  onSuccess,
}: SendStatementSheetProps) {
  const { colors } = useTheme();
  const statementTypeLabel = query?.type === 'payable' ? '应付对账单' : '应收对账单';

  return (
    <SendActionSheet<
      StatementParams,
      StatementSendChannel,
      StatementSendOptionDto,
      StatementSendOptionsResponseDto
    >
      visible={visible}
      payload={query ?? undefined}
      title={`发送对账单 · ${statementTypeLabel}`}
      subtitle="支持邮件直发、复制并调起系统分享（微信/企微/飞书等）"
      onClose={onClose}
      onSuccess={onSuccess}
      channelOrder={CHANNEL_ORDER}
      autoCopyChannels={AUTO_COPY_CHANNELS}
      nativeShareChannels={NATIVE_SHARE_CHANNELS}
      fetchOptions={(params) => financeService.statementSendOptions(params)}
      sendAction={(params, channel) =>
        financeService.statementSend({
          ...params,
          channel,
        })
      }
      getChannelIcon={(channel) => {
        if (channel === StatementSendChannel.EMAIL)
          return { name: 'mail-outline', color: colors.primary };
        if (channel === StatementSendChannel.COPY)
          return { name: 'copy-outline', color: colors.textSecondary };
        return { name: 'send-outline', color: colors.textSecondary };
      }}
      getTagText={getTagText}
      getShareTitle={(optionsData) => optionsData?.emailSubject ?? statementTypeLabel}
      getSuccessMessage={(channel) => {
        if (channel === StatementSendChannel.EMAIL) return '邮件已发送';
        if (channel === StatementSendChannel.COPY) return '已复制对账文本并调起系统分享';
        return '已发送';
      }}
    />
  );
}
