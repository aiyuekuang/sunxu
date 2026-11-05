import { getMesAuthorizationAdapter } from '../authorization';

export function usePermission(sign: string): boolean { return getMesAuthorizationAdapter().usePermission(sign); }
export function useAnyPermission(...signs: string[]): boolean { return getMesAuthorizationAdapter().useAnyPermission(signs); }
export function useCanCreateManualMaterialIssue(): boolean {
  return getMesAuthorizationAdapter().useCanCreateManualMaterialIssue();
}
export function canAccess(sign: string): boolean { return getMesAuthorizationAdapter().hasPermission(sign); }
export function canAccessRaw(sign: string): boolean { return getMesAuthorizationAdapter().hasPermission(sign); }
export function canAccessAny(...signs: string[]): boolean {
  return getMesAuthorizationAdapter().hasAnyPermission(signs);
}
