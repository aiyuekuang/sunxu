export type TraceBatchGraphDto = {
    /**
     * 追溯入口批次ID
     */
    batchId: string;
    /**
     * 上下文级别，summary 返回摘要，full 返回明细
     */
    contextLevel?: TraceBatchGraphDto.contextLevel;
    /**
     * 追溯方向：正向、反向或双向
     */
    direction: TraceBatchGraphDto.direction;
    /**
     * 是否包含关联单据节点，默认 true
     */
    includeDocs?: boolean;
    /**
     * 是否包含设备环境摘要，默认 true
     */
    includeEnvironment?: boolean;
    /**
     * 是否包含质检测量项，默认 true
     */
    includeMeasurement?: boolean;
    /**
     * 最大追溯深度，默认 10
     */
    maxDepth?: number;
};
export declare namespace TraceBatchGraphDto {
    /**
     * 上下文级别，summary 返回摘要，full 返回明细
     */
    enum contextLevel {
        SUMMARY = "summary",
        FULL = "full"
    }
    /**
     * 追溯方向：正向、反向或双向
     */
    enum direction {
        FORWARD = "forward",
        BACKWARD = "backward",
        BOTH = "both"
    }
}
