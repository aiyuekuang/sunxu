import type { SimpleUserItemDto } from '../generated/models/SimpleUserItemDto.d.ts';
import type { User, CreateUserDto, UpdateUserDto, AssignRolesDto, AssignCompaniesDto, UserListParams, PaginatedResult } from '../types.d.ts';
export declare const userService: {
    list(params: UserListParams): Promise<PaginatedResult<User>>;
    simpleList(keyword?: string): Promise<Array<{
        id: string;
        username: string;
        realName: string | null;
    }>>;
    detail(id: string): Promise<User>;
    create(dto: CreateUserDto): Promise<User>;
    update(dto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    assignRoles(dto: AssignRolesDto): Promise<void>;
    assignCompanies(dto: AssignCompaniesDto): Promise<void>;
    toggleStatus(id: string, isActive: boolean): Promise<void>;
    getRoles(userId: string): Promise<Array<{
        id: string;
        name: string;
    }>>;
    getCompanies(userId: string): Promise<Array<{
        id: string;
        name: string;
    }>>;
    resetPassword(username: string, newPassword: string): Promise<void>;
    /** 供 EntityFilterChip 使用的分页包装 */
    listForPicker(params: {
        keyword?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{
        list: SimpleUserItemDto[];
        total: number;
    }>;
};
