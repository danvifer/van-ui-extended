import type { State, ChildDom } from "vanjs-core";

/**
 * Built-in visual themes. The name lands on the wrapper as `data-vx-theme`; the colors
 * come from the `--vx-table-*` tokens in `xTable.css`.
 */
export type ThemeName = "dark" | "material";

/**
 * Stable identity used by xTable for selection and expansion bookkeeping.
 */
export type RowKey = string | number;

/**
 * Accessor that resolves a row to its stable identity. Provided by the caller
 * as either a property name on the row, or a function that derives one.
 */
export type RowKeyAccessor<T> =
  | Extract<keyof T, string | number>
  | ((row: T) => RowKey);

/** Text alignment for a column's header and body cells. */
export type ColumnAlign = "left" | "center" | "right";

/** Visual separator style between cells. */
export type Separator = "horizontal" | "vertical" | "cell" | "none";

/** Row-selection mode. */
export type SelectionMode = "none" | "single" | "multiple";

/** Comparator returned/expected by `Array.prototype.sort`. */
export type SortDir = "asc" | "desc" | null;

/**
 * Opt-in per-column popover filter kind.
 *
 * - `"basic"` — single free-text input
 * - `"select"` — dropdown of distinct values found in the rendered column
 */
export type ColumnFilterKind = "basic" | "select";

/**
 * Public shape of a column definition.
 *
 * `key` can be any `T` field name or a free-form string (when the column is
 * synthesised from multiple fields via `value`). Free-form keys are widened
 * with `(string & {})` to preserve autocompletion for real keys while still
 * accepting custom ones — without falling back to `any`.
 *
 * @example
 *   const cols: XColumn<User>[] = [
 *     { key: "name", label: "Name", sortable: true },
 *     { key: "age",  label: "Age",  align: "right", sortable: true },
 *   ]
 */
export interface XColumn<T> {
  /** Stable identity used for slot lookup and as the React-key-equivalent. */
  readonly key: Extract<keyof T, string> | (string & {});
  /** Header label — string, reactive state, or arbitrary ChildDom. */
  readonly label: string | State<string> | ChildDom;
  /** Derive the cell value. Defaults to `row[key]` when omitted. */
  readonly value?: (row: T) => unknown;
  /** Format the resolved value for display. Defaults to `String(value)`. */
  readonly format?: (value: unknown, row: T) => string;
  /** Allow the user to click the header to sort by this column. */
  readonly sortable?: boolean;
  /**
   * Custom comparator. Receives the resolved cell values (via `value`) AND
   * the source rows for callers needing whole-row context.
   *
   * @example
   *   sort: (a, b) => Number(a) - Number(b)
   */
  readonly sort?: (a: unknown, b: unknown, rowA: T, rowB: T) => number;
  /** Cell text alignment. Default `"left"`. */
  readonly align?: ColumnAlign;
  /** Extra classes appended to the header cell `<th>`. */
  readonly headerClass?: string;
  /** Extra classes appended to body cells `<td>`. */
  readonly bodyClass?: string;
  /** Opt-in per-column popover filter. */
  readonly columnFilter?: ColumnFilterKind;
}

/**
 * Caller-owned pagination state. Two-way bound — xTable reads `.val` and
 * writes back on user interactions (page change, rowsPerPage select).
 */
export interface PaginationState {
  /** Active sort column (mirrored to `sortBy` State for convenience). */
  sortBy?: string | null;
  /** Active sort direction. */
  descending?: boolean;
  /** 1-based current page. */
  page: number;
  /** Page size. `0` means "show all rows" (no slicing). */
  rowsPerPage: number;
  /**
   * Server-side total. When defined, xTable disables internal sort/filter/
   * paginate and treats `rows.val` as the pre-shaped current page.
   */
  rowsNumber?: number;
}

/**
 * Argument passed to `onRequest` when xTable is in server-side mode.
 *
 * @example
 *   onRequest: async ({ pagination, filter }) => {
 *     loading.val = true
 *     try {
 *       const res = await api.fetch({
 *         page: pagination.val.page,
 *         pageSize: pagination.val.rowsPerPage,
 *         sortBy: pagination.val.sortBy,
 *         descending: pagination.val.descending,
 *         search: filter.val,
 *       })
 *       rows.val = res.items
 *       pagination.val = { ...pagination.val, rowsNumber: res.total }
 *     } finally {
 *       loading.val = false
 *     }
 *   }
 */
export interface RequestProps<T> {
  readonly pagination: State<PaginationState>;
  readonly filter: State<string>;
  readonly getCellValue: (col: XColumn<T>, row: T) => unknown;
}

/** Scope passed to `slots.headerCell` and `headerCellByKey`. */
export interface HeaderCellScope<T> {
  readonly col: XColumn<T>;
  readonly sort: () => void;
  readonly sortDir: SortDir;
}

/** Scope passed to `slots.bodyCell` and `bodyCellByKey`. */
export interface BodyCellScope<T> {
  readonly col: XColumn<T>;
  readonly row: T;
  readonly rowKey: RowKey;
  readonly value: unknown;
}

/** Scope passed to each `filterCellByKey` renderer. */
export interface FilterCellScope<T> {
  readonly col: XColumn<T>;
}

/** Shared scope passed to outer slots (`top`, `header`, `body`, `bottom`). */
export interface TableScope<T> {
  readonly rows: State<T[]>;
  readonly selected: State<T[]>;
  readonly pagination: State<PaginationState>;
  readonly filter: State<string>;
  readonly visibleRows: () => readonly T[];
}

/** Alias for clarity at slot call sites. */
export type TopScope<T> = TableScope<T>;
export type HeaderScope<T> = TableScope<T>;
export type BodyScope<T> = TableScope<T>;
export type BottomScope<T> = TableScope<T>;

/** Scope passed to the `slots.pagination` override. */
export interface PaginationSlotScope {
  readonly pagination: State<PaginationState>;
  readonly pagesCount: () => number;
  readonly firstPage: () => void;
  readonly prevPage: () => void;
  readonly nextPage: () => void;
  readonly lastPage: () => void;
}

/**
 * Scope passed to `slots.expandedRow`. `expand` is the per-row boolean state
 * so the slot can disable itself; `toggle` is a convenience that flips it.
 */
export interface ExpandedRowScope<T> {
  readonly row: T;
  readonly rowKey: RowKey;
  readonly cols: readonly XColumn<T>[];
  readonly expand: State<boolean>;
  readonly toggle: () => void;
}

/**
 * Optional render-function-as-child slots, indexed by slot name.
 *
 * Per-column overrides for header/body cells live separately on
 * `headerCellByKey` / `bodyCellByKey` (typed `Record<string, ...>`) to keep
 * each slot scope strongly typed without falling back to dynamic key unions.
 */
export interface XTableSlots<T> {
  readonly top?: (scope: TopScope<T>) => ChildDom;
  readonly topLeft?: (scope: TopScope<T>) => ChildDom;
  readonly topRight?: (scope: TopScope<T>) => ChildDom;
  readonly header?: (scope: HeaderScope<T>) => ChildDom;
  readonly headerCell?: (scope: HeaderCellScope<T>) => ChildDom;
  readonly body?: (scope: BodyScope<T>) => ChildDom;
  readonly bodyCell?: (scope: BodyCellScope<T>) => ChildDom;
  readonly noData?: (scope: { filterActive: boolean }) => ChildDom;
  readonly loading?: (scope: { label: string }) => ChildDom;
  readonly pagination?: (scope: PaginationSlotScope) => ChildDom;
  readonly bottom?: (scope: BottomScope<T>) => ChildDom;
  readonly bottomRow?: (scope: BottomScope<T>) => ChildDom;
  /** Setting this slot enables the expander column. */
  readonly expandedRow?: (scope: ExpandedRowScope<T>) => ChildDom;
  /**
   * Content for the expander column's HEADER cell, which is otherwise empty.
   *
   * Lets a caller put a table-wide control (a filter toggle, say) in the gutter the
   * expander already occupies, instead of adding a second gutter beside it and pushing
   * every data column further right. Ignored when the expander column is off.
   */
  readonly expanderHeader?: () => ChildDom;
  /**
   * Content for the expander column's cell in the per-column filter row (`filterCellByKey`),
   * which is otherwise empty. The natural home for a "clear all filters" control: it sits
   * level with the filter inputs it clears. Ignored when the expander column is off.
   */
  readonly expanderFilterCell?: () => ChildDom;
}

/** Per-column slot override map. Keys must match `XColumn.key`. */
export type ByKey<S> = Readonly<Record<string, (scope: S) => ChildDom>>;

/**
 * Default substring filter contract. Implementations receive the rendered
 * cell accessor so callers can match against the displayed text rather than
 * raw row values.
 */
export type FilterMethod<T> = (
  rows: readonly T[],
  term: string,
  cols: readonly XColumn<T>[],
  getCellValue: (col: XColumn<T>, row: T) => unknown,
) => readonly T[];

/**
 * Full prop surface for the `xTable` factory.
 *
 * State-shaped props (`rows`, `pagination`, `selected`, `filter`, `loading`,
 * `sortBy`, `descending`, `expanded`) are caller-owned: xTable reads `.val`
 * and writes back on user actions. Pass internal defaults by omitting the
 * prop; pass a controlled value by providing your own `van.state(...)`.
 */
export interface XTableProps<T> {
  // Core
  readonly rows: State<T[]>;
  readonly columns: readonly XColumn<T>[];
  readonly rowKey?: RowKeyAccessor<T>;
  readonly dense?: boolean;
  readonly flat?: boolean;
  readonly bordered?: boolean;
  readonly square?: boolean;
  readonly separator?: Separator;
  readonly wrapCells?: boolean;
  /** Extra classes appended to the inner `<table>`. */
  readonly tableClass?: string;
  /** Extra classes appended to `<thead>`. */
  readonly tableHeaderClass?: string;
  /** Extra classes appended to the outer wrapper. */
  readonly cardClass?: string;
  /**
   * Classes for the inner scroll region (top slot + table + bottom slot). The
   * pagination footer renders as a sibling OUTSIDE this element, so it stays a
   * fixed bar at the bottom of the wrapper. Defaults to `"vx-table__scroll"`.
   *
   * Replaces the default as a whole: pass `"vx-table__scroll my-extra"` to extend it.
   * Ignored under `virtualScroll`, where the table's own viewport is the scroll region.
   */
  readonly scrollClass?: string;
  /**
   * Extra classes for a body `<tr>`, derived from its row. Runs once per row per body
   * render; return `""` for no extra class.
   *
   * The row's own hover style is applied alongside it, not replaced. A hover background set
   * on the `<tr>` paints BEHIND the cells, so a caller tinting the row opaquely will cover it —
   * tint the cells instead (give your class a `td` rule: `.is-critical > td { … }`) and the
   * hover shows through.
   *
   * @example rowClass: (row) => (row.severity === "critical" ? "is-critical" : "")
   */
  readonly rowClass?: (row: T, rowKey: RowKey) => string;

  // Sort
  readonly sortBy?: State<string | null>;
  readonly descending?: State<boolean>;
  readonly binaryStateSort?: boolean;

  // Pagination
  readonly pagination?: State<PaginationState>;
  readonly rowsPerPageOptions?: readonly number[];
  readonly hidePagination?: boolean;

  // Server-side
  readonly onRequest?: (props: RequestProps<T>) => void | Promise<void>;

  // Selection
  readonly selection?: SelectionMode;
  readonly selected?: State<T[]>;
  readonly selectedRowsLabel?: (n: number) => string;

  // Pagination footer text. English by default; pass these to localise the footer.
  /** Label before the rows-per-page selector. Default `"Records per page:"`. */
  readonly rowsPerPageLabel?: string;
  /**
   * The range indicator, from the first and last row shown and the total. Default
   * `` `${first}–${last} of ${total}` ``. Called on every repaint of the footer, so a function
   * that reads a reactive locale follows it.
   *
   * @example rangeLabel: (first, last, total) => `${first}–${last} de ${total}`
   */
  readonly rangeLabel?: (first: number, last: number, total: number) => string;

  // Filter
  readonly filter?: State<string>;
  readonly filterMethod?: FilterMethod<T>;

  // Loading / empty
  readonly loading?: State<boolean>;
  readonly noDataLabel?: string;
  readonly noResultsLabel?: string;
  readonly loadingLabel?: string;

  // Slots
  readonly slots?: XTableSlots<T>;
  readonly headerCellByKey?: ByKey<HeaderCellScope<T>>;
  readonly bodyCellByKey?: ByKey<BodyCellScope<T>>;

  /**
   * Optional full-width filter row rendered as a second `<tr>` inside the
   * sticky `<thead>`, directly under the column-header row. Because it lives
   * in the sticky thead it stays pinned just below the headers while the body
   * scrolls. The thunk is only invoked when the row is rendered, so callers
   * pay nothing when it's omitted (backward-compatible — existing callers are
   * unaffected). The returned content fills a single `<td colspan>` spanning
   * every column (data columns + selection + expander).
   *
   * @example
   *   xTable({ rows, columns, filterRow: () => myFilterControls })
   */
  readonly filterRow?: () => ChildDom;

  /**
   * Per-column filter cell renderers, keyed by `XColumn.key`. When provided,
   * xTable renders an extra `<tr>` inside the sticky `<thead>` where every
   * column gets its own `<td>` aligned with its header cell, so filter controls
   * line up with their columns (unlike `filterRow`, which is a single full-width
   * `colspan` cell). Columns without an entry render an empty cell; leading
   * empty cells are added for the selection/expander columns when present.
   *
   * @example
   *   xTable({ rows, columns, filterCellByKey: { name: () => nameFilter } })
   */
  readonly filterCellByKey?: ByKey<FilterCellScope<T>>;

  /**
   * Optional reactive visibility for the per-column filter row. When it returns
   * `false` the row carries `hidden` (`display:none`) but stays mounted, so its
   * controls keep their state across toggles. Omit for an always-visible row.
   */
  readonly filterCellsVisible?: () => boolean;

  // Expansion
  readonly expanded?: State<RowKey[]>;

  // Virtual scroll
  readonly virtualScroll?: boolean;
  readonly virtualScrollSliceSize?: number;
  readonly virtualScrollItemSize?: number;
  readonly virtualScrollStickySizeStart?: number;
  readonly virtualScrollStickySizeEnd?: number;

  // Theming
  /**
   * Visual theme. Defaults to `"dark"` to preserve the original look.
   *
   * It is written to the wrapper as `data-vx-theme`, and every theme color is a
   * `--vx-table-*` token declared on that wrapper. To retheme, override the tokens on
   * `.vx-table` (or on `.vx-table[data-vx-theme="material"]` for material), not on
   * `:root`: the wrapper's own declaration beats an inherited one.
   */
  readonly theme?: ThemeName;
  /**
   * CSS color to bind to `--xtable-primary` on this instance's wrapper.
   * Overrides any inherited value. Both themes read this variable for the
   * focus ring and the selection checkbox accent, and fall back to their own
   * `--vx-table-ring` / `--vx-table-accent` tokens when it is not set.
   *
   * @example
   *   xTable({ rows, columns, theme: "material", primaryColor: "#7c3aed" })
   */
  readonly primaryColor?: string;
}
