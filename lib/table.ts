import van, { ChildDom } from "vanjs-core"
import { State } from "vanjs-core"
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
} = van.tags
import { xButton } from "./xButton"
const { svg, path } = van.tags("http://www.w3.org/2000/svg")
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
)
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
)
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
)
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
)
const xIcon = svg(
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
    d: "M6 18 18 6M6 6l12 12",
  }),
)
const checkIcon = svg(
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
    d: "m4.5 12.75 6 6 9-13.5",
  }),
)

export type Column = {
  key: string
  label: string | State<string>
  order?: boolean
  filter?: string
  tdClass?: string
  filterModal?: State<boolean>
  filterValues?: State<any[]>
}
export type Action = {
  label?: string | State<string>
  func: Function
  condition?: Function
  icon?: string | ChildDom
  disable?: Function
}
export type Pagination = {
  nextFunc?: Function
  prevFunc?: Function
  selectFunc?: Function
  firstFunc?: Function
  lastFunc?: Function
  paginationLabel?: string
  pageLabel?: string
  nextLabel?: string
  prevLabel?: string
  firstLabel?: string
  lastLabel?: string
  elementsLabel?: string
  pages?: State<number>
  page?: State<number>
  elements?: State<Number>
}

export interface TableProps {
  readonly columns: Column[]
  readonly data: State<any[]>
  readonly addMultiSelect?: boolean
  readonly actionsColumn?: Action[]
  readonly pagination?: Pagination
  readonly actionsLabel?: string
  readonly condensed?: boolean
  readonly tableClass?: string
  readonly filterLabel?: string
  readonly clearLabel?: string
  readonly applyLabel?: string
  readonly filterDescriptionLabel?: string
  readonly funcOrder?: Function
  readonly funcFilter?: Function
  readonly filters?: any
  readonly theadClass?: string
  readonly noDataLabel?: string
  readonly tbodyClass?: string
  readonly tbodyhoverClass?: string
}

export const TableComponent = ({
  columns = [],
  data = van.state([]),
  addMultiSelect = false,
  actionsColumn = [],
  pagination = {
    page: van.state(1),
  },
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
}: TableProps) => {
  document.activeElement instanceof HTMLElement
  let rows = "100"
  let editRows = van.state(false)
  let orderCol = van.state("")
  let orderBy = van.state("")
  window.addEventListener("click", function (e) {
    data.val.forEach((item, index) => {
      if (
        !document
          .getElementById("select-father-" + index)
          ?.contains(e.target as Node)
      ) {
        item.actions.val = false
      }
    })
    columns.forEach((item, index) => {
      if (
        !document
          .getElementById("filter-father-" + index)
          ?.contains(e.target as Node) &&
        !document.getElementById("filter-" + index)?.contains(e.target as Node)
      ) {
        if (item.filterModal) item.filterModal.val = false
      }
    })
  })
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
                col.filterModal = van.state(false)
                let filterValue = van.state("")
                filterValue.val = filters[col.key] || ""

                return () =>
                  th(
                    {
                      class: condensed ? "font-medium p-2" : "font-medium p-4",
                    },
                    col.order
                      ? span(
                          {
                            class: "cursor-pointer",
                            onclick: () => {
                              if (orderCol.val === col.key) {
                                orderBy.val =
                                  orderBy.val === "asc" ? "desc" : ""
                                orderCol.val =
                                  orderBy.val === "" ? "" : orderCol.val
                              } else {
                                orderCol.val = col.key
                                orderBy.val = "asc"
                              }
                              funcOrder(orderCol.val, orderBy.val)
                            },
                          },
                          col.label,
                          span(
                            {
                              class: "ml-1 text-xs ",
                            },
                            orderCol.val === col.key
                              ? orderBy.val === "asc"
                                ? ascIcon
                                : descIcon
                              : null,
                          ),
                        )
                      : col.label,
                    col.filter
                      ? xButton({
                          id: "filter-father-" + index,
                          className:
                            "uppercase cursor-pointer rounded-md px-1 mx-2 py-2 text-white hover:bg-gray-600 focus:outline-none ",
                          icon: filterIcon,
                          onClick: () => {
                            if (!col.filterModal)
                              col.filterModal = van.state(false)
                            col.filterModal.val = !col.filterModal.val
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
                                placeholder: col.label,
                                value: filterValue,
                                oninput: (e) => {
                                  const value = (e.target as HTMLInputElement)
                                    .value
                                  filterValue.val = value
                                },
                              })
                            : col.filter === "checks" &&
                                col.filterValues &&
                                col.filterValues.val
                              ? col.filterValues.val.map((uuid) => {
                                  return label(
                                    {
                                      class: "flex items-center mb-3 space-x-3",
                                    },
                                    input({
                                      type: "checkbox",
                                      name: "checked-demo",
                                      checked: () => uuid.value.val,
                                      class:
                                        "accent-orange-400 bg-white bg-check h-6 w-6 border border-gray-300 rounded-md checked:bg-yellow-500 checked:border-transparent focus:outline-none",
                                      oninput: () => {
                                        uuid.value.val = !uuid.value.val
                                      },
                                    }),
                                    span(
                                      {
                                        class:
                                          "font-normal text-gray-700 dark:text-white",
                                      },
                                      uuid.uuid,
                                    ),
                                  )
                                })
                              : col.filter === "complex" &&
                                  col.filterValues &&
                                  col.filterValues.val
                                ? col.filterValues.val.map((val) => {
                                    return label(
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
                                          val.value.val = !val.value.val
                                        },
                                      }),
                                      span(
                                        {
                                          class:
                                            "font-normal text-gray-700 dark:text-white",
                                        },
                                        val.label,
                                      ),
                                    )
                                  })
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
                                    filterValue.val = ""
                                    filters[col.key] = filterValue.val
                                    funcFilter(filters)
                                  },
                                })
                              : null,
                            xButton({
                              className:
                                "uppercase cursor-pointer rounded-md px-5 py-2 mt-2 text-white hover:bg-gray-600 focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed right-0",
                              icon: checkIcon,
                              label: applyLabel,
                              disabled:
                                filterValue.val === "" &&
                                col.filter === "basic",
                              onClick: () => {
                                if (col.filterModal) col.filterModal.val = false
                                if (col.filter === "basic") {
                                  filters[col.key] = filterValue.val
                                } else if (
                                  col.filter === "complex" &&
                                  col.filterValues
                                ) {
                                  filters[col.key] = col.filterValues.val
                                    .filter((val: any) => val.value.val)
                                    .map(
                                      (filter: { label: any }) => filter.label,
                                    )
                                  console.log(filters[col.key])
                                } else if (col.filterValues) {
                                  console.log(col)
                                  console.log(data.val)
                                  filters[col.key] = col.filterValues.val
                                    .filter((uuid) => uuid.value.val)
                                    .map((uuid) => uuid.uuid)
                                }
                                funcFilter(filters)
                              },
                            }),
                          ),
                        )
                      : null,
                  )
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
            ...data.val.map((item, index) => {
              item.actions = van.state(false)
              return tr(
                { class: tbodyhoverClass },
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
                    item[col.key as keyof any],
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
                                    (item.actions.val =
                                      !item.actions
                                        .val) /*  blur: () => item.actions.val = false */,
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
                                          action.condition(item)) ||
                                        !action.condition
                                          ? div(
                                              {
                                                class:
                                                  "cursor-pointer hover:bg-white dark:hover:bg-stone-900 dark:bg-stone-800 hover:text-link px-2 py-2 rounded-md flex justify-start items-start gap-3 ",
                                                onclick: () => {
                                                  action.func(item)
                                                  item.actions.val =
                                                    !item.actions.val
                                                },
                                              },
                                              typeof action.icon === "function"
                                                ? action.icon
                                                : action.icon instanceof Node
                                                  ? action.icon.cloneNode(true)
                                                  : "",
                                              action.label,
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
                                    action.condition(item)) ||
                                  !action.condition
                                    ? button(
                                        {
                                          class:
                                            " mt-1 mr-3 ml-3 py-2 px-3 md:text-sm text-white border border-dimmed enabled:hover:bg-stone-500 enabled:hover:border-brand enabled:hover:outline-none enabled:hover:ring-0  focus:border-brand focus:outline-none focus:ring-0 flex justify-between rounded font-semibold cursor-pointer border-none disabled:cursor-not-allowed disabled:opacity-75 ",
                                          disabled: () =>
                                            action.disable
                                              ? !action.disable?.(item)
                                              : false,
                                          onclick: () => {
                                            action.func(item)
                                          },
                                        },
                                        typeof action.icon === "function"
                                          ? action.icon
                                          : action.icon instanceof Node
                                            ? action.icon.cloneNode(true)
                                            : typeof action.icon === "string"
                                              ? span({ class: action.icon })
                                              : "",
                                        span({ class: "ml-2" }, action.label),
                                      )
                                    : null,
                                ),
                              )
                          : null,
                      )
                  : null,
              )
            }),
            data.val.length === 0
              ? tr(
                  td(
                    { colSpan: "12", class: "w-full text-center h-20 text-xl" },
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
                  pagination.firstFunc?.()
                  if (pagination.page) pagination.page.val = 1
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
                  pagination.prevFunc?.()
                  if (pagination.page) pagination.page.val--
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
                pagination?.pages?.val?.toString(),
              ),
            ),
            button(
              {
                class:
                  "hover:bg-stone-500 text-white font-bold py-2 px-4 rounded disabled:opacity-75 disabled:cursor-not-allowed !important cursor-pointer",
                disabled: pagination.page?.val === pagination.pages?.val,
                onclick: () => {
                  pagination.nextFunc?.()
                  if (pagination.page) pagination.page.val++
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
                  pagination.lastFunc?.()
                  if (pagination.page)
                    pagination.page.val = pagination?.pages?.val || 1
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
                            editRows.val = true
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
                        oninput: (e) => (rows = e.target.value),
                      }),
                      button(
                        {
                          class:
                            "hover:bg-stone-500 text-white font-bold py-2 px-4 rounded disabled:opacity-75 disabled:cursor-not-allowed !important cursor-pointer",
                          onclick: () => {
                            editRows.val = false
                            pagination?.selectFunc?.(rows)
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
              pagination?.elements?.val?.toString(),
              " ",
              pagination?.elementsLabel,
            ),
          )
        : null,
  ]
}
