/**
 * Service 工厂 — 配置驱动，消除 46 个 service 文件的 CRUD 模板冗余。
 *
 * 核心思想：所有 service 的 list/detail/create/update/delete 行为是相同的"模式"，
 * 差异仅在于"调用哪个 generated 方法"和"类型是什么"。
 * 用工厂函数把"模式"固化，用配置表达"差异"。
 *
 * @example
 * // 简单 CRUD service（只需 5 行而非 50 行）
 * export const supplierService = {
 *   ...createListDetailService<Supplier, SupplierListDto>(
 *     (p) => SupplierService.supplierControllerList(p),
 *     (p) => SupplierService.supplierControllerDetail(p),
 *   ),
 *   create: (dto: CreateSupplierDto) => SupplierService.supplierControllerCreate(dto),
 *   update: (dto: UpdateSupplierDto) => SupplierService.supplierControllerUpdate(dto),
 *   delete: (id: string) => SupplierService.supplierControllerDelete({ id }),
 * };
 */
export interface PaginatedList<T> {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
}
/**
 * 将后端分页响应安全地解构为 PaginatedList<T>。
 * 替代各 service 中 `as unknown as { list: T[]; total: number; ... }` 的不安全 cast。
 */
export declare function asPaginated<T>(raw: unknown): PaginatedList<T>;
/**
 * 创建标准化的 list + detail 方法。
 *
 * 处理了后端返回类型与前端期望类型的统一转换，
 * 集中解决 `as unknown as` 类型绕过问题（只在此一处 cast）。
 */
export declare function createListDetailService<TListItem, TListParams = Record<string, unknown>, TDetailItem = TListItem>(listFn: (params: TListParams) => Promise<unknown>, detailFn: (dto: {
    id: string;
}) => Promise<unknown>): {
    list(params?: TListParams): Promise<PaginatedList<TListItem>>;
    detail(id: string): Promise<TDetailItem>;
};
interface CrudConfig<TItem, TListParams, TCreate, TUpdate> {
    list: (params: TListParams) => Promise<unknown>;
    detail: (dto: {
        id: string;
    }) => Promise<unknown>;
    create?: (dto: TCreate) => Promise<unknown>;
    update?: (dto: TUpdate) => Promise<unknown>;
    delete?: (dto: {
        id: string;
    }) => Promise<unknown>;
}
interface CrudService<TItem, TListParams, TCreate, TUpdate> {
    list: (params?: TListParams) => Promise<PaginatedList<TItem>>;
    detail: (id: string) => Promise<TItem>;
    create: (dto: TCreate) => Promise<TItem>;
    update: (dto: TUpdate) => Promise<TItem>;
    delete: (id: string) => Promise<unknown>;
}
/**
 * 创建完整 CRUD service — 一个配置对象生成五个标准方法。
 *
 * @example
 * export const customerService = createCrudService<Customer, CustomerListDto, CreateCustomerDto, UpdateCustomerDto>({
 *   list: (p) => CustomerService.customerControllerList(p),
 *   detail: (p) => CustomerService.customerControllerDetail(p),
 *   create: (p) => CustomerService.customerControllerCreate(p),
 *   update: (p) => CustomerService.customerControllerUpdate(p),
 *   delete: (p) => CustomerService.customerControllerDelete(p),
 * });
 */
export declare function createCrudService<TItem, TListParams = Record<string, unknown>, TCreate = Record<string, unknown>, TUpdate = Record<string, unknown>>(config: CrudConfig<TItem, TListParams, TCreate, TUpdate>): CrudService<TItem, TListParams, TCreate, TUpdate>;
export {};
