import van from "vanjs-core";
import { xTable } from "./xTable";
import type { XColumn, XTableProps } from "./xTable.types";

/**
 * Local factory that defaults every showcase table to the Material theme
 * (so callers can compare to Quasar's docs at a glance) while still letting
 * a single demo override `theme` for the side-by-side dark/material card.
 */
const xt = <T>(props: XTableProps<T>) =>
  xTable<T>({ ...props, theme: props.theme ?? "material" });

const {
  a, aside, article, code, div, h1, h2, header, li, main, nav,
  p, pre, section, span, strong, ul,
} = van.tags;

// ───────────────────────────── Sample data ──────────────────────────────────

interface User {
  readonly id: number;
  readonly name: string;
  readonly age: number;
  readonly city: string;
  readonly role: string;
  readonly status: "active" | "inactive";
  readonly salary: number;
  readonly startDate: string;
}

const users: User[] = [
  { id: 1, name: "Alice Johnson", age: 28, city: "Madrid", role: "Engineer", status: "active", salary: 68000, startDate: "2022-03-14" },
  { id: 2, name: "Bob Martinez", age: 34, city: "Barcelona", role: "Designer", status: "active", salary: 54000, startDate: "2021-09-02" },
  { id: 3, name: "Carla Singh", age: 41, city: "Madrid", role: "PM", status: "active", salary: 92000, startDate: "2019-01-21" },
  { id: 4, name: "Diego Ferreira", age: 26, city: "Valencia", role: "Engineer", status: "inactive", salary: 61000, startDate: "2023-06-30" },
  { id: 5, name: "Eva Nguyen", age: 31, city: "Bilbao", role: "Data Scientist", status: "active", salary: 75000, startDate: "2020-11-12" },
  { id: 6, name: "Faisal Rahman", age: 38, city: "Sevilla", role: "Engineer", status: "active", salary: 71000, startDate: "2018-04-08" },
  { id: 7, name: "Greta Olsen", age: 29, city: "Madrid", role: "Designer", status: "active", salary: 58000, startDate: "2022-07-19" },
  { id: 8, name: "Hugo Petit", age: 45, city: "Barcelona", role: "PM", status: "inactive", salary: 98000, startDate: "2016-02-03" },
  { id: 9, name: "Inés Costa", age: 27, city: "Valencia", role: "Engineer", status: "active", salary: 64000, startDate: "2023-01-09" },
  { id: 10, name: "Jakub Novak", age: 33, city: "Bilbao", role: "Data Scientist", status: "active", salary: 79000, startDate: "2021-05-18" },
  { id: 11, name: "Kalia Brown", age: 30, city: "Madrid", role: "Engineer", status: "active", salary: 67000, startDate: "2022-02-28" },
  { id: 12, name: "Liam O'Connor", age: 39, city: "Sevilla", role: "PM", status: "inactive", salary: 89000, startDate: "2017-10-14" },
  { id: 13, name: "Mei Wang", age: 32, city: "Madrid", role: "Designer", status: "active", salary: 60000, startDate: "2021-04-22" },
  { id: 14, name: "Nuno Almeida", age: 44, city: "Valencia", role: "PM", status: "active", salary: 95000, startDate: "2015-08-17" },
  { id: 15, name: "Olga Ivanova", age: 36, city: "Barcelona", role: "Data Scientist", status: "active", salary: 82000, startDate: "2019-10-05" },
  { id: 16, name: "Pedro Silva", age: 25, city: "Bilbao", role: "Engineer", status: "inactive", salary: 56000, startDate: "2023-09-01" },
  { id: 17, name: "Qing Zhao", age: 37, city: "Madrid", role: "Data Scientist", status: "active", salary: 84000, startDate: "2018-11-29" },
  { id: 18, name: "Rosa Lima", age: 42, city: "Sevilla", role: "Engineer", status: "active", salary: 76000, startDate: "2017-06-11" },
  { id: 19, name: "Sven Lindgren", age: 35, city: "Barcelona", role: "PM", status: "active", salary: 91000, startDate: "2020-02-20" },
  { id: 20, name: "Tara Patel", age: 29, city: "Valencia", role: "Designer", status: "inactive", salary: 53000, startDate: "2022-12-15" },
  { id: 21, name: "Umar Sayed", age: 31, city: "Madrid", role: "Engineer", status: "active", salary: 69000, startDate: "2021-07-08" },
  { id: 22, name: "Vera Klein", age: 40, city: "Bilbao", role: "PM", status: "active", salary: 96000, startDate: "2016-05-23" },
  { id: 23, name: "Wesley Brooks", age: 28, city: "Sevilla", role: "Engineer", status: "active", salary: 63000, startDate: "2023-03-04" },
  { id: 24, name: "Xenia Popescu", age: 33, city: "Valencia", role: "Data Scientist", status: "active", salary: 78000, startDate: "2020-08-30" },
  { id: 25, name: "Yusuf Aydın", age: 47, city: "Madrid", role: "PM", status: "inactive", salary: 102000, startDate: "2014-11-02" },
  { id: 26, name: "Zara Hassan", age: 26, city: "Barcelona", role: "Designer", status: "active", salary: 57000, startDate: "2023-05-12" },
  { id: 27, name: "Adriano Russo", age: 39, city: "Valencia", role: "Engineer", status: "active", salary: 74000, startDate: "2018-02-25" },
  { id: 28, name: "Bianca Costa", age: 34, city: "Bilbao", role: "Designer", status: "active", salary: 59000, startDate: "2021-01-17" },
  { id: 29, name: "Camille Dubois", age: 31, city: "Madrid", role: "Data Scientist", status: "active", salary: 81000, startDate: "2021-11-09" },
  { id: 30, name: "Dimitri Petrov", age: 43, city: "Sevilla", role: "Engineer", status: "inactive", salary: 87000, startDate: "2016-09-28" },
];

const userCols: XColumn<User>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "age", label: "Age", sortable: true, align: "right" },
  { key: "city", label: "City", sortable: true },
  { key: "role", label: "Role", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "salary", label: "Salary", sortable: true, align: "right",
    format: (v) => `€${Number(v).toLocaleString("en-US")}` },
];

// Massive synthetic dataset for the virtual-scroll demo
const big: User[] = Array.from({ length: 10_000 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  age: 20 + (i % 50),
  city: ["Madrid", "Barcelona", "Valencia", "Bilbao", "Sevilla"][i % 5],
  role: ["Engineer", "Designer", "PM", "Data Scientist"][i % 4],
  status: i % 7 === 0 ? "inactive" : "active",
  salary: 40_000 + (i % 100) * 750,
  startDate: `20${10 + (i % 13)}-0${1 + (i % 9)}-1${i % 9}`,
}));

// ───────────────────────────── Layout helpers ───────────────────────────────

// No `overflow-hidden` — would clip per-column filter popovers that need
// to spill past the card's rounded corners. The inner padding keeps the
// rounded look intact for the normal content.
const cardClass =
  "block w-full rounded-xl border border-slate-200 bg-white shadow-sm";

interface DemoSection {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
}

const sections: readonly DemoSection[] = [
  { id: "basic", title: "Basic", summary: "Minimal usage — caller-owned rows + columns." },
  { id: "sorting", title: "Sorting", summary: "Sortable columns, asc → desc → none cycle, custom comparators." },
  { id: "pagination", title: "Pagination", summary: "Caller-owned PaginationState, rowsPerPageOptions with 'All'." },
  { id: "filter-global", title: "Global filter", summary: "Top-level filter State piped through the derive chain." },
  { id: "filter-column", title: "Per-column filter", summary: "Opt-in popover per column. Internal state — caller columns never mutated." },
  { id: "selection-single", title: "Selection (single)", summary: "Radio mode. Toggling a row clears the previous selection." },
  { id: "selection-multiple", title: "Selection (multiple)", summary: "Checkbox mode + indeterminate header state." },
  { id: "loading", title: "Loading", summary: "Caller-owned loading State + custom loading slot." },
  { id: "empty", title: "Empty / no data", summary: "noData slot replaces the default placeholder." },
  { id: "expandable", title: "Expandable rows", summary: "Set slots.expandedRow to enable the expander column." },
  { id: "body-cell-slot", title: "Custom cell render", summary: "slots.bodyCell (fallback) + bodyCellByKey (per-column)." },
  { id: "header-slot", title: "Custom header cell", summary: "headerCellByKey for one column; defaults stay for the rest." },
  { id: "top-bottom", title: "Top / bottom toolbar", summary: "topLeft + topRight slots for a caller-controlled toolbar." },
  { id: "dense", title: "Dense / bordered / flat", summary: "Cosmetic prop combinations." },
  { id: "virtual", title: "Virtual scroll", summary: "10,000 rows. DOM keeps ≤ 2 × sliceSize trs at any scroll position." },
  { id: "server-side", title: "Server-side", summary: "onRequest fires on pagination/filter change. Internal helpers bypassed." },
  { id: "theming", title: "Theming", summary: "Material vs dark theme, and a per-instance --xtable-primary CSS variable." },
];

const sectionHeader = (s: DemoSection) =>
  header(
    { class: "p-4 border-b border-slate-200" },
    h2({ class: "text-xl font-bold text-slate-900" }, s.title),
    p({ class: "mt-1 text-sm text-slate-600" }, s.summary),
  );

const demoCard = (s: DemoSection, ...body: ReturnType<typeof div>[]) =>
  section(
    { id: s.id, class: "scroll-mt-20" },
    article(
      { class: cardClass },
      sectionHeader(s),
      div({ class: "p-4 bg-slate-50" }, ...body),
    ),
  );

// ───────────────────────────── Demo instances ───────────────────────────────

// 1) Basic
const basicDemo = () => xt<User>({
  rows: van.state(users),
  columns: userCols,
  rowKey: "id",
  pagination: van.state({ page: 1, rowsPerPage: 5 }),
});

// 2) Sorting — custom comparator on Salary that puts the highest first
const sortingDemo = () => {
  const cols: XColumn<User>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "age", label: "Age", sortable: true, align: "right" },
    { key: "salary", label: "Salary (high → low priority)", sortable: true,
      align: "right",
      sort: (a, b) => Number(b) - Number(a),
      format: (v) => `€${Number(v).toLocaleString("en-US")}` },
  ];
  return xt<User>({
    rows: van.state(users),
    columns: cols,
    rowKey: "id",
    pagination: van.state({ page: 1, rowsPerPage: 5 }),
  });
};

// 3) Pagination — small page size + "All" option
const paginationDemo = () => {
  const pagination = van.state({ page: 1, rowsPerPage: 3 });
  return xt<User>({
    rows: van.state(users),
    columns: userCols,
    rowKey: "id",
    pagination,
    rowsPerPageOptions: [3, 5, 10, 25, 0],
  });
};

// 4) Global filter
const globalFilterDemo = () => {
  const filter = van.state("");
  return div(
    { class: "space-y-3" },
    div(
      { class: "flex items-center gap-2" },
      span({ class: "text-sm text-slate-700" }, "Search:"),
      van.tags.input({
        type: "text",
        placeholder: "Try 'madrid' or 'engineer'…",
        class: "px-3 py-1.5 rounded-md border border-slate-300 text-sm w-72",
        value: () => filter.val,
        oninput: (e: Event) => {
          filter.val = (e.target as HTMLInputElement).value;
        },
      }),
    ),
    xt<User>({
      rows: van.state(users),
      columns: userCols,
      rowKey: "id",
      filter,
      pagination: van.state({ page: 1, rowsPerPage: 5 }),
    }),
  );
};

// 5) Per-column filter — basic (text) + select (dropdown) variants
const columnFilterDemo = () => {
  const cols: XColumn<User>[] = [
    { key: "name", label: "Name", sortable: true, columnFilter: "basic" },
    { key: "age", label: "Age", align: "right", sortable: true },
    { key: "city", label: "City", sortable: true, columnFilter: "select" },
    { key: "role", label: "Role", sortable: true, columnFilter: "select" },
    { key: "status", label: "Status", sortable: true, columnFilter: "select" },
  ];
  return div(
    { class: "space-y-3" },
    p({ class: "text-xs text-slate-500" },
      "Name uses ",
      code({ class: "px-1 py-0.5 rounded bg-slate-100" }, "columnFilter: \"basic\""),
      " (text). City / Role / Status use ",
      code({ class: "px-1 py-0.5 rounded bg-slate-100" }, "columnFilter: \"select\""),
      " — dropdown of distinct values, exact match on Apply."),
    xt<User>({
      rows: van.state(users),
      columns: cols,
      rowKey: "id",
      pagination: van.state({ page: 1, rowsPerPage: 5 }),
    }),
  );
};

// 6) Single selection
const singleSelectionDemo = () => {
  const selected = van.state<User[]>([]);
  return div(
    { class: "space-y-3" },
    xt<User>({
      rows: van.state(users),
      columns: userCols,
      rowKey: "id",
      selection: "single",
      selected,
      pagination: van.state({ page: 1, rowsPerPage: 5 }),
    }),
    p({ class: "text-sm text-slate-600" },
      "Selected: ",
      () => selected.val.length === 0 ? "—" : selected.val[0].name),
  );
};

// 7) Multiple selection (indeterminate)
const multipleSelectionDemo = () => {
  const selected = van.state<User[]>([]);
  return div(
    { class: "space-y-3" },
    xt<User>({
      rows: van.state(users),
      columns: userCols,
      rowKey: "id",
      selection: "multiple",
      selected,
      selectedRowsLabel: (n) => `${n} of ${users.length} selected`,
      pagination: van.state({ page: 1, rowsPerPage: 5 }),
    }),
    p({ class: "text-sm text-slate-600" },
      "Selected names: ",
      () => selected.val.map((u) => u.name).join(", ") || "—"),
  );
};

// 8) Loading
const loadingDemo = () => {
  const loadingA = van.state(true);
  const loadingB = van.state(true);
  setTimeout(() => { loadingA.val = false; }, 2000);
  setTimeout(() => { loadingB.val = false; }, 2000);

  const reload = (s: typeof loadingA, ms = 1800) => {
    s.val = true;
    setTimeout(() => { s.val = false; }, ms);
  };

  const dot = (delayMs: number) =>
    span({
      class:
        "inline-block w-2 h-2 rounded-full bg-[var(--xtable-primary,#1976d2)] animate-bounce",
      style: `animation-delay: ${delayMs}ms`,
    });

  return div(
    { class: "space-y-4" },
    p({ class: "text-xs text-slate-500" },
      "Left: the built-in spinner (no ",
      code({ class: "px-1 py-0.5 rounded bg-slate-100" }, "slots.loading"),
      "). Right: a custom slot — three bouncing dots driven by ",
      code({ class: "px-1 py-0.5 rounded bg-slate-100" }, "var(--xtable-primary)"),
      "."),
    div({ class: "grid grid-cols-1 lg:grid-cols-2 gap-4" },
      // Default spinner
      div({ class: "space-y-2" },
        van.tags.button({
          class:
            "px-3 py-1 rounded-md text-xs bg-slate-900 text-white hover:bg-slate-700",
          onclick: () => reload(loadingA),
        }, "Reload — default spinner"),
        xt<User>({
          rows: van.state(users),
          columns: userCols,
          rowKey: "id",
          loading: loadingA,
          pagination: van.state({ page: 1, rowsPerPage: 5 }),
        }),
      ),
      // Custom loading slot
      div({ class: "space-y-2" },
        van.tags.button({
          class:
            "px-3 py-1 rounded-md text-xs bg-slate-900 text-white hover:bg-slate-700",
          onclick: () => reload(loadingB),
        }, "Reload — custom dots"),
        xt<User>({
          rows: van.state(users),
          columns: userCols,
          rowKey: "id",
          loading: loadingB,
          pagination: van.state({ page: 1, rowsPerPage: 5 }),
          slots: {
            loading: ({ label }) =>
              div(
                { class: "inline-flex items-center justify-center gap-3 text-slate-600" },
                div({ class: "flex gap-1" }, dot(0), dot(150), dot(300)),
                span(label),
              ),
          },
        }),
      ),
    ),
  );
};

// 9) Empty / no data
const emptyDemo = () =>
  xt<User>({
    rows: van.state<User[]>([]),
    columns: userCols,
    rowKey: "id",
    slots: {
      noData: () =>
        div({ class: "flex flex-col items-center gap-2 text-slate-400" },
          span({ class: "text-3xl" }, "·"),
          span({ class: "text-sm" }, "Nothing to show. Try adjusting your filters.")),
    },
  });

// 10) Expandable rows
const expandableDemo = () =>
  xt<User>({
    rows: van.state(users),
    columns: userCols,
    rowKey: "id",
    pagination: van.state({ page: 1, rowsPerPage: 5 }),
    slots: {
      expandedRow: ({ row }) =>
        div({ class: "grid grid-cols-2 gap-4 text-sm" },
          div(strong("Started: "), row.startDate),
          div(strong("Status: "), row.status),
          div(strong("City: "), row.city),
          div(strong("Salary: "),
            `€${Number(row.salary).toLocaleString("en-US")}`),
        ),
    },
  });

// 11) Custom body cell — bodyCellByKey wins over slots.bodyCell
const bodyCellDemo = () =>
  xt<User>({
    rows: van.state(users),
    columns: userCols,
    rowKey: "id",
    pagination: van.state({ page: 1, rowsPerPage: 5 }),
    slots: {
      bodyCell: ({ value }) => `• ${String(value)}`, // fallback for all columns
    },
    bodyCellByKey: {
      status: ({ value }) =>
        span({
          class: value === "active"
            ? "px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium"
            : "px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium",
        }, String(value)),
      salary: ({ value }) =>
        span({ class: "font-mono text-slate-700" },
          `€${Number(value).toLocaleString("en-US")}`),
    },
  });

// 12) Custom header cell — replace one column's header
const headerCellDemo = () =>
  xt<User>({
    rows: van.state(users),
    columns: userCols,
    rowKey: "id",
    pagination: van.state({ page: 1, rowsPerPage: 5 }),
    headerCellByKey: {
      salary: ({ sort, sortDir }) =>
        span({
          class: "inline-flex items-center gap-1 cursor-pointer",
          onclick: () => sort(),
        },
          span({ class: "uppercase text-amber-300 font-bold" }, "💰 Salary"),
          span({ class: "text-xs" }, () => sortDir ?? "—"),
        ),
    },
  });

// 13) Top / Bottom toolbar slots
const topBottomDemo = () => {
  const filter = van.state("");
  const selected = van.state<User[]>([]);
  return xt<User>({
    rows: van.state(users),
    columns: userCols,
    rowKey: "id",
    selection: "multiple",
    selected,
    filter,
    slots: {
      topLeft: () => h2({ class: "text-base font-semibold text-slate-800" }, "Employees"),
      topRight: () =>
        div({ class: "flex items-center gap-2" },
          van.tags.input({
            type: "text",
            class: "px-3 py-1 rounded-md border border-slate-300 text-sm",
            placeholder: "Search…",
            value: () => filter.val,
            oninput: (e: Event) => {
              filter.val = (e.target as HTMLInputElement).value;
            },
          }),
          van.tags.button({
            class:
              "px-3 py-1 rounded-md text-sm bg-slate-900 text-white hover:bg-slate-700",
            onclick: () => alert(`Action on ${selected.val.length} selected row(s).`),
          }, "Action"),
        ),
      bottom: ({ visibleRows }) =>
        span({ class: "text-xs text-slate-500" },
          () => `${visibleRows().length} visible · ${selected.val.length} selected`),
    },
  });
};

// 14) Dense / bordered / flat / separator
const styleDemo = () =>
  div({ class: "grid grid-cols-1 lg:grid-cols-2 gap-4" },
    div({ class: cardClass + " p-3" },
      h2({ class: "text-sm font-semibold mb-2" }, "dense + bordered"),
      xt<User>({
        rows: van.state(users),
        columns: userCols,
        rowKey: "id",
        dense: true,
        bordered: true,
        pagination: van.state({ page: 1, rowsPerPage: 5 }),
      }),
    ),
    div({ class: cardClass + " p-3" },
      h2({ class: "text-sm font-semibold mb-2" }, "flat + square"),
      xt<User>({
        rows: van.state(users),
        columns: userCols,
        rowKey: "id",
        flat: true,
        square: true,
        pagination: van.state({ page: 1, rowsPerPage: 5 }),
      }),
    ),
  );

// 15) Virtual scroll — 10k rows
const virtualScrollDemo = () => {
  return div(
    { class: "space-y-3" },
    p({ class: "text-sm text-slate-600" },
      strong("10,000 rows"), ". The DOM holds at most ",
      strong("2 × sliceSize"), " <tr> nodes at any scroll position. Scroll inside the table to see the slice update."),
    xt<User>({
      rows: van.state(big),
      columns: userCols,
      rowKey: "id",
      virtualScroll: true,
      virtualScrollItemSize: 40,
      virtualScrollSliceSize: 20,
    }),
  );
};

// 16) Server-side — simulated backend with debounced fetch
const serverSideDemo = () => {
  const rows = van.state<User[]>(users.slice(0, 5));
  const pagination = van.state({
    page: 1,
    rowsPerPage: 5,
    rowsNumber: users.length,
    sortBy: null as string | null,
    descending: false,
  });
  const loading = van.state(false);
  const filter = van.state("");
  const log = van.state<string[]>([]);

  const fakeFetch = (): void => {
    loading.val = true;
    setTimeout(() => {
      const { page, rowsPerPage, sortBy, descending } = pagination.val;
      const term = filter.val.toLowerCase();
      let filtered = term
        ? users.filter((u) =>
            u.name.toLowerCase().includes(term) ||
            u.city.toLowerCase().includes(term) ||
            u.role.toLowerCase().includes(term))
        : users.slice();
      if (sortBy) {
        const dir = descending ? -1 : 1;
        filtered = filtered.slice().sort((a, b) => {
          const av = (a as unknown as Record<string, unknown>)[sortBy];
          const bv = (b as unknown as Record<string, unknown>)[sortBy];
          if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
          return String(av).localeCompare(String(bv)) * dir;
        });
      }
      const start = (page - 1) * rowsPerPage;
      rows.val = filtered.slice(start, start + rowsPerPage);
      pagination.val = { ...pagination.val, rowsNumber: filtered.length };
      log.val = [
        `→ fetched page=${page} size=${rowsPerPage} ` +
        `sort=${sortBy ?? "-"}${descending ? " desc" : ""} ` +
        `filter="${filter.val}" total=${filtered.length}`,
        ...log.val.slice(0, 3),
      ];
      loading.val = false;
    }, 350);
  };

  return div(
    { class: "space-y-3" },
    div(
      { class: "flex items-center gap-2" },
      van.tags.input({
        type: "text",
        class: "px-3 py-1.5 rounded-md border border-slate-300 text-sm w-72",
        placeholder: "Server-side search…",
        value: () => filter.val,
        oninput: (e: Event) => {
          filter.val = (e.target as HTMLInputElement).value;
        },
      }),
      van.tags.button({
        class:
          "px-3 py-1.5 rounded-md text-sm bg-slate-900 text-white hover:bg-slate-700",
        onclick: fakeFetch,
      }, "Manual fetch"),
    ),
    xt<User>({
      rows,
      columns: userCols,
      rowKey: "id",
      pagination,
      filter,
      loading,
      onRequest: fakeFetch,
    }),
    pre({ class: "text-xs bg-slate-900 text-slate-100 rounded-md p-3 overflow-x-auto" },
      () => log.val.join("\n") || "(no fetches yet — change page or sort to trigger onRequest)"),
  );
};

// 17) Theming — show theme swap + per-instance primaryColor
const themingDemo = () => {
  const rows1 = van.state(users);
  const rows2 = van.state(users);
  const rows3 = van.state(users);
  const card = "rounded-xl border border-slate-200 bg-white p-3 shadow-sm";
  return div(
    { class: "space-y-4" },
    p({ class: "text-sm text-slate-600" },
      "All other tables on this page use ",
      code({ class: "px-1 py-0.5 rounded bg-slate-100" }, "theme: \"material\""),
      ". The cards below show the dark theme and two custom primary colors. ",
      strong("Note:"),
      " ",
      code({ class: "px-1 py-0.5 rounded bg-slate-100" }, "--xtable-primary"),
      " controls the selection accent and focus ring."),
    div({ class: "grid grid-cols-1 lg:grid-cols-2 gap-4" },
      div({ class: card },
        h2({ class: "text-sm font-semibold mb-2" }, "theme: \"dark\""),
        xTable<User>({
          rows: rows1,
          columns: userCols,
          rowKey: "id",
          theme: "dark",
          selection: "multiple",
          pagination: van.state({ page: 1, rowsPerPage: 5 }),
        }),
      ),
      div({ class: card },
        h2({ class: "text-sm font-semibold mb-2" }, "Material — primaryColor: \"#7c3aed\" (violet)"),
        xt<User>({
          rows: rows2,
          columns: userCols,
          rowKey: "id",
          primaryColor: "#7c3aed",
          selection: "multiple",
          pagination: van.state({ page: 1, rowsPerPage: 5 }),
        }),
      ),
    ),
    div({ class: card },
      h2({ class: "text-sm font-semibold mb-2" }, "Material — primaryColor: \"#16a34a\" (emerald)"),
      xt<User>({
        rows: rows3,
        columns: userCols,
        rowKey: "id",
        primaryColor: "#16a34a",
        selection: "multiple",
        pagination: van.state({ page: 1, rowsPerPage: 5 }),
      }),
    ),
  );
};

// ───────────────────────────── Page composition ─────────────────────────────

const sideNav = aside(
  { class: "w-64 sticky top-16 self-start hidden lg:block" },
  nav(
    { class: "rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm" },
    h2({ class: "font-semibold text-slate-900 mb-2 px-2" }, "On this page"),
    ul(
      { class: "space-y-0.5" },
      ...sections.map((s) =>
        li(
          a({
            href: `#${s.id}`,
            class: "block px-2 py-1 rounded text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          }, s.title),
        ),
      ),
    ),
  ),
);

const renderDemo = (s: DemoSection): ReturnType<typeof section> => {
  switch (s.id) {
    case "basic": return demoCard(s, div(basicDemo()));
    case "sorting": return demoCard(s, div(sortingDemo()));
    case "pagination": return demoCard(s, div(paginationDemo()));
    case "filter-global": return demoCard(s, div(globalFilterDemo()));
    case "filter-column": return demoCard(s, div(columnFilterDemo()));
    case "selection-single": return demoCard(s, div(singleSelectionDemo()));
    case "selection-multiple": return demoCard(s, div(multipleSelectionDemo()));
    case "loading": return demoCard(s, div(loadingDemo()));
    case "empty": return demoCard(s, div(emptyDemo()));
    case "expandable": return demoCard(s, div(expandableDemo()));
    case "body-cell-slot": return demoCard(s, div(bodyCellDemo()));
    case "header-slot": return demoCard(s, div(headerCellDemo()));
    case "top-bottom": return demoCard(s, div(topBottomDemo()));
    case "dense": return demoCard(s, styleDemo());
    case "virtual": return demoCard(s, div(virtualScrollDemo()));
    case "server-side": return demoCard(s, div(serverSideDemo()));
    case "theming": return demoCard(s, themingDemo());
    default: return demoCard(s, div("(not implemented)"));
  }
};

van.add(
  document.body,
  div(
    { class: "min-h-screen bg-slate-100 text-slate-900" },

    header(
      {
        class:
          "sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200",
      },
      div(
        { class: "max-w-7xl mx-auto px-6 py-3 flex items-center justify-between" },
        div(
          { class: "flex items-baseline gap-3" },
          h1({ class: "text-xl font-bold" }, "xTable"),
          span({ class: "text-sm text-slate-500" }, "Quasar-QTable-inspired VanJS table"),
        ),
        a({
          href: "/",
          class: "text-sm text-slate-700 hover:text-slate-900 underline",
        }, "← Back to component demos"),
      ),
    ),

    div(
      { class: "max-w-7xl mx-auto px-6 py-8 flex gap-8" },

      sideNav,

      main(
        { class: "flex-1 min-w-0 space-y-6" },

        section(
          { class: "rounded-xl border border-slate-200 bg-white p-6 shadow-sm" },
          h1({ class: "text-2xl font-bold" }, "xTable showcase"),
          p({ class: "mt-2 text-slate-600" },
            "Live examples mirroring the structure of Quasar's QTable docs. Each card is a working xTable instance — the source for this page lives in ",
            code({ class: "px-1 py-0.5 rounded bg-slate-100 text-sm" }, "lib/xTable-demo.ts"),
            "."),
        ),

        ...sections.map(renderDemo),

        section(
          { class: "rounded-xl border border-slate-200 bg-white p-6 shadow-sm" },
          h2({ class: "text-lg font-semibold" }, "Not yet covered"),
          ul({ class: "list-disc list-inside mt-2 text-sm text-slate-600 space-y-1" },
            li("Grid mode + ", code({}, "slots.item"), " (out of scope this pass)"),
            li("Horizontal virtual scroll"),
            li("Sticky header / sticky columns (CSS-only follow-up)"),
            li("Per-column ", code({}, "columnFilter: \"select\""), " kind (only ", code({}, "\"basic\""), " implemented)")),
        ),
      ),
    ),
  ),
);
