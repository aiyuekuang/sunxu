/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SetupStartRestrictionDto } from './SetupStartRestrictionDto';
import type { SetupTransitionRuleDto } from './SetupTransitionRuleDto';
import type { WorkOrderScheduleBufferSource } from './WorkOrderScheduleBufferSource';
export type AppliedSchedulePolicyDto = {
    /**
     * 是否允许在排产时临时覆盖公司默认缓冲比例
     */
    allowBufferRatioOverride: boolean;
    /**
     * 本次排产最终采用的缓冲比例
     */
    bufferRatio: number;
    /**
     * 公司默认尾部缓冲比例，0=不加缓冲，0.15=15%
     */
    defaultBufferRatio: number;
    /**
     * 公司默认是否允许插单重排使用替代设备
     */
    defaultRescheduleAllowAlternativeEquipment: boolean;
    /**
     * 公司默认是否允许插单重排移动已确认未开工排产
     */
    defaultRescheduleAllowMoveConfirmed: boolean;
    /**
     * 公司默认插单重排冻结窗口分钟数
     */
    defaultRescheduleFreezeMinutes: number;
    /**
     * 公司默认插单重排窗口天数
     */
    defaultRescheduleHorizonDays: number;
    /**
     * 公司默认插单重排最大允许延迟分钟数
     */
    defaultRescheduleMaxDelayMinutes: number;
    /**
     * 公司默认插单重排最大允许新增逾期数
     */
    defaultRescheduleMaxOverdueCount: number;
    /**
     * 公司默认插单重排最大允许重确认数量
     */
    defaultRescheduleMaxReconfirmCount: number;
    /**
     * 是否优先相同准备组连续生产
     */
    preferSameSetupGroup: boolean;
    /**
     * 是否启用准备组连续生产规则
     */
    setupRuleEnabled: boolean;
    setupStartRestriction: SetupStartRestrictionDto;
    setupTransitionRules: Array<SetupTransitionRuleDto>;
    /**
     * 本次排产采用的缓冲来源
     */
    source: WorkOrderScheduleBufferSource;
};
