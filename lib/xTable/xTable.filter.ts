import van, { type State } from "vanjs-core";
import type { XColumn } from "./xTable.types";
import type { Theme } from "./xTable.themes";
import { xButton } from "../xButton";
import {
  checkIcon,
  filterIcon,
  filteredIcon,
  xIcon,
} from "./xTable.icons";

const { div, input, option, select, span } = van.tags;

/**
 * Internal per-column popover state. Lives in the `xTable` component's
 * closure (one `PopoverCtx` per filterable column), never on the
 * caller-provided `XColumn` object.
 *
 * Each field is a **separate** `State<T>` so VanJS can track reads at
 * field granularity. Mutating one field does NOT invalidate readers of
 * the others — critical for the popover's `<input>`, which would otherwise
 * lose focus every keystroke because the parent's "should the popover be
 * mounted?" derivation re-fires and rebuilds the whole popover subtree.
 *
 * - `open`         : whether the popover is mounted in the DOM
 * - `draftValue`   : text currently typed/selected in the popover control
 * - `appliedValue` : text that's actively filtering rows (set on Apply)
 */
export interface PopoverCtx {
  open: State<boolean>;
  draftValue: State<string>;
  appliedValue: State<string>;
}

/** Inputs needed to render a column's popover. */
export interface ColumnFilterArgs<T> {
  readonly col: XColumn<T>;
  readonly st: PopoverCtx;
  readonly theme: Theme;
  /**
   * Lazy accessor for the distinct values rendered as `<option>`s by the
   * `"select"` filter kind. Implemented by the xTable factory which knows
   * how to read `rows.val` reactively; called only when the popover is
   * open, and only for `"select"` columns.
   */
  readonly distinctValues?: () => readonly string[];
  /**
   * Horizontal anchor for the popover. `"right"` (default) extends the
   * popover leftward from the trigger — good for non-leftmost columns.
   * `"left"` extends it rightward, which the leftmost data column needs
   * to avoid running off the page or being clipped by an ancestor's
   * `overflow: hidden`.
   */
  readonly anchor?: "left" | "right";
}

const popoverWrapperBase =
  "absolute z-50 top-full mt-1 p-3 rounded-md min-w-[200px]";

const fieldBase = "block w-full px-2 py-1 rounded focus:outline-none";

const actionBtnBase =
  "inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm cursor-pointer";

/** Text input variant — case-insensitive substring match downstream. */
const renderBasicControl = <T>(
  col: XColumn<T>,
  st: PopoverCtx,
  theme: Theme,
): Element =>
  input({
    type: "text",
    placeholder:
      typeof col.label === "string" ? col.label : `Filter ${col.key}`,
    class: `${fieldBase} ${theme.popoverInput}`,
    value: () => st.draftValue.val,
    oninput: (e: Event) => {
      st.draftValue.val = (e.target as HTMLInputElement).value;
    },
  });

/**
 * Dropdown variant — exact match against one of the column's distinct values.
 *
 * Options are built from a snapshot of `distinctValues()` at popover-open
 * time. If `rows.val` changes while the popover is open, the option list
 * stays put until the popover closes and reopens. Re-evaluating
 * `distinctValues()` reactively requires re-rendering the entire `<select>`
 * (you can't reactively inject `<option>` children — wrapping them in a
 * reactive node produces invalid HTML that browsers silently strip).
 */
const renderSelectControl = <T>(
  _col: XColumn<T>,
  st: PopoverCtx,
  distinctValues: () => readonly string[],
  theme: Theme,
): Element => {
  const opts = distinctValues();
  return select(
    {
      class: `${fieldBase} ${theme.popoverInput}`,
      onchange: (e: Event) => {
        st.draftValue.val = (e.target as HTMLSelectElement).value;
      },
    },
    option(
      { value: "", selected: () => st.draftValue.val === "" },
      "(All)",
    ),
    ...opts.map((v) =>
      option(
        { value: v, selected: () => st.draftValue.val === v },
        v,
      ),
    ),
  );
};

/**
 * Render the popover body: input + Clear/Apply buttons. The input control
 * varies by `col.columnFilter`: text for `"basic"`, dropdown for `"select"`.
 * `e.stopPropagation()` keeps the outside-click delegate from closing the
 * popover while the user is interacting with it.
 */
const renderPopover = <T>(args: ColumnFilterArgs<T>): Element => {
  const { col, st, theme } = args;
  const anchorClass = args.anchor === "left" ? "left-0" : "right-0";
  const control =
    col.columnFilter === "select" && args.distinctValues
      ? renderSelectControl(col, st, args.distinctValues, theme)
      : renderBasicControl(col, st, theme);
  const actionBtn = `${actionBtnBase} ${theme.popoverActionHover}`;
  return div(
    {
      class: `${popoverWrapperBase} ${anchorClass} ${theme.popoverWrap}`,
      onclick: (e: MouseEvent) => e.stopPropagation(),
    },
    control,
    div(
      { class: "flex justify-between mt-2 gap-2" },
      xButton({
        label: "Clear",
        icon: xIcon(),
        onClick: () => {
          st.draftValue.val = "";
          st.appliedValue.val = "";
          st.open.val = false;
        },
        className: actionBtn,
      }),
      xButton({
        label: "Apply",
        icon: checkIcon(),
        onClick: () => {
          st.appliedValue.val = st.draftValue.val;
          st.open.val = false;
        },
        className: actionBtn,
      }),
    ),
  );
};

/**
 * Render the column-filter trigger (icon button) and the popover body when
 * the column declares `columnFilter`. Returns `null` for columns without
 * the feature so the header cell remains untouched.
 */
export const renderColumnFilterButton = <T>(
  args: ColumnFilterArgs<T> | { col: XColumn<T>; st: undefined; theme: Theme },
): Element | null => {
  if (!args.st) return null;
  const st = args.st;
  const triggerClass = `p-1 rounded cursor-pointer ${args.theme.popoverActionHover} focus:outline-none`;
  return span(
    { class: "relative inline-flex items-center ml-2" },
    xButton({
      icon: (): Element => (st.appliedValue.val ? filteredIcon() : filterIcon()),
      onClick: (e: MouseEvent) => {
        e.stopPropagation();
        st.draftValue.val = st.appliedValue.val;
        st.open.val = !st.open.val;
      },
      className: triggerClass,
    }),
    (): Element =>
      st.open.val
        ? renderPopover(args as ColumnFilterArgs<T>)
        : span(),
  );
};
