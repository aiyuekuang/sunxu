export type { DashboardResponseDto as DashboardData } from '../generated/models/DashboardResponseDto.d.ts';
export type { QualitySummaryResponseDto as QualitySummary } from '../generated/models/QualitySummaryResponseDto.d.ts';
import type { DashboardResponseDto as DashboardData } from '../generated/models/DashboardResponseDto.d.ts';
import type { LargeScreenResponseDto } from '../generated/models/LargeScreenResponseDto.d.ts';
import type { QualitySummaryResponseDto as QualitySummary } from '../generated/models/QualitySummaryResponseDto.d.ts';
import type { QualityReportQueryDto } from '../generated/models/QualityReportQueryDto.d.ts';
import type { StockWarningQueryDto } from '../generated/models/StockWarningQueryDto.d.ts';
import type { StockWarningResponseDto } from '../generated/models/StockWarningResponseDto.d.ts';
import type { ReportCatalogItemDto } from '../generated/models/ReportCatalogItemDto.d.ts';
import type { ReportCatalogResponseDto } from '../generated/models/ReportCatalogResponseDto.d.ts';
import type { ReportDashboardSnapshotQueryDto } from '../generated/models/ReportDashboardSnapshotQueryDto.d.ts';
import type { ReportDashboardSnapshotResponseDto } from '../generated/models/ReportDashboardSnapshotResponseDto.d.ts';
import type { DashboardShortcutPreferencesResponseDto } from '../generated/models/DashboardShortcutPreferencesResponseDto.d.ts';
export type ReportDetailCode = 'sale_delivery_detail' | 'sale_order_detail' | 'purchase_receipt_detail' | 'purchase_order_detail';
export type ReportTabKey = 'dashboard' | 'production' | 'quality' | 'stock' | 'piecework' | 'finance';
export type ReportCatalogItem = ReportCatalogItemDto;
export type ReportCatalogResponse = ReportCatalogResponseDto;
export type DashboardLargeScreen = LargeScreenResponseDto;
export type DashboardSnapshotResponse = ReportDashboardSnapshotResponseDto;
export interface ReportDetailRow {
    id: string;
    materialName: string;
    materialCode: string;
    materialSpec: string;
    unit: string;
    quantity: number;
    ledgerQty: number;
    amount: number | null;
    totalAmount: number | null;
    effectiveAmount: number | null;
    documentNo: string;
    partnerName: string;
    date: string;
    warehouseName: string;
    status: string;
    sourceNo: string;
    batchNo: string;
    originalQty: number | null;
    returnedQty: number | null;
    reversedQty: number | null;
    effectiveQty: number | null;
    receivedQty: number | null;
    outstandingQty: number | null;
}
export interface ReportSummaryMetric {
    label: string;
    value: number | null;
    unit?: string;
}
export interface ReportDetailSummary {
    metrics: ReportSummaryMetric[];
    customFieldSummaries: Array<{
        fieldKey: string;
        label: string;
        mode: string;
        value: number | null;
    }>;
}
export interface ReportDetailResult {
    list: ReportDetailRow[];
    total: number;
    page: number;
    pageSize: number;
    priceVisible: boolean;
    summary: ReportDetailSummary;
}
export type ReportDetailParams = {
    page?: number;
    pageSize?: number;
    keyword?: string;
    orderBy?: string;
    orderDir?: 'ASC' | 'DESC';
    startDate?: string;
    endDate?: string;
    status?: string;
    customerId?: string;
    supplierId?: string;
    materialId?: string;
    warehouseId?: string;
};
export interface TrendPoint {
    label: string;
    qty: number;
    count: number;
}
export interface RealtimeDashboard {
    workOrders: {
        running: number;
        pending: number;
        completed: number;
        paused: number;
    };
    todayQty: number;
    overdueCount: number;
    qualityPassRate: number;
    equipmentStatus: {
        available: number;
        busy: number;
        maintenance: number;
        fault: number;
        retired: number;
    };
}
export declare const reportService: {
    getCatalog(): Promise<ReportCatalogResponse>;
    setFavorite(reportCode: string, isFavorite: boolean): Promise<boolean>;
    getDetail: (code: ReportDetailCode, params?: ReportDetailParams) => Promise<ReportDetailResult>;
    getRealtimeDashboard(): Promise<RealtimeDashboard>;
    getLargeScreen: () => import("../../../types/generated/index").Promise<LargeScreenResponseDto>;
    getAlertEvents: () => import("../../../types/generated/index").Promise<import("../../../types/generated/index").AlertEventsResponseDto>;
    getDashboard: () => import("../../../types/generated/index").Promise<DashboardData>;
    getDashboardShortcutPreferences: () => Promise<DashboardShortcutPreferencesResponseDto>;
    getDashboardSnapshot: (params: ReportDashboardSnapshotQueryDto) => import("../../../types/generated/index").Promise<ReportDashboardSnapshotResponseDto>;
    getProductionAnalysis: (params: ReportDashboardSnapshotQueryDto) => import("../../../types/generated/index").Promise<import("../../../types/generated/index").ProductionAnalysisResponseDto>;
    getQualitySummary: (params?: QualityReportQueryDto) => import("../../../types/generated/index").Promise<QualitySummary>;
    getStockWarning: (params?: StockWarningQueryDto) => import("../../../types/generated/index").Promise<StockWarningResponseDto>;
    exportMaterialsCSV: () => Promise<unknown>;
};
