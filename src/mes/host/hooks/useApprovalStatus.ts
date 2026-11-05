import { getMesHostHooks, type ApprovalState } from './adapters';
export type { ApprovalState } from './adapters';
export function useApprovalStatus(entityType: string, entityId: string, onStatusChange?: () => void): ApprovalState {
  const hook = getMesHostHooks().useApprovalStatus;
  if (!hook) throw new Error('The host app must configure useApprovalStatus before rendering approval components.');
  return hook(entityType, entityId, onStatusChange);
}
