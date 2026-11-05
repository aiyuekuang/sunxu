import type { ToolingStatus } from './ToolingStatus.d.ts';
export type ToolingRecommendationItemDto = {
    /**
     * 工装技术图纸资料 URL 列表
     */
    drawingUrls: Array<string>;
    /**
     * 工装ID
     */
    id: string;
    /**
     * 寿命百分比
     */
    lifePercent: number;
    /**
     * 工装名称
     */
    name: string;
    /**
     * 推荐原因
     */
    recommendReasons: Array<string>;
    /**
     * 推荐分数
     */
    score: number;
    /**
     * 规格
     */
    spec?: string | null;
    status: ToolingStatus;
    /**
     * 工装编码
     */
    toolingCode: string;
    /**
     * 工装类型
     */
    type: string;
    /**
     * 所属工作中心ID
     */
    workCenterId?: string | null;
};
