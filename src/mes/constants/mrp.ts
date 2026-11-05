export const MRP_ELIGIBLE_PLAN_STATUSES = [
  'confirmed',
  'scheduled',
  'released',
  'in_progress',
] as const;

export function isMrpEligiblePlanStatus(status?: string | null): boolean {
  return MRP_ELIGIBLE_PLAN_STATUSES.some((candidate) => candidate === status);
}
