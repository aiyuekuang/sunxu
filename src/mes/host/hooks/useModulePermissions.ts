import { getMesAuthorizationAdapter } from '../authorization';
export function useModulePermissions<T extends Record<string, string>>(config: T): Record<keyof T, boolean> {
  return getMesAuthorizationAdapter().useModulePermissions(config);
}
