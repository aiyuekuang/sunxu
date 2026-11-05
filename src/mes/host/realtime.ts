export type RealtimeListener = (payload?: unknown) => void;
export type RealtimeUnsubscribe = () => void;

export interface MesRealtimeAdapter {
  on(event: string, listener: RealtimeListener): RealtimeUnsubscribe;
}

let realtimeAdapter: MesRealtimeAdapter | undefined;

export function configureMesRealtime(adapter: MesRealtimeAdapter): void {
  realtimeAdapter = adapter;
}

export const socketService: MesRealtimeAdapter = {
  on(event, listener) {
    if (!realtimeAdapter) return () => {};
    return realtimeAdapter.on(event, listener);
  },
};

/** Stable event keys; the host maps them to its transport's actual event names. */
export const WS_EVENTS = {
  ANNOUNCEMENT_NEW: 'sunxu.mes.announcement.new',
  DASHBOARD_REFRESH: 'sunxu.mes.dashboard.refresh',
  WORK_ORDER_UPDATED: 'sunxu.mes.work-order.updated',
  STATS_UPDATED: 'sunxu.mes.stats.updated',
} as const;
