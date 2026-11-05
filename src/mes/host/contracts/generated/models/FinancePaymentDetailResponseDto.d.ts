import type { FinancePayment } from './FinancePayment.d.ts';
import type { PaymentAllocation } from './PaymentAllocation.d.ts';
export type FinancePaymentDetailResponseDto = {
    allocations: Array<PaymentAllocation>;
    payment: FinancePayment;
};
