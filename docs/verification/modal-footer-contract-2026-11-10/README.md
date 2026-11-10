# Modal footer contract verification

## Result

**Overall: PASS WITH UNVERIFIED.** The `FullScreenModal` fixed-footer contract passed Expo Web geometry and interaction checks at two fresh portrait viewports. The `BottomSheet` Web example did not open, so its rendered behavior and native iOS/Android footer placement remain unverified.

## Scope and component contract

- **Audience and job:** Sunxu host developers composing short edit, filter, confirm, and selection workflows in a modal. The person using the app must be able to reach submit/cancel actions while scrolling long content.
- **Owner and anatomy:** `FullScreenModal` / `BottomSheet` own the title, body viewport, fixed footer, and bottom safe-area inset. The host owns form data, validation, loading, submission, and recovery callbacks.
- **API:** `confirmText` / `onConfirm` provide the standard cancel/confirm footer. A custom or multi-action footer uses `footer: ReactNode`. TypeScript excludes configuring both modes together; `FullScreenModal` also excludes footer actions in `immersive` mode. `renderFooter` remains as a deprecated compatibility alias.
- **Content boundary:** modal `children` contains form or selection content only. Process buttons stay in the footer, outside the scroll view and title bar. In `bodyMode="fill"`, the host owns scrolling inside the fill area while the modal continues to own the footer.
- **States and recovery:** the host controls visible, disabled/loading, and validation state. The modal forwards button and close callbacks. Cancel and save both closed the demo modal. Business outcomes remain the host's responsibility.
- **Layout and accessibility:** the body shrinks and scrolls above the footer; the footer owns safe-area padding and stretches custom footer content across its available width. Equal-weight buttons use `flex: 1` to divide that width; narrow-screen arrangements may wrap or stack. Demo buttons were 44px high in Expo Web and exposed distinct accessible names. Native platform touch-target checks remain unverified.
- **Decision:** use a named fixed footer slot and the standard confirm props. Keeping flow buttons inside scrollable children was rejected because their reachability would depend on content length and scroll position.

## Route × viewport × state

| Route | Viewport | State | Result |
|---|---:|---|---|
| `/` Expo Web Catalog | 375×812 | Modal open, body at top and at scroll end | PASS |
| `/` Expo Web Catalog, fresh viewport load | 320×720 | Modal open, body at scroll end | PASS |
| `/` Expo Web Catalog | 375×812 | Cancel and save callbacks | PASS; both close the modal |
| `/` Expo Web Catalog | 375×812 | Activate `ChoiceSheet` / Gorhom BottomSheet | UNVERIFIED; no sheet title or dialog appeared after the trigger click |
| Same document resized from 375×812 to 320×720 | 320×720 | Modal open | UNVERIFIED; an empty Toast host retained a 343px-wide child and raised document `scrollWidth` to 331px. The modal body and footer remained 320px wide. A fresh 320×720 load measured no horizontal overflow. |
| Native iOS / Android | — | Modal and bottom-sheet rendering | UNVERIFIED; no iOS simulator was booted, and no native Android runtime was used. |

The browser preflight targeted the local, public Catalog at `http://localhost:8082/` (HTTP 200, no authentication required). The first navigation did not show an auth surface. Screenshots were captured only from the Catalog/modal surface.

## Rendered geometry and interaction

At 375×812, the body viewport was `(0,57)–(375,747)` and the footer shell `(0,747)–(375,812)`. The body scrolled 189px while the footer stayed at the same coordinates. At the fresh 320×720 viewport, the body was `(0,57)–(320,655)` and the footer `(0,655)–(320,720)`; the body scrolled 281px.

At 375×812, each button measured 171.5×44px; at 320×720, each measured 144×44px. They divide the footer's available width equally, retain an 8px gap, remain inside the viewport, and sit 12px above its bottom edge within the footer safe-area band. The document width matched the viewport on each fresh load. The top and bottom screenshots are unannotated.

- [375×812, body at top](./375x812-top.png)
- [375×812, body scrolled to bottom](./375x812-scrolled.png)
- [320×720, fresh load and body scrolled to bottom](./320x720-scrolled.png)
- [ChoiceSheet trigger attempt; sheet did not render](./bottom-sheet-open-attempt.png)

The JSON seam ledger is [spacing-audit.json](./spacing-audit.json). It includes the viewport/footer boundary, measured rectangles, expected spacing source, screenshot hashes, and executed browser commands. The surface-frame gate is explicitly `NOT APPLICABLE`: this is one viewport-filling modal surface, not an inset panel on a distinct workspace background.

Validator command:

```bash
python3 "/Users/suconnect/.codex/skills/ui-ux-pro-max/scripts/validate_spacing_audit.py" "/Users/suconnect/Desktop/code/sunxu/docs/verification/modal-footer-contract-2026-11-10/spacing-audit.json"
```

Validator result: **PASS** (exit 0, 6 measured seams). This covers the FullScreenModal rows only; it does not upgrade the BottomSheet/native rows above from `UNVERIFIED`.

## Source and checks

- `FullScreenModal` renders the fixed footer after the scroll/fill body and applies bottom inset padding: [FullScreenModal.tsx](/Users/suconnect/Desktop/code/sunxu/src/core/components/FullScreenModal.tsx:221).
- `BottomSheet` renders its footer after `BottomSheetScrollView`: [BottomSheet.tsx](/Users/suconnect/Desktop/code/sunxu/src/core/components/BottomSheet.tsx:337).
- Catalog custom-footer example and long scroll body: [App.tsx](/Users/suconnect/Desktop/code/sunxu/examples/catalog/App.tsx:731).

- `npm run typecheck`: **PASS**.
- `git diff --check`: **PASS**.
- BottomSheet source/type and Catalog example were inspected, but its Web portal did not appear during the interaction check. Its rendered row is **UNVERIFIED**, not a visual pass.
