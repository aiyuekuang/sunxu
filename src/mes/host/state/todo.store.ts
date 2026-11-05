import type { TodoCount } from '../contracts/services/todo.service';
import { bindHostStore, type HostExternalStore } from './external-store';

export interface MesTodoState {
  count: TodoCount;
  fetchCount(): Promise<void>;
}
const binding = bindHostStore<MesTodoState>('todo');
export const configureMesTodoStore = (store: HostExternalStore<MesTodoState>) => binding.configure(store);
export const useTodoStore = binding.useStore;
