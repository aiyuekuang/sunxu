import { useSyncExternalStore } from 'react';

export interface HostExternalStore<State> {
  getState(): State;
  subscribe(listener: () => void): () => void;
}

export interface HostStoreHook<State> {
  <Selected = State>(selector?: (state: State) => Selected): Selected;
  getState(): State;
}

export function bindHostStore<State>(name: string) {
  let store: HostExternalStore<State> | undefined;
  const getStore = () => {
    if (!store) throw new Error(`Sunxu host store '${name}' is not configured.`);
    return store;
  };
  const useStore: HostStoreHook<State> = Object.assign(
    function useHostStore<Selected = State>(selector?: (state: State) => Selected): Selected {
      const current = getStore();
      const select = selector ?? ((state: State) => state as unknown as Selected);
      return useSyncExternalStore(
        current.subscribe,
        () => select(current.getState()),
        () => select(current.getState()),
      );
    },
    { getState: () => getStore().getState() },
  );
  return {
    useStore,
    configure(value: HostExternalStore<State>) { store = value; },
    reset() { store = undefined; },
  };
}
