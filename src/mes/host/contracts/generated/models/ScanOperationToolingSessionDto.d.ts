export type ScanOperationToolingSessionDto = {
    equipmentName?: string | null;
    /**
     * 工装上机会话ID
     */
    id: string;
    operatorName?: string | null;
    startedAt: string;
    toolingCode?: string | null;
    /**
     * 工装ID
     */
    toolingId: string;
    toolingName?: string | null;
};
