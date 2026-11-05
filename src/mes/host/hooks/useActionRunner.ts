import { getMesHostHooks } from './adapters';
export function useActionRunner() {
  const hook = getMesHostHooks().useActionRunner;
  if (!hook) throw new Error('The host app must configure useActionRunner before rendering MES actions.');
  return hook();
}
