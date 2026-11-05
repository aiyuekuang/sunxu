export type AuditLogItemDto = {
    action: string;
    createdAt: string;
    description?: string | null;
    id: string;
    ipAddress?: string | null;
    /**
     * JSON 格式的变更后值，结构取决于资源类型
     */
    newValue?: Record<string, any> | null;
    /**
     * JSON 格式的变更前值，结构取决于资源类型
     */
    oldValue?: Record<string, any> | null;
    resource: string;
    resourceId: string;
    userId?: string | null;
    userName?: string | null;
};
