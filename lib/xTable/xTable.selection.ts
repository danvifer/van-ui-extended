import van from "vanjs-core";
import type { SelectionMode } from "./xTable.types";
import type { Theme } from "./xTable.themes";

const { input, td, th } = van.tags;

const checkboxBase = "w-4 h-4 cursor-pointer";

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
  readonly cellPad: string;
  readonly theme: Theme;
  readonly allVisibleSelected: () => boolean;
  readonly partiallyVisibleSelected: () => boolean;
  readonly toggleAllVisible: () => void;
}

export const renderSelectionHeader = (
  args: SelectionHeaderArgs,
): Element | null => {
  if (args.selection === "none") return null;
  if (args.selection === "single") {
    return th({ class: `${args.cellPad} w-10` });
  }
  const cb = input({
    type: "checkbox",
    class: `${checkboxBase} ${args.theme.selectAccent}`,
    checked: () => args.allVisibleSelected(),
    onchange: () => args.toggleAllVisible(),
  }) as HTMLInputElement;
  van.derive(() => {
    cb.indeterminate = args.partiallyVisibleSelected();
  });
  return th({ class: `${args.cellPad} w-10` }, cb);
};

/** Body cell rendering for the selection column (radio for single, checkbox for multiple). */
export interface SelectionCellArgs<T> {
  readonly selection: SelectionMode;
  readonly cellPad: string;
  readonly theme: Theme;
  readonly row: T;
  readonly isRowSelected: (row: T) => boolean;
  readonly toggleRowSelection: (row: T) => void;
}

export const renderSelectionCell = <T>(
  args: SelectionCellArgs<T>,
): Element | null => {
  if (args.selection === "none") return null;
  const { cellPad, row, isRowSelected, toggleRowSelection } = args;
  const cls = `${checkboxBase} ${args.theme.selectAccent}`;
  if (args.selection === "single") {
    return td(
      { class: `${cellPad} w-10` },
      input({
        type: "radio",
        name: "xtable-single-select",
        class: cls,
        checked: () => isRowSelected(row),
        onchange: () => toggleRowSelection(row),
      }),
    );
  }
  return td(
    { class: `${cellPad} w-10` },
    input({
      type: "checkbox",
      class: cls,
      checked: () => isRowSelected(row),
      onchange: () => toggleRowSelection(row),
    }),
  );
};
