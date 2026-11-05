import type { PickerOption } from '../../../core/components/PickerField';
import type { StatusConfig } from '../../../core/components/Badge';
import type { TabItem } from '../../../core/components/StatusTabs';
import type { DictItem } from '../contracts/services/dict.service';
import type { ApprovalStepDetail } from '../contracts/services/approval.service';
import type { DictLabelMap } from '../../../core/utils/dict-label-map';
import type { UnitDomain, UnitDisplay } from './useUnitDisplay';
import type { AmountDisplayResult } from '../authorization';

export interface ApprovalState {
  status: 'none' | 'pending_approval' | 'approved' | 'rejected' | 'cancelled';
  loading: boolean;
  currentStep: number;
  totalSteps: number;
  steps: ApprovalStepDetail[];
  isPending: boolean;
  isPendingMyAction: boolean;
  currentAssigneeName: string;
  currentStepLabel: string;
  rejectionReason: string | null;
  hasApproval: boolean;
  isConfigured: boolean;
  needsSubmission: boolean;
  canView: boolean;
  canSubmit: boolean;
  canHandle: boolean;
  canRecall: boolean;
  reload(): Promise<void>;
  submit(): Promise<void>;
  approve(comment?: string): Promise<void>;
  reject(comment: string): Promise<void>;
  reset(): void;
  recall(): void;
}

export interface UseAmountDisplayOptions {
  requirePricePermission?: boolean;
  permitted?: boolean;
}
export interface ActionDef {
  title: string;
  message: string;
  beforeConfirm?: () => boolean;
  action?: () => Promise<unknown>;
  onInvoke?: () => void;
  confirmText?: string;
  destructive?: boolean;
  successMsg: string;
  afterSuccess?: 'reload' | 'goBack';
}
export interface ActionButtonDef {
  label: string;
  variant: 'primary' | 'success' | 'warning' | 'error' | 'muted';
}
export interface UseDocumentActionsConfig {
  detail: unknown;
  approval: ApprovalState;
  reload: () => void | Promise<void>;
  goBack: () => void;
  perms: Record<string, boolean>;
  submitApprovalMessage?: string;
  actions: Record<string, ActionDef>;
  buttons: Record<string, ActionButtonDef>;
  disabledReasons?: Record<string, () => string>;
}
export interface DocumentActionsResult {
  actionLoading: boolean;
  handlers: Record<string, () => void>;
  visibility: Record<string, boolean>;
  enabled: Record<string, boolean>;
  reasons: Record<string, string>;
  buttons: Record<string, ActionButtonDef>;
  handleSubmitApproval: () => void;
}
export interface DictHookResult {
  options: PickerOption[];
  loading: boolean;
  items: DictItem[];
  labelMap: DictLabelMap;
  error: string | null;
  retry: () => void;
  statusConfig: StatusConfig<string>;
  tabItems: TabItem<string>[];
}
export interface UnitHookResult extends UnitDisplay {}
export type MesFileDisplayNameResolver = (url: string, fallback: string) => string;

export interface MesHostHooks {
  useDict?: (typeCode: string) => DictHookResult;
  clearDictCache?: (typeCode?: string) => void;
  useUnitDisplay?: (domain: UnitDomain) => UnitHookResult;
  useAmountDisplay?: (options?: UseAmountDisplayOptions) => AmountDisplayResult;
  useApprovalStatus?: (entityType: string, entityId: string, onStatusChange?: () => void) => ApprovalState;
  useDocumentActions?: (config: UseDocumentActionsConfig) => DocumentActionsResult;
  useFileDisplayNames?: (urls: string[]) => MesFileDisplayNameResolver;
  useActionRunner?: () => {
    running: boolean;
    run(action: () => Promise<unknown>, successMsg: string, onSuccess?: () => void | Promise<void>): Promise<void>;
  };
}

let hooks: MesHostHooks = {};
export function configureMesHostHooks(value: MesHostHooks): void {
  hooks = { ...hooks, ...value };
}
export function resetMesHostHooks(): void { hooks = {}; }
export function getMesHostHooks(): MesHostHooks { return hooks; }
