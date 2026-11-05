/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BomItemPartType } from './BomItemPartType';
import type { BomScope } from './BomScope';
import type { BomSourceType } from './BomSourceType';
import type { BomStatus } from './BomStatus';
import type { User } from './User';
export type BomHeader = {
    baseBomHeader?: BomHeader | null;
    /**
     * 型号差异 BOM 关联的系列基础 BOM ID
     */
    baseBomHeaderId?: string | null;
    bomMaster?: Record<string, any> | null;
    /**
     * 稳定 BOM 方案ID
     */
    bomMasterId?: string | null;
    /**
     * BOM 适用层级：型号标准、产品基础、型号差异、型号有效
     */
    bomScope: BomScope;
    /**
     * BOM变更说明
     */
    changeRemark?: string | null;
    companyId: string;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    description?: string | null;
    family?: Record<string, any> | null;
    /**
     * 物料系列ID
     */
    familyId?: string | null;
    id: string;
    /**
     * 激活影响确认时间
     */
    impactConfirmedAt?: string | null;
    /**
     * 激活影响确认人
     */
    impactConfirmedBy?: string | null;
    /**
     * 导入会话ID
     */
    importSessionId?: string | null;
    /**
     * 系列基础 BOM 是否把解析时选中的当前型号物料作为投入料；用于本体加工、来料加工等同料出入库场景
     */
    includeOutputMaterialAsInput: boolean;
    items?: Array<Record<string, any>>;
    material?: Record<string, any> | null;
    /**
     * 成品物料档案ID；系列基础 BOM 可为空并通过 familyId 归属系列
     */
    materialId?: string | null;
    /**
     * 系列基础 BOM 自动生成当前型号本体投入行时使用的供料方式；客户供料会在工单需求中锁定为该工单客户的货主库存
     */
    outputMaterialInputPartType: BomItemPartType;
    /**
     * 当前型号本体投入单耗；按每 1 个父项产出计算
     */
    outputMaterialInputQuantity: number;
    /**
     * 零件号/产品号
     */
    partNo?: string | null;
    /**
     * 来源摘要（机器签名，供有效 BOM 快照幂等查重，不直接对外展示）
     */
    sourceSummary?: string | null;
    /**
     * 来源摘要（人读文本，供界面展示）
     */
    sourceSummaryText?: string | null;
    /**
     * BOM 来源类型：基础资料 BOM 固定为标准 BOM
     */
    sourceType: BomSourceType;
    status: BomStatus;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
    version: string;
};
