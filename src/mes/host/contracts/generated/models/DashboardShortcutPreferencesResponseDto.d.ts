import type { DashboardCustomShortcutResponseDto } from './DashboardCustomShortcutResponseDto.d.ts';
import type { DashboardSystemShortcutResponseDto } from './DashboardSystemShortcutResponseDto.d.ts';
export type DashboardShortcutPreferencesResponseDto = {
    customItems: Array<DashboardCustomShortcutResponseDto>;
    systemItems: Array<DashboardSystemShortcutResponseDto>;
};
