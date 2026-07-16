import van from "vanjs-core";

const { svg, path, circle } = van.tags("http://www.w3.org/2000/svg");

const baseSvgAttrs = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  "stroke-width": "1.5",
  stroke: "currentColor",
} as const;

/**
 * Each icon below is a **factory** — calling it returns a fresh `<svg>` node.
 * The legacy `lib/table.ts` held module-level SVG singletons and relied on
 * `icon.cloneNode(true)` at every render site. Factories avoid that footgun:
 * the caller never has to remember to clone, and each consumer gets its own
 * node that can be safely mounted multiple times.
 */
const sizedSvg = (size: string, d: string): Element =>
  svg(
    { ...baseSvgAttrs, class: size },
    path({ "stroke-linecap": "round", "stroke-linejoin": "round", d }),
  ) as unknown as Element;

/** Sort ascending (used in active header cell). */
export const ascIcon = (): Element =>
  sizedSvg(
    "size-4",
    "M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12",
  );

/** Sort descending (used in active header cell). */
export const descIcon = (): Element =>
  sizedSvg(
    "size-4",
    "M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25",
  );

/** Filter — empty state (no filter applied to this column). */
export const filterIcon = (): Element =>
  sizedSvg(
    "size-4",
    "M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z",
  );

/** Filter — active state (filter currently applied). */
export const filteredIcon = (): Element =>
  sizedSvg(
    "size-4",
    "M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5",
  );

/** X / close — used in popover Clear button. */
export const xIcon = (): Element =>
  sizedSvg("size-4", "M6 18 18 6M6 6l12 12");

/** Checkmark — used in popover Apply button and selected-option indicator. */
export const checkIcon = (size: string = "size-4"): Element =>
  sizedSvg(size, "m4.5 12.75 6 6 9-13.5");

/** Right-pointing chevron — used on the expander column trigger. */
export const chevronIcon = (): Element =>
  sizedSvg("size-4", "m8.25 4.5 7.5 7.5-7.5 7.5");

/** Down-pointing chevron — used on dropdown triggers (rotates 180° when open). */
export const chevronDownIcon = (size: string = "size-3"): Element =>
  sizedSvg(size, "m19.5 8.25-7.5 7.5-7.5-7.5");

/** Pagination — go to first page (double-left chevron). */
export const firstPageIcon = (): Element =>
  sizedSvg("size-4", "M18.75 19.5 11.25 12l7.5-7.5M12.75 19.5 5.25 12l7.5-7.5");

/** Pagination — previous page (single-left chevron). */
export const prevPageIcon = (): Element =>
  sizedSvg("size-4", "M15.75 19.5 8.25 12l7.5-7.5");

/** Pagination — next page (single-right chevron). */
export const nextPageIcon = (): Element =>
  sizedSvg("size-4", "m8.25 4.5 7.5 7.5-7.5 7.5");

/** Pagination — go to last page (double-right chevron). */
export const lastPageIcon = (): Element =>
  sizedSvg("size-4", "m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5");

/**
 * Material-style indeterminate circular spinner.
 *
 * A faint full-circle behind a bright quarter-arc, both stroked in
 * `currentColor`. Tailwind's `animate-spin` (a 1s linear infinite rotation
 * baked into the framework) is applied to the SVG itself — no custom
 * `<style>` block needed.
 *
 * @param size - Tailwind sizing class. Defaults to `"size-5"` (1.25rem),
 *               which lines up nicely with adjacent text at `text-sm`/`text-base`.
 */
export const spinnerIcon = (size: string = "size-5"): Element =>
  svg(
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "none",
      class: `animate-spin ${size}`,
    },
    circle({
      cx: "12",
      cy: "12",
      r: "10",
      stroke: "currentColor",
      "stroke-opacity": "0.25",
      "stroke-width": "3",
    }),
    path({
      d: "M12 2a10 10 0 0 1 10 10",
      stroke: "currentColor",
      "stroke-width": "3",
      "stroke-linecap": "round",
    }),
  ) as unknown as Element;
