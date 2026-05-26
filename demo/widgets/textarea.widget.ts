import van from "vanjs-core";
import { TextAreaComponent } from "../../lib/textarea";

const { div, h3, p } = van.tags;

export const textareaWidget = (): HTMLElement => {
  const value = van.state("Hello from TextAreaComponent");

  return div(
    { class: "h-full w-full flex flex-col p-3 gap-2" },
    h3({ class: "text-sm font-semibold text-slate-700" }, "TextAreaComponent"),
    div(
      { class: "flex-1 min-h-0 text-slate-900" },
      TextAreaComponent(value, 120),
    ),
    p(
      { class: "text-xs text-slate-500 mt-auto" },
      () => `Length: ${value.val.length}`,
    ),
  );
};
