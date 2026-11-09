import { QueryClient } from '@tanstack/react-query';

// The host app owns defaults; the catalog uses short demo cache windows.
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, gcTime: 120_000 } },
});
