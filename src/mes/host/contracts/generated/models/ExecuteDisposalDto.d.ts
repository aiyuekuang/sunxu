export type ExecuteDisposalDto = {
    /**
     * 实际处置业务日期；不传时后端按当天处理，不允许未来日期
     */
    businessDate?: string;
    id: string;
    remarks?: string;
    /**
     * 实际已贴码单件的原产品序列号；全量处置自动沿用来源已登记原码，分批处置填写本批实际带码件，未登记原码的数量无需填写
     */
    serialNumbers?: Array<string>;
};
