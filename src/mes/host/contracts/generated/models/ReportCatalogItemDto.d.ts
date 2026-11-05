import type { ReportCatalogCategory } from './ReportCatalogCategory.d.ts';
import type { ReportCatalogDataMode } from './ReportCatalogDataMode.d.ts';
import type { ReportCatalogTargetType } from './ReportCatalogTargetType.d.ts';
export type ReportCatalogItemDto = {
    /**
     * 报表业务分类
     */
    category?: ReportCatalogCategory;
    /**
     * 数据模式：期间结果、实时快照或混合
     */
    dataMode?: ReportCatalogDataMode;
    /**
     * 报表说明
     */
    description: string;
    /**
     * 报表支持的业务筛选编码
     */
    filterCodes: Array<string>;
    /**
     * 当前用户是否已收藏
     */
    isFavorite: boolean;
    /**
     * 报表使用的指标注册编码
     */
    metricCodes: Array<string>;
    /**
     * 报表目录编码
     */
    reportCode: string;
    /**
     * 报表支持的快捷周期；空数组表示不提供历史周期
     */
    supportedPeriods: Array<'day' | 'week' | 'month' | 'year'>;
    /**
     * 看板页签编码
     */
    tabKey?: string;
    /**
     * 报表打开方式
     */
    targetType?: ReportCatalogTargetType;
    /**
     * 报表名称
     */
    title: string;
};
