const FINISHED_WORK_ORDER_STATUSES = new Set(['completed', 'closed']);

export function isFinishedWorkOrderStatus(status: string): boolean {
  return FINISHED_WORK_ORDER_STATUSES.has(status);
}
