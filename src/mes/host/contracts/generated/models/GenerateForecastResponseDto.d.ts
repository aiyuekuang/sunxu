export type GenerateForecastResponseDto = {
    /**
     * 生成的预测记录数
     */
    count: number;
    /**
     * 使用的预测方法
     */
    method: string;
    /**
     * 预测周期描述
     */
    period: string;
};
