/**
 * 执行就绪状态：未排产 / 待确认排产 / 待开工
 */
export declare enum WorkOrderExecutionState {
    UNSCHEDULED = "unscheduled",
    PENDING_CONFIRM = "pending_confirm",
    READY_TO_START = "ready_to_start"
}
