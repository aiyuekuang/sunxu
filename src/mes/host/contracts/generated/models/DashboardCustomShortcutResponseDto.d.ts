import type { DashboardShortcutBusinessModule } from './DashboardShortcutBusinessModule.d.ts';
import type { DashboardShortcutSupportedPlatform } from './DashboardShortcutSupportedPlatform.d.ts';
export type DashboardCustomShortcutResponseDto = {
    businessModule: DashboardShortcutBusinessModule;
    id: string;
    name: string;
    sortOrder: number;
    supportedPlatforms: DashboardShortcutSupportedPlatform;
    url: string;
    visible: boolean;
};
