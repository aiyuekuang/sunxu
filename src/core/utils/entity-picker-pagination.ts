/**
 * 根据分页合同中的全局 total 判断是否还有下一页。
 * 不能根据当前页长度推断，否则 total 恰好落在页边界时会产生多余请求。
 */
export function hasMoreEntityPickerResults(page: number, pageSize: number, total: number): boolean {
  return Math.max(page, 1) * Math.max(pageSize, 1) < Math.max(total, 0);
}
