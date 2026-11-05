export const Colors = {
  light: {
    // ── 主色 Ant Design 5 Blue ──────────────────────────────────────────────
    primary: '#1677FF',
    primarySurface: '#E8F3FF',

    // ── 页面 & 卡片背景 ────────────────────────────────────────────────────
    // 灰色页面背景是中国 App 最显著的特征（钉钉/飞书/支付宝）
    background: '#F5F6F8',
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F6F8',

    // ── 文字层级 ───────────────────────────────────────────────────────────
    text: '#1A1A1A',
    textSecondary: '#666666',
    textMuted: '#999999',
    textTertiary: '#BBBBBB',

    // ── 边框 & 分隔线 ──────────────────────────────────────────────────────
    border: '#EBEBEB',
    borderLight: '#F5F5F5',
    borderRow: '#F5F5F5',

    // ── 语义色 ─────────────────────────────────────────────────────────────
    success: '#00B578',
    warning: '#FF8F1F',
    error: '#FF3141',
    info: '#1677FF',

    successLight: '#E8FFF5',
    warningLight: '#FFF5E8',
    errorLight: '#FFF2F3',
    infoLight: '#E8F3FF',

    // legacy surface aliases
    successSurface: '#E8FFF5',
    warningSurface: '#FFF5E8',
    errorSurface: '#FFF2F3',
    infoSurface: '#E8F3FF',

    // ── Tab Bar ────────────────────────────────────────────────────────────
    tabBarBg: '#FFFFFF',
    tabBarBorder: '#EBEBEB',
    tabBar: '#FFFFFF',
    tabBarActive: '#1677FF',
    tabBarInactive: '#BBBBBB',

    // ── 对比色（用于 primary/success/error 背景上的文字） ────────────────
    textOnPrimary: '#FFFFFF',

    // ── 其他 ──────────────────────────────────────────────────────────────
    scanBtn: '#1A1A1A',
    statusBar: 'dark-content' as const,
    card: '#FFFFFF',
    cardBorder: '#EBEBEB',
    shadow: 'rgba(0, 0, 0, 0.06)',
    overlay: 'rgba(0, 0, 0, 0.45)',
    skeleton: '#EBEBEB',
    skeletonHighlight: '#F5F5F5',
  },
  dark: {
    primary: '#4096FF',
    primarySurface: '#111D2C',

    // OLED 真黑 + iOS 深色层级
    background: '#0F0F0F',
    surface: '#1C1C1E',
    surfaceSecondary: '#1C1C1E',

    text: '#F5F5F5',
    textSecondary: '#ABABAB',
    textMuted: '#787878',
    textTertiary: '#555555',

    border: '#2C2C2E',
    borderLight: '#1C1C1E',
    borderRow: '#1C1C1E',

    success: '#00D68F',
    warning: '#FFAA00',
    error: '#FF4D4F',
    info: '#4096FF',

    successLight: '#0A2E21',
    warningLight: '#2E1E00',
    errorLight: '#2E0A0A',
    infoLight: '#111D2C',

    successSurface: '#0A2E21',
    warningSurface: '#2E1E00',
    errorSurface: '#2E0A0A',
    infoSurface: '#111D2C',

    tabBarBg: '#1C1C1E',
    tabBarBorder: '#2C2C2E',
    tabBar: '#1C1C1E',
    tabBarActive: '#4096FF',
    tabBarInactive: '#555555',

    textOnPrimary: '#FFFFFF',

    scanBtn: '#F5F5F5',
    statusBar: 'light-content' as const,
    card: '#1C1C1E',
    cardBorder: '#2C2C2E',
    shadow: 'rgba(0, 0, 0, 0.4)',
    overlay: 'rgba(0, 0, 0, 0.65)',
    skeleton: '#2C2C2E',
    skeletonHighlight: '#3A3A3C',
  },
} as const;

export type ColorScheme = keyof typeof Colors;

type StatusBarStyleValue = 'auto' | 'inverted' | 'light-content' | 'dark-content';

/**
 * Host apps supply their own brand palette through `SunxuProvider`, so theme
 * values widen to `string` instead of the built-in literal colors. Only
 * `statusBar` keeps a literal union because it feeds Expo's `StatusBar`.
 */
type WidenThemeColors<T> = {
  readonly [K in keyof T]: K extends 'statusBar' ? StatusBarStyleValue : string;
};

export type ThemeColors = WidenThemeColors<typeof Colors.light>;
