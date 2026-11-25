# App component integration verification

Date: 2026-11-24

## Scope

Rendered the Sunxu component catalog route `组件` in the runnable Expo web catalog at `http://localhost:8081`. This verifies the shared component examples and their compact layouts. It does not verify authenticated MES App business routes.

## Viewports and layout evidence

| Viewport | Document width | Dense action section | Button rows |
| --- | ---: | --- | --- |
| 320 × 720 | 320 px | x=28, y=271.5, w=264, h=173 | 3 + 2 buttons; each 72 × 36 px; row y=308.5 and 356.5 |
| 375 × 812 | 375 px | x=28, y=326.5, w=319, h=155 | 3 + 2 buttons; each 88.5 × 36 px; row y=363.5 and 411.5 |

The longest action label measured 55 px wide and its text scroll width was also 55 px at both viewports. The document width matched each viewport; no horizontal overflow was observed. The wrapped rows use 12 px gaps so the compact Android hit slop does not overlap neighboring actions.

## Interaction and appearance

- Filter action toggled from “启用记住筛选” to “关闭记住筛选”; no count badge was rendered for count zero.
- In dark mode, the scan tab emphasis surface measured `rgb(245, 245, 245)` at both viewports, with the dark glyph remaining visible.
- Light mode tab rendering was also captured at 320 × 720.
- No JavaScript errors were observed during the catalog interaction.

## Evidence files

- `dense-actions-320x720.png`
- `dense-actions-375x812.png`
- `tabs-dark-320x720.png`
- `tabs-dark-375x812.png`
- `filter-active-320x720.png`
- `tabs-light-320x720.png`

## Limits

This is component-catalog evidence only. Authenticated App routes, API-backed states, and native iOS/Android rendering were not available in this run and remain `UNVERIFIED`.
