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
  const rowsPerPageLabel = props.rowsPerPageLabel ?? "Records per page:";
  const rangeLabel =
    props.rangeLabel ?? ((first: number, last: number, total: number): string => `${first}–${last} of ${total}`);
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
  const scrollClass = props.scrollClass ?? "vx-table__scroll";
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
    a === "right"
      ? "vx-table__cell--right"
      : a === "center"
        ? "vx-table__cell--center"
        : "vx-table__cell--left";

  // Body cells never wrap unless `wrapCells` is set. Cell padding follows `dense` through
  // the `--vx-table-cell-pad` token on the wrapper, so no per-cell class is needed.
  const cellWrap = wrapCells ? "" : "vx-table__cell--nowrap";

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
      selection, row, isRowSelected, toggleRowSelection,
    });

  const renderExpanderCell = (row: T): Element | null =>
    renderExpanderCellHelper({
      row, hasExpander, isRowExpanded, toggleRowExpansion,
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
      "vx-table__cell", alignClass(col.align), col.headerClass ?? "",
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
              class: "vx-table__sort",
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
              anchor: index === 0 ? "left" : "right",
            }
          : { col, st: undefined },
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
      "vx-table__cell", alignClass(col.align), cellWrap,
      col.bodyClass ?? "",
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
          class: "vx-table__empty",
        },
        content,
      ),
    );

  const renderLoadingBody = (): Element =>
    renderEmptyRow(
      props.slots?.loading
        ? (props.slots.loading({ label: loadingLabel }) as ChildDom)
        : div(
            { class: "vx-table__loading" },
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
        class: ["vx-table__row", props.rowClass?.(row, keyOf(row))]
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
      rowsPerPageLabel, rangeLabel,
      rowsPerPageOptions, pagesCount, totalCount,
      firstPage, prevPage, nextPage, lastPage, onRowsPerPageChange,
    });
  };

  const renderTopSection = (): ChildDom => {
    if (props.slots?.top) return div({ class: "vx-table__top" }, props.slots.top(tableScope));
    if (props.slots?.topLeft || props.slots?.topRight) {
      return div(
        { class: "vx-table__toolbar" },
        div(props.slots?.topLeft ? props.slots.topLeft(tableScope) : ""),
        div(props.slots?.topRight ? props.slots.topRight(tableScope) : ""),
      );
    }
    return null;
  };

  const renderBottomSection = (): ChildDom => {
    if (props.slots?.bottom) return div({ class: "vx-table__bottom" }, props.slots.bottom(tableScope));
    if (props.slots?.bottomRow) return div({ class: "vx-table__bottom" }, props.slots.bottomRow(tableScope));
    return null;
  };

  // `vx-table` is a flex column so the inner scroll region takes the remaining height and
  // the pagination footer pins to the bottom (outside the scroll). The modifiers cover the
  // non-default looks; `xtable` stays as a public hook for consumers.
  const wrapperClass = [
    "xtable vx-table",
    cardClass,
    props.bordered === true ? "vx-table--bordered" : "",
    props.square === true ? "vx-table--square" : "",
    props.flat === true ? "vx-table--flat" : "",
    dense ? "vx-table--dense" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const innerTableClass = ["vx-table__table", tableClass]
    .filter(Boolean)
    .join(" ");

  const headerClass = ["vx-table__head", tableHeaderClass]
    .filter(Boolean)
    .join(" ");

  const tableEl = table(
    { class: innerTableClass },
    thead(
      { class: headerClass },
      tr(
        renderSelectionHeaderHelper({
          selection, allVisibleSelected,
          partiallyVisibleSelected, toggleAllVisible,
        }),
        renderExpanderHeaderHelper(
          hasExpander,
          props.slots?.expanderHeader?.(),
        ),
        ...columns.map(renderHeaderCell),
      ),
      // Optional filter row: a second full-width <tr> inside the sticky
      // <thead>, pinned directly under the column-header row. The <td> spans
      // every column (data + selection + expander via totalColCount) and takes
      // the thead background so it reads as part of the pinned header; zero padding
      // keeps it full-bleed so the caller's content owns its own padding.
      // Omitted entirely (renders nothing) when `filterRow` is not provided —
      // the thunk is only invoked on render, keeping existing callers untouched.
      props.filterRow
        ? tr(
            td(
              {
                colSpan: String(totalColCount()),
                class: "vx-table__filter-content",
              },
              props.filterRow(),
            ),
          )
        : null,
      // Optional per-column filter row: an extra <tr> inside the sticky <thead>
      // with one <td> per column, so each filter control lines up with its
      // header (unlike the full-width `filterRow` above). Leading empty cells
      // mirror the selection/expander columns. A reactive `hidden` binding drives
      // visibility (function in ATTRIBUTE position -> updates the attribute only, it
      // never rebuilds the cells or their state).
      props.filterCellByKey
        ? tr(
            {
              hidden: () =>
                props.filterCellsVisible != null && !props.filterCellsVisible(),
            },
            selection !== "none"
              ? td({ class: "vx-table__filter-cell" })
              : null,
            hasExpander
              ? td(
                  { class: "vx-table__filter-cell" },
                  props.slots?.expanderFilterCell?.() ?? null,
                )
              : null,
            ...columns.map((col) => {
              const slot = props.filterCellByKey?.[col.key];
              return td(
                {
                  class: ["vx-table__filter-cell", alignClass(col.align)].join(" "),
                },
                slot ? slot({ col }) : null,
              );
            }),
          )
        : null,
    ),
    (): Element => tbody({ class: "vx-table__body" }, ...renderBodyRows()),
  );

  const tableHost = virtualScrollOn
    ? div(
        {
          class: "vx-table__viewport",
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
  // theme's own `--vx-table-ring` / `--vx-table-accent` tokens).
  const wrapperStyle = props.primaryColor
    ? `--xtable-primary: ${props.primaryColor};`
    : "";

  // Scroll region: top slot + table + bottom slot. The sticky <thead> lives here
  // (its scroll ancestor), so header pinning keeps working. The pagination footer
  // is deliberately OUTSIDE this element (a non-shrinking sibling below) so it is a
  // fixed bar and never overlaps rows/actions when the viewport is short.
  //
  // In virtualScroll mode the tableHost is ALREADY its own scrolling viewport
  // (and pagination is suppressed), so don't double-wrap it — keep it a direct
  // child so the single scroll viewport stays the vs container.
  const wrapper = div(
    {
      class: wrapperClass,
      "data-vx-theme": props.theme ?? "dark",
      ...(wrapperStyle ? { style: wrapperStyle } : {}),
    },
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
