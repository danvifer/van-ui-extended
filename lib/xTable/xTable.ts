import van, { type ChildDom, type State } from "vanjs-core";
import type {
  XTableProps,
  XColumn,
  PaginationState,
  ColumnAlign,
  SortDir,
  RowKey,
  RowKeyAccessor,
  SelectionMode,
  TableScope,
  BodyCellScope,
  HeaderCellScope,
} from "./xTable.types";
import {
  applyPopoverFilters,
  filterRows,
  getCellValue,
  resolveRowKey,
  sortRows,
  paginateRows,
} from "./xTable.helpers";
import { ascIcon, descIcon, spinnerIcon } from "./xTable.icons";
import {
  renderExpandedRow as renderExpandedRowHelper,
  renderExpanderCell as renderExpanderCellHelper,
  renderExpanderHeader as renderExpanderHeaderHelper,
} from "./xTable.expansion";
import {
  renderColumnFilterButton,
  type PopoverCtx,
} from "./xTable.filter";
import { renderPaginationFooter } from "./xTable.pagination";
import { registerOutsideClick } from "./xTable.outsideClick";
import {
  renderSelectionCell as renderSelectionCellHelper,
  renderSelectionHeader as renderSelectionHeaderHelper,
} from "./xTable.selection";
import { buildBodyRows } from "./xTable.body";
import { resolveTheme, type Theme } from "./xTable.themes";

const { div, table, thead, tbody, tr, th, td, span } = van.tags;

const DEFAULT_ROWS_PER_PAGE_OPTIONS: readonly number[] = [5, 10, 20, 50, 0];

/**
 * Quasar-QTable-inspired VanJS table. Caller owns every `State<T>` prop;
 * client-side rendering pipes `filter → sort → paginate` through one
 * `van.derive`. Defining `onRequest` (or `pagination.rowsNumber`) switches
 * to server-side mode and bypasses the pipeline.
 */
export const xTable = <T>(props: XTableProps<T>): ChildDom => {
  const rows = props.rows;
  const columns = props.columns;
  const pagination: State<PaginationState> = props.pagination ?? van.state<PaginationState>({ page: 1, rowsPerPage: 10 });
  const sortByState: State<string | null> = props.sortBy ?? van.state<string | null>(null);
  const descendingState: State<boolean> = props.descending ?? van.state<boolean>(false);
  const filter: State<string> = props.filter ?? van.state("");
  const loading: State<boolean> = props.loading ?? van.state<boolean>(false);
  const selected: State<T[]> = props.selected ?? van.state<T[]>([]);
  const selection: SelectionMode = props.selection ?? "none";
  const selectedRowsLabel = props.selectedRowsLabel ?? ((n: number): string => `${n} selected`);
  const rowKeyAccessor: RowKeyAccessor<T> = props.rowKey ?? ("id" as Extract<keyof T, string | number>);
  const expanded: State<RowKey[]> = props.expanded ?? van.state<RowKey[]>([]);
  const expandedRowSlot = props.slots?.expandedRow;
  const hasExpander = expandedRowSlot != null;

  const keyOf = (row: T): RowKey => resolveRowKey(row, rowKeyAccessor);

  const isRowExpanded = (row: T): boolean =>
    expanded.val.includes(keyOf(row));

  const toggleRowExpansion = (row: T): void => {
    const k = keyOf(row);
    if (expanded.val.includes(k)) {
      expanded.val = expanded.val.filter((x) => x !== k);
    } else {
      expanded.val = [...expanded.val, k];
    }
  };

  const binaryStateSort = props.binaryStateSort === true;
  const dense = props.dense === true, wrapCells = props.wrapCells === true;
  const tableClass = props.tableClass ?? "", tableHeaderClass = props.tableHeaderClass ?? "", cardClass = props.cardClass ?? "";
  // Class for the inner scroll region (holds top slot + table + bottom slot). The
  // pagination footer is rendered as a sibling OUTSIDE this element so it stays a
  // fixed bar at the bottom of the (flex-column) wrapper instead of scrolling/
  // overlapping. Callers can override; the default carries the scroll intent.
  const scrollClass = props.scrollClass ?? "flex-1 min-h-0 overflow-auto";
  const rowsPerPageOptions = props.rowsPerPageOptions ?? DEFAULT_ROWS_PER_PAGE_OPTIONS;
  const virtualScrollOn = props.virtualScroll === true;
  const hidePagination = props.hidePagination === true || virtualScrollOn;
  const noDataLabel = props.noDataLabel ?? "No data available";
  const loadingLabel = props.loadingLabel ?? "Loading...";
  const vsItemSize = props.virtualScrollItemSize ?? 32;
  const vsSliceSize = props.virtualScrollSliceSize ?? 30;
  const vsStickyStart = props.virtualScrollStickySizeStart ?? 0;
  const vsStickyEnd = props.virtualScrollStickySizeEnd ?? 0;
  const vsContainerHeight = vsSliceSize * vsItemSize;
  const viewportScrollTop = van.state(0);
  const t: Theme = resolveTheme(props.theme);

  const isServerSide = (): boolean =>
    props.onRequest != null || pagination.val.rowsNumber != null;

  const cellValue = (col: XColumn<T>, row: T): unknown =>
    getCellValue(col, row);

  const sortDirOf = (col: XColumn<T>): SortDir => {
    if (sortByState.val !== col.key) return null;
    return descendingState.val ? "desc" : "asc";
  };

  const toggleSort = (col: XColumn<T>): void => {
    if (!col.sortable) return;
    const wasActive = sortByState.val === col.key;
    if (!wasActive) {
      sortByState.val = col.key;
      descendingState.val = false;
      return;
    }
    if (!descendingState.val) {
      descendingState.val = true;
      return;
    }
    if (binaryStateSort) {
      descendingState.val = false;
      return;
    }
    sortByState.val = null;
    descendingState.val = false;
  };

  // Per-column popover state, eagerly allocated so `van.derive` can track
  // each field at the State level. Splitting `open` / `draftValue` /
  // `appliedValue` into three separate States is what keeps the popover
  // `<input>` from losing focus on every keystroke — see PopoverCtx jsdoc.
  const popoverStates = new Map<string, PopoverCtx>();
  for (const col of columns) {
    if (col.columnFilter) {
      popoverStates.set(col.key, {
        open: van.state(false),
        draftValue: van.state(""),
        appliedValue: van.state(""),
      });
    }
  }

  // Mirror sort state into pagination so server-side handlers can read it
  // off the single `pagination` argument. Stable in 2 runs (write only when
  // the mirrored value diverges).
  van.derive(() => {
    const sb = sortByState.val;
    const desc = descendingState.val;
    if (pagination.val.sortBy !== sb || pagination.val.descending !== desc) {
      pagination.val = { ...pagination.val, sortBy: sb, descending: desc };
    }
  });

  // Server-side dispatch: fire `onRequest` whenever a state the caller's
  // backend cares about changes. Skip the initial run — callers fetch the
  // first page themselves.
  if (props.onRequest) {
    const onRequest = props.onRequest;
    let firstRun = true;
    van.derive(() => {
      void pagination.val;
      void filter.val;
      if (firstRun) {
        firstRun = false;
        return;
      }
      void onRequest({ pagination, filter, getCellValue: cellValue });
    });
  }

  const visibleRows = van.derive((): readonly T[] => {
    if (isServerSide()) return rows.val;
    const popMap = new Map<string, string>();
    for (const [k, st] of popoverStates) popMap.set(k, st.appliedValue.val);
    const filtered = applyPopoverFilters(
      filterRows(rows.val, filter.val, columns, cellValue, props.filterMethod),
      popMap, columns, cellValue,
    );
    const sorted = sortRows(filtered, sortByState.val, descendingState.val, columns, cellValue);
    if (virtualScrollOn) return sorted;
    return paginateRows(sorted, pagination.val.page, pagination.val.rowsPerPage);
  });

  const totalCount = (): number =>
    pagination.val.rowsNumber ?? rows.val.length;

  const pagesCount = (): number => {
    const rpp = pagination.val.rowsPerPage;
    if (rpp <= 0) return 1;
    return Math.max(1, Math.ceil(totalCount() / rpp));
  };

  const goToPage = (n: number): void => {
    const clamped = Math.max(1, Math.min(pagesCount(), n));
    if (pagination.val.page !== clamped) {
      pagination.val = { ...pagination.val, page: clamped };
    }
  };

  const firstPage = (): void => goToPage(1);
  const prevPage = (): void => goToPage(pagination.val.page - 1);
  const nextPage = (): void => goToPage(pagination.val.page + 1);
  const lastPage = (): void => goToPage(pagesCount());

  const onRowsPerPageChange = (rpp: number): void => {
    pagination.val = { ...pagination.val, rowsPerPage: rpp, page: 1 };
  };

  const alignClass = (a: ColumnAlign | undefined): string =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";

  const cellPad = dense ? "p-2" : "p-4";
  // Filter-row cells: same horizontal padding as header/body cells (so controls
  // line up with their column) but tighter vertically to keep the row compact.
  const filterCellPad = dense ? "px-2 py-1" : "px-4 py-2";
  const cellWrap = wrapCells ? "" : "whitespace-nowrap";

  const isRowSelected = (row: T): boolean => {
    const k = keyOf(row);
    return selected.val.some((s) => keyOf(s) === k);
  };

  const toggleRowSelection = (row: T): void => {
    if (selection === "single") {
      selected.val = isRowSelected(row) ? [] : [row];
      return;
    }
    const k = keyOf(row);
    if (selected.val.some((s) => keyOf(s) === k)) {
      selected.val = selected.val.filter((s) => keyOf(s) !== k);
    } else {
      selected.val = [...selected.val, row];
    }
  };

  const allVisibleSelected = (): boolean => {
    const list = visibleRows.val;
    if (list.length === 0) return false;
    return list.every(isRowSelected);
  };

  const partiallyVisibleSelected = (): boolean => {
    const list = visibleRows.val;
    if (list.length === 0) return false;
    const count = list.filter(isRowSelected).length;
    return count > 0 && count < list.length;
  };

  const toggleAllVisible = (): void => {
    if (selection !== "multiple") return;
    const list = visibleRows.val;
    if (allVisibleSelected()) {
      const visibleKeys = new Set(list.map(keyOf));
      selected.val = selected.val.filter((s) => !visibleKeys.has(keyOf(s)));
    } else {
      const additions = list.filter((r) => !isRowSelected(r));
      selected.val = [...selected.val, ...additions];
    }
  };

  const totalColCount = (): number =>
    columns.length +
    (selection !== "none" ? 1 : 0) +
    (hasExpander ? 1 : 0);

  const renderSelectionCell = (row: T): Element | null =>
    renderSelectionCellHelper({
      selection, cellPad, row, isRowSelected, toggleRowSelection,
      theme: t,
    });

  const renderExpanderCell = (row: T): Element | null =>
    renderExpanderCellHelper({
      row, cellPad, hasExpander, isRowExpanded, toggleRowExpansion,
    });

  const renderExpandedRow = (row: T): Element => {
    if (!expandedRowSlot) return tr();
    return renderExpandedRowHelper({
      row,
      rowKey: keyOf(row),
      cols: columns,
      totalCol: totalColCount(),
      slot: expandedRowSlot,
      toggleRowExpansion,
      expandedRowClass: t.expandedRow,
    });
  };

  const headerCellSlotFor = (
    col: XColumn<T>,
  ): ((s: HeaderCellScope<T>) => ChildDom) | undefined =>
    props.headerCellByKey?.[col.key] ?? props.slots?.headerCell;

  const bodyCellSlotFor = (
    col: XColumn<T>,
  ): ((s: BodyCellScope<T>) => ChildDom) | undefined =>
    props.bodyCellByKey?.[col.key] ?? props.slots?.bodyCell;

  const renderHeaderCell = (col: XColumn<T>, index: number): ChildDom => {
    const slot = headerCellSlotFor(col);
    const baseClass = [
      cellPad, alignClass(col.align), t.cellBorder, col.headerClass ?? "",
    ].join(" ").trim();
    if (slot) {
      return th({ class: baseClass }, slot({
        col,
        sort: () => toggleSort(col),
        sortDir: sortDirOf(col),
      }));
    }
    return th(
      { class: baseClass },
      col.sortable
        ? span(
            {
              class: "inline-flex items-center gap-1 cursor-pointer select-none",
              onclick: () => toggleSort(col),
            },
            col.label as ChildDom,
            () => {
              const dir = sortDirOf(col);
              if (dir === "asc") return ascIcon();
              if (dir === "desc") return descIcon();
              return span();
            },
          )
        : (col.label as ChildDom),
      renderColumnFilterButton(
        popoverStates.get(col.key)
          ? {
              col,
              st: popoverStates.get(col.key)!,
              distinctValues: () => distinctValuesFor(col),
              theme: t,
              anchor: index === 0 ? "left" : "right",
            }
          : { col, st: undefined, theme: t },
      ),
    );
  };

  const distinctValuesFor = (col: XColumn<T>): readonly string[] => {
    const seen = new Set<string>();
    for (const row of rows.val) {
      const v = cellValue(col, row);
      if (v == null) continue;
      seen.add(String(v));
    }
    return [...seen].sort();
  };

  const renderBodyCell = (col: XColumn<T>, row: T): ChildDom => {
    const value = cellValue(col, row);
    const baseClass = [
      cellPad, alignClass(col.align), cellWrap,
      t.cellBorder, col.bodyClass ?? "",
    ].join(" ").trim();
    const slot = bodyCellSlotFor(col);
    if (slot) {
      return td(
        { class: baseClass },
        slot({ col, row, rowKey: keyOf(row), value }),
      );
    }
    const display = col.format ? col.format(value, row) : value;
    return td({ class: baseClass }, display as ChildDom);
  };

  const renderEmptyRow = (content: ChildDom): Element =>
    tr(
      td(
        {
          colSpan: String(totalColCount()),
          class: `text-center p-6 ${t.emptyText}`,
        },
        content,
      ),
    );

  const renderLoadingBody = (): Element =>
    renderEmptyRow(
      props.slots?.loading
        ? (props.slots.loading({ label: loadingLabel }) as ChildDom)
        : div(
            { class: "inline-flex items-center justify-center gap-3" },
            spinnerIcon(),
            span(loadingLabel),
          ),
    );

  const renderNoDataBody = (): Element =>
    renderEmptyRow(
      props.slots?.noData
        ? (props.slots.noData({ filterActive: filter.val.length > 0 }) as ChildDom)
        : noDataLabel,
    );

  const renderDataRow = (row: T): Element =>
    tr(
      {
        class: [t.rowHover, props.rowClass?.(row, keyOf(row))]
          .filter(Boolean)
          .join(" "),
      },
      renderSelectionCell(row),
      renderExpanderCell(row),
      ...columns.map((col) => renderBodyCell(col, row)),
    );

  const renderBodyRows = (): readonly Element[] =>
    buildBodyRows<T>({
      loading: loading.val,
      visibleRows: visibleRows.val,
      renderLoadingBody, renderNoDataBody, renderDataRow,
      hasExpander, isRowExpanded, renderExpandedRow,
      virtualScrollOn,
      viewportScrollTop: viewportScrollTop.val,
      vsContainerHeight, vsItemSize, vsSliceSize, vsStickyStart, vsStickyEnd,
    });

  const tableScope: TableScope<T> = {
    rows, selected, pagination, filter,
    visibleRows: () => visibleRows.val,
  };

  const renderFooter = (): ChildDom => {
    if (hidePagination) return span();
    if (props.slots?.pagination) {
      return props.slots.pagination({
        pagination, pagesCount, firstPage, prevPage, nextPage, lastPage,
      });
    }
    return renderPaginationFooter<T>({
      pagination, selection, selected, selectedRowsLabel,
      rowsPerPageOptions, pagesCount, totalCount,
      firstPage, prevPage, nextPage, lastPage, onRowsPerPageChange,
      theme: t,
    });
  };

  const renderTopSection = (): ChildDom => {
    if (props.slots?.top) return div({ class: "p-2" }, props.slots.top(tableScope));
    if (props.slots?.topLeft || props.slots?.topRight) {
      return div(
        { class: "flex items-center justify-between p-2" },
        div(props.slots?.topLeft ? props.slots.topLeft(tableScope) : ""),
        div(props.slots?.topRight ? props.slots.topRight(tableScope) : ""),
      );
    }
    return null;
  };

  const renderBottomSection = (): ChildDom => {
    if (props.slots?.bottom) return div({ class: "p-2" }, props.slots.bottom(tableScope));
    if (props.slots?.bottomRow) return div({ class: "p-2" }, props.slots.bottomRow(tableScope));
    return null;
  };

  const wrapperClass = [
    "xtable",
    // Flex column so the inner scroll region takes the remaining height and the
    // pagination footer pins to the bottom (outside the scroll). `min-h-0` lets it
    // shrink inside a flex/grid parent instead of overflowing.
    "flex flex-col min-h-0",
    cardClass,
    props.bordered === true ? `border ${t.borderWhenBordered}` : "",
    props.square === true ? "" : "rounded-md",
    props.flat === true ? "" : t.shadow,
  ]
    .filter(Boolean)
    .join(" ");

  const innerTableClass = ["w-full text-sm", tableClass]
    .filter(Boolean)
    .join(" ");

  const headerClass = [t.thead, tableHeaderClass]
    .filter(Boolean)
    .join(" ");

  const tableEl = table(
    { class: innerTableClass },
    thead(
      { class: headerClass },
      tr(
        renderSelectionHeaderHelper({
          selection, cellPad, allVisibleSelected,
          partiallyVisibleSelected, toggleAllVisible,
          theme: t,
        }),
        renderExpanderHeaderHelper(cellPad, hasExpander),
        ...columns.map(renderHeaderCell),
      ),
      // Optional filter row: a second full-width <tr> inside the sticky
      // <thead>, pinned directly under the column-header row. The <td> spans
      // every column (data + selection + expander via totalColCount) and takes
      // the thead background so it reads as part of the pinned header; `p-0`
      // keeps it full-bleed so the caller's content owns its own padding.
      // Omitted entirely (renders nothing) when `filterRow` is not provided —
      // the thunk is only invoked on render, keeping existing callers untouched.
      props.filterRow
        ? tr(
            td(
              {
                colSpan: String(totalColCount()),
                class: `p-0 ${t.filterRowBg}`,
              },
              props.filterRow(),
            ),
          )
        : null,
      // Optional per-column filter row: an extra <tr> inside the sticky <thead>
      // with one <td> per column, so each filter control lines up with its
      // header (unlike the full-width `filterRow` above). Leading empty cells
      // mirror the selection/expander columns. A reactive `class` binding drives
      // visibility (function in ATTRIBUTE position -> updates the class only, it
      // never rebuilds the cells or their state).
      props.filterCellByKey
        ? tr(
            {
              class: () =>
                props.filterCellsVisible && !props.filterCellsVisible()
                  ? "hidden"
                  : "",
            },
            selection !== "none"
              ? td({ class: `${filterCellPad} ${t.filterRowBg}` })
              : null,
            hasExpander
              ? td({ class: `${filterCellPad} ${t.filterRowBg}` })
              : null,
            ...columns.map((col) => {
              const slot = props.filterCellByKey?.[col.key];
              return td(
                {
                  class: [
                    filterCellPad,
                    alignClass(col.align),
                    t.filterRowBg,
                  ].join(" "),
                },
                slot ? slot({ col }) : null,
              );
            }),
          )
        : null,
    ),
    (): Element => tbody({ class: t.tbody }, ...renderBodyRows()),
  );

  const tableHost = virtualScrollOn
    ? div(
        {
          class: "overflow-auto",
          style: `height:${vsContainerHeight}px`,
          onscroll: (e: Event) => {
            viewportScrollTop.val = (e.target as HTMLElement).scrollTop;
          },
        },
        tableEl,
      )
    : tableEl;

  // Inline `--xtable-primary` only when caller pinned a color; otherwise
  // the CSS variable cascades from the document (or falls back to the
  // value baked into each theme's `var(...)` expressions).
  const wrapperStyle = props.primaryColor
    ? `--xtable-primary: ${props.primaryColor};`
    : "";

  // Scroll region: top slot + table + bottom slot. The sticky <thead> lives here
  // (its scroll ancestor), so header pinning keeps working. The pagination footer
  // is deliberately OUTSIDE this element (a shrink-0 sibling below) so it is a
  // fixed bar and never overlaps rows/actions when the viewport is short.
  //
  // In virtualScroll mode the tableHost is ALREADY its own overflow-auto viewport
  // (and pagination is suppressed), so don't double-wrap it — keep it a direct
  // child so the single scroll viewport stays the vs container.
  const wrapper = div(
    { class: wrapperClass, ...(wrapperStyle ? { style: wrapperStyle } : {}) },
    virtualScrollOn
      ? [renderTopSection(), tableHost, renderBottomSection()]
      : div(
          { class: scrollClass },
          renderTopSection(),
          tableHost,
          renderBottomSection(),
        ),
    renderFooter(),
  );

  if (popoverStates.size > 0) {
    registerOutsideClick(wrapper, () => {
      for (const [, st] of popoverStates) {
        if (st.open.val) st.open.val = false;
      }
    });
  }

  return wrapper;
};
