/** Authorization boundary. The host supplies every permission and feature decision. */
export type MesPermissionKey = string;
export type OperationFeatureCode = string;
export type PermissionGroup = Record<string, string>;

export interface AmountDisplayResult {
  readonly visible: boolean;
  readonly toggle: () => Promise<void>;
  readonly mask: (amount: string) => string;
  readonly permitted: boolean;
}

export interface MesAuthorizationAdapter {
  hasPermission(key: string): boolean;
  hasAnyPermission(keys: readonly string[]): boolean;
  hasAllPermissions(keys: readonly string[]): boolean;
  hasFeature(feature: string, operationConfig?: unknown): boolean;
  hasAnyFeature(features: readonly string[], operationConfig?: unknown): boolean;
  hasOperationFeatureAccess(operationConfig: unknown, permissionKeys: readonly string[]): boolean;
  usePermission(key: string): boolean;
  useAnyPermission(keys: readonly string[]): boolean;
  useCanCreateManualMaterialIssue(): boolean;
  useModulePermissions<T extends Record<string, string>>(config: T): Record<keyof T, boolean>;
  useOperationFeatureVisibility(feature: string): boolean;
  useAmountDisplay(options?: { requirePricePermission?: boolean; permitted?: boolean }): AmountDisplayResult;
  permissionGroups?: Record<string, PermissionGroup>;
}

let adapter: MesAuthorizationAdapter | undefined;
export function configureMesAuthorization(value: MesAuthorizationAdapter): void {
  adapter = value;
}
export function getMesAuthorizationAdapter(): MesAuthorizationAdapter {
  if (!adapter) throw new Error('Sunxu MES authorization adapter is not configured.');
  return adapter;
}

function symbolicKey(prefix: string, name: PropertyKey): string {
  return `sunxu:mes:${prefix}:${String(name)}`;
}
function createKeyProxy<T extends Record<string, string>>(prefix: string): T {
  return new Proxy({} as T, {
    get(_target, property) {
      if (property === 'then') return undefined;
      return symbolicKey(prefix, property);
    },
  });
}
function createPermissionGroup(name: string): PermissionGroup {
  return new Proxy({} as PermissionGroup, {
    get(_target, property) {
      if (property === 'then') return undefined;
      const configured = adapter?.permissionGroups?.[name]?.[String(property)];
      return configured ?? symbolicKey(`permission-group/${name}`, property);
    },
    ownKeys() {
      return Reflect.ownKeys(adapter?.permissionGroups?.[name] ?? {});
    },
    getOwnPropertyDescriptor() {
      return { configurable: true, enumerable: true };
    },
  });
}

/** Symbolic keys are component contract identifiers, not backend permission codes. */
export const P = createKeyProxy<Readonly<Record<string, string>>>('permission');
export const OPERATION_FEATURE = createKeyProxy<Readonly<Record<string, string>>>('feature');
export const INSPECTION_PERMS = createPermissionGroup('INSPECTION_PERMS');
export const PRODUCTION_RECEIPT_PERMS = createPermissionGroup('PRODUCTION_RECEIPT_PERMS');
export const CUSTOMER_PERMS = createPermissionGroup('CUSTOMER_PERMS');
export const SUPPLIER_PERMS = createPermissionGroup('SUPPLIER_PERMS');

export function hasPermission(key: string): boolean { return getMesAuthorizationAdapter().hasPermission(key); }
export function hasAnyPermission(keys: readonly string[]): boolean { return getMesAuthorizationAdapter().hasAnyPermission(keys); }
export function hasAllPermissions(keys: readonly string[]): boolean { return getMesAuthorizationAdapter().hasAllPermissions(keys); }
export function hasVisibleFeature(config: unknown, feature: string): boolean {
  return getMesAuthorizationAdapter().hasFeature(feature, config);
}
export function hasAnyVisibleFeature(config: unknown, ...features: string[]): boolean {
  return getMesAuthorizationAdapter().hasAnyFeature(features, config);
}
export function hasOperationFeatureAccess(config: unknown, permissionKeys: readonly string[]): boolean {
  return getMesAuthorizationAdapter().hasOperationFeatureAccess(config, permissionKeys);
}
export function resetMesAuthorization(): void { adapter = undefined; }
