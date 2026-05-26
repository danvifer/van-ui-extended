import van from "vanjs-core";
import type { EChartsOption } from "echarts";
import { xChart } from "../../lib/xChart";

const { div, h3 } = van.tags;

const lineOption: EChartsOption = {
  title: { text: "IoT events / day", left: "center", textStyle: { fontSize: 14 } },
  tooltip: { trigger: "axis" },
  grid: { left: 40, right: 16, top: 40, bottom: 30 },
  xAxis: {
    type: "category",
    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  yAxis: { type: "value" },
  series: [
    {
      name: "Events",
      type: "line",
      smooth: true,
      data: [1240, 1320, 1180, 1430, 1610, 980, 870],
    },
  ],
};

export const xChartWidget = (): HTMLElement =>
  div(
    { class: "h-full w-full flex flex-col" },
    h3(
      { class: "text-sm font-semibold text-slate-700 px-2 pt-2" },
      "xChart",
    ),
    div(
      { class: "flex-1 min-h-0" },
      xChart({ options: lineOption, height: "100%", width: "100%" }),
    ),
  );
