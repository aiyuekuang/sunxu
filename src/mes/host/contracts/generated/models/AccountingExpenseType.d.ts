import type { AccountingExpenseCategory } from './AccountingExpenseCategory.d.ts';
export type AccountingExpenseType = {
    /**
     * 是否影响订单毛利
     */
    affectsOrderMargin: boolean;
    /**
     * 适用对象编码
     */
    applicableObjectTypes: Array<string>;
    /**
     * 是否可资本化进库存成本
     */
    capitalizable: boolean;
    /**
     * 费用大类
     */
    category: AccountingExpenseCategory;
    /**
     * 编码
     */
    code: string;
    companyId: string;
    createdAt: string;
    /**
     * 默认科目用途
     */
    defaultAccountPurpose?: string | null;
    /**
     * 默认分摊方式
     */
    defaultAllocationBasis?: string | null;
    /**
     * 默认财务用途
     */
    defaultFinancialUsage?: string | null;
    id: string;
    /**
     * 名称
     */
    name: string;
    /**
     * 备注
     */
    remark?: string | null;
    /**
     * 状态
     */
    status: string;
    updatedAt: string;
};
