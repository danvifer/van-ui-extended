/**
 * Pure windowing math for xTable's virtual-scroll mode. Returns the indices
 * to render and the spacer sizes that keep the scrollbar geometry honest.
 *
 * Why a pure function: this is the only piece of virtual-scroll logic worth
 * testing in isolation — the DOM wiring is straightforward but the index/
 * padding arithmetic gets fiddly at the edges (top, bottom, sticky bands).
 *
 * @example
 *   const { startIndex, endIndex, paddingTop, paddingBottom } = computeWindow({
 *     scrollTop: 320,
 *     containerHeight: 480,
 *     itemSize: 32,
 *     sliceSize: 30,
 *     rowCount: 10_000,
 *     stickyStart: 0,
 *     stickyEnd: 0,
 *   })
 */
export interface ComputeWindowArgs {
  /** Current `scrollTop` of the scrollable viewport, in px. */
  readonly scrollTop: number;
  /** Visible viewport height, in px. */
  readonly containerHeight: number;
  /** Pixel height of each row. Assumed uniform. */
  readonly itemSize: number;
  /**
   * Maximum number of rows the caller wants in the live DOM slice (excluding
   * over-render). The implementation may render up to `2 * sliceSize` rows
   * to absorb fast scrolls without exposing the spacer band.
   */
  readonly sliceSize: number;
  /** Total number of rows the viewport scrolls through. */
  readonly rowCount: number;
  /** Extra px reserved above the viewport for sticky content. */
  readonly stickyStart: number;
  /** Extra px reserved below the viewport for sticky content. */
  readonly stickyEnd: number;
}

export interface WindowResult {
  /** Inclusive index of the first rendered row. */
  readonly startIndex: number;
  /** Exclusive index of the row past the last rendered row. */
  readonly endIndex: number;
  /** Top spacer height in px — keeps the scrollbar positioned correctly. */
  readonly paddingTop: number;
  /** Bottom spacer height in px — keeps the scrollbar length honest. */
  readonly paddingBottom: number;
}

const clamp = (value: number, min: number, max: number): number =>
  value < min ? min : value > max ? max : value;

/**
 * Compute the visible slice + spacers for a virtualized list.
 *
 * Over-renders `sliceSize / 2` rows above and below the viewport to smooth
 * fast scrolls. Bounds are clamped: never returns a negative startIndex and
 * never returns an endIndex past `rowCount`. Sticky bands shrink the
 * effective viewport when present.
 */
export function computeWindow(args: ComputeWindowArgs): WindowResult {
  const {
    scrollTop,
    containerHeight,
    itemSize,
    sliceSize,
    rowCount,
    stickyStart,
    stickyEnd,
  } = args;

  if (rowCount <= 0 || itemSize <= 0) {
    return {
      startIndex: 0,
      endIndex: 0,
      paddingTop: 0,
      paddingBottom: 0,
    };
  }

  const effectiveScroll = Math.max(0, scrollTop - stickyStart);
  const effectiveViewport = Math.max(0, containerHeight - stickyStart - stickyEnd);
  const visibleCount = Math.ceil(effectiveViewport / itemSize);
  const overscan = Math.max(1, Math.floor(sliceSize / 2));

  const firstVisible = Math.floor(effectiveScroll / itemSize);
  const startIndex = clamp(firstVisible - overscan, 0, Math.max(0, rowCount - 1));
  const renderBudget = Math.max(sliceSize, visibleCount + overscan * 2);
  const endIndex = clamp(startIndex + renderBudget, 0, rowCount);

  const paddingTop = startIndex * itemSize;
  const paddingBottom = (rowCount - endIndex) * itemSize;

  return { startIndex, endIndex, paddingTop, paddingBottom };
}
