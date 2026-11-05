/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MaterialLifecycleRefDto } from './MaterialLifecycleRefDto';
import type { MaterialLifecycleTargetDto } from './MaterialLifecycleTargetDto';
export type MaterialLifecycleCheckResponseDto = {
    /**
     * 是否允许普通删除
     */
    canDelete: boolean;
    /**
     * 是否允许彻底清理
     */
    canPurge: boolean;
    /**
     * 普通删除阻断项
     */
    deleteBlockers: Array<MaterialLifecycleRefDto>;
    /**
     * 普通删除会自动清理的低风险从属项
     */
    deleteCascade: Array<MaterialLifecycleRefDto>;
    material: MaterialLifecycleTargetDto;
    /**
     * 彻底清理阻断项
     */
    purgeBlockers: Array<MaterialLifecycleRefDto>;
    /**
     * 彻底清理会级联删除的白名单对象
     */
    purgeCascade: Array<MaterialLifecycleRefDto>;
};
