/**
 * 齐套门禁模式，仅下达、开工等需要齐套门禁的动作返回
 */
export declare enum MaterialReadinessGateMode {
    OFF = "off",
    WARNING = "warning",
    SUPERVISOR_OVERRIDE = "supervisor_override",
    BLOCKING = "blocking"
}
