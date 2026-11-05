import type { HomeQuickActionsDisplayMode } from '../../constants/home-configs';
import { bindHostStore, type HostExternalStore } from './external-store';

export interface MesMenuLayoutState {
  favoriteItemKeys: string[];
  menuDisplayMode: HomeQuickActionsDisplayMode;
  toggleFavoriteItem(key: string): void;
}
const binding = bindHostStore<MesMenuLayoutState>('menu-layout');
export const configureMesMenuLayoutStore = (store: HostExternalStore<MesMenuLayoutState>) => binding.configure(store);
export const useMenuLayoutStore = binding.useStore;
