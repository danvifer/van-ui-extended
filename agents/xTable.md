# xTable — agent reference

> Companion to **[../AGENTS.md](../AGENTS.md)**. Read that first for runtime requirements
> and VanJS conventions shared by every component in this package.

A Quasar-QTable-inspired VanJS data table. Caller-owned state, slot-based rendering, two
built-in themes, server-side mode, virtual scrolling.

## Import

```ts
import { xTable } from "van-ui-extended"
import type {
  XColumn, XTableProps, XTableSlots, PaginationState, RequestProps,
  RowKey, RowKeyAccessor, SelectionMode, SortDir, ColumnAlign,
  ColumnFilterKind, FilterMethod, ThemeName, ByKey,
  TableScope, TopScope, HeaderScope, BodyScope, BottomScope,
  HeaderCellScope, BodyCellScope, ExpandedRowScope, PaginationSlotScope,
} from "van-ui-extended"
```

## Mental model

- Factory: `xTable<T>(props): ChildDom`. Mount with `van.add(target, xTable({...}))`.
- **Caller owns every `State<T>` prop** (`rows`, `pagination`, `selected`, `filter`,
  `loading`, `sortBy`, `descending`, `expanded`). If omitted, xTable allocates a default
  `van.state(...)` internally. Two-way binding: the table reads `.val` and writes back on
  user actions.
- One reactive render path: `filter → sort → paginate` runs inside a single `van.derive`
  (`visibleRows`). Defining `onRequest` OR `pagination.rowsNumber` switches to
  **server-side mode**, which **bypasses** the internal pipeline — `rows.val` is treated
  as the pre-shaped current page.
- `rows.val` is never mutated. `columns` is read once at construction and never mutated
  (frozen columns work fine).

## XTableProps&lt;T&gt;

```ts
interface XTableProps<T> {
  // Core
  rows: State<T[]>                 // required
  columns: readonly XColumn<T>[]   // required
  rowKey?: RowKeyAccessor<T>       // default: "id" (cast). MUST yield string|number; uniqueness is the caller's responsibility
  dense?: boolean                  // default false  → cell padding p-2 vs p-4
  flat?: boolean                   // default false  → drop the wrapper shadow
  bordered?: boolean               // default false  → adds the bordered class
  square?: boolean                 // default false  → drops rounded-md
  separator?: Separator            // accepted but cosmetic; layout never branches on it
  wrapCells?: boolean              // default false  → toggles whitespace-nowrap on body cells
  tableClass?: string              // appended to <table>
  tableHeaderClass?: string        // appended to <thead>
  cardClass?: string               // appended to outer wrapper

  // Sort
  sortBy?: State<string | null>
  descending?: State<boolean>
  binaryStateSort?: boolean        // default false → asc → desc → none cycle; true → asc ↔ desc

  // Pagination
  pagination?: State<PaginationState>     // default: { page: 1, rowsPerPage: 10 }
  rowsPerPageOptions?: readonly number[]  // default [5, 10, 20, 50, 0]. 0 means "All"
  hidePagination?: boolean                // hides the footer entirely (also forced when virtualScroll is on)

  // Server-side
  onRequest?: (props: RequestProps<T>) => void | Promise<void>
                          // fires on pagination/filter changes (skips the initial run)

  // Selection
  selection?: SelectionMode          // "none" (default) | "single" | "multiple"
  selected?: State<T[]>
  selectedRowsLabel?: (n: number) => string  // default: n => `${n} selected`

  // Filter
  filter?: State<string>             // global substring filter
  filterMethod?: FilterMethod<T>     // bypasses the default substring matcher

  // Loading / empty
  loading?: State<boolean>
  noDataLabel?: string               // default "No data available"
  noResultsLabel?: string            // (declared, not currently used in render)
  loadingLabel?: string              // default "Loading..."

  // Slots
  slots?: XTableSlots<T>
  headerCellByKey?: ByKey<HeaderCellScope<T>>
  bodyCellByKey?: ByKey<BodyCellScope<T>>

  // Expansion (the expander column appears only when slots.expandedRow is set)
  expanded?: State<RowKey[]>

  // Virtual scroll (forces hidePagination)
  virtualScroll?: boolean
  virtualScrollSliceSize?: number    // default 30 (DOM holds up to 2 × this + 2 spacer trs)
  virtualScrollItemSize?: number     // default 32 (px height per row, MUST match real row height)
  virtualScrollStickySizeStart?: number // default 0
  virtualScrollStickySizeEnd?: number   // default 0

  // Theming
  theme?: ThemeName                  // "dark" (default) | "material"
  primaryColor?: string              // sets --xtable-primary on this instance's wrapper
}
```

### XColumn&lt;T&gt;

```ts
interface XColumn<T> {
  key: Extract<keyof T, string> | (string & {})  // free-form keys allowed when synthesised via `value`
  label: string | State<string> | ChildDom
  value?: (row: T) => unknown          // derive cell value; defaults to row[key]
  format?: (value: unknown, row: T) => string  // format for display
  sortable?: boolean                   // header becomes clickable
  sort?: (a, b, rowA, rowB) => number  // custom comparator; values are AFTER `value` derivation
  align?: "left" | "center" | "right"  // default "left"
  headerClass?: string                 // extra Tailwind on <th>
  bodyClass?: string                   // extra Tailwind on <td>
  columnFilter?: "basic" | "select"    // opt-in per-column popover
}
```

### PaginationState

```ts
interface PaginationState {
  page: number              // 1-based
  rowsPerPage: number       // 0 means "show all"
  sortBy?: string | null    // mirrored from sortBy State (xTable writes this for you)
  descending?: boolean      // mirrored from descending State
  rowsNumber?: number       // server-side total. Setting this switches to server-side mode
}
```

### RequestProps&lt;T&gt;

```ts
interface RequestProps<T> {
  pagination: State<PaginationState>
  filter: State<string>
  getCellValue: (col: XColumn<T>, row: T) => unknown
}
```

### Slots (`XTableSlots<T>`)

All slots accept a scope and return `ChildDom`.

- `top(scope)` / `topLeft(scope)` / `topRight(scope)` — toolbar above the table
- `header(scope)` — replaces the entire header (rare)
- `headerCell(scope: HeaderCellScope)` — fallback per-cell header renderer
- `body(scope)` — replaces tbody (rare)
- `bodyCell(scope: BodyCellScope)` — fallback per-cell body renderer
- `noData(scope: { filterActive })` — empty state
- `loading(scope: { label })` — loading placeholder (default is spinner SVG + label)
- `pagination(scope: PaginationSlotScope)` — replaces the entire footer
- `bottom(scope)` / `bottomRow(scope)` — content below the table
- `expandedRow(scope: ExpandedRowScope)` — **setting this enables the expander column**

Per-column overrides (more specific, win over the fallback):

- `headerCellByKey: { [columnKey]: (scope: HeaderCellScope) => ChildDom }`
- `bodyCellByKey:   { [columnKey]: (scope: BodyCellScope)   => ChildDom }`

| Scope             | Shape                                                         |
| ----------------- | ------------------------------------------------------------- |
| `HeaderCellScope` | `{ col, sort, sortDir }` — calling `sort()` toggles the column. |
| `BodyCellScope`   | `{ col, row, rowKey, value }` — `value` is post-`value` accessor, pre-`format`. |
| `ExpandedRowScope`| `{ row, rowKey, cols, expand: State<boolean>, toggle: () => void }` |
| `TableScope` (top/bottom/header/body) | `{ rows, selected, pagination, filter, visibleRows: () => readonly T[] }` |

## Theming

Two built-in themes: `"dark"` (default) and `"material"`. Selection accent and focus rings
bind to `var(--xtable-primary, #1976d2)`. Two ways to override:

```ts
// 1) Per instance
xTable({ rows, columns, theme: "material", primaryColor: "#7c3aed" })

// 2) Globally via CSS
// :root { --xtable-primary: #7c3aed; }
```

## Confirmed behavior (visually verified)

| Feature             | Behavior                                                                |
| ------------------- | ----------------------------------------------------------------------- |
| Sort                | Click a sortable header → toggles asc → desc → none. `binaryStateSort:true` skips none. |
| Pagination          | Footer shows `<start>–<end> of <total>`; next/prev/first/last buttons + custom rows-per-page dropdown. |
| Per-col filter `select` | Distinct values from `rows.val` (`Set` + `.sort()`), prefixed with `""` rendered as "(All)". **Exact** match on Apply. |
| Per-col filter `basic`  | Substring match (case-insensitive). Apply commits draft → applied. |
| Multi selection     | Indeterminate header checkbox while partially selected; toggling header selects/clears **all visible** rows (not the entire dataset). |
| Virtual scroll      | 10k rows → ≤ `2 × sliceSize + 2` trs in DOM. Scroll updates slice based on `scrollTop / itemSize`. |
| Server-side         | `onRequest` fires on pagination/filter changes AFTER the initial run; receives `{ pagination, filter, getCellValue }`. Internal sort/filter/paginate bypassed. |
| Expansion           | Setting `slots.expandedRow` adds a leftmost chevron column; chevron click toggles `rowKey` in `expanded.val`. Expanded row spans every visible column. |
| Primary color       | `primaryColor` writes inline `style="--xtable-primary: <color>"` on the `.xtable` wrapper. |
| Loading             | Swaps tbody to a single full-width row. Default is `animate-spin` SVG; `slots.loading` overrides. |
| Outside click       | A single document-level click delegate closes any open popovers (column filter + rows-per-page). |

## Cookbook

### Minimal client-side table

```ts
import van from "vanjs-core"
import { xTable, type XColumn } from "van-ui-extended"

interface User { id: number; name: string; age: number }
const rows = van.state<User[]>([{ id: 1, name: "Ada", age: 30 }])
const columns: XColumn<User>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "age",  label: "Age",  sortable: true, align: "right" },
]
van.add(document.body, xTable({ rows, columns, rowKey: "id" }))
```

### Global filter + pagination

```ts
const filter = van.state("")
const pagination = van.state({ page: 1, rowsPerPage: 10 })
xTable({ rows, columns, rowKey: "id", filter, pagination })
// You render the <input> bound to filter.val yourself, or use slots.topRight.
```

### Per-column popover filters

```ts
const cols: XColumn<User>[] = [
  { key: "name",   label: "Name",   columnFilter: "basic"  },  // text input, substring
  { key: "city",   label: "City",   columnFilter: "select" },  // dropdown, exact match
  { key: "status", label: "Status", columnFilter: "select" },
]
// Popover state is owned internally — your column objects are never mutated.
// Distinct values for "select" are snapshotted each time the popover opens.
```

### Multi-selection

```ts
const selected = van.state<User[]>([])
xTable({
  rows, columns, rowKey: "id",
  selection: "multiple",
  selected,
  selectedRowsLabel: (n) => `${n} of ${rows.val.length} selected`,
})
```

### Server-side

```ts
const rows = van.state<User[]>([])
const pagination = van.state({
  page: 1, rowsPerPage: 25, rowsNumber: 0,
  sortBy: null as string | null, descending: false,
})
const filter = van.state("")
const loading = van.state(false)

const onRequest = async () => {
  loading.val = true
  try {
    const { page, rowsPerPage, sortBy, descending } = pagination.val
    const r = await api.fetch({
      page, pageSize: rowsPerPage, sortBy, descending, search: filter.val,
    })
    rows.val = r.items
    pagination.val = { ...pagination.val, rowsNumber: r.total }
  } finally {
    loading.val = false
  }
}
xTable({ rows, columns, rowKey: "id", pagination, filter, loading, onRequest })
// Trigger the first fetch yourself — xTable skips the initial run.
```

### Expandable rows

```ts
xTable({
  rows, columns, rowKey: "id",
  slots: {
    expandedRow: ({ row }) =>
      div({ class: "grid grid-cols-2 gap-4" },
        div(strong("Started: "), row.startDate),
        div(strong("Salary: "),  `€${row.salary.toLocaleString()}`)),
  },
})
```

### Virtual scroll

```ts
xTable({
  rows, columns, rowKey: "id",
  virtualScroll: true,
  virtualScrollItemSize: 40,  // MUST match the real row height
  virtualScrollSliceSize: 20, // DOM holds up to 2 × this
})
// Pagination is auto-hidden when virtualScroll is true.
```

### Custom body cell (status pill) + custom comparator

```ts
xTable({
  rows, columns, rowKey: "id",
  bodyCellByKey: {
    status: ({ value }) =>
      span({
        class: value === "active"
          ? "px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs"
          : "px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs",
      }, String(value)),
  },
})
```

### Material theme + brand color

```ts
xTable({ rows, columns, theme: "material", primaryColor: "#7c3aed" })
```

### Top toolbar with search + action

```ts
const filter = van.state(""), selected = van.state<User[]>([])
xTable({
  rows, columns, rowKey: "id",
  selection: "multiple", selected, filter,
  slots: {
    topLeft: () => h2({ class: "font-semibold" }, "Employees"),
    topRight: () => div({ class: "flex gap-2" },
      input({
        type: "text",
        value: () => filter.val,
        oninput: (e) => { filter.val = (e.target as HTMLInputElement).value },
      }),
      button({ onclick: () => doStuff(selected.val) }, "Action"),
    ),
    bottom: ({ visibleRows }) =>
      span(() => `${visibleRows().length} visible · ${selected.val.length} selected`),
  },
})
```

## Gotchas

- **VanJS, not React.** Child callbacks (`() => ChildDom`) re-execute when any state read
  inside them changes. Keep slot closures small to avoid over-rendering.
- **`rowKey` defaults to `"id"`** — silently. If your rows have no `id`, pass an explicit
  accessor (string or `(row) => RowKey`) or selection and expansion will misbehave.
- **`rowsPerPage: 0` means "show all"**, not "show zero".
- **Server-side mode is triggered by EITHER** `onRequest` defined OR
  `pagination.rowsNumber != null`. Both bypass the internal pipeline; `rows.val` is
  treated as the current page (pre-shaped).
- **`onRequest` skips its first run.** Fire the initial fetch yourself.
- **Virtual scroll forces `hidePagination`.** You can't combine paginated UI with virtual
  scroll.
- **`virtualScrollItemSize` MUST match the real row height** or the scrollbar geometry
  drifts. Use `dense: true` if your rows are smaller than 32 px.
- **`columnFilter: "select"` snapshots distinct values when the popover opens.** Reactive
  option lists are not supported (browsers strip reactive `<option>` wrappers).
- **Per-column popover state lives in the component closure** — three separate States per
  column (`open`/`draftValue`/`appliedValue`) so the input doesn't lose focus on
  keystrokes. Do not try to expose or share them.
- **Outside-click delegate is global.** Mount/unmount cleanup is best-effort via
  `MutationObserver`; in environments without it, callbacks accumulate (bounded leak — by
  design).
- **Tailwind v4 is required.** Without it, the table renders unstyled. See
  [../AGENTS.md](../AGENTS.md) for the content-glob snippet.
- **`columns` is read once at construction.** Adding or removing columns at runtime
  requires re-creating the table (re-call `xTable(...)`).
- **`expanded` / `selected` arrays grow with use.** They are caller-owned; if you persist
  across navigations, reset them yourself.
- **`headerCellByKey[col.key]` wins over `slots.headerCell`** (same for `bodyCellByKey`
  vs `slots.bodyCell`).
