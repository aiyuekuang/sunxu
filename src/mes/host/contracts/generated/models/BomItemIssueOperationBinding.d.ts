import type { ProcessRouteMaster } from './ProcessRouteMaster.d.ts';
export type BomItemIssueOperationBinding = {
    bomItem?: Record<string, any>;
    /**
     * BOM 行ID
     */
    bomItemId: string;
    companyId: string;
    createdAt: string;
    id: string;
    /**
     * 路线内稳定投料工序编码
     */
    operationCode: string;
    /**
     * 阶段编码；同一编码在路线内重复时用于精确定位
     */
    phaseCode?: string | null;
    routeMaster: ProcessRouteMaster;
    /**
     * 工艺路线主数据ID
     */
    routeMasterId: string;
    updatedAt: string;
};
