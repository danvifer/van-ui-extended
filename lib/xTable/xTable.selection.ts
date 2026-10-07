import van from "vanjs-core";
import type { SelectionMode } from "./xTable.types";

const { input, td, th } = van.tags;

/**
 * Header cell for the selection column.
 *
 * - `"none"`     → no column rendered (returns `null`)
 * - `"single"`   → empty placeholder cell (radio mode has no "select all")
 * - `"multiple"` → checkbox whose `checked` reflects "all visible rows
 *   selected" and whose `indeterminate` is true when partially selected.
 *
 * The indeterminate flag is a DOM property (not an HTML attribute), so it
 * is set imperatively inside a `van.derive` to keep it in sync.
 */
export interface SelectionHeaderArgs {
  readonly selection: SelectionMode;
  readonly allVisibleSelected: () => boolean;
  readonly partiallyVisibleSelected: () => boolean;
  readonly toggleAllVisible: () => void;
}

export const renderSelectionHeader = (
  args: SelectionHeaderArgs,
): Element | null => {
  if (args.selection === "none") return null;
  if (args.selection === "single") {
    return th({ class: "vx-table__select-cell" });
  }
  const cb = input({
    type: "checkbox",
    class: "vx-table__checkbox",
    checked: () => args.allVisibleSelected(),
    onchange: () => args.toggleAllVisible(),
  }) as HTMLInputElement;
  van.derive(() => {
    cb.indeterminate = args.partiallyVisibleSelected();
  });
  return th({ class: "vx-table__select-cell" }, cb);
};

/** Body cell rendering for the selection column (radio for single, checkbox for multiple). */
export interface SelectionCellArgs<T> {
  readonly selection: SelectionMode;
  readonly row: T;
  readonly isRowSelected: (row: T) => boolean;
  readonly toggleRowSelection: (row: T) => void;
}

export const renderSelectionCell = <T>(
  args: SelectionCellArgs<T>,
): Element | null => {
  if (args.selection === "none") return null;
  const { row, isRowSelected, toggleRowSelection } = args;
  if (args.selection === "single") {
    return td(
      { class: "vx-table__select-cell" },
      input({
        type: "radio",
        name: "xtable-single-select",
        class: "vx-table__checkbox",
        checked: () => isRowSelected(row),
        onchange: () => toggleRowSelection(row),
      }),
    );
  }
  return td(
    { class: "vx-table__select-cell" },
    input({
      type: "checkbox",
      class: "vx-table__checkbox",
      checked: () => isRowSelected(row),
      onchange: () => toggleRowSelection(row),
    }),
  );
};
