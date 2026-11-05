import { Alert } from 'react-native';
import { toast } from '../toast';

export function confirmAlert(
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>,
  confirmText = '确认',
  destructive = true,
  onCancel?: () => void,
  cancelable = false,
  cancelText = '取消',
) {
  Alert.alert(
    title,
    message,
    [
      { text: cancelText, style: 'cancel', onPress: () => onCancel?.() },
      {
        text: confirmText,
        style: destructive ? 'destructive' : 'default',
        onPress: () => {
          // 包装 async 回调，捕获错误并显示 toast
          const result = onConfirm();
          if (result instanceof Promise) {
            result.catch((e: unknown) => {
              toast.error(e instanceof Error ? e.message : '操作失败');
            });
          }
        },
      },
    ],
    { cancelable },
  );
}
