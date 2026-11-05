import { getMesHostHooks, type UseDocumentActionsConfig, type DocumentActionsResult } from './adapters';
export type { ActionButtonDef, ActionDef, DocumentActionsResult, UseDocumentActionsConfig } from './adapters';
export function useDocumentActions(config: UseDocumentActionsConfig): DocumentActionsResult {
  const hook = getMesHostHooks().useDocumentActions;
  if (!hook) throw new Error('The host app must configure useDocumentActions before rendering document actions.');
  return hook(config);
}
