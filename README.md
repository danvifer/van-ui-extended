# van-ui-extended

A comprehensive library of reusable graphical components built on top of [VanJS](https://vanjs.org/). This project extends the core VanJS capabilities with advanced UI components and third-party integrations.

## Key Features

- **VanJS Integration**: Built with simplicity and performance in mind using VanJS.
- **Advanced Components**: Includes complex components like data tables, wizards, and cron editors.
- **Third-party Integrations**:
  - **CodeMirror**: Full-featured code editor with JS, JSON, and Markdown support.
  - **ECharts**: Powerful charting and visualization.
  - **GridStack**: Draggable / resizable dashboard layouts (via `xDashboard`).
  - **Leaflet**: Interactive maps.
  - **Pikaday**: Lightweight date picking.
- **Own stylesheet**: stable `vx-*` classes, no CSS framework required — works with or without Tailwind.
- **TypeScript**: Fully typed for a better developer experience.

## Installation

```bash
npm install van-ui-extended
```

Everything the components import at runtime ships as a direct dependency — no peer
dependencies to install by hand.

Import the stylesheet once at your app entry:

```ts
import "van-ui-extended/style.css"
```

## Styling

The components ship their own CSS; no Tailwind or other framework is needed. Without a
bundler, link `node_modules/van-ui-extended/dist/van-ui.css` instead. Components inherit
`font-family` and `line-height` from your page.

- **Classes.** Every element carries a stable `vx-*` class
  (`vx-<block>__<element>--<modifier>`, e.g. `vx-select__option--active`). Restyle by
  overriding them in CSS loaded after the library's: `.vx-button { border-radius: 9999px; }`.
- **`*Class` props** keep their 0.1.x behaviour. Most **replace** the default class — pass
  `"vx-select__list my-extra"` to extend instead. These are **appended**: xTable's
  (`tableClass`, `tableHeaderClass`, `cardClass`, `headerClass`, `bodyClass`, `rowClass`),
  xDashboard's `className`, xButton's `iconClass` and the legacy Select's `optionsClass` /
  `optionClass`. Replacing a default class also drops the library's reset for that element,
  since the reset only targets `vx-*` classes.
- **xTable themes** are sets of `--vx-table-*` custom properties (listed at the start of the
  xTable section of `dist/van-ui.css`), selected by the `theme` prop through `data-vx-theme`
  on the table wrapper. Override them on `.vx-table` (or `.vx-table[data-vx-theme="material"]`),
  not on `:root`: the wrapper declares its own values. `--xtable-primary` still drives the
  accent and focus ring, globally or per instance through `primaryColor`. `dense` works by
  lowering `--vx-table-cell-pad` on `.vx-table--dense`: if you override that token, override
  it there as well.
- **Wizard buttons** take any CSS color through `primaryColor` / `secondaryColor`, or the
  `--vx-wizard-btn-bg` / `--vx-wizard-btn-hover-bg` custom properties.

### Class reference

These are the class names the stylesheet defines (in the repository each component's rules
live next to it, `lib/<component>.css`). `xtable` stays on xTable's wrapper as a hook, and xDashboard keeps GridStack's
own `grid-stack*` classes and `x-dashboard-item-title`.

| Component | Classes |
| --- | --- |
| xButton | `vx-button` · `__icon` |
| xLastValue | `vx-last-value` (`--clickable`, `--hover`) · `__title` · `__subtitle` · `__row` · `__preicon` · `__main` · `__value-base` · `__value` · `__posticon` · `__children` |
| xSelect | `vx-select` · `__field` · `__control` (`--readonly`) · `__toggle` · `__chevron` · `__clear` · `__clear-icon` · `__list` · `__option` (`--active`, `--enabled`, `--disabled`) · `__check-label` · `__checkbox` · `__empty` |
| xTable | `vx-table` (`--bordered`, `--dense`, `--flat`, `--square`) · `__top` · `__toolbar` · `__bottom` · `__scroll` · `__viewport` · `__table` · `__head` · `__body` · `__row` · `__cell` (`--left`, `--center`, `--right`, `--nowrap`) · `__sort` · `__icon` (`--sm`) · `__select-cell` · `__checkbox` · `__expander-cell` · `__expander` · `__expanded-row` · `__expanded-cell` · `__filter-cell` · `__filter` · `__filter-content` · `__filter-trigger` · `__popover` (`--left`, `--right`) · `__field` · `__popover-actions` · `__popover-btn` · `__empty` · `__loading` · `__spinner` · `__footer` · `__footer-label` · `__footer-nav` · `__range` · `__page-btn` · `__rpp` · `__rpp-trigger` · `__rpp-chevron` (`--open`) · `__rpp-menu` · `__rpp-option` (`--active`) · `__rpp-check` |
| WizardComponent | `vx-wizard` · `__panel` · `__header` · `__close` · `__title` · `__grid` · `__steps` · `__step` (`--active`) · `__step-num` (`--inactive`) · `__content` · `__actions` · `__btn` (`--primary`) · `__spinner` · `__spinner-track` · `__spinner-arc` |
| TextAreaComponent | `vx-textarea` |
| xDashboard | `vx-dashboard__error` |
| Select (legacy) | `vx-legacy-select` · `__wrap` · `__trigger` · `__menu` · `__scroll` · `__option` · `__img` · `__desc` · `__footer` · `__chip` · `__chip-remove` · `__chip-icon` |
| TableComponent (legacy) | `vx-legacy-table` · `__table` · `__head` · `__body` · `__row` · `__th` (`--condensed`) · `__td` · `__select-cell` · `__checkbox` · `__sort` · `__sort-icon` · `__icon` (`--sm`) · `__filter-btn` (`--active`) · `__popover` · `__popover-title` · `__popover-desc` · `__input` · `__check-row` · `__check` · `__check-label` · `__popover-btn` · `__menu-wrap` · `__menu-btn` · `__menu` · `__menu-item` · `__inline-actions` · `__action` · `__action-label` · `__empty` · `__rule` · `__pager` · `__pager-btn` · `__pager-label` · `__pager-rows` · `__pager-input` · `__pager-suffix` · `__pager-count` |

### With Tailwind

The library's rules are unlayered, so they beat Tailwind's preflight and also your
utilities. If you want utilities passed through `className` & co. to override them, import
the stylesheet into Tailwind's components layer:

```css
@import "tailwindcss";
@import "van-ui-extended/style.css" layer(components);
```

### Migrating from 0.1.x

0.2.0 removes Tailwind from the library.

1. **Import `van-ui-extended/style.css`.** Without it every component renders unstyled —
   `CronComponent` included, which used to pull in its own CSS.
2. Drop the `@source` / `content` entry for `node_modules/van-ui-extended/dist` from your
   Tailwind setup; nothing in the package needs scanning anymore.
3. Default classes are `vx-*` classes instead of Tailwind utilities. `*Class` props behave
   as before, so a full replacement you were passing still renders exactly as it did.
4. `WizardComponent`'s `primaryColor` / `secondaryColor` take CSS colors (`"#0369a1"`), not
   Tailwind tokens (`"sky-700"`); anything else logs a warning and falls back to the
   default. The default buttons now actually show their sky-700 background.
5. The `exports` map only exposes the package root and `./style.css`; deep imports into
   `dist/` no longer resolve.
6. Visual fixes: classes that never existed in the legacy `Select` / `TableComponent`
   (`border-dimmed`, `border-brand`, `text-link`) now render — dimmed borders and teal
   focus/hover accents — and the wizard's inactive step circles are dimmed as intended.

### Using it from Nuxt / Vue / SSR

VanJS builds real DOM nodes at import time and has no server renderer. Mount these
components client-side only (`<ClientOnly>`, a `.client.vue` component, or inside
`onMounted`) or the server build will fail on `document is not defined`.

## Local development

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Building the library

Clone the repository and install the dependencies:

```bash
git clone https://github.com/danvifer/van-ui-extended.git
cd van-ui-extended
npm install
```

### Development Mode

To start the project in development mode with hot-reload:

```bash
npm run dev
```

This will start a [Vite](https://vitejs.dev/) development server on `http://localhost:3030`. Demo pages live under `demo/`:

- `/` — dashboard home (`demo/main.ts`) showcasing every component inside an `xDashboard`.
- `/demo/pages/<component>/` — isolated demo per component.

### Build

To build the library for production:

```bash
npm run build
```

The output will be generated in the `dist` directory.

To generate TypeScript declarations:

```bash
npm run types
```

## Available Components

The library exports the following components:

- `TableComponent`: Advanced data table with search and pagination.
- `TextAreaComponent`: Enhanced text area.
- `Select`: Standard select component.
- `xSelect` / `xOption`: Extended select component with search and custom rendering.
- `WizardComponent`: Step-by-step wizard interface.
- `CronComponent`: Visual cron expression editor.
- `Widget`: Base widget container.
- `TimePickerComponent`: Simple time selection.
- `xButton`: Extended button component.
- `xLastValue`: Component for displaying historical data/values.
- `xCodeMirror`: Integration with CodeMirror 6.
- `xChart`: ECharts wrapper with reactive options.
- `xDashboard`: Draggable / resizable dashboard grid powered by GridStack.
- `xTable`: Feature-rich data table — sorting, a collapsible per-column filter row, pagination, row selection, expandable rows, virtual scrolling and light/dark themes.

### `xDashboard`

Wrapper around [GridStack](https://gridstackjs.com/) following the VanJS reactive prop pattern. Each item carries its own `HTMLElement` (or factory), and the grid emits layout changes via `onChange`.

`gridstack` is a **peer dependency** — install it in your app:

```bash
npm install gridstack
```

You must also import GridStack's CSS once at your app entry:

```ts
import "gridstack/dist/gridstack.min.css"
```

Minimal usage:

```ts
import van from "vanjs-core"
import { xDashboard } from "van-ui-extended"

const dashboard = xDashboard({
  column: 12,
  cellHeight: 80,
  items: [
    { id: "a", x: 0, y: 0, w: 6, h: 4, content: someChart() },
    { id: "b", x: 6, y: 0, w: 6, h: 4, content: someTable() },
  ],
  onChange: (nodes) => console.log("layout", nodes),
})

van.add(document.body, dashboard)
```

### `xTable`

Feature-rich, reactive data table. Rows are a VanJS `State<T[]>`; columns declare their key, label, alignment and per-column sort/filter. It supports:

- Client- or server-side **pagination** (a `pagination` state, or an `onRequest` hook for server mode). The pagination footer renders as a fixed bar **outside** the scroll region, so it never overlaps rows.
- A collapsible **per-column filter row** below the headers (`filterCellByKey` + `filterCellsVisible`).
- **Sorting**, **row selection**, **expandable rows** and **virtual scrolling** for large datasets.
- Custom cell rendering via slots (`headerCellByKey` / `bodyCellByKey` / `slots`) and light/dark **themes**.

The source lives under `lib/xTable/` (split into `xTable.body`, `xTable.filter`, `xTable.pagination`, `xTable.selection`, `xTable.themes`, `xTable.virtualScroll`, …); import the public component and its types from the package root.

Minimal usage:

```ts
import van from "vanjs-core"
import { xTable } from "van-ui-extended"
import type { XColumn } from "van-ui-extended"

type Row = { id: string; name: string; status: string }

const rows = van.state<Row[]>([
  { id: "1", name: "edge-01", status: "up" },
  { id: "2", name: "nas-01", status: "down" },
])

const columns: XColumn<Row>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "status", label: "Status" },
]

van.add(document.body, xTable<Row>({ rows, columns, rowKey: (r) => r.id }))
```

An optional `scrollClass` prop replaces the inner scroll region's class (default `"vx-table__scroll"`).

## Example Usage

```javascript
import van from "vanjs-core"
import { xSelect, xOption } from "van-ui-extended"

const MyComponent = () => {
  return xSelect(
    { placeholder: "Select a language" },
    xOption({ value: "js", text: "JavaScript" }),
    xOption({ value: "ts", text: "TypeScript" })
  )
}

van.add(document.body, MyComponent())
```

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](LICENSE) file for details.
