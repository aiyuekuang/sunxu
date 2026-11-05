/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PaginatedListDto = {
    /**
     * 数据列表
     */
    list: Array<Record<string, any>>;
    /**
     * 当前页码
     */
    page: number;
    /**
     * 每页条数
     */
    pageSize: number;
    /**
     * 总条数
     */
    total: number;
};
