import Toast, { type ToastConfig } from 'react-native-toast-message';
import { AppToast } from './components/AppToast';
import { messageAlert } from './toast/MessageAlert';

const CHARS_PER_LINE = 18;
const MIN_VISIBILITY_TIME = 3000;
const MAX_VISIBILITY_TIME = 6000;
const EXTRA_LINE_READ_TIME = 550;
const MAX_TOAST_TOTAL_LINES = 6;

function estimateWrappedLineCount(text: string): number {
  return text
    .split('\n')
    .reduce((total, line) => total + Math.max(Math.ceil(line.length / CHARS_PER_LINE), 1), 0);
}

function shouldEscalateToast(message: string, title?: string): boolean {
  const titleLineCount = title ? 1 : 0;
  return titleLineCount + estimateWrappedLineCount(message) > MAX_TOAST_TOTAL_LINES;
}

function getToastVisibilityTime(message: string, title?: string): number {
  const titleLineCount = title ? 1 : 0;
  const estimatedLineCount = titleLineCount + estimateWrappedLineCount(message);
  return Math.min(
    MAX_VISIBILITY_TIME,
    MIN_VISIBILITY_TIME + Math.max(estimatedLineCount - 1, 0) * EXTRA_LINE_READ_TIME,
  );
}

function showToastOrAlert(type: 'success' | 'error' | 'info', message: string, title: string) {
  if (shouldEscalateToast(message, title)) {
    Toast.hide();
    messageAlert(title, message);
    return;
  }

  Toast.show({
    type,
    text1: title,
    text2: message,
    visibilityTime: getToastVisibilityTime(message, title),
  });
}

/** Toast 自定义配置：长文案自适应高度、宽度和展示时长 */
export const toastConfig: ToastConfig = {
  success: ({ text1, text2, onPress }) => (
    <AppToast variant="success" title={text1} message={text2} onPress={onPress} />
  ),
  error: ({ text1, text2, onPress }) => (
    <AppToast variant="error" title={text1} message={text2} onPress={onPress} />
  ),
  info: ({ text1, text2, onPress }) => (
    <AppToast variant="info" title={text1} message={text2} onPress={onPress} />
  ),
};

export const toast = {
  success: (message: string, title?: string) => {
    const resolvedTitle = title ?? '成功';
    showToastOrAlert('success', message, resolvedTitle);
  },

  error: (message: string, title?: string) => {
    const resolvedTitle = title ?? '错误';
    showToastOrAlert('error', message, resolvedTitle);
  },

  info: (message: string, title?: string) => {
    const resolvedTitle = title ?? '提示';
    showToastOrAlert('info', message, resolvedTitle);
  },
};
