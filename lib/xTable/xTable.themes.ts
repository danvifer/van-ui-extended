/**
 * Theme tokens for xTable. Each entry is a Tailwind class string that the
 * renderer applies to one structural element. Adding a new theme means
 * filling in every token below — `resolveTheme(name)` picks them up
 * automatically.
 *
 * The `selectAccent` and ring/focus tokens reference a CSS variable
 * `--xtable-primary` so caller pages can override the brand color without
 * recompiling Tailwind. The variable falls back to a sensible default
 * inside the `var(...)` expression so callers who skip the override still
 * get a usable look.
 */
export type ThemeName = "dark" | "material";

export interface Theme {
  /** Class on the outer wrapper (cosmetic shadow). */
  readonly shadow: string;
  /** Border color when `bordered: true`. */
  readonly borderWhenBordered: string;
  /** Class on `<thead>`. */
  readonly thead: string;
  /** Class on `<tbody>`. */
  readonly tbody: string;
  /**
   * Background class for the optional filter row rendered inside the sticky
   * `<thead>` (see `XTableProps.filterRow`). Should match the thead
   * background so the pinned filter row reads as part of the header.
   */
  readonly filterRowBg: string;
  /** Class on each body `<tr>` (hover affordance). */
  readonly rowHover: string;
  /** Class on each header/body cell border (bottom rule). */
  readonly cellBorder: string;
  /** Text color used for empty/loading placeholder rows. */
  readonly emptyText: string;
  /** Wrapper class for the column filter popover. */
  readonly popoverWrap: string;
  /** Input / select control class inside the popover. */
  readonly popoverInput: string;
  /** Hover class for popover Clear/Apply buttons. */
  readonly popoverActionHover: string;
  /** Pagination footer wrapper class. */
  readonly footerWrap: string;
  /** Selected-rows label class (left side of the footer). */
  readonly footerSelectedLabel: string;
  /** Pagination rows-per-page <select> class. */
  readonly footerSelect: string;
  /** Pagination navigation button class (icon-only). */
  readonly footerBtn: string;
  /** Checkbox/radio `accent-color` class for selection cells. */
  readonly selectAccent: string;
  /** Row class for the expanded-row body. */
  readonly expandedRow: string;
}

const dark: Theme = {
  shadow: "shadow-sm",
  borderWhenBordered: "border-stone-700",
  thead: "bg-stone-900 text-stone-200 uppercase",
  tbody: "bg-stone-800 text-stone-200",
  filterRowBg: "bg-stone-900",
  rowHover: "hover:bg-stone-900",
  cellBorder: "border-b border-stone-700/40",
  emptyText: "text-stone-400",
  popoverWrap: "bg-stone-800 border border-stone-700 shadow-lg",
  popoverInput: "bg-stone-700 text-stone-100 focus:ring-1 focus:ring-teal-500",
  popoverActionHover: "hover:bg-stone-700 text-stone-200",
  footerWrap:
    "shrink-0 text-stone-300 bg-stone-900 border-t border-stone-700 text-sm",
  footerSelectedLabel: "text-stone-400",
  footerSelect: "bg-stone-800 border border-stone-700 text-stone-200",
  footerBtn: "rounded-md px-2 py-1 enabled:hover:bg-stone-700 text-stone-300",
  selectAccent: "accent-teal-600",
  expandedRow: "bg-stone-900 text-stone-300",
};

const material: Theme = {
  // Material elevation 1 — subtle drop shadow.
  shadow: "shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)]",
  borderWhenBordered: "border-slate-200",
  thead:
    "bg-white text-slate-600 font-medium text-xs tracking-wider border-b border-slate-200",
  tbody: "bg-white",
  filterRowBg: "bg-white",
  rowHover: "hover:bg-slate-50 transition-colors",
  cellBorder: "border-b border-slate-100",
  emptyText: "text-slate-500",
  popoverWrap: "bg-white border border-slate-200 shadow-lg text-slate-800",
  popoverInput:
    "bg-white border border-slate-300 text-slate-800 focus:border-[var(--xtable-primary,#1976d2)] focus:ring-1 focus:ring-[var(--xtable-primary,#1976d2)]",
  popoverActionHover: "hover:bg-slate-100 text-slate-700",
  footerWrap:
    "shrink-0 text-slate-600 bg-white border-t border-slate-200 text-[12px] leading-tight",
  footerSelectedLabel: "text-slate-500",
  footerSelect:
    "bg-transparent border-0 text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--xtable-primary,#1976d2)]",
  footerBtn:
    "rounded-full w-8 h-8 text-slate-700 enabled:hover:bg-slate-100 transition-colors",
  selectAccent: "accent-[var(--xtable-primary,#1976d2)]",
  expandedRow: "bg-slate-50 text-slate-700",
};

const themes: Record<ThemeName, Theme> = { dark, material };

/** Resolve a theme name to its token bundle. Unknown names fall back to dark. */
export const resolveTheme = (name?: ThemeName): Theme =>
  themes[name ?? "dark"];
