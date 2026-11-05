import type { GenerateForecastResponseDto } from '../generated/models/GenerateForecastResponseDto.d.ts';
export type { GenerateForecastResponseDto } from '../generated/models/GenerateForecastResponseDto.d.ts';
export interface ForecastResult {
    id: string;
    materialCode: string;
    materialName: string;
    period: string;
    forecastQty: number;
    method: string;
    confidence?: number;
    createdAt: string;
}
export interface ForecastGenerateParams {
    materialId: string;
    months: number;
    algorithm: string;
}
export interface ForecastListParams {
    materialCode?: string;
    page?: number;
    pageSize?: number;
}
export interface ForecastListResult {
    list: ForecastResult[];
    total: number;
}
export declare const forecastService: {
    generate(params: ForecastGenerateParams): Promise<GenerateForecastResponseDto>;
    list(params?: ForecastListParams): Promise<ForecastListResult>;
};
