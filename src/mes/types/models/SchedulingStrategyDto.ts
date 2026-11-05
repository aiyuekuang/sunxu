/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SetupStartRestrictionDto } from './SetupStartRestrictionDto';
import type { SetupTransitionRuleDto } from './SetupTransitionRuleDto';
export type SchedulingStrategyDto = {
    /**
     * 是否允许在排产时临时覆盖公司默认缓冲比例
     */
    allowBufferRatioOverride?: boolean;
    /**
     * 公司默认尾部缓冲比例，0=不加缓冲，0.15=15%
     */
    defaultBufferRatio?: number;
    /**
     * 公司默认是否允许插单重排使用替代设备
     */
    defaultRescheduleAllowAlternativeEquipment?: boolean;
    /**
     * 公司默认是否允许插单重排移动已确认未开工排产
     */
    defaultRescheduleAllowMoveConfirmed?: boolean;
    /**
     * 公司默认插单重排冻结窗口分钟数
     */
    defaultRescheduleFreezeMinutes?: number;
    /**
     * 公司默认插单重排窗口天数
     */
    defaultRescheduleHorizonDays?: number;
    /**
     * 公司默认插单重排最大允许延迟分钟数
     */
    defaultRescheduleMaxDelayMinutes?: number;
    /**
     * 公司默认插单重排最大允许新增逾期数
     */
    defaultRescheduleMaxOverdueCount?: number;
    /**
     * 公司默认插单重排最大允许重确认数量
     */
    defaultRescheduleMaxReconfirmCount?: number;
    /**
     * 启用准备规则后，是否优先让相同准备组的计划连续排产；只影响候选排序，不绕过交期、资源、班次和工序依赖约束。
     */
    preferSameSetupGroup?: boolean;
    /**
     * 是否启用准备组连续生产规则。默认关闭；关闭时完全沿用原有每单固定准备工时和分派顺序。
     */
    setupRuleEnabled?: boolean;
    /**
     * 长准备启动时间窗限制。只限制准备开始，不改变班次、有限产能和工序依赖；未开启时不生效。
     */
    setupStartRestriction?: SetupStartRestrictionDto;
    /**
     * 准备转换工时矩阵。工作中心专属规则优先于通用规则，同一范围内来源/目标组越精确越优先；未命中时回退工序固定准备工时。
     */
    setupTransitionRules?: Array<SetupTransitionRuleDto>;
};
