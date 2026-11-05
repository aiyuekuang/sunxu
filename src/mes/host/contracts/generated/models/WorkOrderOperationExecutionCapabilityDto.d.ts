export type WorkOrderOperationExecutionCapabilityDto = {
    /**
     * 当前不能录入工序执行时的后端业务原因
     */
    blockReason?: string | null;
    /**
     * 当前业务状态下是否允许录入工序执行，不包含前端权限判断
     */
    canRecord: boolean;
    /**
     * 数量输入允许的小数位数
     */
    inputScale: number;
    /**
     * 是否末道工序；有有效依赖网络时按无后继节点判定，否则按未跳过工序的最大序号判定
     */
    isTerminalOperation: boolean;
    /**
     * 本次允许录入的最大数量；null 表示当前执行类型不录数量或未设置数量上限
     */
    maxAllowedQty?: number | null;
    /**
     * 本次录入数量超过该值时必须填写执行原因或备注；null 表示没有数量超额原因要求
     */
    reasonRequiredBeyond?: number | null;
};
