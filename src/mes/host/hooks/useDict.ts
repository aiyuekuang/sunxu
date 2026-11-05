import { getMesHostHooks, type DictHookResult } from './adapters';
export function useDict(typeCode: string): DictHookResult {
  const hook = getMesHostHooks().useDict;
  if (!hook) throw new Error('The host app must configure useDict before rendering MES components.');
  return hook(typeCode);
}
export function clearDictCache(typeCode?: string): void {
  const clear = getMesHostHooks().clearDictCache;
  if (!clear) throw new Error('The host app must configure clearDictCache before managing MES dictionaries.');
  clear(typeCode);
}
export function resetDictCache(): void { clearDictCache(); }
