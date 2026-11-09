import Toast from 'react-native-toast-message';
import { toastConfig } from '../toast';

/** App-level host for Sunxu toast notifications shown outside modal overlays. */
export function ToastHost() {
  return <Toast config={toastConfig} />;
}
