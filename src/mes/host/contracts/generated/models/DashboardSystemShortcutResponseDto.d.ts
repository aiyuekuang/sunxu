import type { DashboardShortcutBusinessModule } from './DashboardShortcutBusinessModule.d.ts';
import type { DashboardShortcutSystemKey } from './DashboardShortcutSystemKey.d.ts';
export type DashboardSystemShortcutResponseDto = {
    businessModule: DashboardShortcutBusinessModule;
    key: DashboardShortcutSystemKey;
    sortOrder: number;
    visible: boolean;
};
