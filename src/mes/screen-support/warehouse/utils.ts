import type { Stock } from '../../host/services';

type StockQtySnapshot = Pick<Stock, 'quantity' | 'reservedQty' | 'frozenQty'>;
type StockWarningSnapshot = StockQtySnapshot & Pick<Stock, 'alertThreshold'>;

/** 统一仓储模块前端的可用库存口径：总库存 - 占用库存 - 冻结库存 */
export function getAvailableQty(stock: StockQtySnapshot): number {
  return Number(stock.quantity) - Number(stock.reservedQty) - Number(stock.frozenQty ?? 0);
}

/** 低库存统一使用后端按当前货主和预警口径返回的阈值。 */
export function isBelowAlertThreshold(stock: StockWarningSnapshot): boolean {
  const threshold = Number(stock.alertThreshold ?? 0);
  return threshold > 0 && getAvailableQty(stock) < threshold;
}
