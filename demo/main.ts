import van from "vanjs-core";
import "./styles.css";
import { xDashboard } from "../lib/xDashboard";
import {
  xChartWidget,
  xButtonWidget,
  tableWidget,
  xTableWidget,
  xLastValueWidget,
  xSelectWidget,
  xCodeMirrorWidget,
  widgetWidget,
  textareaWidget,
  timePickerWidget,
  wizardWidget,
  cronWidget,
  selectWidget,
} from "./widgets";

const { div, header, main, h1, p, a, nav } = van.tags;

const isolatedPages: ReadonlyArray<{ label: string; href: string }> = [
  { label: "xDashboard", href: "/demo/pages/xDashboard/" },
  { label: "xChart", href: "/demo/pages/xChart/" },
  { label: "xTable", href: "/demo/pages/xTable/" },
  { label: "xButton", href: "/demo/pages/xButton/" },
  { label: "xLastValue", href: "/demo/pages/xLastValue/" },
  { label: "xSelect", href: "/demo/pages/xSelect/" },
  { label: "xCodeMirror", href: "/demo/pages/xCodeMirror/" },
  { label: "TableComponent", href: "/demo/pages/TableComponent/" },
  { label: "TextAreaComponent", href: "/demo/pages/TextAreaComponent/" },
  { label: "TimePickerComponent", href: "/demo/pages/TimePickerComponent/" },
  { label: "WizardComponent", href: "/demo/pages/WizardComponent/" },
  { label: "CronComponent", href: "/demo/pages/CronComponent/" },
  { label: "Select", href: "/demo/pages/Select/" },
  { label: "Widget", href: "/demo/pages/Widget/" },
];

const navBar = () =>
  nav(
    {
      class:
        "flex flex-wrap gap-x-3 gap-y-1 px-6 py-3 border-b border-slate-200 bg-slate-50",
    },
    a(
      {
        href: "/",
        class:
          "text-sm font-semibold text-slate-900 hover:text-slate-700 underline",
      },
      "Dashboard home",
    ),
    ...isolatedPages.map((p) =>
      a(
        {
          href: p.href,
          class:
            "text-sm font-medium text-slate-600 hover:text-slate-900 underline",
        },
        p.label,
      ),
    ),
  );

const dashboard = xDashboard({
  column: 12,
  cellHeight: 80,
  margin: 8,
  items: [
    { id: "chart", x: 0, y: 0, w: 6, h: 4, content: xChartWidget },
    { id: "table", x: 6, y: 0, w: 6, h: 4, content: tableWidget },
    { id: "lastValue", x: 0, y: 4, w: 6, h: 3, content: xLastValueWidget },
    { id: "buttons", x: 6, y: 4, w: 6, h: 2, content: xButtonWidget },
    { id: "select", x: 6, y: 6, w: 6, h: 3, content: xSelectWidget },
    { id: "textarea", x: 0, y: 7, w: 6, h: 3, content: textareaWidget },
    { id: "timePicker", x: 6, y: 9, w: 6, h: 3, content: timePickerWidget },
    { id: "codeMirror", x: 0, y: 10, w: 6, h: 4, content: xCodeMirrorWidget },
    { id: "wizard", x: 6, y: 12, w: 6, h: 3, content: wizardWidget },
    { id: "cron", x: 0, y: 14, w: 6, h: 3, content: cronWidget },
    { id: "select-multi", x: 6, y: 15, w: 6, h: 4, content: selectWidget },
    { id: "widget", x: 0, y: 17, w: 12, h: 5, content: widgetWidget },
    { id: "xtable", x: 0, y: 22, w: 12, h: 6, content: xTableWidget },
  ],
  onChange: (nodes) => {
    console.log("[xDashboard] layout changed", nodes);
  },
});

van.add(
  document.body,
  div(
    { class: "min-h-screen bg-slate-100 text-slate-900" },
    header(
      { class: "px-6 py-4 bg-white border-b border-slate-200" },
      h1(
        { class: "text-2xl font-bold" },
        "van-ui-extended — Dashboard demo",
      ),
      p(
        { class: "text-sm text-slate-500" },
        "Drag widgets by their content, resize from the bottom-right corner. Layout changes log to the console.",
      ),
    ),
    navBar(),
    main({ class: "p-6" }, dashboard),
  ),
);
