# AGENTS.md — van-ui-extended

> Context for AI coding agents (Claude, Cursor, Copilot Workspace, etc.) integrating this
> library into a host application. Humans, you can read this too — it's just a quick map.

## TL;DR

`van-ui-extended` is a collection of UI components built on top of **VanJS**, distributed as
ES modules plus one stylesheet of its own. No Tailwind (or any CSS framework) is required.

```bash
yarn add van-ui-extended vanjs-core
```

```ts
import van from "vanjs-core"
import { xTable, xSelect, xOption } from "van-ui-extended"
import "van-ui-extended/style.css"

van.add(document.body, xTable({
  rows: van.state([{ id: 1, name: "Ada" }]),
  columns: [{ key: "name", label: "Name", sortable: true }],
  rowKey: "id",
}))
```

## Required runtime

| Requirement   | Why                                                                      |
| ------------- | ------------------------------------------------------------------------ |
| `vanjs-core` (≥1.5.3, peer)  | All components are VanJS factories. Caller-owned `State<T>` everywhere. |
| `van-ui-extended/style.css`  | Components emit `vx-*` classes styled by this stylesheet. Import it once; without it the UI renders unstyled. |
| Modern browser, ESM          | Bundle target is `esnext`. No SSR — some helpers touch `document` at construction (e.g. xTable's outside-click delegate). |

### Stylesheet

- Every element carries a stable `vx-*` class (BEM: `vx-<block>__<element>--<modifier>`);
  restyle by overriding those classes in CSS loaded after the library's.
- `*Class` props keep their 0.1.x semantics: most **replace** the default `vx-*` class (pass
  `"vx-select__list extra"` to extend it); xTable's, xDashboard's, xButton's `iconClass` and
  the legacy Select's `optionsClass`/`optionClass` are **appended**.
- The rules are unlayered, so they beat Tailwind's preflight and utilities. Tailwind hosts
  that want their utilities to win import the sheet into a layer:
  `@import "van-ui-extended/style.css" layer(components);`
- Components inherit `font-family` and `line-height` from the host page.
- See the README's "Styling" section for tokens (xTable themes, wizard colors) and the
  0.1.x → 0.2.0 migration notes.

## VanJS conventions used everywhere

These apply to every component in this package — internalise them once.

1. **Caller-owned state.** Anything reactive is a `van.state(...)`. Pass yours in to
   control it; omit to let the component allocate a default. Two-way binding: the
   component reads `.val` and writes back on user actions.
2. **Immutability.** VanJS only notifies subscribers on **assignment**, not on mutation.
   Do `rows.val = [...rows.val, x]`, **not** `rows.val.push(x)`.
3. **Slot conventions.** "Slots" are functions returning `ChildDom`. Two granularities:
   - `slots.<name>` — fallback for that surface (e.g. `bodyCell` for every body cell).
   - `<name>ByKey: { [columnKey]: slot }` — per-column override that wins over the fallback.
4. **Mounting.** Components return `ChildDom` — mount with `van.add(target, comp(...))`.
   Calling a component is **not** equivalent to creating a class instance; you can call
   the same factory multiple times for multiple mounts.

## Component index

| Export                  | Source                       | Doc                         | Summary                                                   |
| ----------------------- | ---------------------------- | --------------------------- | --------------------------------------------------------- |
| `xTable`                | `lib/xTable.ts`              | **[agents/xTable.md](agents/xTable.md)** | Full-featured data table — sort, paginate, filter (global + per-column popover), single/multi selection, expandable rows, virtual scroll (10k rows), server-side mode, themable (dark/material), slot system. **Documented in depth.** |
| `xSelect` / `xOption`   | `lib/xSelect.ts`             | TODO — read source           | Searchable dropdown with custom-rendered options.         |
| `xButton`               | `lib/xButton.ts`             | TODO — read source           | Themable button with icon + label.                        |
| `xChart`                | `lib/xChart.ts`              | TODO — read source           | ECharts wrapper (depends on `echarts`).                   |
| `xCodeMirror`           | `lib/xCodeMirror.ts`         | TODO — read source           | CodeMirror 6 wrapper. Languages: JS, JSON, Markdown.      |
| `xLastValue`            | `lib/xLastValue.ts`          | TODO — read source           | Displays the most recent value with history affordances.  |
| `WizardComponent`       | `lib/wizard.ts`              | TODO — read source           | Multi-step wizard with progress and step validation.      |
| `CronComponent`         | `lib/cron.ts`                | TODO — read source           | Visual cron-expression editor (depends on `cron-validator`, `cronstrue`). |
| `TimePickerComponent`   | `lib/timePicker.ts`          | TODO — read source           | Time selection control.                                   |
| `Widget`                | `lib/widget.ts`              | TODO — read source           | Generic widget container shell.                           |
| `TableComponent`        | `lib/table.ts`               | Legacy — prefer `xTable`     | Older table implementation.                               |
| `Select`                | `lib/select.ts`              | Legacy — prefer `xSelect`    | Standard select wrapper.                                  |
| `TextAreaComponent`     | `lib/textarea.ts`            | TODO — read source           | Enhanced textarea.                                        |

When a component is not yet documented under `agents/`, **read the source file directly** —
TypeScript types are the source of truth.

## Repo conventions for agents working ON this library

- TypeScript strict mode. Public APIs (exported functions, factories) must have explicit
  parameter and return types. Internal helpers can rely on inference.
- File organisation: many small files (< 400 LOC typical). xTable is split into
  `xTable.ts` + `xTable.<concern>.ts` (filter, pagination, selection, expansion,
  helpers, body, icons, virtualScroll, outsideClick, types).
- Styles: no Tailwind. Each component has a co-located stylesheet (`lib/xSelect.css`,
  `lib/xTable/xTable.css`, …) with unlayered single-class `vx-*` rules; `lib/base.css` holds
  the reset scoped to `vx-*` elements and the shared keyframes; `lib/van-ui.css` imports them
  all. Custom properties only where something varies (xTable themes, wizard colors).
  `lib/styles.test.ts` fails if a `vx-*` class is used but not defined, or if a component
  emits a class that is not `vx-*`.
- Tests live next to source (`xTable.test.ts`). Vitest + jsdom.
- Build: `yarn build` → `node build.js` bundles `lib/van-ui.css` into `dist/van-ui.css`
  (published as `van-ui-extended/style.css`), then `tsc` emits JS + `.d.ts` per module.
- Dev server: `yarn dev` → Vite on **port 3030**. Showcase pages live at:
  - `/` — main demo (entry `demo/main.ts`)
  - `/xtable.html` — xTable showcase (entry `lib/xTable/xTable-demo.ts`)
  - `/demo/pages/_parity/` — every component with default props (with the demo's Tailwind);
    `/demo/pages/_parity/bare.html` — the same without Tailwind, the visual check that the
    library needs nothing but its own stylesheet.

## Pointers

- License: Apache-2.0
- Package home: https://www.npmjs.com/package/van-ui-extended
- Repo: https://github.com/danvifer/van-ui-extended
- VanJS docs: https://vanjs.org/
