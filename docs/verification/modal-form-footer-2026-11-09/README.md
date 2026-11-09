# Modal form footer verification

## Result

- Source contract: implemented. `FullScreenModal` and `BottomSheet` place their footer outside the body scroll view; `EntityPickerModal` already pins its multi-select confirmation bar below the result list.
- Type check: `npm run typecheck` passed.
- Rendered geometry and interaction: **UNVERIFIED**.

## Scope

- Catalog route: Expo Web `/`, viewport 375×812 CSS px.
- Updated surfaces: `FilterBar` advanced filter sheet, `FullScreenModal`, and the iOS `DatePickerField` modal.

## Runtime attempt

The Expo Web Catalog loaded from the locally started project server. One browser navigation was made. The script selected the Components example, opened the advanced filter control, then timed out waiting for the accessible `应用高级筛选` button. No screenshot or DOM geometry was collected. A separate pre-existing Chrome preview showed `Disconnected from Metro` and was treated as stale; it did not provide current-source evidence. The browser check was stopped without another navigation, so this is not a visual pass. The iOS-native date picker was not rendered in this run.

## Source evidence

- `src/core/components/BottomSheet.tsx`: regular mode renders `BottomSheetScrollView` followed by `footerEl` as siblings.
- `src/core/components/FullScreenModal.tsx`: renders the body before the confirm/custom footer.
- `src/core/components/FilterBar.tsx`: advanced filter actions use `BottomSheet.renderFooter`; the filter content remains in its scrollable children.
- `src/core/components/DatePickerField.tsx`: iOS cancel/confirm buttons render after the picker in the modal footer.

A spacing audit ledger and screenshots are absent because the rendered controls and geometry were not captured. Overall UI status remains **UNVERIFIED** until the Catalog route is inspected successfully at the declared viewport and the iOS date picker is checked in a native runtime.
