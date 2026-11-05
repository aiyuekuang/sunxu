export interface ServerTestResult {
  readonly kind: 'success' | 'error';
  readonly message: string;
}
