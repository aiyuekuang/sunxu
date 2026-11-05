import type { AppUpdateInfo, AppUpdateSource } from '../contracts/services/app-update.service';
import { bindHostStore, type HostExternalStore } from './external-store';

export interface MesUpdateState {
  checking: boolean;
  updateInfo: AppUpdateInfo | null;
  visible: boolean;
  checkUpdate(options?: { showModal?: boolean; source?: AppUpdateSource }): Promise<AppUpdateInfo>;
  dismissModal(): void;
  reset(): void;
  showModal(): void;
}
const binding = bindHostStore<MesUpdateState>('update');
export const configureMesUpdateStore = (store: HostExternalStore<MesUpdateState>) => binding.configure(store);
export const useUpdateStore = binding.useStore;
