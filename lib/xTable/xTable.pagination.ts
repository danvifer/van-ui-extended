import van, { type State } from "vanjs-core";
import type { PaginationState, SelectionMode } from "./xTable.types";
import { xButton } from "../xButton";
import {
  checkIcon,
  chevronDownIcon,
  firstPageIcon,
  lastPageIcon,
  nextPageIcon,
  prevPageIcon,
} from "./xTable.icons";
import { registerOutsideClick } from "./xTable.outsideClick";

const { button, div, span } = van.tags;

/**
 * Configuration accepted by `renderPaginationFooter`. The component owns
 * the underlying state — this helper is a pure renderer.
 */
export interface PaginationFooterArgs<T> {
  readonly pagination: State<PaginationState>;
  readonly selection: SelectionMode;
  readonly selected: State<T[]>;
  readonly selectedRowsLabel: (n: number) => string;
  /** Label before the rows-per-page selector (`XTableProps.rowsPerPageLabel`). */
  readonly rowsPerPageLabel: string;
  /** Range indicator text (`XTableProps.rangeLabel`). */
  readonly rangeLabel: (first: number, last: number, total: number) => string;
  readonly rowsPerPageOptions: readonly number[];
  readonly pagesCount: () => number;
  /** Total row count (either client-side rows length or `rowsNumber` from the server). */
  readonly totalCount: () => number;
  readonly firstPage: () => void;
  readonly prevPage: () => void;
  readonly nextPage: () => void;
  readonly lastPage: () => void;
  readonly onRowsPerPageChange: (rpp: number) => void;
}

/**
 * Quasar-style "1–25 of 100" range indicator. With `rowsPerPage === 0`
 * the table shows everything, so we display the full range. With
 * `total === 0` we still show a sensible "0–0 of 0". The words come from
 * `label` (`XTableProps.rangeLabel`); this only computes the numbers.
 */
const formatRange = (
  state: PaginationState,
  total: number,
  label: (first: number, last: number, total: number) => string,
): string => {
  if (total === 0) return label(0, 0, 0);
  if (state.rowsPerPage <= 0) return label(1, total, total);
  const first = (state.page - 1) * state.rowsPerPage + 1;
  const last = Math.min(state.page * state.rowsPerPage, total);
  return label(first, last, total);
};

/**
 * Custom rows-per-page dropdown — a popup-style selector matching the
 * theme on every surface (closed trigger AND the open options panel).
 *
 * Why not `<select>`? The native control's options panel uses the OS's
 * picker UI, which can't be themed. Quasar's QSelect builds its own div-
 * based dropdown for exactly this reason. We do the same on a smaller
 * scale here: a `<button>` trigger plus a conditionally-rendered absolute
 * positioned options list, closed via `registerOutsideClick`.
 */
const renderRowsPerPageSelector = <T>(
  args: PaginationFooterArgs<T>,
): Element => {
  const open = van.state(false);

  const optionItem = (n: number): Element =>
    div(
      {
        class: () =>
          args.pagination.val.rowsPerPage === n
            ? "vx-table__rpp-option vx-table__rpp-option--active"
            : "vx-table__rpp-option",
        onclick: () => {
          args.onRowsPerPageChange(n);
          open.val = false;
        },
      },
      span(
        { class: "vx-table__rpp-check" },
        (): Element =>
          args.pagination.val.rowsPerPage === n
            ? checkIcon("vx-table__icon vx-table__icon--sm")
            : span(),
      ),
      span(n === 0 ? "All" : String(n)),
    );

  const optionsList = (): Element =>
    div(
      {
        class: "vx-table__rpp-menu",
        onclick: (e: MouseEvent) => e.stopPropagation(),
      },
      ...args.rowsPerPageOptions.map(optionItem),
    );

  const wrapper = span(
    { class: "vx-table__rpp" },
    button(
      {
        type: "button",
        class: "vx-table__rpp-trigger",
        onclick: (e: MouseEvent) => {
          e.stopPropagation();
          open.val = !open.val;
        },
      },
      span(
        ((): string =>
          args.pagination.val.rowsPerPage === 0
            ? "All"
            : String(args.pagination.val.rowsPerPage)),
      ),
      span(
        {
          class: () =>
            open.val
              ? "vx-table__rpp-chevron vx-table__rpp-chevron--open"
              : "vx-table__rpp-chevron",
        },
        chevronDownIcon(),
      ),
    ),
    (): Element => (open.val ? optionsList() : span()),
  );

  registerOutsideClick(wrapper, () => {
    if (open.val) open.val = false;
  });

  return wrapper;
};

/**
 * Pagination footer — rows-per-page selector, page indicator, navigation
 * buttons, and (when selection is enabled) a selected-rows-count label on
 * the left.
 */
export const renderPaginationFooter = <T>(
  args: PaginationFooterArgs<T>,
): Element => {
  const btnClass = "vx-table__page-btn";
  return div(
    { class: "vx-table__footer" },
    span(
      { class: "vx-table__footer-label" },
      ((): string =>
        args.selection !== "none" && args.selected.val.length > 0
          ? args.selectedRowsLabel(args.selected.val.length)
          : ""),
    ),
    div(
      { class: "vx-table__footer-nav" },
      span("Records per page:"),
      renderRowsPerPageSelector(args),
      span(
        { class: "vx-table__range" },
        ((): string => formatRange(args.pagination.val, args.totalCount())),
      ),
      () =>
        xButton({
          icon: firstPageIcon(),
          onClick: args.firstPage,
          className: btnClass,
          disabled: args.pagination.val.page <= 1,
        }),
      () =>
        xButton({
          icon: prevPageIcon(),
          onClick: args.prevPage,
          className: btnClass,
          disabled: args.pagination.val.page <= 1,
        }),
      () =>
        xButton({
          icon: nextPageIcon(),
          onClick: args.nextPage,
          className: btnClass,
          disabled: args.pagination.val.page >= args.pagesCount(),
        }),
      () =>
        xButton({
          icon: lastPageIcon(),
          onClick: args.lastPage,
          className: btnClass,
          disabled: args.pagination.val.page >= args.pagesCount(),
        }),
    ),
  );
};
