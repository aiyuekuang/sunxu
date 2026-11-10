# eslint-plugin-sunxu

ESLint rules for enforcing Sunxu component usage and marking host-owned business components. This is a separate development-tool package; it does not enter the `sunxu` runtime package.

## Rules

- `sunxu/component-classification`: exported React components in the configured component paths must declare `@sunxu-component shared` or `@sunxu-component business-specific`. Business-specific components also need `@sunxu-domain` and `@sunxu-reason`.
- `sunxu/page-container`: exported screen components in configured screen paths must declare `@sunxu-page` and return the matching Sunxu page container as an outer root.
- `sunxu/required-components`: each declared `@sunxu-use` feature must be backed by the matching Sunxu component in that component's JSX.
- `sunxu/no-native-text`: screens must use Sunxu `AppText` instead of rendering React Native's `Text` directly, preserving shared dynamic font scaling.

Supported `@sunxu-use` features:

| Tag | Required component |
|---|---|
| `search` | `SearchBar` |
| `filters` | `FilterBar` |
| `status-tabs` | `StatusTabs` |
| `list-card` | `ListCard` |
| `form-field` | `FormField`, `DatePickerField`, `PickerField`, `EntityPickerField`, `MultiEntityPickerField`, `TreePickerField`, `ChipSelectField`, `CheckboxField`, `QuickNumInput`, or `ScanInput` |
| `text-action` | `ActionButton` |
| `icon-action` | `IconActionButton` |

Supported page contracts:

| Tag | Required root |
|---|---|
| `list` | `ListScreenContainer` |
| `form` | `FormScreenContainer` or `FormPage` |
| `detail` | `DetailScreenContainer` |
| `map` | `MapScreenContainer` |
| `custom` | `ScreenContainer`, plus `@sunxu-reason` |

The container must be imported from `sunxu` or `sunxu/core`. Aliased named imports are supported.

## Flat config

The config fragments below intentionally leave file globs to the consuming app:

```js
import sunxu from 'eslint-plugin-sunxu';

export default [
  {
    ...sunxu.configs['components/recommended'],
    files: ['src/components/**/*.{ts,tsx}'],
  },
  {
    ...sunxu.configs['screens/recommended'],
    files: ['src/screens/**/*.{ts,tsx}'],
  },
];
```

Use the app's actual component and route directories. If an exported screen lives in a feature directory, include that path in the `screens/recommended` override. Enable these rules as errors in local lint and CI; the plugin cannot enforce rules in a consuming app unless that app loads it.

## Component annotations

```tsx
/**
 * @sunxu-component business-specific
 * @sunxu-domain crm
 * @sunxu-reason Uses CRM visit-plan states and actions that have no cross-business contract.
 */
export function VisitPlanCard() {
  return <View />;
}

/**
 * @sunxu-page form
 * @sunxu-component business-specific
 * @sunxu-domain crm
 * @sunxu-reason Contains CRM customer fields and save behavior; the page frame remains shared.
 */
export function ContactEditScreen() {
  return <FormScreenContainer title="Edit contact">...</FormScreenContainer>;
}
```

The `page-container` rule checks direct JSX roots returned by the exported component. `required-components` inspects the exported component's own JSX subtree; annotate the component that owns a feature when its control is composed outside the screen file. `no-native-text` recognizes direct named imports and namespace imports from `react-native`, including aliases. The rules do not infer business meaning from filenames or English/Chinese component names; host directory globs and `@sunxu-use` tags make that contract explicit.
