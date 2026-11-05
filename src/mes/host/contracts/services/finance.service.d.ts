import type { AgingReportRowDto as GeneratedAgingReportRowDto } from '../generated/models/AgingReportRowDto.d.ts';
import type { FinanceDeletedResponseDto as GeneratedFinanceDeletedResponseDto } from '../generated/models/FinanceDeletedResponseDto.d.ts';
import type { FinanceInvoice as GeneratedFinanceInvoice } from '../generated/models/FinanceInvoice.d.ts';
import type { FinanceInvoiceListItemDto as GeneratedFinanceInvoiceListItemDto } from '../generated/models/FinanceInvoiceListItemDto.d.ts';
import type { FinanceInvoiceDetailResponseDto as GeneratedFinanceInvoiceDetailResponseDto } from '../generated/models/FinanceInvoiceDetailResponseDto.d.ts';
import type { FinancePayment as GeneratedFinancePayment } from '../generated/models/FinancePayment.d.ts';
import type { SettleCreditNoteRefundDto } from '../generated/models/SettleCreditNoteRefundDto.d.ts';
import type { FinancePaymentDetailResponseDto as GeneratedFinancePaymentDetailResponseDto } from '../generated/models/FinancePaymentDetailResponseDto.d.ts';
import type { OpenCreditRowDto as GeneratedOpenCreditRowDto } from '../generated/models/OpenCreditRowDto.d.ts';
import type { PartnerSummaryRowDto as GeneratedPartnerSummaryRowDto } from '../generated/models/PartnerSummaryRowDto.d.ts';
import type { PaymentAllocation as GeneratedPaymentAllocation } from '../generated/models/PaymentAllocation.d.ts';
import type { SendStatementDto as GeneratedSendStatementDto } from '../generated/models/SendStatementDto.d.ts';
import type { StatementResponseDto as GeneratedStatementResponseDto } from '../generated/models/StatementResponseDto.d.ts';
import { StatementSendChannel } from '../generated/models/StatementSendChannel.d.ts';
import type { StatementSendOptionDto as GeneratedStatementSendOptionDto } from '../generated/models/StatementSendOptionDto.d.ts';
import type { StatementSendOptionsResponseDto as GeneratedStatementSendOptionsResponseDto } from '../generated/models/StatementSendOptionsResponseDto.d.ts';
import type { StatementSendResultDto as GeneratedStatementSendResultDto } from '../generated/models/StatementSendResultDto.d.ts';
import type { PaginatedList } from './_base.d.ts';
export type FinanceInvoiceType = 'receivable' | 'payable';
export type FinanceInvoiceStatus = 'confirmed' | 'partial' | 'paid' | 'cancelled';
export type FinanceInvoiceCategory = 'invoice' | 'credit_note';
export type FinancePaymentType = 'receive' | 'pay';
export type FinancePaymentStatus = 'active' | 'cancelled';
export type OpenCreditSourceType = 'payment' | 'credit_note';
export type FinanceInvoice = Omit<GeneratedFinanceInvoice, 'type' | 'category' | 'status'> & {
    type: FinanceInvoiceType;
    category: FinanceInvoiceCategory;
    status: FinanceInvoiceStatus;
};
export type FinanceInvoiceListItem = Omit<GeneratedFinanceInvoiceListItemDto, 'type' | 'category' | 'status'> & {
    type: FinanceInvoiceType;
    category: FinanceInvoiceCategory;
    status: FinanceInvoiceStatus;
};
export type FinancePayment = Omit<GeneratedFinancePayment, 'type' | 'status'> & {
    type: FinancePaymentType;
    status: FinancePaymentStatus;
};
export type PaymentAllocation = Omit<GeneratedPaymentAllocation, 'invoice' | 'payment' | 'creditNote' | 'sourceType'> & {
    sourceType?: OpenCreditSourceType;
    paymentId?: string | null;
    creditNoteId?: string | null;
    payment?: FinancePayment;
    creditNote?: FinanceInvoice;
    invoice?: FinanceInvoice;
};
export type AgingRow = GeneratedAgingReportRowDto;
export type PartnerSummary = GeneratedPartnerSummaryRowDto;
export type OpenCreditRow = Omit<GeneratedOpenCreditRowDto, 'direction' | 'sourceType'> & {
    direction: FinancePaymentType;
    sourceType: OpenCreditSourceType;
};
export interface AllocationExecuteResponse {
    sourceType: OpenCreditSourceType;
    sourceId: string;
    allocatedAmount: number;
    remainingAvailableAmount: number;
}
export interface ProfitabilityTrialItem {
    materialId: string;
    materialCode: string | null;
    materialName: string | null;
    salesQty: number;
    salesAmount: number;
    purchaseQty: number;
    purchaseAmount: number;
    estimatedUnitCost: number;
    estimatedCostAmount: number;
    estimatedGrossProfit: number;
    grossMarginRate: number;
    costSource: 'actual_batch_cost' | 'bom_route_standard_cost' | 'bom_standard_cost' | 'route_standard_cost' | 'period_purchase_avg' | 'latest_purchase_price' | 'material_unit_cost' | 'missing';
    hasCostBasis: boolean;
    costWarnings: string[];
}
export interface ProfitabilityTrialSummary {
    salesAmount: number;
    estimatedCostAmount: number;
    estimatedGrossProfit: number;
    grossMarginRate: number;
    salesQty: number;
    purchaseQty: number;
    pricedSalesAmount: number;
    missingCostSalesAmount: number;
    missingCostMaterialCount: number;
    costCoverageRate: number;
}
export interface ProfitabilityTrialResponse {
    dateFrom: string;
    dateTo: string;
    list: ProfitabilityTrialItem[];
    total: number;
    page: number;
    pageSize: number;
    summary: ProfitabilityTrialSummary;
}
export interface InvoiceListParams {
    type?: FinanceInvoiceType;
    category?: FinanceInvoiceCategory;
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: FinanceInvoiceStatus;
    partnerId?: string;
    overdue?: boolean;
    sourceType?: string;
    dateFrom?: string;
    dateTo?: string;
    orderBy?: string;
    orderDir?: 'ASC' | 'DESC';
}
export interface PaymentListParams {
    type?: FinancePaymentType;
    /** 默认不传，由后端隐藏撤销留档；仅“已撤销”筛选显式传入。 */
    status?: FinancePaymentStatus;
    page?: number;
    pageSize?: number;
    keyword?: string;
    partnerId?: string;
    dateFrom?: string;
    dateTo?: string;
    orderBy?: string;
    orderDir?: 'ASC' | 'DESC';
}
export interface OpenCreditListParams {
    page?: number;
    pageSize?: number;
    keyword?: string;
    partnerId?: string;
    direction?: FinancePaymentType;
    sourceType?: 'payment' | 'credit_note';
    dateFrom?: string;
    dateTo?: string;
    orderBy?: string;
    orderDir?: 'ASC' | 'DESC';
}
export interface CreatePaymentParams {
    type: FinancePaymentType;
    partnerId: string;
    amount: number;
    fundsAccountId?: string;
    paymentDate?: string;
    paymentMethod?: string;
    referenceNo?: string;
    description?: string;
    allocations?: {
        invoiceId: string;
        amount: number;
    }[];
}
export interface ProfitabilityTrialParams {
    page?: number;
    pageSize?: number;
    keyword?: string;
    orderBy?: string;
    orderDir?: 'ASC' | 'DESC';
    dateFrom?: string;
    dateTo?: string;
}
export interface StatementParams {
    partnerId?: string;
    partnerKeyword?: string;
    type: FinanceInvoiceType;
    currency?: string;
    dateFrom?: string;
    dateTo?: string;
}
export type StatementResult = Omit<GeneratedStatementResponseDto, 'type' | 'invoices'> & {
    type: FinanceInvoiceType;
    invoices: FinanceInvoice[];
};
type FinanceInvoiceDetail = Omit<GeneratedFinanceInvoiceDetailResponseDto, 'invoice' | 'allocations'> & {
    invoice: FinanceInvoice;
    allocations: PaymentAllocation[];
};
type FinancePaymentDetail = Omit<GeneratedFinancePaymentDetailResponseDto, 'payment' | 'allocations'> & {
    payment: FinancePayment;
    allocations: PaymentAllocation[];
};
export type StatementSendOptionDto = GeneratedStatementSendOptionDto;
export type StatementSendResultDto = GeneratedStatementSendResultDto;
export type SendStatementDto = Omit<GeneratedSendStatementDto, 'type'> & {
    type: FinanceInvoiceType;
};
export type StatementSendOptionsResponseDto = Omit<GeneratedStatementSendOptionsResponseDto, 'type'> & {
    type: FinanceInvoiceType;
    options: StatementSendOptionDto[];
};
export { StatementSendChannel };
export declare const financeService: {
    invoiceList: (params: InvoiceListParams) => Promise<PaginatedList<FinanceInvoiceListItem>>;
    invoiceListAllOpen: (params: {
        type: FinanceInvoiceType;
        partnerId: string;
        maxPages?: number;
    }) => Promise<{
        list: FinanceInvoiceListItem[];
        truncated: boolean;
    }>;
    invoiceDetail: (id: string) => Promise<FinanceInvoiceDetail>;
    invoiceCreate: (params: {
        type: FinanceInvoiceType;
        partnerId: string;
        amount: number;
        invoiceDate?: string;
        dueDate?: string;
        description?: string;
    }) => Promise<FinanceInvoice>;
    invoiceCancel: (id: string) => Promise<FinanceInvoice>;
    paymentList: (params: PaymentListParams) => Promise<PaginatedList<FinancePayment>>;
    paymentDetail: (id: string) => Promise<FinancePaymentDetail>;
    paymentCreate: (params: CreatePaymentParams) => Promise<FinancePayment>;
    settleCreditNoteRefund: (params: SettleCreditNoteRefundDto) => import("../../../types/generated/index").Promise<GeneratedFinancePayment>;
    paymentCancel: (id: string) => Promise<GeneratedFinanceDeletedResponseDto>;
    allocate: (params: {
        sourceType?: OpenCreditSourceType;
        sourceId?: string;
        paymentId?: string;
        allocations: {
            invoiceId: string;
            amount: number;
        }[];
    }) => Promise<AllocationExecuteResponse>;
    unallocate: (allocationId: string) => Promise<GeneratedFinanceDeletedResponseDto>;
    openCreditList: (params: OpenCreditListParams) => Promise<PaginatedList<OpenCreditRow>>;
    agingReport: (params: {
        type: FinanceInvoiceType;
        partnerId?: string;
    }) => Promise<GeneratedAgingReportRowDto[]>;
    partnerSummary: (params: {
        type: FinanceInvoiceType;
        page?: number;
        pageSize?: number;
        keyword?: string;
        balanceStatus?: "outstanding" | "settled";
    }) => Promise<PaginatedList<GeneratedPartnerSummaryRowDto>>;
    statement: (params: StatementParams) => Promise<StatementResult>;
    statementSend: (params: SendStatementDto) => Promise<GeneratedStatementSendResultDto>;
    statementSendOptions: (params: StatementParams) => Promise<StatementSendOptionsResponseDto>;
    profitabilityTrial: (params: ProfitabilityTrialParams) => Promise<ProfitabilityTrialResponse>;
};
