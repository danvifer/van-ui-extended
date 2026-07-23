import van from "vanjs-core";
import { computeWindow } from "./xTable.virtualScroll";

const { td, tr } = van.tags;

/**
 * Inputs to `buildBodyRows`. The xTable factory wires its component-scoped
 * state into this once per render-derive cycle. Keeping this a free
 * function (not a closure) lets the file shrink and the test surface stay
 * surgical.
 */
export interface BuildBodyRowsArgs<T> {
  readonly loading: boolean;
  readonly visibleRows: readonly T[];
  readonly renderLoadingBody: () => Element;
  readonly renderNoDataBody: () => Element;
  readonly renderDataRow: (row: T) => Element;
  readonly hasExpander: boolean;
  readonly isRowExpanded: (row: T) => boolean;
  readonly renderExpandedRow: (row: T) => Element;
  readonly virtualScrollOn: boolean;
  readonly viewportScrollTop: number;
  readonly vsContainerHeight: number;
  readonly vsItemSize: number;
  readonly vsSliceSize: number;
  readonly vsStickyStart: number;
  readonly vsStickyEnd: number;
}

/**
 * Produce the `<tr>` children of the table body. Three modes:
 *   - loading        → loading slot/label
 *   - empty          → no-data slot/label
 *   - virtual scroll → top-spacer + windowed slice + bottom-spacer
 *   - default        → one row per visibleRows entry, plus expanded rows
 */
export const buildBodyRows = <T>(
  args: BuildBodyRowsArgs<T>,
): readonly Element[] => {
  if (args.loading) return [args.renderLoadingBody()];
  const list = args.visibleRows;
  if (list.length === 0) return [args.renderNoDataBody()];

  if (args.virtualScrollOn) {
    const w = computeWindow({
      scrollTop: args.viewportScrollTop,
      containerHeight: args.vsContainerHeight,
      itemSize: args.vsItemSize,
      sliceSize: args.vsSliceSize,
      rowCount: list.length,
      stickyStart: args.vsStickyStart,
      stickyEnd: args.vsStickyEnd,
    });
    const out: Element[] = [];
    if (w.paddingTop > 0) out.push(tr({ style: `height:${w.paddingTop}px` }, td()));
    for (let i = w.startIndex; i < w.endIndex; i += 1) {
      const row = list[i];
      out.push(args.renderDataRow(row));
      if (args.hasExpander && args.isRowExpanded(row)) {
        out.push(args.renderExpandedRow(row));
      }
    }
    if (w.paddingBottom > 0) out.push(tr({ style: `height:${w.paddingBottom}px` }, td()));
    return out;
  }

  const out: Element[] = [];
  for (const row of list) {
    out.push(args.renderDataRow(row));
    if (args.hasExpander && args.isRowExpanded(row)) {
      out.push(args.renderExpandedRow(row));
    }
  }
  return out;
};
