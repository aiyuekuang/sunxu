import type { Customer } from './Customer.d.ts';
import type { SaleDeliveryOrder } from './SaleDeliveryOrder.d.ts';
import type { SaleOrder } from './SaleOrder.d.ts';
import type { SaleReturnDeductionLine } from './SaleReturnDeductionLine.d.ts';
import type { SaleReturnFinanceDocumentRefDto } from './SaleReturnFinanceDocumentRefDto.d.ts';
import type { SaleReturnFinancialAction } from './SaleReturnFinancialAction.d.ts';
import type { SaleReturnItem } from './SaleReturnItem.d.ts';
import type { SaleReturnStatus } from './SaleReturnStatus.d.ts';
import type { SaleReturnStockTransactionRefDto } from './SaleReturnStockTransactionRefDto.d.ts';
import type { SaleReturnType } from './SaleReturnType.d.ts';
import type { User } from './User.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
export type SaleReturnDetailDto = {
    addressSnapshot?: string | null;
    /**
     * 当前可用业务动作
     */
    availableActions: Array<string>;
    companyId: string;
    contactNameSnapshot?: string | null;
    contactPhoneSnapshot?: string | null;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    customer?: Customer | null;
    customerId?: string | null;
    deductionLines?: Array<SaleReturnDeductionLine>;
    /**
     * 扣款合计（Σ扣款明细金额）；无价格查看权限时为空
     */
    deductionTotal?: number | null;
    exchangeDelivery?: SaleDeliveryOrder | null;
    exchangeDeliveryId?: string | null;
    /**
     * 销售退货生成的财务单据（客户贷项和扣款应收，按来源单反查），供审计追溯
     */
    financeDocuments: Array<SaleReturnFinanceDocumentRefDto>;
    financialAction: SaleReturnFinancialAction;
    id: string;
    inspectionRequired: boolean;
    /**
     * 明细行数
     */
    itemCount: number;
    items?: Array<SaleReturnItem>;
    /**
     * 实退金额 = 退货总金额 − 扣款合计；存在未定价明细时为空
     */
    netRefundAmount?: number | null;
    partnerNameSnapshot?: string | null;
    /**
     * 当前用户是否可查看退货金额及价格快照
     */
    priceVisible: boolean;
    reasonCode?: string | null;
    /**
     * 退货原因名称快照
     */
    reasonLabelSnapshot?: string | null;
    receiveDate?: string | null;
    receiveWarehouse?: Warehouse | null;
    receiveWarehouseId?: string | null;
    remarks?: string | null;
    returnNo: string;
    returnType: SaleReturnType;
    /**
     * 冲正实际执行日期
     */
    reversalDate?: string | null;
    /**
     * 冲正原因
     */
    reversalReason?: string | null;
    /**
     * 冲正时间
     */
    reversedAt?: string | null;
    /**
     * 冲正人ID
     */
    reversedBy?: string | null;
    /**
     * 冲正人
     */
    reverser?: User | null;
    sourceDelivery?: SaleDeliveryOrder | null;
    sourceDeliveryId?: string | null;
    sourceSaleOrder?: SaleOrder | null;
    sourceSaleOrderId?: string | null;
    status: SaleReturnStatus;
    /**
     * 退货入库及退货冲正产生的库存流水，按来源单反查，供审计追溯
     */
    stockTransactions: Array<SaleReturnStockTransactionRefDto>;
    /**
     * 退货总金额；存在未定价明细时为空
     */
    totalAmount?: number | null;
    /**
     * 实收总数量
     */
    totalReceivedQty: number;
    /**
     * 申请退货总数量
     */
    totalReturnQty: number;
    updatedAt: string;
    updatedBy?: string | null;
    updater?: User | null;
};
