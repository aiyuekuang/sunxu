/**
 * 根据当前时间返回问候语（早上好 / 下午好 / 晚上好）
 */
export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return '早上好';
  if (h < 18) return '下午好';
  return '晚上好';
}
