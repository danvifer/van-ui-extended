import van from "vanjs-core";
import "../../styles.css";
import { xDashboard, type XDashboardItems } from "../../../lib/xDashboard";

const { div, header, main, h1, p, a, button, pre, section } = van.tags;

const placeholder = (label: string, accent: string) =>
  div(
    {
      class: `h-full w-full flex items-center justify-center text-sm font-semibold ${accent}`,
    },
    label,
  );

const baseItems: XDashboardItems = [
  {
    id: "a",
    x: 0,
    y: 0,
    w: 4,
    h: 3,
    title: "Cell A",
    content: () => placeholder("A", "text-sky-600"),
  },
  {
    id: "b",
    x: 4,
    y: 0,
    w: 4,
    h: 3,
    title: "Cell B",
    content: () => placeholder("B", "text-emerald-600"),
  },
  {
    id: "c",
    x: 8,
    y: 0,
    w: 4,
    h: 3,
    title: "Cell C",
    content: () => placeholder("C", "text-rose-600"),
  },
  {
    id: "wide",
    x: 0,
    y: 3,
    w: 12,
    h: 2,
    title: "Full-width cell",
    content: () => placeholder("Full width", "text-slate-700"),
  },
];

const items = van.state<XDashboardItems>(baseItems);
const layoutSnapshot = van.state<string>("[]");

const addCell = () => {
  const next: XDashboardItems = [
    ...items.val,
    {
      id: `extra-${items.val.length}`,
      w: 3,
      h: 2,
      autoPosition: true,
      title: `Cell ${items.val.length + 1}`,
      content: () => placeholder(`${items.val.length + 1}`, "text-indigo-600"),
    },
  ];
  items.val = next;
};

const reset = () => {
  items.val = baseItems;
};

const dashboard = xDashboard({
  column: 12,
  cellHeight: 70,
  margin: 8,
  items,
  onChange: (nodes) => {
    layoutSnapshot.val = JSON.stringify(
      nodes.map((n) => ({ id: n.id, x: n.x, y: n.y, w: n.w, h: n.h })),
      null,
      2,
    );
  },
});

van.add(
  document.body,
  div(
    { class: "min-h-screen bg-slate-100 text-slate-900" },
    header(
      { class: "px-6 py-4 bg-white border-b border-slate-200" },
      a(
        {
          href: "/",
          class: "text-xs text-slate-500 hover:text-slate-900 underline",
        },
        "← back to dashboard home",
      ),
      h1(
        { class: "text-2xl font-bold mt-1" },
        "xDashboard — isolated",
      ),
      p(
        { class: "text-sm text-slate-500" },
        "Reactive items (van.state) and live layout serialization.",
      ),
    ),
    main(
      { class: "p-6 space-y-4" },
      div(
        { class: "flex gap-2" },
        button(
          {
            class:
              "rounded-md px-3 py-1.5 text-sm font-medium bg-slate-900 text-white hover:bg-slate-700",
            onclick: addCell,
          },
          "Add cell",
        ),
        button(
          {
            class:
              "rounded-md px-3 py-1.5 text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-100",
            onclick: reset,
          },
          "Reset",
        ),
      ),
      dashboard,
      section(
        { class: "bg-white border border-slate-200 rounded-md p-3" },
        h1(
          { class: "text-sm font-semibold text-slate-700 mb-2" },
          "Current layout",
        ),
        pre(
          {
            class:
              "text-xs text-slate-600 bg-slate-50 rounded p-2 overflow-auto",
          },
          () => layoutSnapshot.val,
        ),
      ),
    ),
  ),
);
