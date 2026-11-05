export type { ScanParseResponseDto as ScanParseResult } from '../generated/models/ScanParseResponseDto.d.ts';
export type { ScanEntityInfoDto as ScanEntityInfo } from '../generated/models/ScanEntityInfoDto.d.ts';
export type { ScanEntityInfoItemDto as ScanEntityInfoItem } from '../generated/models/ScanEntityInfoItemDto.d.ts';
export declare const scanService: {
    parse: (code: string) => import("../../../types/generated/index").Promise<import("./scan.service.d.ts").ScanParseResult>;
};
