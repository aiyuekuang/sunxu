import type { ReportQuantityUnitValueDto } from '../../../types/models/ReportQuantityUnitValueDto';

interface TrendUnitBucket {
  label: string;
  unitBreakdown?: ReportQuantityUnitValueDto[];
}

export interface UnitTrendSeriesPoint {
  label: string;
  value: number;
  axisLabel: string;
}

export interface UnitTrendSeries {
  seriesId: string;
  label: string;
  unit: string | null;
  total: number;
  points: UnitTrendSeriesPoint[];
}

export function splitTrendByUnit(
  trend: TrendUnitBucket[],
  getAxisLabel: (label: string, index: number, total: number) => string,
): UnitTrendSeries[] {
  const units = new Map<
    string,
    { label: string; unit: string | null; values: Map<number, number> }
  >();

  trend.forEach((bucket, index) => {
    bucket.unitBreakdown?.forEach((item) => {
      const series = units.get(item.seriesId) ?? {
        label: item.label,
        unit: item.unit ?? null,
        values: new Map<number, number>(),
      };
      series.values.set(index, Number(item.qty ?? 0));
      units.set(item.seriesId, series);
    });
  });

  return [...units.entries()].map(([seriesId, series]) => {
    const points = trend.map((bucket, index) => ({
      label: bucket.label,
      value: series.values.get(index) ?? 0,
      axisLabel: getAxisLabel(bucket.label, index, trend.length),
    }));
    return {
      seriesId,
      label: series.label,
      unit: series.unit,
      total: points.reduce((sum, point) => sum + point.value, 0),
      points,
    };
  });
}
