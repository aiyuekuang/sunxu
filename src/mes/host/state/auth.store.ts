import type { UserInfo } from '../contracts/types';
import { bindHostStore, type HostExternalStore } from './external-store';

export interface MesAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserInfo | null;
  operationConfig: unknown;
}

const binding = bindHostStore<MesAuthState>('auth');
export const configureMesAuthStore = (store: HostExternalStore<MesAuthState>) => binding.configure(store);
export const useAuthStore = binding.useStore;
