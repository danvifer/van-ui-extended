import van from "vanjs-core";
import { Select } from "../../lib/select";

const { div, h3 } = van.tags;

export const selectWidget = (): HTMLElement => {
  const multipleValues = van.state<string[]>([]);

  return div(
    { class: "h-full w-full flex flex-col p-3 gap-2" },
    h3({ class: "text-sm font-semibold text-slate-700" }, "Select"),
    div(
      { class: "flex-1" },
      Select<string>({
        values: [
          {
            value: "alpha",
            label: "Gateway Alpha",
            description: "OpenGate v3",
          },
          {
            value: "beta",
            label: "Gateway Beta",
            description: "OpenGate v3",
          },
          {
            value: "gamma",
            label: "Gateway Gamma",
            description: "OpenGate v4",
          },
        ],
        multiple: true,
        multipleValues,
        selectClass:
          "w-full text-gray-900 rounded-md border border-slate-300 px-3 py-2 text-sm",
      }),
    ),
  );
};
