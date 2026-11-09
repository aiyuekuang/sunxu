import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryClient,
  type QueryFunction,
  type UseInfiniteQueryOptions,
} from '@tanstack/react-query';

export type TabQueryFilters = Readonly<Record<string, unknown>>;

export type TabQueryKey = readonly [
  'sunxu',
  'tab-query',
  string,
  string,
  string | null,
  string,
  TabQueryFilters,
];

export interface TabQueryScope {
  /** Stable authenticated principal ID. Do not pass an access token. */
  principalId: string;
  /** Tenant/company boundary. Use null only for non-tenant data. */
  tenantId?: string | null;
}

export interface TabQueryFamily {
  /** Prefix covering every tab and filter set for this resource and scope. */
  queryKeyPrefix: readonly ['sunxu', 'tab-query', string, string, string | null];
  queryKey: (tabKey: string, filters: TabQueryFilters) => TabQueryKey;
}

export interface CreateTabQueryFamilyOptions {
  resourceKey: string;
  scope: TabQueryScope;
}

/**
 * Creates keys that isolate each resource by principal, tenant, tab, and the
 * normalized request filters. Pass the same filter values to queryKey and the
 * request function. TanStack Query hashes serializable filter objects by value.
 */
export function createTabQueryFamily({
  resourceKey,
  scope,
}: CreateTabQueryFamilyOptions): TabQueryFamily {
  if (!resourceKey.trim()) {
    throw new Error('resourceKey is required');
  }
  if (!scope.principalId.trim()) {
    throw new Error('scope.principalId is required');
  }

  const queryKeyPrefix = [
    'sunxu',
    'tab-query',
    resourceKey,
    scope.principalId,
    scope.tenantId ?? null,
  ] as const;

  return {
    queryKeyPrefix,
    queryKey: (tabKey, filters) => {
      if (!tabKey.trim()) {
        throw new Error('tabKey is required');
      }
      return [...queryKeyPrefix, tabKey, filters] as const;
    },
  };
}

export interface InvalidateTabQueryFamilyOptions {
  /** Remove inactive snapshots before invalidating when stale membership is unsafe. */
  discardInactive?: boolean;
  /** Defaults to active: inactive entries refetch when next observed. */
  refetchType?: 'active' | 'all' | 'inactive' | 'none';
}

/**
 * Marks every tab/filter query in the family stale. For changes that can move
 * records between tabs, discardInactive removes old snapshots before the
 * active query is refetched.
 */
export function invalidateTabQueryFamily(
  queryClient: QueryClient,
  family: TabQueryFamily,
  options: InvalidateTabQueryFamilyOptions = {},
): Promise<void> {
  if (options.discardInactive) {
    queryClient.removeQueries({
      queryKey: family.queryKeyPrefix,
      type: 'inactive',
    });
  }

  return queryClient.invalidateQueries({
    queryKey: family.queryKeyPrefix,
    refetchType: options.refetchType ?? 'active',
  });
}

export function removeTabQueryFamily(
  queryClient: QueryClient,
  family: TabQueryFamily,
): void {
  queryClient.removeQueries({ queryKey: family.queryKeyPrefix });
}

export type UseTabInfiniteQueryOptions<
  TQueryFnData,
  TError = Error,
  TData = InfiniteData<TQueryFnData>,
  TPageParam = unknown,
> = Omit<
  UseInfiniteQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TabQueryKey,
    TPageParam
  >,
  'queryKey' | 'queryFn' | 'placeholderData'
> & {
  queryFamily: TabQueryFamily;
  tabKey: string;
  filters: TabQueryFilters;
  queryFn: QueryFunction<TQueryFnData, TabQueryKey, TPageParam>;
};

/**
 * Infinite list query for one tab. Exact-key cache is reused automatically;
 * previous-tab placeholder data is intentionally not exposed by this wrapper.
 */
export function useTabInfiniteQuery<
  TQueryFnData,
  TError = Error,
  TData = InfiniteData<TQueryFnData>,
  TPageParam = unknown,
>(options: UseTabInfiniteQueryOptions<TQueryFnData, TError, TData, TPageParam>) {
  const { queryFamily, tabKey, filters, queryFn, ...queryOptions } = options;
  const queryKey = queryFamily.queryKey(tabKey, filters);
  const query = useInfiniteQuery<TQueryFnData, TError, TData, TabQueryKey, TPageParam>({
    ...queryOptions,
    queryKey,
    queryFn,
  });

  return { ...query, queryKey };
}
