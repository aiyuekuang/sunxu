export type DictResourceStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface DictResourceSnapshot<T> {
  items: T[];
  status: DictResourceStatus;
  error: Error | null;
  updatedAt: number;
}

export interface DictResourceOptions {
  ttlMs: number;
  now?: () => number;
  onError?: (typeCode: string, error: Error) => void;
}

interface InFlightRequest<T> {
  generation: number;
  promise: Promise<T[]>;
}

/**
 * 字典远程资源的唯一会话级容器。
 *
 * 同一 typeCode 共享快照、订阅和进行中的请求；失效后使用 generation
 * 丢弃旧响应，避免慢请求覆盖刷新后的数据。
 */
export class DictResource<T> {
  private readonly snapshots = new Map<string, DictResourceSnapshot<T>>();
  private readonly listeners = new Map<string, Set<() => void>>();
  private readonly inFlight = new Map<string, InFlightRequest<T>>();
  private readonly generations = new Map<string, number>();
  private readonly now: () => number;
  private readonly loader: (typeCode: string) => Promise<T[]>;
  private readonly options: DictResourceOptions;

  constructor(loader: (typeCode: string) => Promise<T[]>, options: DictResourceOptions) {
    this.loader = loader;
    this.options = options;
    this.now = options.now ?? Date.now;
  }

  getSnapshot(typeCode: string): DictResourceSnapshot<T> {
    const existing = this.snapshots.get(typeCode);
    if (existing) return existing;

    const initial: DictResourceSnapshot<T> = {
      items: [],
      status: 'idle',
      error: null,
      updatedAt: 0,
    };
    this.snapshots.set(typeCode, initial);
    return initial;
  }

  subscribe(typeCode: string, listener: () => void): () => void {
    const typeListeners = this.listeners.get(typeCode) ?? new Set<() => void>();
    typeListeners.add(listener);
    this.listeners.set(typeCode, typeListeners);
    return () => {
      typeListeners.delete(listener);
      if (typeListeners.size === 0) this.listeners.delete(typeCode);
    };
  }

  load(typeCode: string, force = false): Promise<T[]> {
    const snapshot = this.getSnapshot(typeCode);
    const isFresh =
      snapshot.status === 'ready' && this.now() - snapshot.updatedAt < this.options.ttlMs;
    if (!force && isFresh) return Promise.resolve(snapshot.items);

    const generation = this.generations.get(typeCode) ?? 0;
    const activeRequest = this.inFlight.get(typeCode);
    if (activeRequest?.generation === generation) return activeRequest.promise;

    this.setSnapshot(typeCode, {
      ...snapshot,
      status: 'loading',
      error: null,
    });

    const promise = this.loader(typeCode)
      .then((items) => {
        if ((this.generations.get(typeCode) ?? 0) === generation) {
          this.setSnapshot(typeCode, {
            items,
            status: 'ready',
            error: null,
            updatedAt: this.now(),
          });
        }
        return items;
      })
      .catch((cause: unknown) => {
        const error = cause instanceof Error ? cause : new Error(String(cause));
        if ((this.generations.get(typeCode) ?? 0) === generation) {
          this.setSnapshot(typeCode, {
            ...this.getSnapshot(typeCode),
            status: 'error',
            error,
          });
          this.options.onError?.(typeCode, error);
        }
        throw error;
      })
      .finally(() => {
        if (this.inFlight.get(typeCode)?.promise === promise) {
          this.inFlight.delete(typeCode);
        }
      });

    this.inFlight.set(typeCode, { generation, promise });
    return promise;
  }

  /** 标记缓存失效但保留旧展示值，刷新期间不闪回原始编码。 */
  invalidate(typeCode?: string): string[] {
    const typeCodes = typeCode ? [typeCode] : [...this.snapshots.keys()];
    for (const code of typeCodes) {
      const snapshot = this.getSnapshot(code);
      this.generations.set(code, (this.generations.get(code) ?? 0) + 1);
      this.setSnapshot(code, {
        ...snapshot,
        status: 'idle',
        error: null,
        updatedAt: 0,
      });
    }
    return typeCodes;
  }

  /** 清除指定作用域的所有数据；用于账号、公司或服务器切换。 */
  reset(typeCode?: string): void {
    const typeCodes = typeCode
      ? [typeCode]
      : [...new Set([...this.snapshots.keys(), ...this.inFlight.keys()])];
    for (const code of typeCodes) {
      this.generations.set(code, (this.generations.get(code) ?? 0) + 1);
      this.snapshots.delete(code);
      this.inFlight.delete(code);
      this.emit(code);
    }
  }

  private setSnapshot(typeCode: string, snapshot: DictResourceSnapshot<T>): void {
    this.snapshots.set(typeCode, snapshot);
    this.emit(typeCode);
  }

  private emit(typeCode: string): void {
    for (const listener of this.listeners.get(typeCode) ?? []) listener();
  }
}
