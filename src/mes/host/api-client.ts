import type { AxiosInstance } from 'axios';

export interface ApiBusinessErrorLike extends Error {
  code?: number;
  status?: number;
}

/** Stable error class for host adapters and MES components that branch on API codes. */
export class ApiBusinessError extends Error {
  readonly code: number;
  readonly status?: number;

  constructor(message: string, code: number, status?: number) {
    super(message);
    this.name = 'ApiBusinessError';
    this.code = code;
    this.status = status;
  }
}

let hostClient: AxiosInstance | undefined;
let requestCancelCheck: ((error: unknown) => boolean) | undefined;

export function configureMesApiClient(
  client: AxiosInstance,
  options: { isRequestCanceled?: (error: unknown) => boolean } = {},
): void {
  hostClient = client;
  requestCancelCheck = options.isRequestCanceled;
}

const apiClient = new Proxy({} as AxiosInstance, {
  get(_target, property) {
    if (!hostClient) {
      throw new Error('Sunxu MES API client is not configured. Call configureMesApiClient before using MES API components.');
    }
    const value: unknown = Reflect.get(hostClient, property, hostClient);
    return typeof value === 'function' ? value.bind(hostClient) : value;
  },
});

export default apiClient;

export function isRequestCanceled(error: unknown): boolean {
  if (requestCancelCheck) return requestCancelCheck(error);
  return typeof error === 'object' && error !== null &&
    ('code' in error && (error.code === 'ERR_CANCELED' || error.code === 'ECONNABORTED'));
}
