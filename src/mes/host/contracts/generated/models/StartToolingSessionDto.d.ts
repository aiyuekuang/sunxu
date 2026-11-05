export type StartToolingSessionDto = {
    equipmentId?: string;
    toolingId: string;
    /**
     * 实际使用位置；未绑定设备时必填，例如：装配一线 3 号工位、检具台 A
     */
    usageLocation?: string;
    workOrderOpId?: string;
};
