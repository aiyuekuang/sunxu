import type { CreateCustomerMaterialDto } from '../models/CreateCustomerMaterialDto.d.ts';
import type { CustomerMaterial } from '../models/CustomerMaterial.d.ts';
import type { CustomerMaterialIdDto } from '../models/CustomerMaterialIdDto.d.ts';
import type { CustomerMaterialListDto } from '../models/CustomerMaterialListDto.d.ts';
import type { CustomerMaterialMatchResponseDto } from '../models/CustomerMaterialMatchResponseDto.d.ts';
import type { FindEffectiveCustomerMaterialDto } from '../models/FindEffectiveCustomerMaterialDto.d.ts';
import type { MatchCustomerMaterialDto } from '../models/MatchCustomerMaterialDto.d.ts';
import type { SuccessResponseDto } from '../models/SuccessResponseDto.d.ts';
import type { UpdateCustomerMaterialDto } from '../models/UpdateCustomerMaterialDto.d.ts';
import type { CancelablePromise } from '../core/CancelablePromise.d.ts';
export declare class CustomerMaterialsService {
    /**
     * 创建客户料号
     * @param requestBody
     * @returns CustomerMaterial
     * @throws ApiError
     */
    static customerMaterialControllerCreate(requestBody: CreateCustomerMaterialDto): Promise<CustomerMaterial>;
    /**
     * 删除客户料号
     * @param requestBody
     * @returns SuccessResponseDto
     * @throws ApiError
     */
    static customerMaterialControllerDelete(requestBody: CustomerMaterialIdDto): Promise<SuccessResponseDto>;
    /**
     * 客户料号有效映射列表
     * @param requestBody
     * @returns CustomerMaterial
     * @throws ApiError
     */
    static customerMaterialControllerFindEffective(requestBody: FindEffectiveCustomerMaterialDto): Promise<CustomerMaterial>;
    /**
     * 客户料号列表
     * @param requestBody
     * @returns CustomerMaterial
     * @throws ApiError
     */
    static customerMaterialControllerList(requestBody: CustomerMaterialListDto): Promise<Array<CustomerMaterial>>;
    /**
     * 客户料号匹配列表
     * @param requestBody
     * @returns CustomerMaterialMatchResponseDto
     * @throws ApiError
     */
    static customerMaterialControllerMatch(requestBody: MatchCustomerMaterialDto): Promise<CustomerMaterialMatchResponseDto>;
    /**
     * 更新客户料号
     * @param requestBody
     * @returns CustomerMaterial
     * @throws ApiError
     */
    static customerMaterialControllerUpdate(requestBody: UpdateCustomerMaterialDto): Promise<CustomerMaterial>;
}
