import van from "vanjs-core";
import { TimePickerComponent } from "../../lib/timePicker";

const { div, h3, p } = van.tags;

export const timePickerWidget = (): HTMLElement => {
  const value = van.state("2026-05-26");

  const pickerFactory = TimePickerComponent(
    "demo-timepicker",
    "Pick a date",
    "rounded-md border border-slate-300 px-3 py-2 text-sm",
    value,
  );

  return div(
    { class: "h-full w-full flex flex-col p-3 gap-2" },
    h3({ class: "text-sm font-semibold text-slate-700" }, "TimePickerComponent"),
    div({ class: "flex-1" }, pickerFactory()),
    p(
      { class: "text-xs text-slate-500 mt-auto" },
      () => `Selected: ${value.val}`,
    ),
  );
};
