import { useCallback, useState } from 'react';
import { PurchaseReturnFinancialAction } from '../../../types/models/PurchaseReturnFinancialAction';
import type { PurchaseReceipt } from '../../../host/services';
import {
  type PurchaseReturnReturnableLineDto,
  purchaseReturnService,
} from '../../../host/services';
import { BottomSheet } from '../../../../core/components/BottomSheet.tsx';
import { useAmountDisplay } from '../../../host/hooks/useAmountDisplay';
import { useDict } from '../../../host/hooks/useDict';
import { PurchaseReturnFromReceiptContent } from './PurchaseReturnFromReceiptContent.tsx';
import {
  buildReceiptReturnItems,
  newReceiptDraft,
  type PurchaseReturnFromReceiptSheetProps,
  type ReceiptDraft,
  toFromReceiptFinancialAction,
} from './PurchaseReturnFromReceiptSheet.helpers.ts';

export function PurchaseReturnFromReceiptSheet({
  visible,
  onClose,
  onCreated,
}: PurchaseReturnFromReceiptSheetProps) {
  const { permitted: canViewPrices } = useAmountDisplay();
  const [receiptDraft, setReceiptDraft] = useState<ReceiptDraft>(newReceiptDraft);
  const [loadingLines, setLoadingLines] = useState(false);
  const [lines, setLines] = useState<PurchaseReturnReturnableLineDto[]>([]);
  const { options: purchaseReturnReasonOptions } = useDict('purchase_return_reason');

  const close = useCallback(() => {
    setReceiptDraft(newReceiptDraft());
    setLines([]);
    onClose();
  }, [onClose]);

  const selectReceipt = useCallback(async (receipt: PurchaseReceipt | null) => {
    setReceiptDraft((current) => ({ ...current, receipt, quantityByLine: {} }));
    setLines([]);
    if (!receipt) return;
    setLoadingLines(true);
    try {
      const result = await purchaseReturnService.returnableLines(receipt.id);
      setLines(result.lines);
      setReceiptDraft({
        receipt,
        quantityByLine: Object.fromEntries(
          result.lines.map((line) => [line.sourceReceiptItemId, String(line.returnableQty)]),
        ),
        returnDate: newReceiptDraft().returnDate,
        financialAction: PurchaseReturnFinancialAction.PAYABLE_OFFSET,
        reasonCode: '',
      });
    } finally {
      setLoadingLines(false);
    }
  }, []);

  const createFromReceipt = useCallback(async () => {
    const receipt = receiptDraft.receipt;
    if (!receipt) return;
    const items = buildReceiptReturnItems(lines, receiptDraft.quantityByLine);
    if (items.length === 0) return;
    if (!receiptDraft.reasonCode) return;
    const detail = await purchaseReturnService.fromReceipt({
      sourceReceiptId: receipt.id,
      items,
      returnDate: receiptDraft.returnDate,
      financialAction: toFromReceiptFinancialAction(receiptDraft.financialAction),
      reasonCode: receiptDraft.reasonCode,
    });
    close();
    onCreated(detail.id);
  }, [close, lines, onCreated, receiptDraft]);

  const canCreate =
    receiptDraft.receipt !== null &&
    Boolean(receiptDraft.reasonCode) &&
    lines.some((line) => {
      const value = Number(receiptDraft.quantityByLine[line.sourceReceiptItemId] ?? 0);
      return Number.isFinite(value) && value > 0;
    });
  const confirmDisabledHint = loadingLines
    ? '正在加载可退明细，请稍候'
    : !receiptDraft.receipt
      ? '请选择采购入库单'
      : !receiptDraft.reasonCode
        ? '请选择退货原因'
        : !canCreate
          ? '请至少填写一条退货数量'
          : undefined;

  return (
    <BottomSheet
      visible={visible}
      onClose={close}
      title="从采购入库单下推"
      subtitle="选择已确认的采购入库单，系统会按当前可退数量创建采购退料单草稿。"
      confirmText="创建草稿"
      onConfirm={() => void createFromReceipt()}
      disabled={!canCreate || loadingLines}
      confirmDisabledHint={confirmDisabledHint}
      loading={loadingLines}
      avoidKeyboard
    >
      <PurchaseReturnFromReceiptContent
        receipt={receiptDraft.receipt}
        quantityByLine={receiptDraft.quantityByLine}
        returnDate={receiptDraft.returnDate}
        financialAction={receiptDraft.financialAction}
        reasonCode={receiptDraft.reasonCode}
        reasonOptions={purchaseReturnReasonOptions}
        lines={lines}
        canManagePrice={canViewPrices}
        onSelectReceipt={(receipt) => void selectReceipt(receipt)}
        onReturnDateChange={(returnDate) =>
          setReceiptDraft((current) => ({ ...current, returnDate }))
        }
        onFinancialActionChange={(financialAction) =>
          setReceiptDraft((current) => ({ ...current, financialAction }))
        }
        onReasonCodeChange={(reasonCode) =>
          setReceiptDraft((current) => ({ ...current, reasonCode }))
        }
        onQuantityChange={(sourceReceiptItemId, returnQty) =>
          setReceiptDraft((current) => ({
            ...current,
            quantityByLine: { ...current.quantityByLine, [sourceReceiptItemId]: returnQty },
          }))
        }
      />
    </BottomSheet>
  );
}
