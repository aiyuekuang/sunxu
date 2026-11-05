import type { PermissionNode } from '../types.d.ts';
export declare const permissionService: {
    tree(): Promise<PermissionNode[]>;
    myPermissions(): Promise<string[]>;
    myPermissionTree(): Promise<PermissionNode[]>;
};
