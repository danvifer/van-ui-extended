import van from "vanjs-core";
import type { EChartsOption } from "echarts";
import { Widget } from "../../lib/widget";

const { div, h3 } = van.tags;

const chartOption: EChartsOption = {
  xAxis: { type: "category", data: ["L", "M", "X", "J", "V"] },
  yAxis: { type: "value" },
  series: [{ type: "bar", data: [120, 200, 150, 80, 70] }],
};

export const widgetWidget = (): HTMLElement =>
  div(
    { class: "h-full w-full flex flex-col p-3 gap-2 overflow-auto" },
    h3({ class: "text-sm font-semibold text-slate-700" }, "Widget (composite)"),
    div(
      { class: "grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1" },
      Widget({
        type: "lastValue",
        widgetConfiguration: {
          value: "412 ppm",
          title: "CO₂",
          subtitle: "MH-Z19B",
        },
      }),
      div(
        { style: "height:200px" },
        Widget({
          type: "chart",
          widgetConfiguration: {
            option: chartOption,
            height: "100%",
          },
        }),
      ),
      Widget({
        type: "table",
        widgetConfiguration: {
          columns: [
            { key: "name", label: "Sensor" },
            { key: "v", label: "Value" },
          ],
          data: van.state([
            { name: "T", v: "23.5 °C" },
            { name: "H", v: "61 %" },
            { name: "P", v: "1013 hPa" },
          ]),
          tableClass:
            "table-auto border-collapse text-xs w-full",
        },
      }),
    ),
  );
