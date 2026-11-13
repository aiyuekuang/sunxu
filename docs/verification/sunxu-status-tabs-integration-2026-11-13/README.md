# Sunxu StatusTabs and CountBadge visual verification

Date: 2026-11-13

## Rendered page

- Surface: Sunxu Catalog, `组件示例` page (Expo Web / React Native Web).
- Regression section: `StatusTabs · 日/周/月/年`, using the same default rounded variant, compact density, and four short labels as the MES report quick-range bar.
- Shared component section: `Sunxu · 通用操作与摘要`, showing `CountBadge` values `12` and `99+`.

## Viewports and geometry

| Viewport | Section width | Track width × height | Each tab width × height | X overflow |
|---|---:|---:|---:|---|
| 375 × 812 CSS px | 319 px | 303 × 36 px | 72 × 32 px | none in section, track, or document |
| 320 × 720 CSS px | 264 px | 248 × 36 px | 58 × 32 px | none in section, track, or document |

The four visible tab labels were `日`, `周`, `月`, and `年`; the first tab exposed `aria-selected="true"` and the others were false. CountBadge labels `12` and `99+` were present in the rendered component section.

## Screenshots

- [StatusTabs at 375 × 812](./status-tabs-375x812.png)
- [StatusTabs at 320 × 720](./status-tabs-320x720.png)
- [CountBadge at 375 × 812](./count-badges-375x812.png)

## MES App route

The host App's `ReportsScreen` native rendering is `UNVERIFIED`. The booted iPhone simulator's development client required a signed update manifest; the checked-in configuration provides the public certificate but no local signing key, and the local Expo server rejected the manifest without `--private-key-path`. No production signing key was used.

The App TypeScript check matched the clean-tree baseline (23 pre-existing report DTO diagnostics, no migration diagnostics). The iOS bundle exported successfully with `npx expo export --platform ios` to `/tmp/mes-app-export-sunxu-20261113-final`; bundle export confirms Metro resolution but does not replace a rendered host-route check.
