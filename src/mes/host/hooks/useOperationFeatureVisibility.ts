import { getMesAuthorizationAdapter } from '../authorization';
export function useOperationFeatureVisibility(featureCode: string): boolean {
  return getMesAuthorizationAdapter().useOperationFeatureVisibility(featureCode);
}
