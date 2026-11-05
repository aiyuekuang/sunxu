import type { ExternalPlanScheduleAssignmentDto } from './ExternalPlanScheduleAssignmentDto.d.ts';
export type AutoScheduleFromPlansDto = {
    /**
     * 算法引擎：system（默认）使用 MES 内置算法；external 接收 externalAssignments 的外部算法结果。两种引擎共用本动作的工单、排产、齐套、审批和下达事务。
     */
    algorithmEngine?: AutoScheduleFromPlansDto.algorithmEngine;
    /**
     * 是否自动创建并下达工单（默认 true）
     */
    autoCreateWorkOrders?: boolean;
    /**
     * 缓冲比例：在排产总工时末尾追加缓冲时间，提高排程稳定性。0=不加缓冲，0.15=15%（默认），最大0.5=50%
     */
    bufferRatio?: number;
    /**
     * 排产方向：forward=正排（默认），backward=从交期倒排
     */
    direction?: AutoScheduleFromPlansDto.direction;
    /**
     * 分派规则：edd=最早交期（默认）, spt=最短加工时间, cr=临界比率, wspt=加权最短加工时间, fifo=先进先出
     */
    dispatchRule?: AutoScheduleFromPlansDto.dispatchRule;
    /**
     * 外部算法的工序资源与时间结果；仅 algorithmEngine=external 时使用，必须覆盖所选计划自身路线的全部有效工序，每道工序只提交一个资源。计划数量由 MES 读取，不由外部结果改写；BOM 派生子工单仍由 MES 按现有规则展开和排程。
     */
    externalAssignments?: Array<ExternalPlanScheduleAssignmentDto>;
    /**
     * 仅在用户已明确确认替换关联工单后传 true；系统将取消可取消的草稿/审批中/已下达且未实际开工工单并重新排产。未传时会返回待确认提示，不会静默替换；已实际开工或进入受保护状态的工单仍会阻止排产。
     */
    forceReplace?: boolean;
    /**
     * 排产粒度：固定为设备级
     */
    granularity?: AutoScheduleFromPlansDto.granularity;
    /**
     * 生产计划ID列表
     */
    planIds: Array<string>;
};
export declare namespace AutoScheduleFromPlansDto {
    /**
     * 算法引擎：system（默认）使用 MES 内置算法；external 接收 externalAssignments 的外部算法结果。两种引擎共用本动作的工单、排产、齐套、审批和下达事务。
     */
    enum algorithmEngine {
        SYSTEM = "system",
        EXTERNAL = "external"
    }
    /**
     * 排产方向：forward=正排（默认），backward=从交期倒排
     */
    enum direction {
        FORWARD = "forward",
        BACKWARD = "backward"
    }
    /**
     * 分派规则：edd=最早交期（默认）, spt=最短加工时间, cr=临界比率, wspt=加权最短加工时间, fifo=先进先出
     */
    enum dispatchRule {
        EDD = "edd",
        SPT = "spt",
        CR = "cr",
        WSPT = "wspt",
        FIFO = "fifo"
    }
    /**
     * 排产粒度：固定为设备级
     */
    enum granularity {
        EQUIPMENT = "equipment"
    }
}
