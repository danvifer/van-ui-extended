import van from "vanjs-core";
import type { EChartsOption } from "echarts";
import {
  Widget,
  TableComponent,
  TextAreaComponent,
  Select,
  TimePickerComponent,
  xButton,
  xLastValue,
  xSelect,
  xOption,
  xCodeMirror,
  CronComponent,
} from "./index";

const { header, main, div, button, h1, h2, p, hr, style } = van.tags;
const cronTag = van.tags["cron-expression-input"];

const cardClass =
  "block w-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-4";

// ── Shared chart options for Widget demos ────────────────────
const lineChartOptions: EChartsOption = {
  xAxis: {
    type: "category",
    data: ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"],
  },
  yAxis: { type: "value" },
  series: [{ type: "line", data: [150, 230, 224, 218, 135] }],
};

const barChartOptions: EChartsOption = {
  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
  xAxis: {
    type: "category",
    data: ["Temperatura", "Humedad", "Acelerómetros", "Presión", "GPS"],
  },
  yAxis: { type: "value" },
  series: [
    {
      name: "Eventos IoT",
      type: "bar",
      barWidth: "55%",
      data: [1240, 980, 620, 430, 310],
    },
  ],
};

// ── State values ─────────────────────────────────────────────
const textareaValue = van.state("Hello from TextAreaComponent");
const selectValue = van.state({});
const timeValue = van.state("14:30");
const xSelectValue = van.state("");
const codeMirrorValue = van.state('const greeting = "Hello, world!";\nconsole.log(greeting);');

const sectionTitle = (text: string) =>
  h2({ class: "text-xl font-bold" }, text);

const separator = () =>
  hr({ class: "border-slate-200" });

van.add(
  document.body,
  div(
    { class: "min-h-screen bg-white text-slate-900" },

    header(
      { class: "p-6" },
      h1({ class: "text-2xl font-bold" }, "van-ui-extended — Component Demos"),
    ),

    main(
      { class: "p-6 space-y-10" },

      // ── xButton ────────────────────────────────────────────
      sectionTitle("xButton"),
      div(
        { class: "flex flex-wrap gap-3" },
        xButton({
          label: "Primary",
          className:
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium bg-slate-900 text-white hover:bg-slate-700",
          onClick: () => alert("Primary clicked"),
        }),
        xButton({
          label: "Secondary",
          className:
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-100",
          onClick: () => alert("Secondary clicked"),
        }),
        xButton({
          label: "Disabled",
          disabled: true,
          className:
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium bg-slate-900 text-white disabled:opacity-50 disabled:cursor-not-allowed",
        }),
      ),

      separator(),

      // ── xLastValue ─────────────────────────────────────────
      sectionTitle("xLastValue"),
      div(
        { class: "grid grid-cols-1 sm:grid-cols-3 gap-4" },
        xLastValue({
          value: "23.5 °C",
          title: "Temperatura",
          subtitle: "Sensor DHT22",
        }),
        xLastValue({
          value: "61 %",
          title: "Humedad",
          subtitle: "Sensor DHT22",
        }),
        xLastValue({
          value: "1013 hPa",
          title: "Presión",
          subtitle: "Sensor BMP280",
          onClick: () => alert("Presión clicked"),
        }),
      ),

      separator(),

      // ── TableComponent ─────────────────────────────────────
      sectionTitle("TableComponent"),
      TableComponent({
        columns: [
          { key: "sensor", label: "Sensor" },
          { key: "value", label: "Value" },
          { key: "unit", label: "Unit" },
          { key: "status", label: "Status" },
        ],
        data: [
          { sensor: "Temperatura", value: 23.5, unit: "°C", status: "OK" },
          { sensor: "Humedad", value: 61, unit: "%", status: "OK" },
          { sensor: "Presión", value: 1013, unit: "hPa", status: "OK" },
          { sensor: "CO2", value: 412, unit: "ppm", status: "Warning" },
        ],
        tableClass: "table-auto text-pretty overflow-auto border-collapse text-sm w-full",
      }),

      separator(),

      // ── TextAreaComponent ──────────────────────────────────
      sectionTitle("TextAreaComponent"),
      div(
        { class: cardClass },
        div({class: "text-sky-50"},TextAreaComponent(textareaValue, 120)),
        p(
          { class: "mt-2 text-sm text-slate-500" },
          () => `Value: ${textareaValue.val}`,
        ),
      ),

      separator(),

      // ── xSelect / xOption ──────────────────────────────────
      sectionTitle("xSelect / xOption"),
      div(
        { class: cardClass + " " },
        xSelect(
          {
            searchable: true,
            placeholder: "Choose a device...",
            onSelected: (val: any) => {
              xSelectValue.val = val;
            },
          },
          xOption({ data: "Gateway Alpha", value: "gw-alpha" }),
          xOption({ data: "Gateway Beta", value: "gw-beta" }),
          xOption({ data: "Sensor Node 1", value: "sn-1" }),
          xOption({ data: "Sensor Node 2", value: "sn-2" }),
          xOption({ data: "Actuator A", value: "act-a", disabled: true }),
        ),
        p(
          { class: "mt-2 text-sm text-slate-500" },
          () => `Selected: ${xSelectValue.val || "—"}`,
        ),
      ),

      separator(),

      // ── TimePickerComponent ────────────────────────────────
      sectionTitle("TimePickerComponent"),
      div(
        { class: cardClass },
        TimePickerComponent(
          "demo-time",
          "Pick a time",
          "rounded-md border border-slate-300 px-3 py-2 text-sm",
          timeValue,
        ),
        p(
          { class: "mt-2 text-sm text-slate-500" },
          () => `Time: ${timeValue.val}`,
        ),
      ),

      separator(),

      // ── xCodeMirror ────────────────────────────────────────
      sectionTitle("xCodeMirror"),
      div(
        { class: cardClass },
        xCodeMirror({
          value: codeMirrorValue.val,
          language: "javascript",
        }),
      ),

      separator(),

      // ── Widget: table ──────────────────────────────────────
      h1(
        { class: "text-2xl font-bold pt-10 border-t border-slate-200" },
        "Widget",
      ),

      sectionTitle("Widget: table"),
      Widget({
        type: "table",
        widgetConfiguration: {
          columns: [
            { key: "sensor", label: "Sensor" },
            { key: "value", label: "Value" },
            { key: "unit", label: "Unit" },
          ],
          data: van.state([
            { sensor: "Temperatura", value: 23.5, unit: "°C" },
            { sensor: "Humedad", value: 61, unit: "%" },
            { sensor: "Presión", value: 1013, unit: "hPa" },
            { sensor: "CO2", value: 412, unit: "ppm" },
          ]),
        },
      }),

      // ── Widget: lastValue ──────────────────────────────────
      sectionTitle("Widget: lastValue"),
      Widget({
        type: "lastValue",
        widgetConfiguration: {
          value: "23.5 °C",
          title: "Temperatura",
          subtitle: "Sensor DHT22 — last reading",
        },
      }),

      // ── Widget: chart ──────────────────────────────────────
      sectionTitle("Widget: chart"),
      div(
        { style: "height:400px" },
        Widget({
          type: "chart",
          widgetConfiguration: {
            option: lineChartOptions,
            height: "100%",
          },
        }),
      ),

      // ── Widget: chart (dark) ───────────────────────────────
      sectionTitle("Widget: chart (dark theme)"),
      div(
        { style: "height:400px" },
        Widget({
          type: "chart",
          widgetConfiguration: {
            option: barChartOptions,
            theme: "dark",
            height: "100%",
            className: "border-slate-800 bg-slate-950",
            ariaLabel: "IoT bar widget",
          },
        }),
      ),

      separator(),

      // ── CronComponent ───────────────────────────────────────
      sectionTitle("CronComponent"),
      div(
        { class: cardClass },
        style("cron-expression-input .cronInput input[type='text'] { color: black !important; }"),
        cronTag({ value: "0 */5 * * *", width: "100%", height: "40px", color: "#334155" }),
        p(
          { class: "mt-2 text-sm text-slate-500" },
          "Click the pencil icon to open the cron editor.",
        ),
      ),
    ),
  ),
);
