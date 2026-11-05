export type CopyProcessRouteDto = {
    /**
     * 复制新版本说明（选填，未填时后续启用会自动生成追溯说明）
     */
    changeReason?: string;
    /**
     * 变更类型；历史版本重新启用时传 rollback
     */
    changeType?: CopyProcessRouteDto.changeType;
    /**
     * 源工艺路线ID
     */
    sourceId: string;
};
export declare namespace CopyProcessRouteDto {
    /**
     * 变更类型；历史版本重新启用时传 rollback
     */
    enum changeType {
        NEW = "new",
        MINOR = "minor",
        MAJOR = "major",
        TRIAL_TO_STANDARD = "trial_to_standard",
        ROLLBACK = "rollback"
    }
}
