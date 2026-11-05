/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SaleReturnItemInputDto = {
    /**
     * 批号
     */
    batchNo?: string;
    /**
     * 前端当前销售退货明细自定义字段 schema 版本；提交 customValues 时必填
     */
    customFieldSchemaVersion?: number;
    /**
     * 销售退货明细自定义字段值（key=字段 key）；不传表示本次不修改自定义字段
     */
    customValues?: Record<string, any>;
    /**
     * 退货处置方式
     */
    disposition?: SaleReturnItemInputDto.disposition;
    /**
     * 行级财务处理；选择生成客户贷项时传入，普通实物退货不传
     */
    financialAction?: SaleReturnItemInputDto.financialAction;
    /**
     * 编辑时原退货明细ID，用于保留行自定义字段
     */
    id?: string;
    /**
     * 入库仓位ID
     */
    locationId?: string;
    /**
     * 物料ID；无来源客户退回时必填
     */
    materialId?: string;
    /**
     * 兼容字段；销售退货申请创建/编辑只能为 0，正式收货请使用收货明细实收数量
     */
    receivedQty?: number;
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 申请退货数量
     */
    returnQty: number;
    /**
     * 来源销售出库单明细ID；无来源客户退回时不传
     */
    sourceDeliveryItemId?: string;
    /**
     * 入库存放位置文本
     */
    storageLocation?: string;
    /**
     * 无来源退货生成贷项时使用双方确认的退货单价
     */
    unitPrice?: number;
};
export namespace SaleReturnItemInputDto {
    /**
     * 退货处置方式
     */
    export enum disposition {
        RESELLABLE = 'resellable',
        PENDING = 'pending',
        DEFECTIVE = 'defective',
        SCRAP = 'scrap',
        REWORK = 'rework',
        REJECT_TO_CUSTOMER = 'reject_to_customer',
    }
    /**
     * 行级财务处理；选择生成客户贷项时传入，普通实物退货不传
     */
    export enum financialAction {
        NONE = 'none',
        CREDIT_NOTE = 'credit_note',
        RECEIVABLE_OFFSET = 'receivable_offset',
        REFUND = 'refund',
    }
}
