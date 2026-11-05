import type { MrpItemDto } from './MrpItemDto.d.ts';
import type { MrpSummaryDto } from './MrpSummaryDto.d.ts';
export type MrpCalculateResponseDto = {
    /**
     * 本次实际采用的BOM展开范围
     */
    bomExplosionMode: MrpCalculateResponseDto.bomExplosionMode;
    /**
     * 本次实际采用的计算口径
     */
    calculationMode: MrpCalculateResponseDto.calculationMode;
    /**
     * MRP计算明细
     */
    items: Array<MrpItemDto>;
    /**
     * MRP运行ID
     */
    runId: string;
    /**
     * MRP运行单号
     */
    runNo: string;
    /**
     * 汇总
     */
    summary: MrpSummaryDto;
};
export declare namespace MrpCalculateResponseDto {
    /**
     * 本次实际采用的BOM展开范围
     */
    enum bomExplosionMode {
        SINGLE_LEVEL = "single_level",
        MULTI_LEVEL = "multi_level"
    }
    /**
     * 本次实际采用的计算口径
     */
    enum calculationMode {
        GROSS = "gross",
        NET = "net"
    }
}
