import { bindHostStore, type HostExternalStore } from './external-store';

export interface MesOnboardingState {
  hasCompleted: boolean;
  currentStep: number;
  nextStep(): void;
  skip(): void;
}
const binding = bindHostStore<MesOnboardingState>('onboarding');
export const configureMesOnboardingStore = (store: HostExternalStore<MesOnboardingState>) => binding.configure(store);
export const useOnboardingStore = binding.useStore;
