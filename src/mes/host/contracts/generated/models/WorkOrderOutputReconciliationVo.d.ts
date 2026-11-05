export type WorkOrderOutputReconciliationVo = {
    /**
     * 实际入成品库合计（唯一权威取自库存流水净额：本工单成品物料 IN_PRODUCTION 正、OUT_PRODUCTION 负，已含报工自动入库/待确认入库/让步接收并扣减回滚冲正）
     */
    actualFinishedInboundQty: number;
    /**
     * 让步接收转可用入库数量（生产报废处置派生，已 IN_PRODUCTION 入成品库，来源处置单）
     */
    concessionInboundQty: number;
    /**
     * 报工完工良品数量（报工事实口径，= 工单 completedQty；非库存入库事实）
     */
    goodInboundQty: number;
    /**
     * 净报废数量（生产报废处置后最终保留报废；原始报工不良口径不变）
     */
    netScrapQty: number;
    /**
     * 生产输出暂存中已发现损坏/不合格、等待处置执行的质量冻结数量
     */
    outputQualityHoldQty: number;
    /**
     * 待处置数量（已报废尚未质量判定）
     */
    pendingDispositionQty: number;
    /**
     * 已报工完工良品中尚未真正入成品库的数量（= 报工完工良品 - 已入库良品；终点为非输出工序、待确认入库未放行、被质量门拦截等场景下的差额）
     */
    pendingFinishedInboundQty: number;
    /**
     * 工单计划数量
     */
    plannedQty: number;
    /**
     * 原始报工不良数量（= 工单 scrappedQty，驱动良率/计件工资，不因让步/返工回写）
     */
    reportedScrapQty: number;
    /**
     * 返工转可用数量（生产报废处置派生）
     */
    reworkResolvedQty: number;
    /**
     * 计划数量中尚未报工产出的差额（= 计划数量 - 报工完工良品 - 原始报工不良；执行中为未投产/未报工余量，工单终结后即为强制完工/欠产的短产缺口）
     */
    unproducedQty: number;
};
