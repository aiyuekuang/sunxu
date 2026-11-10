# CenteredModal verification

## Result

**Overall: PASS WITH UNVERIFIED.** The local Expo Web Catalog rendered the centered update dialog at 320×720. The cancel button, backdrop, and confirm button all closed the dialog in the browser interaction run. The run ended at its final text assertion because the same feedback text appeared in both the shared action feedback and the page feedback, so the DOM rectangle values were not saved. Screenshot-derived bounds are recorded separately and remain `UNVERIFIED`; the 375×812 capture was taken during the fade animation and is excluded.

Native iOS and Android rendering, native touch targets, and actual App update/download flow remain `UNVERIFIED`.

## Contract

- **Audience and job:** Sunxu host apps need a reusable centered surface for short notices and lightweight confirmations. The host keeps update policy, download/install work, loading state, and recovery callbacks.
- **Component boundary:** `CenteredModal` owns the themed overlay/card, `ModalHeader`, scroll viewport, fixed footer, safe-area spacing, backdrop and system-close behavior. The host owns content, business actions, visibility, and force-update rules.
- **Decision:** use the native React Native `Modal` with a centered bounded card for the update prompt. Keep `BottomSheet` for the separate release-notes view and use `FullScreenModal` for full forms.

## Route × viewport × state

| Route | Viewport | State | Result |
|---|---:|---|---|
| `/` Expo Web Catalog | 320×720 | Centered update dialog open | Screenshot captured; pixel frame inspected; DOM geometry not preserved (`UNVERIFIED`) |
| `/` Expo Web Catalog | 320×720 | Later, backdrop, and confirm actions | All three closed the dialog; final duplicate-text assertion stopped result serialization |
| `/` Expo Web Catalog | 375×812 | Dialog open | Captured before fade settled; excluded |
| Tel App native runtime | — | Update prompt open | `UNVERIFIED`; no iOS/Android device render was available |

The local Catalog route was public and required no authentication. The browser made one navigation to `http://localhost:8087/`.

## Evidence

- [320×720 unannotated screenshot](./320x720.png)
- [Spacing audit ledger](./spacing-audit.json)

The screenshot shows the dialog centered at about 288×230px with a 16px horizontal frame. Those are screenshot pixel bounds, not DOM measurements. The validator therefore reports `PASS WITH UNVERIFIED` and must not be treated as a visual acceptance pass.

Validator command:

```bash
python3 "/Users/suconnect/.codex/skills/ui-ux-pro-max/scripts/validate_spacing_audit.py" "/Users/suconnect/Desktop/code/sunxu/docs/verification/centered-modal-2026-11-10/spacing-audit.json"
```

## Code and checks

- `CenteredModal` is exported from `sunxu/core`; it uses the shared `ModalHeader`, holds footer actions outside its scroll view, responds to system back, and supports backdrop-close and `closeDisabled` states.
- Tel App now uses `CenteredModal` only for the pre-update prompt. Update notes remain in `BottomSheet`.
- Sunxu `yarn typecheck`: **PASS**.
- Tel App `yarn tsc --noEmit`: **PASS**.
- `git diff --check`: **PASS**.
