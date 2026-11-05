import { PurchaseReturnFinancialAction } from '../../../types/models/PurchaseReturnFinancialAction';
import { PurchaseReturnFromReceiptDto } from '../../../types/models/PurchaseReturnFromReceiptDto';
import type { PurchaseReceipt } from '../../../host/services';
import type { PurchaseReturnReturnableLineDto } from '../../../host/services';
import { today } from '../../../../core/utils/date';

export interface ReceiptDraft {
  receipt: PurchaseReceipt | null;
  quantityByLine: Record<string, string>;
  returnDate: string;
  financialAction: PurchaseReturnFinancialAction;
  reasonCode: string;
}

export interface PurchaseReturnFromReceiptSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

export function newReceiptDraft(): ReceiptDraft {
  return {
    receipt: null,
    quantityByLine: {},
    returnDate: today(),
    financialAction: PurchaseReturnFinancialAction.PAYABLE_OFFSET,
    reasonCode: '',
  };
}

export function buildReceiptReturnItems(
  lines: PurchaseReturnReturnableLineDto[],
  quantityByLine: Record<string, string>,
) {
  return lines
    .map((line) => ({
      sourceReceiptItemId: line.sourceReceiptItemId,
      returnQty: Number(quantityByLine[line.sourceReceiptItemId] ?? 0),
    }))
    .filter((item) => Number.isFinite(item.returnQty) && item.returnQty > 0);
}

export function toFromReceiptFinancialAction(
  action: PurchaseReturnFinancialAction,
): PurchaseReturnFromReceiptDto['financialAction'] {
  switch (action) {
    case PurchaseReturnFinancialAction.NONE:
      return PurchaseReturnFromReceiptDto.financialAction.NONE;
    case PurchaseReturnFinancialAction.PAYABLE_OFFSET:
      return PurchaseReturnFromReceiptDto.financialAction.PAYABLE_OFFSET;
    case PurchaseReturnFinancialAction.REFUND:
      return PurchaseReturnFromReceiptDto.financialAction.REFUND;
  }
}
