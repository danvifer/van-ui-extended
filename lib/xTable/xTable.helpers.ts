import type {
  XColumn,
  RowKey,
  RowKeyAccessor,
  FilterMethod,
} from "./xTable.types";

/**
 * Resolve a row's stable identity. Falls back to `String(value)` only when
 * the accessor produces a non-string/non-number value — the caller is
 * responsible for ensuring uniqueness.
 */
export const resolveRowKey = <T>(
  row: T,
  accessor: RowKeyAccessor<T>,
): RowKey => {
  if (typeof accessor === "function") return accessor(row);
  const raw = (row as Record<string, unknown>)[accessor as string];
  if (typeof raw === "string" || typeof raw === "number") return raw;
  return String(raw);
};

/**
 * Read a column's value off a row. Uses `column.value` if supplied, otherwise
 * indexes by `column.key`. Always returns `unknown` — callers must narrow.
 */
export const getCellValue = <T>(col: XColumn<T>, row: T): unknown => {
  if (col.value) return col.value(row);
  return (row as Record<string, unknown>)[col.key as string];
};

/**
 * Comparator used when a column does not supply its own `sort` function.
 * Coerces `null`/`undefined` to "smaller", compares numbers and booleans
 * natively, and uses `localeCompare` for everything else.
 */
export const defaultCompare = (a: unknown, b: unknown): number => {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") {
    return a === b ? 0 : a ? 1 : -1;
  }
  return String(a).localeCompare(String(b));
};

/**
 * Pure client-side sort. Returns the input unchanged when `sortBy` is null
 * or refers to an unknown column. Does NOT mutate the input array.
 */
export const sortRows = <T>(
  rows: readonly T[],
  sortBy: string | null,
  descending: boolean,
  columns: readonly XColumn<T>[],
  getValue: (col: XColumn<T>, row: T) => unknown,
): readonly T[] => {
  if (!sortBy) return rows;
  const col = columns.find((c) => c.key === sortBy);
  if (!col) return rows;
  const cmp = col.sort ?? ((a: unknown, b: unknown) => defaultCompare(a, b));
  const out = [...rows].sort((rowA, rowB) => {
    const va = getValue(col, rowA);
    const vb = getValue(col, rowB);
    const r = cmp(va, vb, rowA, rowB);
    return descending ? -r : r;
  });
  return out;
};

/**
 * Slice rows for a given page. `rowsPerPage <= 0` is interpreted as "show
 * all" — returns the input unchanged.
 */
export const paginateRows = <T>(
  rows: readonly T[],
  page: number,
  rowsPerPage: number,
): readonly T[] => {
  if (rowsPerPage <= 0) return rows;
  const start = Math.max(0, (page - 1) * rowsPerPage);
  return rows.slice(start, start + rowsPerPage);
};

/**
 * Default top-level filter — case-insensitive substring match across every
 * column's resolved value. A custom `FilterMethod` bypasses this entirely.
 */
export const filterRows = <T>(
  rows: readonly T[],
  term: string,
  columns: readonly XColumn<T>[],
  getValue: (col: XColumn<T>, row: T) => unknown,
  custom?: FilterMethod<T>,
): readonly T[] => {
  if (custom) return custom(rows, term, columns, getValue);
  if (!term) return rows;
  const needle = term.toLowerCase();
  return rows.filter((row) =>
    columns.some((col) => {
      const v = getValue(col, row);
      if (v == null) return false;
      return String(v).toLowerCase().includes(needle);
    }),
  );
};

/**
 * Apply per-column "applied" filter values to an already-globally-filtered
 * row set. Each entry in `popoverFilters` is `(columnKey → appliedValue)`;
 * empty values are ignored.
 */
export const applyPopoverFilters = <T>(
  rows: readonly T[],
  popoverFilters: ReadonlyMap<string, string>,
  columns: readonly XColumn<T>[],
  getValue: (col: XColumn<T>, row: T) => unknown,
): readonly T[] => {
  let out: readonly T[] = rows;
  for (const [colKey, applied] of popoverFilters) {
    if (!applied) continue;
    const col = columns.find((c) => c.key === colKey);
    if (!col) continue;
    if (col.columnFilter === "select") {
      out = out.filter((row) => {
        const v = getValue(col, row);
        return v != null && String(v) === applied;
      });
    } else {
      const needle = applied.toLowerCase();
      out = out.filter((row) => {
        const v = getValue(col, row);
        return v != null && String(v).toLowerCase().includes(needle);
      });
    }
  }
  return out;
};
