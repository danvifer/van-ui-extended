import van from "vanjs-core"
import { State } from "vanjs-core"
import { Select } from "./select"
import * as vanX from "vanjs-ext"
const { table, thead, tbody, th, tr, td, input, button, span, div, hr, b } =
  van.tags
export type Column = {
  key: string
  label: string | State<string>
}
export type Action = {
  label?: string | State<string>
  func: Function
  condition?: Function
  disable?: Function
  icon?: string
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
  elements?: Number
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
  pagination = {},
  condensed = false,
  actionsLabel = "actions",
  tableClass = "table-auto block overflow-auto border-collapse text-sm w-full",
  theadClass = "text-center bg-stone-900 border-t border-b border-stone-700 dark:border-stone-600 text-stone-400 dark:text-stone-200 uppercase w-full",
  tbodyClass = "bg-stone-800",
  tbodyhoverClass = "hover:bg-stone-900",
  noDataLabel = "No data",
}: TableProps) => {
  document.activeElement instanceof HTMLElement
  data.val = data.val.map((item) => {
    item.actions = van.state(false)
    return item
  })
  let page = van.state(1)
  let rows = "100"
  /*  window.addEventListener('click', function (e) {
         data.val.forEach((item, index) => {
             if (!document.getElementById("select-father-" + index)?.contains(e.target as Node)) {
                 item.actions.val = false
             }
         })
 
     }); */
  return [
    () =>
      table(
        { id: "", class: tableClass },
        thead(
          { class: theadClass },
          tr(
            { class: "" },
            addMultiSelect
              ? th(
                  { class: condensed ? "font-medium p-2" : "font-medium p-4" },
                  input({
                    class:
                      "accent-teal-600 w-5 h-5 text-teal-600 accent-teal-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-gray-800 focus:ring-2 ",
                    type: "checkbox",
                  })
                )
              : null,
            ...columns.map((col) =>
              th(
                { class: condensed ? "font-medium p-2" : "font-medium p-4" },
                col.label
              )
            ),
            actionsColumn.length > 0
              ? th(
                  { class: condensed ? "font-medium p-2" : "font-medium p-4" },
                  actionsLabel
                )
              : null
          )
        ),
        tbody(
          { class: tbodyClass },
          ...data.val.map((item, index) =>
            tr(
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
                    })
                  )
                : null,
              ...columns.map((col) =>
                td(
                  {
                    class:
                      "text-center border-b border-stone-100 dark:border-stone-700 p-4 text-stone-500 dark:text-stone-400",
                  },
                  item[col.key as keyof any]
                )
              ),
              actionsColumn.length > 0
                ? td(
                    {
                      class:
                        "text-center border-b border-stone-100 dark:border-stone-700 p-4 text-stone-500 dark:text-stone-400 justify-items-right",
                    },
                    !item.noActions
                      ? actionsColumn.length > 3
                        ? div(
                            {
                              class: "grid relative group justify-items-center",
                            },
                            button({
                              id: "select-father-" + index,
                              class:
                                "og ogiconactions py-2.5 px-3 md:text-sm text-site bg-transparent border border-dimmed  focus:border-brand focus:outline-none focus:ring-0 flex justify-between rounded font-semibold cursor-pointer border-none text-xl",
                              onclick: () =>
                                (item.actions.val = !item.actions.val),
                            }),
                            div(
                              {
                                id: "",
                                class: () =>
                                  item.actions.val
                                    ? "inline" +
                                      "w-full absolute z-10 top-[-100%] left-[25%] translate-x-[-90%] rounded-md overflow-hidden shadow-lg min-w-[150px] opacity-100 opacity-0 duration-200 p-1 bg-gray-100 dark:bg-stone-900  border border-dimmed text-xs md:text-sm"
                                    : "hidden",
                              },
                              ...actionsColumn.map((action) =>
                                (action.condition && action.condition(item)) ||
                                !action.condition
                                  ? div(
                                      {
                                        class:
                                          "cursor-pointer hover:bg-white dark:hover:bg-stone-900 dark:bg-stone-800 hover:text-link px-2 py-2 rounded-md flex justify-start items-start gap-3",
                                        onclick: () => {
                                          action.func(item)
                                        },
                                      },
                                      span({
                                        class: "text-xl og " + action.icon,
                                      }),
                                      action.label
                                    )
                                  : null
                              )
                            )
                          )
                        : div(
                            {
                              class: "flex justify-end",
                            },
                            ...actionsColumn.map((action) =>
                              (action.condition && action.condition(item)) ||
                              !action.condition
                                ? button(
                                    {
                                      class:
                                        "mt-1 mr-3 ml-3 py-2 px-3 md:text-sm text-white border border-dimmed enabled:hover:bg-stone-500 enabled:hover:border-brand enabled:hover:outline-none enabled:hover:ring-0  focus:border-brand focus:outline-none focus:ring-0 flex justify-between rounded font-semibold cursor-pointer border-none disabled:cursor-not-allowed disabled:opacity-75",
                                      disabled: () =>
                                        action.disable
                                          ? !action.disable?.(item)
                                          : false,
                                      onclick: () => {
                                        action.func(item)
                                      },
                                    },

                                    span({
                                      class: "text-xl og " + action.icon,
                                    }),
                                    action.label
                                      ? span({ class: "ml-2" }, action.label)
                                      : null
                                  )
                                : null
                            )
                          )
                      : null
                  )
                : null
            )
          ),
          data.val.length === 0
            ? tr(
                td(
                  { colSpan: "12", class: "w-full text-center h-20 text-xl" },
                  noDataLabel
                )
              )
            : null
        )
      ),
    hr({ class: "border-stone-700" }),
    () =>
      pagination.selectFunc
        ? div(
            {
              class:
                "flex items-center justify-between p-2 bg-white dark:bg-neutral-900",
            },

            button(
              {
                class:
                  "hover:bg-stone-500 text-white font-bold py-2 px-4 rounded disabled:opacity-75 disabled:cursor-not-allowed !important cursor-pointer",
                disabled: page.val === 1,
                onclick: () => {
                  pagination.firstFunc?.()
                  page.val = 1
                },
              },
              "<< ",
              pagination?.firstLabel
            ),
            button(
              {
                class:
                  "hover:bg-stone-500 text-white font-bold py-2 px-4 rounded disabled:opacity-75 disabled:cursor-not-allowed !important cursor-pointer",
                disabled: page.val === 1,
                onclick: () => {
                  pagination.prevFunc?.()
                  page.val--
                },
              },
              "< ",
              pagination?.prevLabel
            ),
            div(
              { class: "mb-1 ml-5 text-gray-700 dark:text-gray-400" },
              (pagination?.pageLabel ?? "") + " ",
              b(page.val, "-", pagination?.pages?.val?.toString())
            ),
            button(
              {
                class:
                  "hover:bg-stone-500 text-white font-bold py-2 px-4 rounded disabled:opacity-75 disabled:cursor-not-allowed !important cursor-pointer",
                disabled: page.val === pagination.pages?.val,
                onclick: () => {
                  pagination.nextFunc?.()
                  page.val++
                },
              },
              pagination?.nextLabel,
              " >"
            ),
            button(
              {
                class:
                  "hover:bg-stone-500 text-white font-bold py-2 px-4 rounded disabled:opacity-75 disabled:cursor-not-allowed !important cursor-pointer",
                disabled: page.val === pagination.pages?.val,
                onclick: () => {
                  pagination.lastFunc?.()
                  page.val = pagination?.pages?.val || 1
                },
              },
              pagination?.lastLabel,
              " >>"
            ),
            span(
              { class: "text-gray-700 dark:text-gray-400" },

              div(
                { class: "grid grid-cols-2" },
                Select({
                  values: vanX.reactive([
                    {
                      value: "100",
                      label: "100",
                      func: (value) => {
                        pagination?.selectFunc?.(value)
                        rows = value
                        page.val = 1
                      },
                    },
                    {
                      value: "50",
                      label: "50",
                      func: (value) => {
                        pagination?.selectFunc?.(value)
                        rows = value
                        page.val = 1
                      },
                    },
                  ]),
                  selected: rows,
                  multiple: false,
                  modelValue: van.state(""),
                  selectClass: "w-[100px] text-sky-50 bg-[#313233]",
                  optionClass: "text-sky-50 hover:bg-[#595b5d] bg-[#313233]",
                  optionsClass: "text-sky-50 bg-[#313233]",
                }),
                span({ class: "ml-1 mt-2" }, pagination?.paginationLabel)
              )
            ),
            span(
              { class: "ml-2 text-gray-700 dark:text-gray-400" },
              pagination?.elements?.toString(),
              " ",
              pagination?.elementsLabel
            )
          )
        : null,
  ]
}
