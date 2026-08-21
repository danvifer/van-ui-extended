import van, { type State } from "vanjs-core";
import type { ChildDom } from "vanjs-core";
import type { ExpandedRowScope, RowKey, XColumn } from "./xTable.types";
import { chevronIcon } from "./xTable.icons";

const { span, td, th, tr } = van.tags;

/**
 * Header cell for the expander column. Empty unless the caller fills it through the
 * `expanderHeader` slot, which is there so a table-wide control can live in this gutter
 * rather than in a second one next to it.
 */
export const renderExpanderHeader = (
  cellPad: string,
  hasExpander: boolean,
  content?: ChildDom,
): Element | null =>
  hasExpander
    ? th({ class: `${cellPad} w-10` }, content ?? null)
    : null;

/**
 * Per-row chevron cell. Rotates 90° when the row is expanded. Click toggles
 * the expansion state via the supplied callback.
 */
export const renderExpanderCell = <T>(args: {
  readonly row: T;
  readonly cellPad: string;
  readonly hasExpander: boolean;
  readonly isRowExpanded: (row: T) => boolean;
  readonly toggleRowExpansion: (row: T) => void;
}): Element | null => {
  if (!args.hasExpander) return null;
  return td(
    { class: `${args.cellPad} w-10` },
    span(
      {
        class: "inline-flex items-center justify-center cursor-pointer p-1",
        onclick: () => args.toggleRowExpansion(args.row),
      },
      (): Element => {
        const open = args.isRowExpanded(args.row);
        const icon = chevronIcon() as HTMLElement;
        icon.style.transform = open ? "rotate(90deg)" : "rotate(0deg)";
        icon.style.transition = "transform 150ms ease";
        return icon;
      },
    ),
  );
};

/**
 * Detail row rendered below the parent when `slots.expandedRow` is set.
 * Spans every visible column (selection / expander / data) so the slot
 * gets the full table width.
 */
export const renderExpandedRow = <T>(args: {
  readonly row: T;
  readonly rowKey: RowKey;
  readonly cols: readonly XColumn<T>[];
  readonly totalCol: number;
  readonly slot: (scope: ExpandedRowScope<T>) => Parameters<typeof td>[1];
  readonly toggleRowExpansion: (row: T) => void;
  /** Theme token controlling the expanded row's background + text color. */
  readonly expandedRowClass: string;
}): Element => {
  const expandState = van.state(true);
  return tr(
    { class: args.expandedRowClass },
    td(
      {
        colSpan: String(args.totalCol),
        class: "p-4",
      },
      args.slot({
        row: args.row,
        rowKey: args.rowKey,
        cols: args.cols,
        expand: expandState as State<boolean>,
        toggle: () => args.toggleRowExpansion(args.row),
      }),
    ),
  );
};
