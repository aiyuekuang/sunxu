export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}
export interface PageParams {
    page?: number;
    pageSize?: number;
}
export interface LoginDto {
    identifier: string;
    password: string;
}
export interface LoginResult {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
    user: UserInfo;
}
export interface UserInfo {
    id: string;
    username: string;
    realName: string | null;
    email: string | null;
    phone: string | null;
    isActive: boolean;
    companyId: string | null;
    roles: string[];
    permissions: string[];
    departmentId: string | null;
}
export interface UpdateProfileDto {
    realName?: string;
    email?: string;
    username?: string;
    phone?: string;
}
export interface ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
}
export interface Company {
    id: string;
    name: string;
    companyNo: string | null;
    status: number;
    parentId: string | null;
    path: string | null;
    level: number;
    contactName: string | null;
    contactPhone: string | null;
    balance: number;
    expireDate: string | null;
    lowBalanceThreshold: number;
    billingCompanyId: string | null;
    maxSeats: number;
    planType: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    children?: Company[];
}
export interface CreateCompanyDto {
    name: string;
    companyNo?: string;
    parentId?: string;
    contactName?: string;
    contactPhone?: string;
    planType?: string;
    maxSeats?: number;
    expireDate?: string;
    description?: string;
}
export interface UpdateCompanyDto extends Partial<CreateCompanyDto> {
    id: string;
    status?: number;
}
export type SubscriptionApplyMode = 'renew_current' | 'upgrade_now' | 'downgrade_after_current';
export interface RedeemRechargeCodeDto {
    code: string;
    externalOrderNo?: string;
    remark?: string;
}
export interface RechargeCodePreview {
    mode: SubscriptionApplyMode;
    planType: string;
    maxSeats: number;
    durationDays: number;
    validUntil: string | null;
    currentPlanType: string;
    currentMaxSeats: number;
    currentExpireDate: string;
    expireDate: string;
    convertedDays: number;
    willReactivateCompany: boolean;
    pendingSchedule: {
        planType: string;
        maxSeats: number;
        startDate: string;
        expireDate: string;
    } | null;
}
export interface User {
    id: string;
    username: string;
    realName: string | null;
    email: string | null;
    phone: string | null;
    isActive: boolean;
    companyId: string | null;
    departmentId: string | null;
    department?: {
        id: string;
        name: string;
    } | null;
    managedCompanyIds: string[];
    roles: Role[];
    companies: Company[];
    createdAt: string;
    updatedAt: string;
}
export interface SimpleUser {
    id: string;
    username: string;
    realName: string | null;
}
export interface CreateUserDto {
    username?: string;
    password: string;
    realName?: string;
    email?: string;
    phone?: string;
    isActive?: boolean;
    departmentId?: string;
    roleIds?: string[];
    managedCompanyIds?: string[];
}
export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'username' | 'password'>> {
    id: string;
    password?: string;
}
export interface AssignRolesDto {
    id: string;
    roleIds: string[];
}
export interface AssignCompaniesDto {
    id: string;
    companyIds: string[];
}
export interface UserListParams extends PageParams {
    username?: string;
    realName?: string;
    isActive?: boolean;
    companyIds?: string[];
}
export interface Role {
    id: string;
    name: string;
    description: string | null;
    permissionIds: string[];
    companyId: string | null;
    isDefault: boolean;
    managedCompanyIds: string[];
    createdAt: string;
    updatedAt: string;
    _readonly?: boolean;
}
export interface CreateRoleDto {
    name: string;
    description?: string;
    permissionIds?: string[];
    isDefault?: boolean;
    managedCompanyIds?: string[];
}
export interface UpdateRoleDto extends Partial<CreateRoleDto> {
    id: string;
}
export interface Department {
    id: string;
    name: string;
    parentId: string | null;
    sortOrder: number;
    status: number;
    leaderId: string | null;
    /** 负责人（从用户表关联） */
    leader?: SimpleUser | null;
    description: string | null;
    companyId: string | null;
    createdAt: string;
    updatedAt: string;
    children?: Department[];
}
export interface CreateDepartmentDto {
    name: string;
    parentId?: string;
    sortOrder?: number;
    leaderId?: string;
    description?: string;
}
export interface UpdateDepartmentDto extends Partial<CreateDepartmentDto> {
    id: string;
    status?: number;
}
export interface PermissionNode {
    id: string;
    name: string;
    sign: string;
    description?: string;
    children?: PermissionNode[];
}
export interface SendVerifyCodeDto {
    email: string;
}
export interface RegisterDto {
    email: string;
    password: string;
    realName: string;
    username?: string;
    phone?: string;
    verifyCode: string;
    companyName: string;
}
export type RegisterResult = LoginResult;
