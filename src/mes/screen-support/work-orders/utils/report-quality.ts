const REPORT_SCRAP_RATE_ERROR_THRESHOLD = 0.02;

export type ReportQualityVariant = 'success' | 'warning' | 'error';

const percentFormatter = new Intl.NumberFormat('zh-CN', {
  maximumFractionDigits: 1,
});

export function getReportScrapRate(
  completedQty?: number | null,
  scrappedQty?: number | null,
): number | null {
  const completed = Number(completedQty ?? 0);
  const scrapped = Number(scrappedQty ?? 0);
  const total = completed + scrapped;

  if (total <= 0) {
    return null;
  }

  return scrapped / total;
}

export function getReportQualityVariant(scrapRate: number): ReportQualityVariant {
  if (scrapRate <= 0) {
    return 'success';
  }
  if (scrapRate <= REPORT_SCRAP_RATE_ERROR_THRESHOLD) {
    return 'warning';
  }
  return 'error';
}

export function formatReportScrapRate(scrapRate: number): string {
  return `${percentFormatter.format(scrapRate * 100)}%`;
}
