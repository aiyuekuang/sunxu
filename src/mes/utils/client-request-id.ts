/**
 * 写入动作的客户端请求标识。
 * 调用方必须在同一次表单会话和网络重试中复用返回值，不能在每次点击时重新生成。
 */
export function createClientRequestId(action: string): string {
  const randomPart = Math.random().toString(36).slice(2);
  return `${action}:${Date.now()}:${randomPart}`;
}
