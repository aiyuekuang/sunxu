// ============================================================
// 实体状态枚举（通用）
// ============================================================
export const EntityStatus = {
  Active: 1,
  Inactive: 0,
} as const;

export type EntityStatusValue = (typeof EntityStatus)[keyof typeof EntityStatus];

// ============================================================
// 分页默认值
// ============================================================
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_MAX_SEATS = 50;

/** 非分页列表的常用 pageSize（如弹窗选择、详情子列表） */
export const PAGE_SIZE = {
  /** 默认分页（ConfigListScreen 等列表页） */
  DEFAULT: 20,
  /** 弹窗选择器、详情页子列表等中等列表 */
  MEDIUM: 50,
  /** 全量加载或大列表（如排程、报工记录） */
  LARGE: 100,
  /** 内联子列表（如 BOM 项、工艺路线） */
  SMALL: 10,
} as const;

// ============================================================
// 业务默认值
// ============================================================

/** 需求预测默认月数 */
export const DEFAULT_FORECAST_MONTHS = 3;

/** 生产计划默认优先级 */
export const DEFAULT_PLAN_PRIORITY = 5;

// ============================================================
// Avatar 颜色因子
// ============================================================
export const AVATAR_HUE_FACTOR = 37;
