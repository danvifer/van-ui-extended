import van, { State, ChildDom } from "vanjs-core";
import { xButton } from "./xButton";

const {
  table,
  thead,
  tbody,
  th,
  tr,
  td,
  input,
  button,
  span,
  div,
  hr,
  b,
  label,
} = van.tags;
const { svg, path } = van.tags("http://www.w3.org/2000/svg");

/* ────────────────────────────────────────────────────────────────────────
 * Icons
 * ──────────────────────────────────────────────────────────────────────── */
const descIcon = svg(
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
    class: "size-6",
  },
  path({
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    d: "M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25",
  }),
);

const ascIcon = svg(
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
    class: "size-6",
  },
  path({
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    d: "M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12",
  }),
);

const filteredIcon = svg(
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
    class: "size-6",
  },
  path({
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    d: "M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5",
  }),
);

const filterIcon = svg(
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
    class: "size-6",
  },
  path({
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    d: "M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z",
  }),
);

const actionsIcon = svg(
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
    class: "size-6",
  },
  path({
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    d: "M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5",
  }),
);

const xIcon = svg(
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
    class: "size-1 ",
  },
  path({
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    d: "M6 18 18 6M6 6l12 12",
  }),
);

const checkIcon = svg(
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
    class: "size-1",
  },
  path({
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    d: "m4.5 12.75 6 6 9-13.5",
  }),
);

/* ────────────────────────────────────────────────────────────────────────
 * Public types
 * ──────────────────────────────────────────────────────────────────────── */

export type FilterKind = "basic" | "checks" | "complex" | "select" | string;

/**
 * Structural shape for items in `Column.filterValues`. Reads depend on
 * `Column.filter`:
 *   - `"checks"` → renders `item.uuid` as the label, applies as uuid[]
 *   - `"complex"` → renders `item.label` as the label, applies as label[]
 *
 * `value` is typed as `State<any>` because consumers in the wild use both
 * `State<boolean>` (primitive) and `State<Boolean>` (wrapper); State is
 * invariant on T so the two are not assignable to each other. Keeping it
 * permissive avoids forcing every caller to cast.
 */
export interface FilterValueItem {
  readonly value: State<any>;
  readonly uuid?: string;
  readonly label?: string;
}

/** Kept as the historical name for the array of filter items. */
export type FilterValues = FilterValueItem[];

export interface Column {
  readonly key: string;
  readonly label: string | State<string> | ChildDom;
  readonly order?: boolean;
  readonly filter?: FilterKind;
  readonly filterValues?: State<any>;
  readonly tdClass?: string;
  filterModal?: State<boolean>;
}

export interface ActionItem<T = Record<string, unknown>> {
  readonly label?: string | State<string>;
  readonly icon?: string | ChildDom | ((item: T) => ChildDom);
  readonly func: (item: T) => void;
  readonly condition?: (item: T) => boolean;
  readonly disable?: (item: T) => boolean;
}

export interface Pagination {
  readonly page?: State<number>;
  readonly pages?: State<number>;
  readonly elements?: State<number>;
  readonly firstFunc?: () => void;
  readonly prevFunc?: () => void;
  readonly nextFunc?: () => void;
  readonly lastFunc?: () => void;
  readonly selectFunc?: (value: string) => void;
  readonly firstLabel?: string;
  readonly prevLabel?: string;
  readonly nextLabel?: string;
  readonly lastLabel?: string;
  readonly pageLabel?: string;
  readonly paginationLabel?: string;
  readonly elementsLabel?: string;
}

export interface TableProps<
  T extends Record<string, any> = Record<string, any>,
> {
  readonly columns?: Column[];
  readonly data?: State<T[]>;
  readonly addMultiSelect?: boolean;
  readonly actionsColumn?: ActionItem<T>[];
  readonly pagination?: Pagination;
  readonly RowFormatterClass?: (item: T) => string;
  readonly condensed?: boolean;
  readonly actionsLabel?: string;
  readonly tableClass?: string;
  readonly theadClass?: string;
  readonly tbodyClass?: string;
  readonly filterLabel?: string;
  readonly clearLabel?: string;
  readonly applyLabel?: string;
  readonly filterDescriptionLabel?: string;
  readonly tbodyhoverClass?: string;
  readonly noDataLabel?: string;
  readonly filters?: Record<string, unknown>;
  readonly funcOrder?: (col: string, dir: string) => void;
  readonly funcFilter?: (filters: Record<string, unknown>) => void;
}

/* ────────────────────────────────────────────────────────────────────────
 * TableComponent
 *
 * Outside-click detection walks up from `e.target` with `closest()` rather
 * than calling `document.getElementById(id).contains(e.target)`. The
 * previous approach was racy when VanJS re-rendered the th/button while
 * the click event was still bubbling: `getElementById` could return a
 * freshly-mounted button while `e.target` still pointed at the now-
 * detached original, so `contains` returned `false` and the filter modal
 * was closed in the same tick that the trigger opened it. `closest` walks
 * up from `e.target` itself, so it is robust to that race.
 * ──────────────────────────────────────────────────────────────────────── */

export const TableComponent = <
  T extends Record<string, any> = Record<string, any>,
>({
  columns = [],
  data = van.state([] as T[]),
  addMultiSelect = false,
  actionsColumn = [],
  pagination = { page: van.state(1) },
  RowFormatterClass = () => "",
  condensed = false,
  actionsLabel = "actions",
  tableClass = "table-auto overflow-auto border-collapse text-sm w-full",
  theadClass = "text-center bg-stone-900 border-t border-b border-stone-700 dark:border-stone-600 text-stone-400 dark:text-stone-200 uppercase w-full",
  tbodyClass = "bg-stone-800",
  filterLabel = "Filter",
  clearLabel = "Clear",
  applyLabel = "Apply",
  filterDescriptionLabel = "Use the controls below to filter the data",
  tbodyhoverClass = "hover:bg-stone-900",
  noDataLabel = "No data",
  filters = {},
  funcOrder = () => {},
  funcFilter = () => {},
}: TableProps<T>) => {
  // Side-effect preserved from the original implementation; harmless but
  // kept to avoid behavioural drift across versions.
  document.activeElement instanceof HTMLElement;

  let rows = "100";
  const editRows = van.state(false);
  const orderCol = van.state("");
  const orderBy = van.state("");

  window.addEventListener("click", function (e: MouseEvent) {
    const target = e.target as Element | null;
    const closestId = (id: string): Element | null =>
      target && typeof target.closest === "function"
        ? target.closest(`[id="${id}"]`)
        : null;

    data.val.forEach((item: any, index: number) => {
      if (!closestId("select-father-" + index)) {
        if (item.actions) item.actions.val = false;
      }
    });

    columns.forEach((item, index) => {
      if (
        !closestId("filter-father-" + index) &&
        !closestId("filter-" + index)
      ) {
        if (item.filterModal) item.filterModal.val = false;
      }
    });
  });

  return [
    () =>
      div(
        { id: "", class: tableClass },
        table(
          { id: "", class: "w-full" },
          thead(
            { class: theadClass },
            tr(
              { class: "" },
              addMultiSelect
                ? th(
                    {
                      class: condensed ? "font-medium p-2" : "font-medium p-4",
                    },
                    input({
                      class:
                        "accent-teal-600 w-5 h-5 text-teal-600 accent-teal-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-gray-800 focus:ring-2 ",
                      type: "checkbox",
                    }),
                  )
                : null,
              ...columns.map((col, index) => {
                col.filterModal = van.state(false);
                const filterValue = van.state("");
                filterValue.val = (filters as any)[col.key] || "";

                return () =>
                  th(
                    {
                      class: condensed ? "font-medium p-2" : "font-medium p-4",
                    },
                    col.order
                      ? span(
                          {
                            class: "cursor-pointer flex",
                            onclick: () => {
                              if (orderCol.val === col.key) {
                                orderBy.val =
                                  orderBy.val === "asc" ? "desc" : "";
                                orderCol.val =
                                  orderBy.val === "" ? "" : orderCol.val;
                              } else {
                                orderCol.val = col.key;
                                orderBy.val = "asc";
                              }
                              funcOrder(orderCol.val, orderBy.val);
                            },
                          },
                          col.label as ChildDom,
                          span(
                            { class: "ml-1" },
                            orderCol.val === col.key
                              ? orderBy.val === "asc"
                                ? ascIcon
                                : descIcon
                              : null,
                          ),
                        )
                      : (col.label as ChildDom),
                    col.filter
                      ? xButton({
                          id: "filter-father-" + index,
                          className:
                            ((filters as any)[col.key] ? "underline " : "") +
                            "uppercase cursor-pointer rounded-md mx-2 text-white hover:bg-gray-600 focus:outline-none ",
                          icon: (filters as any)[col.key]
                            ? filteredIcon
                            : filterIcon,
                          onClick: () => {
                            if (!col.filterModal)
                              col.filterModal = van.state(false);
                            col.filterModal.val = !col.filterModal.val;
                          },
                        })
                      : null,
                    col.filterModal && col.filterModal.val
                      ? div(
                          {
                            id: "filter-" + index,
                            class:
                              (col.filter === "select" ? "" : "") +
                              "absolute z-100 rounded-md overflow-y-auto shadow-lg min-w-[150px] opacity-100 opacity-0 p-1 dark:bg-stone-800  border border-dimmed text-xs md:text-sm",
                          },
                          span({ class: "flex text-xl" }, filterLabel),
                          div(
                            { class: "text-sm mb-2" },
                            filterDescriptionLabel,
                          ),
                          col.filter === "basic"
                            ? input({
                                class:
                                  "p-2 bg-stone-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-gray-800",
                                type: "text",
                                placeholder: col.label as string,
                                value: filterValue,
                                oninput: (e: Event) => {
                                  filterValue.val = (
                                    e.target as HTMLInputElement
                                  ).value;
                                },
                              })
                            : col.filter === "checks" &&
                                col.filterValues &&
                                col.filterValues.val
                              ? (col.filterValues.val as FilterCheck[]).map(
                                  (uuid) =>
                                    label(
                                      {
                                        class:
                                          "flex items-center mb-3 space-x-3",
                                      },
                                      input({
                                        type: "checkbox",
                                        name: "checked-demo",
                                        checked: () => uuid.value.val,
                                        class:
                                          "accent-orange-400 bg-white bg-check h-6 w-6 border border-gray-300 rounded-md checked:bg-yellow-500 checked:border-transparent focus:outline-none",
                                        oninput: () => {
                                          uuid.value.val = !uuid.value.val;
                                        },
                                      }),
                                      span(
                                        {
                                          class:
                                            "font-normal text-gray-700 dark:text-white",
                                        },
                                        uuid.uuid,
                                      ),
                                    ),
                                )
                              : col.filter === "complex" &&
                                  col.filterValues &&
                                  col.filterValues.val
                                ? (col.filterValues.val as FilterChoice[]).map(
                                    (val) =>
                                      label(
                                        {
                                          class:
                                            "flex items-center mb-3 space-x-3",
                                        },
                                        input({
                                          type: "checkbox",
                                          name: "checked-demo",
                                          checked: () => val.value.val,
                                          class:
                                            "accent-orange-400 bg-white bg-check h-6 w-6 border border-gray-300 rounded-md checked:bg-yellow-500 checked:border-transparent focus:outline-none",
                                          oninput: () => {
                                            val.value.val = !val.value.val;
                                          },
                                        }),
                                        span(
                                          {
                                            class:
                                              "font-normal text-gray-700 dark:text-white",
                                          },
                                          val.label,
                                        ),
                                      ),
                                  )
                                : null,
                          div(
                            { class: "" },
                            col.filter === "basic"
                              ? xButton({
                                  className:
                                    "uppercase cursor-pointer rounded-md px-5 py-2 mt-2 text-white hover:bg-gray-600 focus:outline-none left-0",
                                  icon: xIcon,
                                  label: clearLabel,
                                  onClick: () => {
                                    filterValue.val = "";
                                    (filters as any)[col.key] = filterValue.val;
                                    funcFilter(filters);
                                  },
                                })
                              : null,
                            xButton({
                              className:
                                "uppercase cursor-pointer rounded-md px-5 py-2 mt-2 text-white hover:bg-gray-600 focus:outline-none disabled:opacity-75 right-0",
                              icon: checkIcon,
                              label: applyLabel,
                              onClick: () => {
                                if (col.filterModal)
                                  col.filterModal.val = false;
                                if (col.filter === "basic") {
                                  (filters as any)[col.key] = filterValue.val;
                                } else if (
                                  col.filter === "complex" &&
                                  col.filterValues
                                ) {
                                  (filters as any)[col.key] = (
                                    col.filterValues.val as FilterChoice[]
                                  )
                                    .filter((v) => v.value.val)
                                    .map((v) => v.label);
                                } else if (col.filterValues) {
                                  (filters as any)[col.key] = (
                                    col.filterValues.val as FilterCheck[]
                                  )
                                    .filter((v) => v.value.val)
                                    .map((v) => v.uuid);
                                }
                                funcFilter(filters);
                              },
                            }),
                          ),
                        )
                      : null,
                  );
              }),
              actionsColumn.length > 0
                ? th(
                    {
                      class: condensed ? "font-medium p-2" : "font-medium p-4",
                    },
                    actionsLabel,
                  )
                : null,
            ),
          ),
          tbody(
            { class: tbodyClass },
            ...data.val.map((item: any, index: number) => {
              item.actions = van.state(false);
              return tr(
                {
                  class: tbodyhoverClass + " " + RowFormatterClass(item as T),
                },
                addMultiSelect
                  ? td(
                      {
                        class:
                          "text-center border-b border-stone-100 dark:border-stone-700 p-4",
                      },
                      input({
                        class:
                          "accent-teal-600 w-5 h-5 text-teal-600 accent-teal-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-gray-800 focus:ring-2 ",
                        type: "checkbox",
                      }),
                    )
                  : null,
                ...columns.map((col) =>
                  td(
                    {
                      class:
                        col.tdClass ||
                        "text-center border-b border-stone-100 dark:border-stone-700 p-4 text-stone-500 dark:text-stone-400",
                    },
                    item[col.key],
                  ),
                ),
                actionsColumn.length > 0
                  ? () =>
                      td(
                        {
                          class:
                            "text-center border-b border-stone-100 dark:border-stone-700 p-4 text-stone-500 dark:text-stone-400",
                        },
                        !item.noActions
                          ? actionsColumn.length > 4
                            ? div(
                                {
                                  class:
                                    "grid relative group justify-items-center",
                                },
                                xButton({
                                  id: "select-father-" + index,
                                  className:
                                    "uppercase cursor-pointer rounded-md px-2 py-2 mx-2 text-white hover:bg-gray-600 focus:outline-none ",
                                  icon: actionsIcon,
                                  onClick: () =>
                                    (item.actions.val = !item.actions.val),
                                }),
                                item.actions && item.actions.val
                                  ? div(
                                      {
                                        id: "",
                                        class:
                                          "inline absolute z-10 top-[-100%] left-[25%] translate-x-[-90%] rounded-md overflow-hidden shadow-lg min-w-[200px] opacity-100 opacity-0 duration-200 p-1 dark:bg-stone-800  border border-dimmed text-xs md:text-sm",
                                      },
                                      ...actionsColumn.map((action) =>
                                        (action.condition &&
                                          action.condition(item as T)) ||
                                        !action.condition
                                          ? div(
                                              {
                                                class:
                                                  "cursor-pointer hover:bg-white dark:hover:bg-stone-900 dark:bg-stone-800 hover:text-link px-2 py-2 rounded-md flex justify-start items-start gap-3 ",
                                                onclick: () => {
                                                  action.func(item as T);
                                                  item.actions.val =
                                                    !item.actions.val;
                                                },
                                              },
                                              typeof action.icon === "function"
                                                ? (action.icon as any)(
                                                    item as T,
                                                  )
                                                : action.icon instanceof Node
                                                  ? action.icon.cloneNode(true)
                                                  : "",
                                              action.label as ChildDom,
                                            )
                                          : null,
                                      ),
                                    )
                                  : null,
                              )
                            : div(
                                {
                                  class: "flex justify-end",
                                },
                                ...actionsColumn.map((action) =>
                                  (action.condition &&
                                    action.condition(item as T)) ||
                                  !action.condition
                                    ? button(
                                        {
                                          class:
                                            " mt-1 mr-3 ml-3 py-2 px-3 md:text-sm text-white border border-dimmed enabled:hover:bg-stone-500 enabled:hover:border-brand enabled:hover:outline-none enabled:hover:ring-0  focus:border-brand focus:outline-none focus:ring-0 flex justify-between rounded font-semibold cursor-pointer border-none disabled:cursor-not-allowed disabled:opacity-75 ",
                                          disabled: () =>
                                            action.disable
                                              ? !action.disable(item as T)
                                              : false,
                                          onclick: () => {
                                            action.func(item as T);
                                          },
                                        },
                                        typeof action.icon === "function"
                                          ? (action.icon as any)(item as T)
                                          : action.icon instanceof Node
                                            ? action.icon.cloneNode(true)
                                            : typeof action.icon === "string"
                                              ? span({ class: action.icon })
                                              : "",
                                        span(
                                          { class: "ml-2" },
                                          action.label as ChildDom,
                                        ),
                                      )
                                    : null,
                                ),
                              )
                          : null,
                      )
                  : null,
              );
            }),
            data.val.length === 0
              ? tr(
                  td(
                    {
                      colSpan: "12",
                      class: "w-full text-center h-20 text-xl",
                    },
                    noDataLabel,
                  ),
                )
              : null,
          ),
        ),
      ),
    hr({ class: "border-stone-700" }),
    () =>
      pagination.selectFunc
        ? div(
            {
              class:
                "block flex items-center justify-between p-2 bg-white dark:bg-neutral-900",
            },
            button(
              {
                class:
                  "hover:bg-stone-500 text-white font-bold py-2 px-4 rounded disabled:opacity-75 disabled:cursor-not-allowed !important cursor-pointer",
                disabled: pagination.page?.val === 1,
                onclick: () => {
                  pagination.firstFunc?.();
                  if (pagination.page) pagination.page.val = 1;
                },
              },
              "<< ",
              pagination?.firstLabel,
            ),
            button(
              {
                class:
                  "hover:bg-stone-500 text-white font-bold py-2 px-4 rounded disabled:opacity-75 disabled:cursor-not-allowed !important cursor-pointer",
                disabled: pagination.page?.val === 1,
                onclick: () => {
                  pagination.prevFunc?.();
                  if (pagination.page) pagination.page.val--;
                },
              },
              "< ",
              pagination?.prevLabel,
            ),
            div(
              { class: "mb-1 ml-5 text-gray-700 dark:text-gray-400" },
              (pagination?.pageLabel ?? "") + " ",
              b(
                data.val.length > 0 ? (pagination.page?.val ?? 0) : 0,
                "-",
                pagination?.pages?.val?.toString() ?? "",
              ),
            ),
            button(
              {
                class:
                  "hover:bg-stone-500 text-white font-bold py-2 px-4 rounded disabled:opacity-75 disabled:cursor-not-allowed !important cursor-pointer",
                disabled: pagination.page?.val === pagination.pages?.val,
                onclick: () => {
                  pagination.nextFunc?.();
                  if (pagination.page) pagination.page.val++;
                },
              },
              pagination?.nextLabel,
              " >",
            ),
            button(
              {
                class:
                  "hover:bg-stone-500 text-white font-bold py-2 px-4 rounded disabled:opacity-75 disabled:cursor-not-allowed !important cursor-pointer",
                disabled: pagination.page?.val === pagination.pages?.val,
                onclick: () => {
                  pagination.lastFunc?.();
                  if (pagination.page)
                    pagination.page.val = pagination?.pages?.val || 1;
                },
              },
              pagination?.lastLabel,
              " >>",
            ),
            span(
              { class: "text-gray-700 dark:text-gray-400" },
              div(
                { class: "" },
                !editRows.val
                  ? [
                      button(
                        {
                          class:
                            "hover:bg-stone-500 text-white font-bold py-2 px-4 rounded disabled:opacity-75 disabled:cursor-not-allowed !important cursor-pointer",
                          onclick: () => {
                            editRows.val = true;
                          },
                        },
                        "Edit",
                      ),
                      label(rows),
                    ]
                  : [
                      input({
                        type: "number",
                        value: rows,
                        oninput: (e: Event) =>
                          (rows = (e.target as HTMLInputElement).value),
                      }),
                      button(
                        {
                          class:
                            "hover:bg-stone-500 text-white font-bold py-2 px-4 rounded disabled:opacity-75 disabled:cursor-not-allowed !important cursor-pointer",
                          onclick: () => {
                            editRows.val = false;
                            pagination?.selectFunc?.(rows);
                          },
                        },
                        "Save",
                      ),
                    ],
                span({ class: "ml-1" }, pagination?.paginationLabel),
              ),
            ),
            span(
              { class: "ml-2 text-gray-700 dark:text-gray-400" },
              pagination?.elements?.val?.toString() ?? "",
              " ",
              pagination?.elementsLabel,
            ),
          )
        : null,
  ];
};
