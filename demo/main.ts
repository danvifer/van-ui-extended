import van from "vanjs-core";
import "./styles.css";
import { xDashboard } from "../lib/xDashboard";
import {
  xChartWidget,
  xButtonWidget,
  tableWidget,
} from "./widgets";

const { div, header, main, h1, p, a, nav } = van.tags;

const isolatedPages: ReadonlyArray<{ label: string; href: string }> = [
  { label: "xDashboard", href: "/demo/pages/xDashboard/" },
];

const navBar = () =>
  nav(
    {
      class:
        "flex flex-wrap gap-2 px-6 py-3 border-b border-slate-200 bg-slate-50",
    },
    a(
      {
        href: "/",
        class:
          "text-sm font-medium text-slate-700 hover:text-slate-900 underline",
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
    { id: "buttons", x: 0, y: 4, w: 12, h: 2, content: xButtonWidget },
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
