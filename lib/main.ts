import van from "vanjs-core";
import type { EChartsOption } from "echarts";
import { xChart } from "./xChart";

const { header, main, div, button, h1, h2, p } = van.tags;

const chartCardClass =
  "block w-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden";

const basicOptions: EChartsOption = {
  xAxis: {
    type: "category",
    data: ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"],
  },
  yAxis: { type: "value" },
  series: [{ type: "line", data: [150, 230, 224, 218, 135] }],
};

const reactiveValues = van.state([120, 200, 150, 80, 70]);

const reactiveOptions = van.derive<EChartsOption>(() => ({
  xAxis: {
    type: "category",
    data: ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"],
  },
  yAxis: { type: "value" },
  series: [{ type: "line", data: reactiveValues.val }],
}));

const lastEvent = van.state("—");

const eventOptions: EChartsOption = {
  legend: { data: ["Sales"] },
  xAxis: {
    type: "category",
    data: ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"],
  },
  yAxis: { type: "value" },
  series: [{ name: "Sales", type: "line", data: [120, 200, 150, 80, 70] }],
};

const themeOptions: EChartsOption = {
  tooltip: {},
  xAxis: { type: "category", data: ["1", "2", "3", "4"] },
  yAxis: { type: "value" },
  series: [{ type: "line", data: [120, 180, 90, 210] }],
};

const donutOptions: EChartsOption = {
  tooltip: {
    trigger: "item",
    formatter: "{b}: {c} ({d}%)",
  },
  legend: {
    bottom: "0",
  },
  series: [
    {
      name: "Datos IoT",
      type: "pie",
      radius: ["45%", "70%"],
      avoidLabelOverlap: false,
      label: {
        show: true,
        formatter: "{b}\n{d}%",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: true,
      },
      data: [
        { value: 1240, name: "Sensores de temperatura" },
        { value: 980, name: "Sensores de humedad" },
      ],
    },
  ],
};

const iotBarOptions: EChartsOption = {
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "shadow" },
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    data: ["Temperatura", "Humedad", "Acelerómetros", "Presión", "GPS"],
    axisLabel: {
      rotate: 20,
    },
  },
  yAxis: {
    type: "value",
  },
  series: [
    {
      name: "Eventos IoT",
      type: "bar",
      barWidth: "55%",
      data: [1240, 980, 620, 430, 310],
    },
  ],
};

const showChart = van.state(true);

const lifecycleOptions: EChartsOption = {
  xAxis: { type: "category", data: ["1", "2", "3", "4"] },
  yAxis: { type: "value" },
  series: [{ type: "line", data: [5, 20, 36, 10] }],
};

const iotCustomTheme = {
  backgroundColor: "#113604",
  textStyle: {
    color: "#ac2bb8",
  },
  title: {
    textStyle: {
      color: "#b9d81c",
    },
  },
  legend: {
    textStyle: {
      color: "#db1414",
    },
  },
  categoryAxis: {
    axisLine: {
      lineStyle: { color: "#4daa4f" },
    },
    axisLabel: {
      color: "#e615c0",
    },
  },
  valueAxis: {
    axisLine: {
      lineStyle: { color: "#371546" },
    },
    splitLine: {
      lineStyle: { color: "#075d61" },
    },
    axisLabel: {
      color: "#d3870b",
    },
  },
};

van.add(
  document.body,
  div(
    { class: "min-h-screen bg-white text-slate-900" },

    header({ class: "p-6" }, h1({ class: "text-2xl font-bold" }, "xChart")),

    main(
      { class: "p-6 space-y-10" },

      h2({ class: "text-xl font-bold" }, "Basic"),
      xChart({
        options: basicOptions,
        height: "300px",
        className: chartCardClass,
      }),

      h2({ class: "text-xl font-bold" }, "Reactive"),
      button(
        {
          class: "px-3 py-2 rounded bg-slate-900 text-white",
          onclick: () => {
            reactiveValues.val = reactiveValues.val.map(
              (v) => v + Math.round(Math.random() * 40 - 20),
            );
          },
        },
        "Datos aleatorios",
      ),
      xChart({
        options: reactiveOptions,
        height: "320px",
        className: chartCardClass,
      }),

      h2({ class: "text-xl font-bold" }, "Dark theme"),
      xChart({
        options: themeOptions,
        height: "320px",
        ariaLabel: "Theme chart",
        className: "border-slate-800 bg-slate-950",
        theme: "dark",
      }),

      h2({ class: "text-xl font-bold" }, "Custom theme"),
      xChart({
        options: iotBarOptions,
        height: "340px",
        ariaLabel: "IoT bar chart with custom theme",
        className: "rounded-xl overflow-hidden",
        theme: iotCustomTheme,
      }),

      h2({ class: "text-xl font-bold" }, "Events"),
      div({ class: "text-sm text-slate-600" }, () => `${lastEvent.val}`),
      xChart({
        options: eventOptions,
        height: "320px",
        className: chartCardClass,
        events: {
          click: (p) => {
            lastEvent.val = `value ${p?.value}`;
          },
        },
      }),
      h2({ class: "text-xl font-bold" }, "Doughnut"),
      xChart({
        options: donutOptions,
        height: "360px",
        className: chartCardClass,
      }),
      h2({ class: "text-xl font-bold" }, "Bar with events in console"),
      xChart({
        options: iotBarOptions,
        height: "340px",
        ariaLabel: "Eventos IoT",
        className: chartCardClass,
        events: {
          click: (p) => console.log("Sensor:", p.name, "Eventos:", p.value),
        },
      }),
      h2({ class: "text-xl font-bold" }, "5) Lifecycle / dispose"),
      button(
        {
          class: "px-3 py-2 rounded bg-slate-900 text-white",
          onclick: () => (showChart.val = !showChart.val),
        },
        () => (showChart.val ? "Unmount chart" : "Mount chart"),
      ),
      () =>
        showChart.val
          ? xChart({
              options: lifecycleOptions,
              height: "280px",
              ariaLabel: "Lifecycle chart",
              onInit: (c) => console.log("mounted:", c),
            })
          : div({ class: "text-sm text-slate-500" }, "Chart unmounted"),
    ),
  ),
);
