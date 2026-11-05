export type FinanceActionRecord = {
  status: string;
  availableActions?: readonly string[];
};

/** 客户端只消费后端动作摘要；旧服务端缺少摘要时才使用状态兜底。 */

/** 页面编辑入口也复用后端动作摘要，避免各页面重复维护状态判断。 */
export function hasFinanceAction(
  record: FinanceActionRecord,
  action: string,
  fallbackStatuses: readonly string[],
): boolean {
  if (Array.isArray(record.availableActions)) {
    return record.availableActions.includes(action);
  }
  return fallbackStatuses.includes(record.status);
}
