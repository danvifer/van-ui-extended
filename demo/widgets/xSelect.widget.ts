import van from "vanjs-core";
import { xSelect, xOption } from "../../lib/xSelect";

const { div, h3, p } = van.tags;

export const xSelectWidget = (): HTMLElement => {
  const selected = van.state<string>("");

  return div(
    { class: "h-full w-full flex flex-col p-3 gap-2" },
    h3({ class: "text-sm font-semibold text-slate-700" }, "xSelect / xOption"),
    xSelect(
      {
        searchable: true,
        placeholder: "Choose a device…",
        onSelected: (val: unknown) => {
          selected.val = String(val ?? "");
        },
      },
      xOption({ data: "Gateway Alpha", value: "gw-alpha" }),
      xOption({ data: "Gateway Beta", value: "gw-beta" }),
      xOption({ data: "Sensor Node 1", value: "sn-1" }),
      xOption({ data: "Sensor Node 2", value: "sn-2" }),
      xOption({ data: "Actuator A", value: "act-a", disabled: true }),
    ),
    p(
      { class: "text-xs text-slate-500 mt-auto" },
      () => `Selected: ${selected.val || "—"}`,
    ),
  );
};
