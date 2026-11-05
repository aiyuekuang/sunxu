export type ApprovalStepDto = {
    departmentId?: string;
    departmentScope?: Record<string, any>;
    label: string;
    roleId?: string;
    step: number;
    type?: string;
    userId?: string;
};
