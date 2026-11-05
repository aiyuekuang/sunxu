export type RouteTopologyOperationDto = {
    /**
     * 工序ID
     */
    id: string;
    /**
     * 工序顺序
     */
    sequence: number;
    /**
     * 阶段名称
     */
    stageName?: string;
    /**
     * 阶段序号，仅用于阶段式维护
     */
    stageNo?: number;
};
