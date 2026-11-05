import type { FinanceInvoice } from './FinanceInvoice.d.ts';
import type { PaymentAllocation } from './PaymentAllocation.d.ts';
export type FinanceInvoiceDetailResponseDto = {
    allocations: Array<PaymentAllocation>;
    invoice: FinanceInvoice;
};
