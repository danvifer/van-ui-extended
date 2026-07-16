import van, { type State } from "vanjs-core";
import type { PaginationState, SelectionMode } from "./xTable.types";
import type { Theme } from "./xTable.themes";
import { xButton } from "./xButton";
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
  readonly rowsPerPageOptions: readonly number[];
  readonly pagesCount: () => number;
  /** Total row count (either client-side rows length or `rowsNumber` from the server). */
  readonly totalCount: () => number;
  readonly firstPage: () => void;
  readonly prevPage: () => void;
  readonly nextPage: () => void;
  readonly lastPage: () => void;
  readonly onRowsPerPageChange: (rpp: number) => void;
  readonly theme: Theme;
}

/** Theme-agnostic structural classes — shape/padding live in `theme.footerBtn`. */
const pagBtnBase =
  "inline-flex items-center justify-center enabled:cursor-pointer disabled:opacity-50";

/**
 * Quasar-style "1–25 of 100" range indicator. With `rowsPerPage === 0`
 * the table shows everything, so we display the full range. With
 * `total === 0` we still show a sensible "0–0 of 0".
 */
const formatRange = (state: PaginationState, total: number): string => {
  if (total === 0) return "0–0 of 0";
  if (state.rowsPerPage <= 0) return `1–${total} of ${total}`;
  const first = (state.page - 1) * state.rowsPerPage + 1;
  const last = Math.min(state.page * state.rowsPerPage, total);
  return `${first}–${last} of ${total}`;
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
  const t = args.theme;
  const open = van.state(false);

  const optionItem = (n: number): Element =>
    div(
      {
        class: () =>
          `flex items-center gap-2 px-3 py-1.5 cursor-pointer ${t.popoverActionHover} ${
            args.pagination.val.rowsPerPage === n ? "font-medium" : ""
          }`,
        onclick: () => {
          args.onRowsPerPageChange(n);
          open.val = false;
        },
      },
      span(
        { class: "w-3 h-3 inline-flex items-center justify-center" },
        (): Element =>
          args.pagination.val.rowsPerPage === n ? checkIcon("size-3") : span(),
      ),
      span(n === 0 ? "All" : String(n)),
    );

  const optionsList = (): Element =>
    div(
      {
        class: `absolute bottom-full right-0 mb-1 py-1 min-w-[88px] rounded ${t.popoverWrap}`,
        onclick: (e: MouseEvent) => e.stopPropagation(),
      },
      ...args.rowsPerPageOptions.map(optionItem),
    );

  const wrapper = span(
    { class: "relative inline-flex items-center" },
    button(
      {
        type: "button",
        class: `inline-flex items-center gap-1 px-2 py-1 rounded cursor-pointer ${t.popoverActionHover}`,
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
            `inline-flex transition-transform ${open.val ? "rotate-180" : ""}`,
        },
        chevronDownIcon("size-3"),
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
  const t = args.theme;
  const btnClass = `${pagBtnBase} ${t.footerBtn}`;
  return div(
    {
      class: `flex items-center justify-between gap-2 px-2 py-1.5 ${t.footerWrap}`,
    },
    span(
      { class: t.footerSelectedLabel },
      ((): string =>
        args.selection !== "none" && args.selected.val.length > 0
          ? args.selectedRowsLabel(args.selected.val.length)
          : ""),
    ),
    div(
      { class: "flex items-center gap-3" },
      span({ class: "text-inherit" }, "Records per page:"),
      renderRowsPerPageSelector(args),
      span(
        { class: "mx-2 tabular-nums" },
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
