# Component API audit verification

Date: 2026-11-24
Environment: Expo Web catalog at `http://localhost:8094`
Route: Catalog → **组件页面示例** tab
Viewports: 375×812 and 320×720 CSS px

## Results

- Browser console and page errors: none.
- Horizontal page overflow: none at either viewport (`documentElement.scrollWidth` equals the viewport width).
- `FilterBar` advanced-filter action remains fixed in the modal footer: 171.5×44 px at 375×812 and 144×44 px at 320×720.
- `PickerField` trigger: 261×44 px and 206×44 px. `TreePickerField` trigger: 293×44 px and 238×44 px.
- `SelectableChip` targets: 48×44 px. Selecting “暂停” updates `aria-checked`; the disabled “锁定” option cannot be activated.
- Tree navigation keeps the picker open when drilling into “工作区”; choosing “外观设置” then closes it. The sibling “选择” action selects the parent directly.
- `PhotoPicker` add target: 72×72 px. The catalog sample has no photos, so remove/reorder/cover controls were not rendered in this run.
- Actionable bottom-tab badge target: 44×44 px and invokes its independent callback.

## Screenshots

The filenames identify viewport and state. Each state was captured at both viewports where applicable.

- Catalog: `375x812-catalog-top.png`, `320x720-catalog-top.png`
- Fixed advanced-filter footer: `375x812-filter-modal.png`, `320x720-filter-modal.png`
- Picker sheet: `375x812-picker-modal.png`, `320x720-picker-modal.png`
- Tree picker: `375x812-tree-picker-modal.png`, `320x720-tree-picker-modal.png`
- Selected and disabled chips: `375x812-chip-select-state.png`, `320x720-chip-select-state.png`
- Photo picker: `375x812-photo-picker.png`, `320x720-photo-picker.png`
- Bottom tabs and badge action: `375x812-bottom-tab-bar.png`, `320x720-bottom-tab-bar.png`, `375x812-bottom-tab-badge-action.png`, `320x720-bottom-tab-badge-action.png`
- Exact measured rectangles and page overflow values: [`geometry.json`](./geometry.json)

## Not verified in this environment

- iOS/Android native hit targets, dynamic type, and screen-reader output.
- Native photo-library selection, camera permission, remove/reorder/cover interactions with a non-empty photo set.
- Native tree picker scanner integration.
- Host-provided upload, storage, route, and authorization behavior.

These are host or native-runtime behaviors; the Expo Web catalog does not exercise them.

## Build checks

- `npm run typecheck` — passed.
- `npx tsc --noEmit -p examples/catalog/tsconfig.json` — passed.
- `npx expo export --platform web --output-dir /tmp/sunxu-catalog-export-final` — passed.
- `git diff --check` — passed.
