import type { ReportCatalogItem, ReportDetailCode } from '../../host/services';

export const REPORT_COMMON_LIMIT = 8;

export function isReportDetailCode(value: string): value is ReportDetailCode {
  return (
    value === 'sale_delivery_detail' ||
    value === 'sale_order_detail' ||
    value === 'purchase_receipt_detail' ||
    value === 'purchase_order_detail'
  );
}

/** 首页页签已有唯一入口；目录/常用只投影可打开的独立明细，绝不补重复项。 */
export function getReportMenuItems(items: ReportCatalogItem[]): ReportCatalogItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (
      item.targetType !== 'detail' ||
      !isReportDetailCode(item.reportCode) ||
      seen.has(item.reportCode)
    )
      return false;
    seen.add(item.reportCode);
    return true;
  });
}
