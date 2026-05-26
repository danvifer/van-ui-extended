import van from "vanjs-core";
import { xButton } from "../../lib/xButton";

const { div, h3, p } = van.tags;

const baseClass =
  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition";

export const xButtonWidget = (): HTMLElement => {
  const lastClicked = van.state("none");

  return div(
    { class: "h-full w-full flex flex-col p-3 gap-2" },
    h3({ class: "text-sm font-semibold text-slate-700" }, "xButton"),
    div(
      { class: "flex flex-wrap gap-2" },
      xButton({
        label: "Primary",
        className: `${baseClass} bg-slate-900 text-white hover:bg-slate-700`,
        onClick: () => (lastClicked.val = "primary"),
      }),
      xButton({
        label: "Secondary",
        className: `${baseClass} border border-slate-300 text-slate-700 hover:bg-slate-100`,
        onClick: () => (lastClicked.val = "secondary"),
      }),
      xButton({
        label: "Disabled",
        disabled: true,
        className: `${baseClass} bg-slate-900 text-white opacity-50 cursor-not-allowed`,
      }),
    ),
    p(
      { class: "text-xs text-slate-500 mt-auto" },
      () => `Last clicked: ${lastClicked.val}`,
    ),
  );
};
