import type { ControlChartPointDto } from './ControlChartPointDto.d.ts';
export type ControlChartResponseDto = {
    chartType: ControlChartResponseDto.chartType;
    points: Array<ControlChartPointDto>;
    rCl: number;
    rLcl: number;
    rUcl: number;
    xBarCl: number;
    xBarLcl: number;
    xBarUcl: number;
};
export declare namespace ControlChartResponseDto {
    enum chartType {
        XBAR_R = "xbar_r",
        I_MR = "i_mr"
    }
}
