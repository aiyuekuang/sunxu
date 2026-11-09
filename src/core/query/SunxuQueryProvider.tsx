import React, { useEffect } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';
import {
  QueryClientProvider,
  focusManager,
  type QueryClient,
} from '@tanstack/react-query';

function handleAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

export interface SunxuQueryProviderProps {
  /** The host owns QueryClient defaults and clears it on identity changes. */
  client: QueryClient;
  children: React.ReactNode;
}

/** Provides TanStack Query and maps native foreground state to query focus. */
export function SunxuQueryProvider({
  client,
  children,
}: SunxuQueryProviderProps) {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      focusManager.setFocused(AppState.currentState === 'active');
    }
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
