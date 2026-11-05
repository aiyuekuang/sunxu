import { bindHostStore, type HostExternalStore } from './external-store';

export interface MesOfflineState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  syncNow(): Promise<void>;
}
const binding = bindHostStore<MesOfflineState>('offline');
export const configureMesOfflineStore = (store: HostExternalStore<MesOfflineState>) => binding.configure(store);
export const useOfflineStore = binding.useStore;
