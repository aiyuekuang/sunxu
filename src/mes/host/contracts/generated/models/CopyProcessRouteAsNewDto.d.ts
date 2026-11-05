export type CopyProcessRouteAsNewDto = {
    /**
     * 新路线说明；不传沿用源路线说明
     */
    description?: string | null;
    /**
     * 新路线名称
     */
    name: string;
    /**
     * 源工艺路线ID
     */
    sourceId: string;
};
