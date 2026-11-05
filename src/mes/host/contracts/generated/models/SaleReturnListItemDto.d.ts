import type { Customer } from './Customer.d.ts';
import type { SaleDeliveryOrder } from './SaleDeliveryOrder.d.ts';
import type { SaleOrder } from './SaleOrder.d.ts';
import type { SaleReturnDeductionLine } from './SaleReturnDeductionLine.d.ts';
import type { SaleReturnFinancialAction } from './SaleReturnFinancialAction.d.ts';
import type { SaleReturnItem } from './SaleReturnItem.d.ts';
import type { SaleReturnStatus } from './SaleReturnStatus.d.ts';
import type { SaleReturnType } from './SaleReturnType.d.ts';
import type { User } from './User.d.ts';
import type { Warehouse } from './Warehouse.d.ts';
export type SaleReturnListItemDto = {
    addressSnapshot?: string | null;
    companyId: string;
    contactNameSnapshot?: string | null;
    contactPhoneSnapshot?: string | null;
    createdAt: string;
    createdBy?: string | null;
    creator?: User | null;
    customer?: Customer | null;
    customerId?: string | null;
    /**
     * 客户名称
     */
    customerName?: string | null;
    deductionLines?: Array<SaleReturnDeductionLine>;
    exchangeDelivery?: SaleDeliveryOrder | null;
    exchangeDeliveryId?: string | null;
    financialAction: SaleReturnFinancialAction;
    id: string;
    inspectionRequired: boolean;
    /**
     * 明细行数
     */
    itemCount: number;
    items?: Array<SaleReturnItem>;
    partnerNameSnapshot?: string | null;
    reasonCode?: string | null;
    /**
     * 退货原因名称快照
     */
    reasonLabelSnapshot?: string | null;
    receiveDate?: string | null;
    receiveWarehouse?: Warehouse | null;
    receiveWarehouseId?: string | null;
    /**
     * 退回仓库名称
     */
    receiveWarehouseName?: string | null;
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
    /**
     * 来源销售出库单编号
     */
    sourceDeliveryNo?: string | null;
    sourceSaleOrder?: SaleOrder | null;
    sourceSaleOrderId?: string | null;
    /**
     * 来源销售订单号
     */
    sourceSaleOrderNo?: string | null;
    status: SaleReturnStatus;
    /**
     * 状态显示颜色
     */
    statusColor: string;
    /**
     * 状态显示文案
     */
    statusLabel: string;
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
