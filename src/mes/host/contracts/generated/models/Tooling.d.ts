import type { ToolingStatus } from './ToolingStatus.d.ts';
import type { User } from './User.d.ts';
import type { WorkCenter } from './WorkCenter.d.ts';
export type Tooling = {
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    currentUseCount: number;
    currentUseHours: number;
    /**
     * 工装技术图纸资料 URL 列表
     */
    drawingUrls: Array<string>;
    id: string;
    /**
     * 寿命计量单位
     */
    lifeCountUnit: string;
    /**
     * 当前寿命周期
     */
    lifeCycle: number;
    maxUseCount?: number | null;
    maxUseHours?: number | null;
    name: string;
    remarks?: string | null;
    /**
     * 报废原因
     */
    scrapReason?: string | null;
    /**
     * 报废时间
     */
    scrappedAt?: string | null;
    /**
     * 报废人ID
     */
    scrappedBy?: string | null;
    /**
     * 报废人
     */
    scrapper?: User | null;
    spec?: string | null;
    status: ToolingStatus;
    toolingCode: string;
    type: string;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    warningThreshold: number;
    workCenter?: WorkCenter | null;
    workCenterId?: string | null;
};
