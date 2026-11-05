import { getMesAuthorizationAdapter } from '../authorization';
import type { UseAmountDisplayOptions } from './adapters';
export function useAmountDisplay(options?: UseAmountDisplayOptions) {
  return getMesAuthorizationAdapter().useAmountDisplay(options);
}
